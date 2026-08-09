<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $product = Product::factory()->create();
        $variant = $product->variants()->first();

        if (! $variant) {
            $variant = ProductVariant::create([
                'product_id' => $product->id,
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
            ]);
        }

        $effectivePrice = (float) ($variant->sale_price ?? $variant->price);
        $quantity = fake()->numberBetween(1, 3);

        return [
            'order_id' => Order::factory(),
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'name' => $product->name,
            'sku' => $variant->sku ?: $product->sku,
            'unit_price' => $effectivePrice,
            'quantity' => $quantity,
            'options' => $variant->options,
            'color' => $variant->color,
            'color_hex' => $variant->color_hex,
            'size' => $variant->size,
            'image_url' => $product->images()->first()?->url,
        ];
    }
}