<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrderTest extends TestCase
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

    public function test_index_requires_authentication(): void
    {
        $this->getJson('/api/admin/orders')->assertStatus(401);
    }

    public function test_index_forbids_customers(): void
    {
        $this->actingAs($this->customer(), 'sanctum')
            ->getJson('/api/admin/orders')
            ->assertStatus(403);
    }

    public function test_index_returns_paginated_envelope(): void
    {
        Order::factory()->count(5)->create();

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/orders?limit=2')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.meta.total', 5)
            ->assertJsonPath('data.meta.per_page', 2)
            ->assertJsonCount(2, 'data.items');
    }

    public function test_index_filters_by_status(): void
    {
        Order::factory()->count(3)->create(['status' => 'delivered']);
        Order::factory()->count(2)->create(['status' => 'pending']);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/orders?status=pending')
            ->assertOk()
            ->assertJsonPath('data.meta.total', 2);
    }

    public function test_index_searches_by_order_number(): void
    {
        $order = Order::factory()->create(['order_number' => 'ORD-FINDME12']);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/orders?search=FINDME')
            ->assertOk()
            ->assertJsonPath('data.meta.total', 1)
            ->assertJsonPath('data.items.0.orderNumber', $order->order_number);
    }

    public function test_show_returns_order_with_items(): void
    {
        $order = Order::factory()->create();
        OrderItem::factory()->count(2)->create(['order_id' => $order->id]);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson("/api/admin/orders/{$order->id}")
            ->assertOk()
            ->assertJsonPath('data.order._id', (string) $order->id)
            ->assertJsonCount(2, 'data.order.items');
    }

    public function test_show_returns_404_for_missing(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/orders/999999')
            ->assertStatus(404);
    }

    public function test_update_status_records_history_and_forgets_cache(): void
    {
        $order = Order::factory()->create(['status' => 'processing', 'order_number' => 'ORD-STATUS01']);

        \Illuminate\Support\Facades\Cache::put('admin.dashboard', ['dummy'], 60);
        \Illuminate\Support\Facades\Cache::put('admin.analytics.30', ['dummy'], 60);

        $this->actingAs($this->admin(), 'sanctum')
            ->patchJson("/api/admin/orders/{$order->id}/status", ['status' => 'shipped'])
            ->assertOk()
            ->assertJsonPath('data.order.status', 'shipped');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'shipped']);
        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id,
            'from_status' => 'processing',
            'to_status' => 'shipped',
        ]);
        $this->assertFalse(\Illuminate\Support\Facades\Cache::has('admin.dashboard'));
        $this->assertFalse(\Illuminate\Support\Facades\Cache::has('admin.analytics.30'));
    }

    public function test_update_status_validates(): void
    {
        $order = Order::factory()->create();

        $this->actingAs($this->admin(), 'sanctum')
            ->patchJson("/api/admin/orders/{$order->id}/status", ['status' => 'bogus'])
            ->assertStatus(422);
    }
}