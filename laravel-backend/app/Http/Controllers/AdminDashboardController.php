<?php

namespace App\Http\Controllers;

use App\Http\Resources\CustomerResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class AdminDashboardController extends Controller
{
    /**
     * Single aggregate request powering the admin dashboard.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $data = Cache::remember('admin.dashboard', 60, function () {
            $now = Carbon::now();

            $kpis = $this->kpis($now);
            $range = $now->copy()->subDays(29)->startOfDay();

            $revenueTrend = $this->revenueTrend($range, $now);

            $recentOrders = Order::query()
                ->with('user')
                ->withCount('items as items_count')
                ->orderByDesc('created_at')
                ->limit(6)
                ->get();

            $recentCustomers = User::query()
                ->where('role', 'customer')
                ->orderByDesc('created_at')
                ->limit(6)
                ->get(['id', 'name', 'email', 'created_at']);

            $topProducts = $this->topSellingProducts($range, $now, 5);

            $activity = OrderStatusHistory::query()
                ->with(['order.user', 'changedBy'])
                ->orderByDesc('created_at')
                ->limit(8)
                ->get();

            return $this->asPlainArray($kpis, $revenueTrend, $recentOrders, $recentCustomers, $topProducts, $range, $now, $activity);
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    private function asPlainArray(
        array $kpis,
        array $revenueTrend,
        \Illuminate\Support\Collection $recentOrders,
        \Illuminate\Support\Collection $recentCustomers,
        array $topProducts,
        Carbon $range,
        Carbon $now,
        \Illuminate\Support\Collection $activity,
    ): array {
        return [
            'kpis' => $kpis,
            'revenueTrend' => $revenueTrend,
            'recentOrders' => OrderResource::collection($recentOrders)->resolve(request()),
            'recentCustomers' => CustomerResource::collection($recentCustomers)->resolve(request()),
            'topSellingProducts' => $topProducts,
            'statusBreakdown' => $this->statusBreakdown($range, $now),
            'activity' => $activity->map(fn (OrderStatusHistory $h) => [
                'id' => (string) $h->id,
                'orderNumber' => $h->order?->order_number,
                'orderId' => $h->order_id ? (string) $h->order_id : null,
                'fromStatus' => $h->from_status,
                'toStatus' => $h->to_status,
                'changedBy' => $h->changedBy?->name ?? 'System',
                'createdAt' => $h->created_at?->toISOString(),
            ])->values()->all(),
        ];
    }

    private function kpis(Carbon $now): array
    {
        $monthStart = $now->copy()->startOfMonth();
        $todayStart = $now->copy()->startOfDay();

        $deliveredTotal = Order::where('status', 'delivered')->sum('total');

        $revenueMonth = Order::where('status', 'delivered')
            ->where('paid_at', '>=', $monthStart)
            ->sum('total');

        $ordersToday = Order::where('created_at', '>=', $todayStart)->count();
        $ordersMonth = Order::where('created_at', '>=', $monthStart)->count();

        $customersTotal = User::where('role', 'customer')->count();
        $customersMonth = User::where('role', 'customer')->where('created_at', '>=', $monthStart)->count();

        $pendingOrderResidual = Order::where('status', 'pending')->count();
        $avgOrderValue = $deliveredTotal > 0 && Order::where('status', 'delivered')->count() > 0
            ? $deliveredTotal / Order::where('status', 'delivered')->count()
            : 0.0;

        $lowStockCount = Product::where('status', 'active')
            ->whereColumn('stock', '<=', 'low_stock_threshold')
            ->count();

        return [
            'revenue' => [
                'total' => round($deliveredTotal, 2),
                'month' => round($revenueMonth, 2),
            ],
            'orders' => [
                'total' => Order::count(),
                'today' => $ordersToday,
                'month' => $ordersMonth,
                'pending' => $pendingOrderResidual,
            ],
            'customers' => [
                'total' => $customersTotal,
                'month' => $customersMonth,
            ],
            'avgOrderValue' => round($avgOrderValue, 2),
            'lowStock' => $lowStockCount,
            'asOf' => $now->toISOString(),
        ];
    }

    private function revenueTrend(Carbon $from, Carbon $now): array
    {
        $rows = Order::query()
            ->where('status', 'delivered')
            ->where('paid_at', '>=', $from)
            ->get(['total', 'paid_at'])
            ->groupBy(fn (Order $o) => $o->paid_at->format('Y-m-d'));

        $days = [];
        $cursor = $from->copy();

        while ($cursor <= $now) {
            $key = $cursor->format('Y-m-d');
            $day = $rows->get($key);

            $days[] = [
                'date' => $key,
                'revenue' => $day ? round($day->sum('total'), 2) : 0.0,
                'orders' => $day ? $day->count() : 0,
            ];
            $cursor->addDay();
        }

        return $days;
    }

    private function topSellingProducts(Carbon $from, Carbon $now, int $limit): array
    {
        return \App\Models\OrderItem::query()
            ->selectRaw('product_id, name, SUM(quantity) as qty, SUM(unit_price * quantity) as revenue')
            ->whereHas('order', fn ($q) => $q->where('status', '!=', 'cancelled')->where('created_at', '>=', $from))
            ->groupBy('product_id', 'name')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get()
            ->map(fn ($item) => [
                'productId' => $item->product_id ? (string) $item->product_id : null,
                'name' => $item->name,
                'unitsSold' => (int) $item->qty,
                'revenue' => round((float) $item->revenue, 2),
            ])
            ->values()
            ->all();
    }

    private function statusBreakdown(Carbon $from, Carbon $now): array
    {
        $counts = Order::query()
            ->where('created_at', '>=', $from)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return collect(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
            ->mapWithKeys(fn ($s) => [$s => (int) $counts->get($s, 0)])
            ->all();
    }
}