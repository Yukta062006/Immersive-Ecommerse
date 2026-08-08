<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name.'-'.Str::random(4)),
            'description' => fake()->paragraph(),
            'long_description' => fake()->optional()->paragraphs(3, true),
            'price' => fake()->randomFloat(2, 20, 999),
            'compare_at_price' => fake()->optional()->randomFloat(2, 30, 1200),
            'sku' => strtoupper(Str::random(10)),
            'category_id' => Category::factory(),
            'featured' => fake()->boolean(20),
            'stock' => fake()->numberBetween(0, 500),
            'low_stock_threshold' => 10,
            'status' => fake()->randomElement(['active', 'active', 'active', 'draft']),
            'weight' => fake()->optional()->randomFloat(2, 0.1, 20),
            'dimensions' => fake()->optional()->randomElement([
                ['length' => 30, 'width' => 20, 'height' => 10],
                ['length' => 12, 'width' => 12, 'height' => 30],
                ['length' => 5, 'width' => 5, 'height' => 20],
            ]),
            'tags' => fake()->randomElements(['new', 'sale', 'trending', 'best-seller', 'limited'], fake()->numberBetween(0, 3)),
            'seo_title' => fake()->optional()->sentence(4),
            'seo_description' => fake()->optional()->sentence(8),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Product $product) {
            $product->images()->createMany([
                ['url' => fake()->imageUrl(800, 800), 'alt' => $product->name.' image 1', 'width' => 800, 'height' => 800, 'sort_order' => 0],
                ['url' => fake()->imageUrl(800, 800), 'alt' => $product->name.' image 2', 'width' => 800, 'height' => 800, 'sort_order' => 1],
            ]);

            $product->variants()->createMany([
                [
                    'name' => 'Default',
                    'sku' => $product->sku.'-D',
                    'price' => $product->price,
                    'sale_price' => $product->compare_at_price < $product->price ? $product->compare_at_price : null,
                    'stock' => $product->stock,
                    'options' => ['size' => 'M'],
                    'color' => 'Black',
                    'color_hex' => '#000000',
                    'size' => 'M',
                    'sort_order' => 0,
                ],
                [
                    'name' => 'Large',
                    'sku' => $product->sku.'-L',
                    'price' => $product->price,
                    'sale_price' => null,
                    'stock' => $product->stock,
                    'options' => ['size' => 'L'],
                    'color' => 'Black',
                    'color_hex' => '#000000',
                    'size' => 'L',
                    'sort_order' => 1,
                ],
            ]);
        });
    }
}
