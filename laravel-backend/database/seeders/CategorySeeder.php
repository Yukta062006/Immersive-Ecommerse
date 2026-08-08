<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public const CATEGORIES = [
        'Electronics' => 'Gadgets, audio, and smart devices for every day.',
        'Apparel' => 'Modern, comfortable clothing for all seasons.',
        'Footwear' => 'Sneakers, boots, and more for every step.',
        'Accessories' => 'Bags, watches, and finishing touches.',
        'Outerwear' => 'Jackets and coats built to last.',
        'Bags' => 'Everyday carry and travel essentials.',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $order = 0;

        foreach (self::CATEGORIES as $name => $description) {
            Category::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => $description,
                    'image' => null,
                    'sort_order' => $order++,
                    'is_active' => true,
                ]
            );
        }
    }
}
