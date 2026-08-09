<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class AdminAnalyticsController extends Controller
{
    private const RANGE_DAYS = ['30' => 30, '90' => 90, '365' => 365, 'all' => null];

    public function __invoke(Request $request): JsonResponse
    {
        $rangeKey = $request->query('range', '30');
        $rangeKey = isset(self::RANGE_DAYS[$rangeKey]) ? $rangeKey : '30';

        $data = Cache::remember('admin.analytics.'.$rangeKey, 60, function () use ($rangeKey) {
            $days = self::RANGE_DAYS[$rangeKey];

            $from = $days === null ? Order::query()->min('created_at')?->startOfDay() ?? Carbon::now()->subYear() : Carbon::now()->subDays($days)->startOfDay();
            $now = Carbon::now();

            $bucket = $days === null ? 'month' : ($days > 120 ? 'week' : 'day');

            $revenueTrend = $this->revenueTrend($from, $now, $bucket);
            $orderTrend = $this->orderTrend($from, $now, $bucket);

            $orders = Order::where('created_at', '>=', $from);
            $delivered = Order::where('created_at', '>=', $from)->where('status', 'delivered');

            $customers = User::where('role', 'customer');
            $newCustomers = (clone $customers)->where('created_at', '>=', $from)->count();

            $statusBreakdown = $this->statusBreakdown($from);
            $topProducts = $this->topSellingProducts($from, 6);

            $revenue = round((clone $delivered)->sum('total'), 2);
            $orderCount = (clone $orders)->count();

            return [
                'range' => $rangeKey,
                'from' => $from->toISOString(),
                'to' => $now->toISOString(),
                'kpis' => [
                    'revenue' => $revenue,
                    'orders' => $orderCount,
                    'averageOrderValue' => $orderCount > 0 ? round($revenue / $orderCount, 2) : 0.0,
                    'newCustomers' => $newCustomers,
                    'totalCustomers' => $customers->count(),
                    'refundRate' => 0.0,
                ],
                'revenueTrend' => $revenueTrend,
                'orderTrend' => $orderTrend,
                'statusBreakdown' => $statusBreakdown,
                'topProducts' => $topProducts,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    private function revenueTrend(Carbon $from, Carbon $now, string $bucket): array
    {
        $rows = Order::query()
            ->where('status', 'delivered')
            ->where('paid_at', '>=', $from)
            ->get(['total', 'paid_at'])
            ->groupBy(fn (Order $o) => $this->bucketKey($o->paid_at, $bucket, $from));

        return $this->fillBuckets($from, $now, $bucket, $rows, 'revenue');
    }

    private function orderTrend(Carbon $from, Carbon $now, string $bucket): array
    {
        $rows = Order::query()
            ->where('created_at', '>=', $from)
            ->get(['created_at'])
            ->groupBy(fn (Order $o) => $this->bucketKey($o->created_at, $bucket, $from));

        return $this->fillBuckets($from, $now, $bucket, $rows, 'orders');
    }

    private function fillBuckets(Carbon $from, Carbon $now, string $bucket, $rows, string $metric): array
    {
        $result = [];
        $cursor = $from->copy();

        while ($cursor <= $now) {
            $key = $this->bucketKey($cursor, $bucket, $from);
            $group = $rows->get($key);

            $result[] = [
                'label' => match ($bucket) {
                    'day' => $cursor->format('M d'),
                    'week' => 'Wk of '.$cursor->format('M d'),
                    default => $cursor->format('M Y'),
                },
                'date' => $cursor->format('Y-m-d'),
                $metric => $metric === 'revenue'
                    ? round($group ? $group->sum('total') : 0.0, 2)
                    : ($group ? $group->count() : 0),
            ];

            match ($bucket) {
                'day' => $cursor->addDay(),
                'week' => $cursor->addWeek(),
                default => $cursor->addMonth(),
            };
        }

        return $result;
    }

    private function bucketKey(Carbon $date, string $bucket, Carbon $from): string
    {
        return match ($bucket) {
            'day' => $date->format('Y-m-d'),
            'week' => $date->copy()->startOfWeek()->format('Y-m-d'),
            default => $date->format('Y-m'),
        };
    }

    private function topSellingProducts(Carbon $from, int $limit): array
    {
        return OrderItem::query()
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

    private function statusBreakdown(Carbon $from): array
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