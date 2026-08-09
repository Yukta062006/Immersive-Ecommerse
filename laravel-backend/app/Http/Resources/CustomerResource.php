<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $totalSpent = (float) ($this->total_spent ?? 0);
        $orderCount = (int) ($this->orders_count ?? 0);

        return [
            '_id' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'totalSpent' => round($totalSpent, 2),
            'orderCount' => $orderCount,
            'avgOrderValue' => $orderCount > 0 ? round($totalSpent / $orderCount, 2) : 0.0,
            'lastOrderAt' => $this->last_order_at ? \Illuminate\Support\Carbon::parse($this->last_order_at)->toISOString() : null,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}