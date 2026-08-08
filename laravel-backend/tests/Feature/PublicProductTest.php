<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_active_products_in_envelope(): void
    {
        Category::factory()->create();
        Product::factory()->count(5)->create(['status' => 'active']);
        Product::factory()->count(2)->create(['status' => 'draft']);

        $response = $this->getJson('/api/products?limit=50');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.pagination.total', 5)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'products' => [[
                        '_id', 'name', 'slug', 'price', 'category' => ['_id', 'name'],
                        'images', 'variants', 'ratings' => ['average', 'count'],
                        'tags', 'featured', 'stock',
                    ]],
                    'pagination' => ['page', 'limit', 'total', 'pages'],
                ],
            ]);
    }

    public function test_index_filters_by_category_id(): void
    {
        $electronics = Category::factory()->create(['name' => 'Electronics']);
        $apparel = Category::factory()->create(['name' => 'Apparel']);

        Product::factory()->create(['category_id' => $electronics->id, 'status' => 'active']);
        Product::factory()->count(3)->create(['category_id' => $apparel->id, 'status' => 'active']);

        $response = $this->getJson('/api/products?category='.$electronics->id);

        $response->assertOk()
            ->assertJsonPath('data.pagination.total', 1);
    }

    public function test_index_filters_by_category_slug(): void
    {
        $electronics = Category::factory()->create(['name' => 'Electronics', 'slug' => 'electronics']);

        Product::factory()->count(2)->create(['category_id' => $electronics->id, 'status' => 'active']);

        $this->getJson('/api/products?category=electronics')
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 2);
    }

    public function test_index_filters_by_price_range(): void
    {
        Category::factory()->create();
        Product::factory()->create(['price' => 10.99, 'status' => 'active']);
        Product::factory()->create(['price' => 50.50, 'status' => 'active']);
        Product::factory()->create(['price' => 100.99, 'status' => 'active']);

        $response = $this->getJson('/api/products?minPrice=20&maxPrice=80');

        $response->assertOk()
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.products.0.price', 50.50);
    }

    public function test_index_sorts_by_price_asc(): void
    {
        Category::factory()->create();
        Product::factory()->create(['price' => 90.25, 'status' => 'active']);
        Product::factory()->create(['price' => 10.75, 'status' => 'active']);
        Product::factory()->create(['price' => 50.99, 'status' => 'active']);

        $prices = collect($this->getJson('/api/products?sort=price_asc&limit=50')->json('data.products'))
            ->pluck('price')
            ->all();

        $this->assertSame([10.75, 50.99, 90.25], $prices);
    }

    public function test_index_search_matches_name(): void
    {
        Category::factory()->create();
        Product::factory()->create(['name' => 'Wireless Headphones', 'status' => 'active']);

        $this->getJson('/api/products?search=headphones')
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 1);
    }

    public function test_show_by_id_returns_mongo_style_product(): void
    {
        $category = Category::factory()->create(['name' => 'Gadgets']);
        $product = Product::factory()->create([
            'name' => 'Smart Watch',
            'category_id' => $category->id,
            'status' => 'active',
            'price' => 199.99,
            'tags' => ['sale'],
        ]);

        $response = $this->getJson('/api/products/'.$product->id);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.product._id', (string) $product->id)
            ->assertJsonPath('data.product.name', 'Smart Watch')
            ->assertJsonPath('data.product.category._id', (string) $category->id)
            ->assertJsonPath('data.product.category.name', 'Gadgets')
            ->assertJsonPath('data.product.price', 199.99)
            ->assertJsonPath('data.product.ratings.average', 0)
            ->assertJsonCount(2, 'data.product.images')
            ->assertJsonCount(2, 'data.product.variants')
            ->assertJsonPath('data.product.tags.0', 'sale');
    }

    public function test_show_by_slug(): void
    {
        $product = Product::factory()->create([
            'name' => 'Unique Thing',
            'slug' => 'unique-thing',
            'status' => 'active',
        ]);

        $this->getJson('/api/products/unique-thing')
            ->assertOk()
            ->assertJsonPath('data.product._id', (string) $product->id);
    }

    public function test_show_hides_draft_products(): void
    {
        $product = Product::factory()->create(['status' => 'draft']);

        $this->getJson('/api/products/'.$product->id)->assertStatus(404);
    }

    public function test_show_returns_404_for_missing(): void
    {
        $this->getJson('/api/products/999999')->assertStatus(404);
    }

    public function test_related_returns_same_category_excluding_self(): void
    {
        $category = Category::factory()->create();
        $main = Product::factory()->create(['category_id' => $category->id, 'status' => 'active']);
        $related = Product::factory()->count(3)->create(['category_id' => $category->id, 'status' => 'active']);
        Product::factory()->create(['status' => 'active']);

        $ids = collect($this->getJson('/api/products/'.$main->id.'/related')->json('data.products'))
            ->pluck('_id')
            ->all();

        $this->assertCount(3, $ids);
        $this->assertNotContains((string) $main->id, $ids);
        foreach ($related as $r) {
            $this->assertContains((string) $r->id, $ids);
        }
    }

    public function test_related_returns_404_for_missing_product(): void
    {
        $this->getJson('/api/products/999999/related')->assertStatus(404);
    }

    public function test_categories_lists_active_with_product_counts(): void
    {
        $active = Category::factory()->create(['name' => 'Active Cat', 'is_active' => true]);
        $inactive = Category::factory()->create(['name' => 'Hidden Cat', 'is_active' => false]);

        Product::factory()->count(3)->create(['category_id' => $active->id, 'status' => 'active']);
        Product::factory()->create(['category_id' => $active->id, 'status' => 'draft']);

        $response = $this->getJson('/api/products/categories');

        $response->assertOk()
            ->assertJsonPath('success', true);

        $cats = collect($response->json('data.categories'));
        $this->assertSame(1, $cats->count());
        $this->assertSame(3, $cats->first()['productCount'] ?? $cats->first()['product_count'] ?? 0);
        $this->assertNotContains($inactive->slug, $cats->pluck('slug')->all());
    }

    public function test_search_returns_products_and_suggestions(): void
    {
        Product::factory()->create(['name' => 'Aurora Wireless Headphones', 'status' => 'active']);
        Product::factory()->create(['name' => 'Wired Earbuds', 'status' => 'active']);

        $response = $this->getJson('/api/products/search?q=aurora');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.products.0.name', 'Aurora Wireless Headphones')
            ->assertJsonCount(1, 'data.products');

        $this->assertContains('Aurora Wireless Headphones', $response->json('data.suggestions'));
    }

    public function test_search_empty_query_returns_empty(): void
    {
        Product::factory()->count(2)->create(['status' => 'active']);

        $this->getJson('/api/products/search?q=')
            ->assertOk()
            ->assertJsonPath('data.products', [])
            ->assertJsonPath('data.suggestions', []);
    }
}
