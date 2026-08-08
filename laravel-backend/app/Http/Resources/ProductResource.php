<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $images = $this->images->map(fn ($img) => [
            'url' => $img->url,
            'alt' => $img->alt,
            'width' => $img->width,
            'height' => $img->height,
        ])->values();

        $variants = $this->variants->map(fn ($v) => [
            '_id' => (string) $v->id,
            'name' => $v->name,
            'sku' => $v->sku,
            'price' => (float) $v->price,
            'salePrice' => $v->sale_price !== null ? (float) $v->sale_price : null,
            'stock' => (int) $v->stock,
            'options' => $v->options ?: (object) [],
            'color' => $v->color,
            'colorHex' => $v->color_hex,
            'size' => $v->size,
        ])->values();

        return [
            '_id' => (string) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'longDescription' => $this->long_description,
            'price' => (float) $this->price,
            'compareAtPrice' => $this->compare_at_price !== null ? (float) $this->compare_at_price : null,
            'sku' => $this->sku,
            'category' => [
                '_id' => (string) $this->category_id,
                'name' => $this->category->name ?? null,
            ],
            'images' => $images,
            'variants' => $variants,
            'ratings' => [
                'average' => $this->average_rating ?? 0,
                'count' => $this->review_count ?? 0,
            ],
            'tags' => $this->tags ?? [],
            'featured' => (bool) $this->featured,
            'stock' => (int) $this->stock,
            'status' => $this->status,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
