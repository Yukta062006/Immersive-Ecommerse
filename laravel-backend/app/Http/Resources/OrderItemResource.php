<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            '_id' => (string) $this->id,
            'productId' => $this->product_id !== null ? (string) $this->product_id : null,
            'variantId' => $this->variant_id !== null ? (string) $this->variant_id : null,
            'name' => $this->name,
            'sku' => $this->sku,
            'unitPrice' => (float) $this->unit_price,
            'quantity' => (int) $this->quantity,
            'lineTotal' => round((float) $this->unit_price * (int) $this->quantity, 2),
            'options' => $this->options ?: (object) [],
            'color' => $this->color,
            'colorHex' => $this->color_hex,
            'size' => $this->size,
            'imageUrl' => $this->image_url,
        ];
    }
}