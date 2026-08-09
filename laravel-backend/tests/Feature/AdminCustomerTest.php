<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCustomerTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function customer(): User
    {
        return User::factory()->create(['role' => 'customer']);
    }

    public function test_index_forbids_customers(): void
    {
        $this->actingAs($this->customer(), 'sanctum')
            ->getJson('/api/admin/customers')
            ->assertStatus(403);
    }

    public function test_index_lists_only_customer_role(): void
    {
        $this->admin();
        User::factory()->count(3)->create(['role' => 'customer']);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/customers')
            ->assertOk()
            ->assertJsonPath('data.meta.total', 3);
    }

    public function test_show_returns_customer_with_totals(): void
    {
        $customer = $this->customer();
        Order::factory()->create(['user_id' => $customer->id, 'status' => 'delivered', 'total' => 250.00]);
        Order::factory()->create(['user_id' => $customer->id, 'status' => 'processing', 'total' => 100.00]);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson("/api/admin/customers/{$customer->id}")
            ->assertOk()
            ->assertJsonPath('data.customer._id', (string) $customer->id)
            ->assertJsonPath('data.kpis.orderCount', 2)
            ->assertJsonCount(2, 'data.orders');
    }

    public function test_show_returns_404_for_missing(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/customers/999999')
            ->assertStatus(404);
    }
}