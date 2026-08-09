<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 15, 900);
        $shipping = $subtotal > 100 ? 0.0 : 9.99;
        $tax = round($subtotal * 0.08, 2);
        $total = round($subtotal + $shipping + $tax, 2);
        $status = fake()->randomElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

        $paid = $status === 'pending' ? null : now();

        return [
            'user_id' => User::factory(),
            'order_number' => 'ORD-'.strtoupper(Str::random(10)),
            'status' => $status,
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'tax' => $tax,
            'discount' => 0,
            'total' => $total,
            'currency' => 'INR',
            'shipping_method' => fake()->randomElement(['standard', 'express']),
            'shipping_address' => [
                'firstName' => fake()->firstName(),
                'lastName' => fake()->lastName(),
                'address1' => fake()->streetAddress(),
                'address2' => fake()->optional()->secondaryAddress(),
                'city' => fake()->city(),
                'state' => fake()->state(),
                'zip' => fake()->postcode(),
                'country' => 'India',
                'phone' => fake()->optional()->phoneNumber(),
            ],
            'razorpay_order_id' => fake()->optional(0.8)->regexify('order_[A-Za-z0-9]{15}'),
            'razorpay_payment_id' => $paid && fake()->boolean() ? fake()->regexify('pay_[A-Za-z0-9]{15}') : null,
            'razorpay_signature' => $paid && fake()->boolean() ? Str::random(64) : null,
            'paid_at' => $paid,
        ];
    }

    /**
     * Typical sealed factory: bind a user and craft 1–3 order items that
     * reference real seeded products/variants.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (Order $order) {
            if (! $order->user_id) {
                $order->user_id = User::factory()->create()->id;
            }
        });
    }
}