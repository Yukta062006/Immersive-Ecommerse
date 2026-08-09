<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderStatusHistory>
 */
class OrderStatusHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $from = fake()->randomElement(['pending', 'processing', 'shipped']);
        $to = match ($from) {
            'pending' => fake()->randomElement(['processing', 'cancelled']),
            'processing' => fake()->randomElement(['shipped', 'cancelled']),
            default => 'delivered',
        };

        return [
            'order_id' => Order::factory(),
            'from_status' => $from,
            'to_status' => $to,
            'changed_by' => User::factory(),
        ];
    }
}