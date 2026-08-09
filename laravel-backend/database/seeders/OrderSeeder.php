<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    private const ORDER_COUNT = 240;

    private const STATUS_WEIGHTS = [
        'delivered' => 65,
        'processing' => 17,
        'shipped' => 8,
        'pending' => 7,
        'cancelled' => 3,
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Order::query()->count() >= self::ORDER_COUNT) {
            $this->command?->info("Orders already seeded ({Order::query()->count()}), skipping.");

            return;
        }

        $admin = User::query()->where('role', 'admin')->first();
        $customers = User::query()->where('role', 'customer')->orderBy('id')->get()->all();
        $products = Product::query()->with('variants')->where('status', 'active')->get()->all();

        if (count($customers) === 0 || count($products) === 0) {
            $this->command?->warn('OrderSeeder requires seeded customers and products. Skipping.');

            return;
        }

        $existingNumbers = Order::query()->pluck('order_number')->all();
        $existingSet = array_flip($existingNumbers);

        for ($i = 0; $i < self::ORDER_COUNT; $i++) {
            $status = $this->weightedStatus();

            if ($status === 'cancelled') {
                $createdAt = now()->subMonths(rand(2, 24))->subDays(rand(0, 27));
            } elseif ($status === 'pending') {
                $createdAt = now()->subDays(rand(0, 5))->subHours(rand(1, 20));
            } elseif ($status === 'processing') {
                $createdAt = now()->subDays(rand(1, 10))->subHours(rand(1, 20));
            } elseif ($status === 'shipped') {
                $createdAt = now()->subDays(rand(6, 18))->subHours(rand(1, 20));
            } else { // delivered - spread across the whole history incl. recent days
                $roll = rand(1, 100);
                if ($roll <= 45) {
                    $createdAt = now()->subDays(rand(0, 30))->subHours(rand(1, 20));
                } elseif ($roll <= 75) {
                    $createdAt = now()->subMonths(rand(1, 6))->subDays(rand(0, 27));
                } else {
                    $createdAt = now()->subMonths(rand(7, 24))->subDays(rand(0, 27));
                }
            }

            do {
                $orderNumber = 'ORD-'.strtoupper(Str::random(10));
            } while (isset($existingSet[$orderNumber]));
            $existingSet[$orderNumber] = true;

            $customer = $customers[array_rand($customers)];
            $itemCount = rand(1, 4);

            $orderItems = [];
            $subtotal = 0.0;
            $usedProductIds = [];

            for ($j = 0; $j < $itemCount; $j++) {
                $product = $products[array_rand($products)];
                if (isset($usedProductIds[$product->id]) && rand(0, 1)) {
                    $j--;

                    continue;
                }
                $usedProductIds[$product->id] = true;

                $variants = $product->variants->all();
                $variant = $variants ? $variants[array_rand($variants)] : null;
                $quantity = rand(1, 3);
                $unitPrice = $variant && $variant->sale_price ? (float) $variant->sale_price : (float) $product->price;
                $subtotal += round($unitPrice * $quantity, 2);

                $orderItems[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variant?->id,
                    'name' => $product->name,
                    'sku' => $variant?->sku ?: $product->sku,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'options' => $variant?->options,
                    'color' => $variant?->color,
                    'color_hex' => $variant?->color_hex,
                    'size' => $variant?->size,
                    'image_url' => $product->images()->value('url'),
                ];
            }

            if (count($orderItems) === 0) {
                continue;
            }

            $shipping = $subtotal >= 100 ? 0.0 : 9.99;
            $tax = round($subtotal * 0.08, 2);
            $total = round($subtotal + $shipping + $tax, 2);
            $paid = $status !== 'pending' ? (clone $createdAt)->addMinutes(rand(2, 120)) : null;

            $order = Order::query()->create([
                'user_id' => $customer->id,
                'order_number' => $orderNumber,
                'status' => $status,
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'tax' => $tax,
                'discount' => 0,
                'total' => $total,
                'currency' => 'INR',
                'shipping_method' => rand(0, 3) > 0 ? 'standard' : 'express',
                'shipping_address' => [
                    'firstName' => $this->firstNameFromName($customer->name),
                    'lastName' => $this->lastNameFromName($customer->name),
                    'address1' => rand(1, 400).' '.fake()->streetName(),
                    'address2' => rand(0, 2) === 0 ? fake()->secondaryAddress() : null,
                    'city' => $this->randomCity(),
                    'state' => $this->randomState(),
                    'zip' => fake()->numberBetween(100001, 700001).'-'.rand(1, 9999),
                    'country' => 'India',
                    'phone' => '+91'.fake()->numerify('9#########'),
                ],
                'razorpay_order_id' => 'order_'.Str::random(15),
                'razorpay_payment_id' => $paid ? 'pay_'.Str::random(15) : null,
                'razorpay_signature' => $paid ? Str::random(64) : null,
                'paid_at' => $paid,
                'created_at' => $createdAt,
                'updated_at' => (clone $createdAt)->addDays(rand(0, 14)),
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            $this->createStatusHistory($order, $status, $admin, $createdAt);
        }

        $this->command?->info('Orders seeded: '.self::ORDER_COUNT);
    }

    /**
     * Create plausible status history rows for an order up to its current status.
     */
    private function createStatusHistory(Order $order, string $status, ?User $admin, \DateTimeInterface $createdAt): void
    {
        $entry = function (string $from, string $to, int $hoursAfter) use ($order, $admin, $createdAt) {
            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'from_status' => $from,
                'to_status' => $to,
                'changed_by' => $admin?->id,
                'created_at' => (clone $createdAt)->addHours($hoursAfter),
                'updated_at' => (clone $createdAt)->addHours($hoursAfter),
            ]);
        };

        switch ($status) {
            case 'processing':
                $entry('pending', 'processing', rand(1, 48));
                break;
            case 'shipped':
                $entry('pending', 'processing', rand(1, 48));
                $entry('processing', 'shipped', rand(24, 120));
                break;
            case 'delivered':
                $entry('pending', 'processing', rand(1, 48));
                $entry('processing', 'shipped', rand(24, 120));
                $entry('shipped', 'delivered', rand(48, 240));
                break;
            case 'cancelled':
                $entry('pending', 'cancelled', rand(1, 48));
                break;
        }
    }

    private function weightedStatus(): string
    {
        $rand = rand(1, 100);
        $threshold = 0;

        foreach (self::STATUS_WEIGHTS as $status => $weight) {
            $threshold += $weight;
            if ($rand <= $threshold) {
                return $status;
            }
        }

        return 'delivered';
    }

    private function firstNameFromName(string $name): string
    {
        return trim(explode(' ', $name)[0]);
    }

    private function lastNameFromName(string $name): string
    {
        $parts = explode(' ', $name);

        return count($parts) > 1 ? end($parts) : $name;
    }

    private function randomCity(): string
    {
        $cities = [
            'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai',
            'Kolkata', 'Pune', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur',
            'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara',
            'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
            'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad',
        ];

        return $cities[array_rand($cities)];
    }

    private function randomState(): string
    {
        $states = [
            'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Gujarat', 'Tamil Nadu',
            'West Bengal', 'Rajasthan', 'Haryana', 'Uttar Pradesh', 'Punjab', 'Kerala',
            'Madhya Pradesh', 'Andhra Pradesh', 'Bihar', 'Jharkhand', 'Odisha',
            'Chhattisgarh', 'Jammu and Kashmir', 'Uttarakhand', 'Himachal Pradesh',
        ];

        return $states[array_rand($states)];
    }
}