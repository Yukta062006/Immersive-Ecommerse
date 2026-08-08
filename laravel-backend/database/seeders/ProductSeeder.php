<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    private const PRODUCT_DEFS = [
        'Aurora Wireless Headphones' => ['Electronics', 249.99, 199.99, ['new', 'best-seller']],
        'Nimbus Smart Watch' => ['Electronics', 179.99, null, ['trending']],
        'Vertex Bluetooth Speaker' => ['Electronics', 89.99, 69.99, ['sale']],
        'Slate Canvas Jacket' => ['Outerwear', 149.99, null, ['new']],
        'Ember Knit Sweater' => ['Apparel', 79.99, 59.99, ['sale']],
        'Drift Leather Boots' => ['Footwear', 189.99, null, ['best-seller']],
        'Orbit Running Sneakers' => ['Footwear', 129.99, 99.99, ['new', 'trending']],
        'Voyager Carry-On Bag' => ['Bags', 219.99, 179.99, ['best-seller']],
        'Metro City Tote' => ['Bags', 99.99, null, ['new']],
        'Pulse Phone Case' => ['Accessories', 19.99, 14.99, ['sale']],
        'Halo Desk Lamp' => ['Electronics', 59.99, null, ['new']],
        'Terra Utility Vest' => ['Outerwear', 119.99, 94.99, ['sale']],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::PRODUCT_DEFS as $name => [$categoryName, $price, $salePrice, $tags]) {
            $category = Category::query()->where('name', $categoryName)->first();

            if (! $category) {
                continue;
            }

            $slug = Str::slug($name);

            $product = Product::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => "A premium {$categoryName} essential, crafted for comfort and everyday reliability.",
                    'long_description' => "Experience the {$name} — thoughtfully designed, built with quality materials, and ready to become part of your daily routine.",
                    'price' => $price,
                    'compare_at_price' => $salePrice ?? $price,
                    'sku' => 'SKU-'.strtoupper(Str::random(8)),
                    'category_id' => $category->id,
                    'featured' => in_array('best-seller', $tags),
                    'stock' => rand(20, 300),
                    'low_stock_threshold' => 10,
                    'status' => 'active',
                    'tags' => $tags,
                ]
            );

            if ($product->images()->count() === 0) {
                $product->images()->createMany([
                    ['url' => "https://picsum.photos/seed/{$slug}-1/800/800", 'alt' => "{$name} image 1", 'width' => 800, 'height' => 800, 'sort_order' => 0],
                    ['url' => "https://picsum.photos/seed/{$slug}-2/800/800", 'alt' => "{$name} image 2", 'width' => 800, 'height' => 800, 'sort_order' => 1],
                ]);
            }

            if ($product->variants()->count() === 0) {
                $product->variants()->createMany([
                    [
                        'name' => 'Default',
                        'sku' => $product->sku.'-D',
                        'price' => $price,
                        'sale_price' => $salePrice,
                        'stock' => $product->stock,
                        'options' => ['size' => 'M'],
                        'color' => 'Black',
                        'color_hex' => '#1f2937',
                        'size' => 'M',
                        'sort_order' => 0,
                    ],
                    [
                        'name' => 'Large',
                        'sku' => $product->sku.'-L',
                        'price' => $price,
                        'sale_price' => $salePrice,
                        'stock' => $product->stock,
                        'options' => ['size' => 'L'],
                        'color' => 'Black',
                        'color_hex' => '#1f2937',
                        'size' => 'L',
                        'sort_order' => 1,
                    ],
                ]);
            }
        }
    }
}
