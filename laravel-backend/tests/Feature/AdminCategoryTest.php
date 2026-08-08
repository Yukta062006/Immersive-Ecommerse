<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCategoryTest extends TestCase
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
        $this->getJson('/api/admin/categories')->assertStatus(401);
    }

    public function test_index_forbids_customers(): void
    {
        $this->actingAs($this->customer(), 'sanctum')
            ->getJson('/api/admin/categories')
            ->assertStatus(403);
    }

    public function test_index_returns_all_categories(): void
    {
        Category::factory()->count(3)->create();

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/categories')
            ->assertOk()
            ->assertJsonCount(3, 'data.categories');
    }

    public function test_store_creates_category(): void
    {
        $response = $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/categories', [
                'name' => 'Toys',
                'description' => 'Fun stuff.',
                'is_active' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.category.name', 'Toys')
            ->assertJsonPath('data.category.slug', 'toys');

        $this->assertDatabaseHas('categories', ['name' => 'Toys', 'slug' => 'toys']);
    }

    public function test_store_validates_required_name(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/categories', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_show_returns_category_with_product_count(): void
    {
        $category = Category::factory()->create(['name' => 'Shoes']);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/categories/'.$category->id)
            ->assertOk()
            ->assertJsonPath('data.category.name', 'Shoes');
    }

    public function test_show_returns_404_for_missing(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/categories/999999')
            ->assertStatus(404);
    }

    public function test_update_changes_category(): void
    {
        $category = Category::factory()->create(['name' => 'Old Name']);

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson('/api/admin/categories/'.$category->id, ['name' => 'New Name'])
            ->assertOk()
            ->assertJsonPath('data.category.name', 'New Name');

        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'New Name']);
    }

    public function test_destroy_deletes_category(): void
    {
        $category = Category::factory()->create();

        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson('/api/admin/categories/'.$category->id)
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_destroy_returns_404_for_missing(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson('/api/admin/categories/999999')
            ->assertStatus(404);
    }
}
