<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get the current user's cart (creating one lazily if needed).
     */
    public function index(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user()->id);

        return response()->json([
            'success' => true,
            'data' => ['cart' => $this->cartPayload($cart)],
        ]);
    }

    /**
     * Add an item to the cart (or bump its quantity if the variant already exists).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'productId' => ['required', 'string'],
            'variantId' => ['required', 'string'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ]);

        $quantity = (int) ($validated['quantity'] ?? 1);

        $product = Product::where('status', 'active')->find($validated['productId']);
        $variant = ProductVariant::where('product_id', $validated['productId'])
            ->find($validated['variantId']);

        if (! $product || ! $variant) {
            return response()->json([
                'success' => false,
                'message' => 'Product or variant not found',
            ], 404);
        }

        $cart = $this->getOrCreateCart($request->user()->id);

        $item = $cart->items()->where('variant_id', $variant->id)->first();
        if ($item) {
            $item->update(['quantity' => $item->quantity + $quantity]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'quantity' => $quantity,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => ['cart' => $this->cartPayload($cart->fresh(['items.product.images', 'items.product.variants', 'items.product.category', 'items.variant']))],
        ]);
    }

    /**
     * Update the quantity of a specific cart item.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $item = CartItem::where('cart_id', $request->user()->cart?->id ?? 0)
            ->find($id);

        if (! $item) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found',
            ], 404);
        }

        $item->update(['quantity' => $validated['quantity']]);

        return response()->json([
            'success' => true,
            'data' => ['cart' => $this->cartPayload($item->cart->fresh(['items.product.images', 'items.product.variants', 'items.product.category', 'items.variant']))],
        ]);
    }

    /**
     * Remove a specific item from the cart.
     */
    public function destroyItem(Request $request, string $id): JsonResponse
    {
        $item = CartItem::where('cart_id', $request->user()->cart?->id ?? 0)
            ->find($id);

        if (! $item) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found',
            ], 404);
        }

        $cart = $item->cart;
        $item->delete();

        return response()->json([
            'success' => true,
            'data' => ['cart' => $this->cartPayload($cart->fresh(['items.product.images', 'items.product.variants', 'items.product.category', 'items.variant']))],
        ]);
    }

    /**
     * Empty the user's cart.
     */
    public function destroy(Request $request): JsonResponse
    {
        $cart = $request->user()->cart;

        if ($cart) {
            $cart->items()->delete();
        }

        $cart = $this->getOrCreateCart($request->user()->id);

        return response()->json([
            'success' => true,
            'data' => ['cart' => $this->cartPayload($cart)],
        ]);
    }

    private function getOrCreateCart(int $userId): Cart
    {
        return Cart::firstOrCreate(['user_id' => $userId]);
    }

    /**
     * Build the frontend-compatible cart payload.
     *
     * `transformCart()` in the frontend expects each item's `variant` to be a
     * scalar id (it calls `item.variant?.toString()`), plus an `item.price`
     * carrying the effective (sale) unit price.
     */
    private function cartPayload(Cart $cart): array
    {
        $items = $cart->items
            ->filter(fn ($item) => $item->product && $item->variant)
            ->map(function ($item) {
                $variant = $item->variant;
                $effectivePrice = (float) ($variant->sale_price ?? $variant->price);

                return [
                    '_id' => (string) $item->id,
                    'product' => new ProductResource($item->product->loadMissing(['category', 'images', 'variants'])),
                    'variant' => (string) $variant->id,
                    'quantity' => (int) $item->quantity,
                    'price' => $effectivePrice,
                ];
            })
            ->values()
            ->all();

        $total = array_reduce($items, function (float $sum, array $item) {
            return $sum + (float) $item['price'] * (int) $item['quantity'];
        }, 0.0);

        return [
            '_id' => (string) $cart->id,
            'items' => $items,
            'total' => round($total, 2),
        ];
    }
}
