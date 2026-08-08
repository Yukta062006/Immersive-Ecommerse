<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProductTest extends TestCase
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
        $this->getJson('/api/admin/products')->assertStatus(401);
    }

    public function test_index_forbids_customers(): void
    {
        $this->actingAs($this->customer(), 'sanctum')
            ->getJson('/api/admin/products')
            ->assertStatus(403);
    }

    public function test_index_returns_all_products_including_drafts(): void
    {
        Category::factory()->create();
        Product::factory()->count(4)->create(['status' => 'active']);
        Product::factory()->count(2)->create(['status' => 'draft']);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/products?limit=50')
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 6);
    }

    public function test_store_creates_product_with_images_and_variants(): void
    {
        $category = Category::factory()->create();

        $response = $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products', [
                'name' => 'New Gadget',
                'description' => 'A shiny new gadget.',
                'price' => 49.99,
                'sku' => 'SKU-NEWGADGET',
                'category_id' => $category->id,
                'featured' => true,
                'stock' => 25,
                'tags' => ['new', 'sale'],
                'images' => [
                    ['url' => 'https://example.com/img1.png', 'alt' => 'Main image', 'width' => 800, 'height' => 800],
                ],
                'variants' => [
                    [
                        'name' => 'Small',
                        'sku' => 'SKU-NEWGADGET-S',
                        'price' => 49.99,
                        'stock' => 10,
                        'size' => 'S',
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.product.name', 'New Gadget')
            ->assertJsonPath('data.product.slug', 'new-gadget')
            ->assertJsonPath('data.product.featured', true)
            ->assertJsonCount(1, 'data.product.images')
            ->assertJsonCount(1, 'data.product.variants');

        $this->assertDatabaseHas('products', ['name' => 'New Gadget', 'slug' => 'new-gadget']);
        $this->assertDatabaseHas('product_images', ['url' => 'https://example.com/img1.png']);
        $this->assertDatabaseHas('product_variants', ['sku' => 'SKU-NEWGADGET-S']);
    }

    public function test_store_validates_required_fields(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'description', 'price', 'sku', 'category_id']);
    }

    public function test_show_returns_product(): void
    {
        $product = Product::factory()->create();

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/products/'.$product->id)
            ->assertOk()
            ->assertJsonPath('data.product._id', (string) $product->id);
    }

    public function test_show_returns_404_for_missing(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/products/999999')
            ->assertStatus(404);
    }

    public function test_update_changes_price_and_stock(): void
    {
        $product = Product::factory()->create(['price' => 10.00, 'stock' => 5]);

        $response = $this->actingAs($this->admin(), 'sanctum')
            ->putJson('/api/admin/products/'.$product->id, [
                'price' => 19.99,
                'stock' => 42,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.product.price', 19.99)
            ->assertJsonPath('data.product.stock', 42);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'price' => 19.99, 'stock' => 42]);
    }

    public function test_update_syncs_variants_when_provided(): void
    {
        $product = Product::factory()->create();
        $this->assertSame(2, $product->variants()->count());

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson('/api/admin/products/'.$product->id, [
                'variants' => [
                    ['name' => 'Only', 'sku' => 'ONLY-VARIANT', 'price' => 5.00, 'stock' => 1],
                ],
            ])
            ->assertOk()
            ->assertJsonCount(1, 'data.product.variants');

        $this->assertSame(1, $product->variants()->count());
        $this->assertDatabaseHas('product_variants', ['sku' => 'ONLY-VARIANT']);
    }

    public function test_destroy_deletes_product_and_children(): void
    {
        $product = Product::factory()->create();
        $productId = $product->id;

        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson('/api/admin/products/'.$productId)
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('products', ['id' => $productId]);
        $this->assertDatabaseMissing('product_images', ['product_id' => $productId]);
        $this->assertDatabaseMissing('product_variants', ['product_id' => $productId]);
    }

    public function test_destroy_returns_404_for_missing(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson('/api/admin/products/999999')
            ->assertStatus(404);
    }
}
