# IMMERSIVE - MEGA UPDATE PLAN
# Save this to track progress across sessions

## PHASE 1: PRODUCT DATA OVERHAUL
- 1a: Write new products.ts with 20+ real products, multiple images per product, color/size variants, fake reviews
- 1b: Add brand data with logo URLs
- 1c: Add promo codes data

## PHASE 2: HERO & HOME PAGE FIXES
- 2a: Fix brand strip - make brands clickable, link to /products?brand=X
- 2b: Fix hero scrolling images - link to real product detail pages
- 2c: Fix trending section - real products with links

## PHASE 3: PRODUCT DETAIL PAGE FIXES
- 3a: Multiple image gallery (not just one image)
- 3b: Color swatches that actually switch product images
- 3c: Size selector with stock indicator
- 3d: Variant-based pricing

## PHASE 4: CHECKOUT & PAYMENT
- 4a: Add promo code input + validation
- 4b: Add tax calculation
- 4c: Add shipping cost logic (free over $100)
- 4d: Order summary with line items, discounts, tax, shipping
- 4e: Stripe payment integration (test mode)

## PHASE 5: AUTH FLOW
- 5a: Login form → API call → store tokens → redirect
- 5b: Signup form → API call → store tokens → redirect
- 5c: Protected routes check
- 5d: Account page shows user data

## PHASE 6: ADVANCED FILTERING
- 6a: Brand filter
- 6b: Price range filter
- 6c: Category filter (already exists)
- 6d: Color filter
- 6e: Sort options

## PHASE 7: PERFORMANCE & POLISH
- 7a: Image optimization (sizes, lazy loading)
- 7b: Remove fake/dead content
- 7c: Ensure zero console errors
- 7d: Build check + backup
