<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with(['category', 'images', 'variants']);

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->has('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }
        if ($request->has('featured')) {
            $query->where('featured', filter_var($request->query('featured'), FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%"));
        }

        $page = max(1, (int) $request->query('page', 1));
        $limit = min(100, max(1, (int) $request->query('limit', 15)));

        $products = $query
            ->orderByDesc('created_at')
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => [
                'products' => ProductResource::collection($products->items()),
                'pagination' => [
                    'page' => $products->currentPage(),
                    'limit' => $products->perPage(),
                    'total' => $products->total(),
                    'pages' => $products->lastPage(),
                ],
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $product = Product::with(['category', 'images', 'variants'])->find($id);

        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => ['product' => new ProductResource($product)],
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = DB::transaction(function () use ($request) {
            $product = Product::create($request->safe()->except(['images', 'variants']));

            $this->syncImages($product, $request->input('images', []));
            $this->syncVariants($product, $request->input('variants', []));

            return $product;
        });

        $product->load(['category', 'images', 'variants']);
        $this->forgetAggregateCache();

        return response()->json([
            'success' => true,
            'data' => ['product' => new ProductResource($product)],
        ], 201);
    }

    public function update(UpdateProductRequest $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $product = DB::transaction(function () use ($request, $product) {
            $product->update($request->safe()->except(['images', 'variants']));

            if ($request->has('images')) {
                $this->syncImages($product, $request->input('images', []));
            }
            if ($request->has('variants')) {
                $this->syncVariants($product, $request->input('variants', []));
            }

            return $product;
        });

        $product->load(['category', 'images', 'variants']);
        $this->forgetAggregateCache();

        return response()->json([
            'success' => true,
            'data' => ['product' => new ProductResource($product)],
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (! $product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        $product->delete();
        $this->forgetAggregateCache();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ], 200);
    }

    /**
     * Dashboard/analytics aggregates are cached 60s; drop them on any product write.
     */
    private function forgetAggregateCache(): void
    {
        Cache::forget('admin.dashboard');
        Cache::forget('admin.analytics.30');
        Cache::forget('admin.analytics.90');
        Cache::forget('admin.analytics.365');
        Cache::forget('admin.analytics.all');
    }

    private function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();

        foreach (array_values($images) as $index => $image) {
            ProductImage::create([
                'product_id' => $product->id,
                'url' => $image['url'],
                'alt' => $image['alt'] ?? '',
                'width' => $image['width'] ?? null,
                'height' => $image['height'] ?? null,
                'sort_order' => $index,
            ]);
        }
    }

    private function syncVariants(Product $product, array $variants): void
    {
        $product->variants()->delete();

        foreach (array_values($variants) as $index => $variant) {
            ProductVariant::create([
                'product_id' => $product->id,
                'name' => $variant['name'],
                'sku' => $variant['sku'],
                'price' => $variant['price'],
                'sale_price' => $variant['sale_price'] ?? null,
                'stock' => $variant['stock'] ?? 0,
                'options' => $variant['options'] ?? [],
                'color' => $variant['color'] ?? null,
                'color_hex' => $variant['color_hex'] ?? null,
                'size' => $variant['size'] ?? null,
                'sort_order' => $index,
            ]);
        }
    }
}
