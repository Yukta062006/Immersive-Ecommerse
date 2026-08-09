<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_dashboard_forbids_customers(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer, 'sanctum')
            ->getJson('/api/admin/dashboard')
            ->assertStatus(403);
    }

    public function test_dashboard_returns_aggregates(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        Order::factory()->count(3)->create(['user_id' => $customer->id, 'status' => 'delivered', 'total' => 100.00]);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.kpis.orders.total', 3)
            ->assertJsonStructure([
                'data' => [
                    'kpis' => ['revenue' => ['total', 'month'], 'orders' => ['total', 'today', 'month', 'pending'], 'customers' => ['total', 'month'], 'avgOrderValue'],
                    'recentOrders',
                    'recentCustomers',
                    'topSellingProducts',
                    'statusBreakdown',
                    'activity',
                ],
            ]);
    }

    public function test_analytics_returns_range_data(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        Order::factory()->count(4)->create(['user_id' => $customer->id, 'status' => 'delivered', 'total' => 50.00]);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/analytics?range=90')
            ->assertOk()
            ->assertJsonPath('data.range', '90')
            ->assertJsonPath('data.kpis.orders', 4)
            ->assertJsonStructure([
                'data' => [
                    'kpis' => ['revenue', 'orders', 'averageOrderValue', 'newCustomers', 'totalCustomers'],
                    'revenueTrend',
                    'orderTrend',
                    'statusBreakdown',
                    'topProducts',
                ],
            ]);
    }

    public function test_analytics_defaults_to_30(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/analytics')
            ->assertOk()
            ->assertJsonPath('data.range', '30');
    }
}