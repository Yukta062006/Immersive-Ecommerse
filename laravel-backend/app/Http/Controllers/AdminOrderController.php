<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class AdminOrderController extends Controller
{
    private const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    public function index(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with('user')
            ->withCount('items as items_count');

        if ($request->has('status') && in_array($request->query('status'), self::STATUSES, true)) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->query('date_from'));
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->query('date_to'));
        }

        $page = max(1, (int) $request->query('page', 1));
        $limit = min(100, max(1, (int) $request->query('limit', 15)));

        $sort = $request->query('sort', 'newest');
        $sortMap = [
            'newest' => ['created_at', 'desc'],
            'oldest' => ['created_at', 'asc'],
            'total_desc' => ['total', 'desc'],
            'total_asc' => ['total', 'asc'],
        ];
        [$column, $direction] = $sortMap[$sort] ?? $sortMap['newest'];

        $orders = $query->orderBy($column, $direction)->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => [
                'items' => OrderResource::collection($orders->items()),
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'per_page' => $orders->perPage(),
                    'last_page' => $orders->lastPage(),
                    'total' => $orders->total(),
                ],
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $order = Order::with(['user', 'items', 'statusHistories.changedBy'])->find($id);

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => ['order' => new OrderResource($order)],
        ]);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $order = Order::find($id);

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
        ]);

        $fromStatus = $order->status;
        $toStatus = $validated['status'];

        if ($fromStatus === $toStatus) {
            return response()->json([
                'success' => true,
                'data' => ['order' => new OrderResource($order->load(['user', 'items', 'statusHistories.changedBy']))],
            ]);
        }

        $order->update(['status' => $toStatus]);

        OrderStatusHistory::create([
            'order_id' => $order->id,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'changed_by' => $request->user()?->id,
        ]);

        Cache::forget('admin.dashboard');
        Cache::forget('admin.analytics.30');
        Cache::forget('admin.analytics.90');
        Cache::forget('admin.analytics.365');
        Cache::forget('admin.analytics.all');

        $order->load(['user', 'items', 'statusHistories.changedBy']);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated to '.$toStatus,
            'data' => ['order' => new OrderResource($order)],
        ]);
    }
}