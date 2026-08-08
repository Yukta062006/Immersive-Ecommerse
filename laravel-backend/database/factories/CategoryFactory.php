<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name.'-'.Str::random(3)),
            'description' => fake()->optional()->sentence(),
            'image' => fake()->optional()->imageUrl(640, 640),
            'parent_id' => null,
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
