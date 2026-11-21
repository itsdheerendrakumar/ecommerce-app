# Product Creation Workflow & Architecture Review Guide

This guide details the end-to-end architecture, backend endpoints, database models, and review steps for the production-grade product creation and Cloudinary direct upload system.

---

## 1. High-Level Architecture Overview

In standard enterprise applications, large file uploads (like high-res product photos) should **never** be piped directly through the web application server (Next.js/Node.js). Pipelining binary buffers through Node.js causes high memory consumption, CPU spikes, and server connection timeouts.

### How this implementation works:
1. **Server signs the upload**: The client asks the backend for cryptographic permissions. The backend signs parameters using the Cloudinary API secret without ever exposing that secret to the browser.
2. **Client uploads directly to Cloudinary**: The browser streams the image binary directly to Cloudinary’s CDN via HTTPS.
3. **Server verifies the asset**: After Cloudinary accepts the file, the client reports the `public_id` to the backend. The backend calls Cloudinary's Admin API to verify that the file actually exists, matches session tags/metadata, and was not forged.
4. **Draft & Publish Lifecycle**: A product starts as a `draft`. Once verified images are reordered and assigned a primary thumbnail, the admin can publish the product.
5. **Background Cleanup**: Abandoned drafts and orphaned Cloudinary uploads are automatically expired and purged via a cron job.

```
[Browser Client] ──(1) Create Draft / Session ──> [Next.js Server] ──> [MongoDB]
[Browser Client] <──(2) Return Session ID ───────── [Next.js Server]
[Browser Client] ──(3) Request Upload Signature ──> [Next.js Server] (Generates HMAC-SHA1)
[Browser Client] <──(4) Return Signed Params ────── [Next.js Server]
[Browser Client] ──(5) Upload Binary Directly ────> [Cloudinary CDN]
[Browser Client] <──(6) Return Upload Details ───── [Cloudinary CDN]
[Browser Client] ──(7) Register Asset ────────────> [Next.js Server] ──(Verify)──> [Cloudinary Admin API]
[Browser Client] ──(8) Save Order / Publish ──────> [Next.js Server] ──(status: "published")──> [MongoDB]
```

---

## 2. Database Models

### A. Product Model (`src/models/product.model.ts`)
Represents an item in the catalog.
- **`status`**: `"draft"` | `"published"` (Indexed for fast public querying).
- **`images`**: An array of subdocuments containing:
  - `publicId`: Cloudinary asset ID (e.g. `products/electronics/abc123`).
  - `secureUrl`: Full HTTPS Cloudinary delivery URL.
  - `isPrimary`: Boolean flag (exactly one image must be `true` when published).
  - `position`: Number (0, 1, 2, ...) indicating display order.
- **`createdBy`**: ObjectId reference to the `User` (Admin) who authored it.
- **`features`**: Array of key feature bullet points.

### B. UploadSession Model (`src/models/upload-session.model.ts`)
Tracks the lifecycle of an upload transaction to prevent orphan files and enforce access limits.
- **`productId`**: Reference to the draft `Product`.
- **`adminId`**: Reference to the `User` executing the upload.
- **`status`**: `"pending"` | `"uploading"` | `"completed"` | `"expired"` | `"failed"`.
- **`expectedImages`**: Maximum number of allowed uploads (capped at 5).
- **`uploadedAssets`**: Array of verified assets `{ publicId, secureUrl, bytes, format, uploadedAt }`.
- **`expiresAt`**: TTL timestamp (default: 2 hours).

---

## 3. Step-by-Step Code Review Map

### Step 1: Create Product Draft
- **File**: `src/app/api/admin/products/draft/route.ts`
- **Method**: `POST /api/admin/products/draft`
- **What it does**:
  1. Validates that the user is an authenticated `admin`.
  2. Validates product payload (`name`, `price`, `category`, `description`) with Zod.
  3. Creates a `Product` document with `status: "draft"` and empty `images: []`.
  4. Creates an `UploadSession` document linked to `productId` with a 2-hour expiration time.
  5. Returns `productId`, `uploadSessionId`, and `expiresAt` to the client.

### Step 2: Generate Cloudinary Signatures
- **File**: `src/app/api/admin/upload-sessions/[sessionId]/signatures/route.ts`
- **Method**: `POST /api/admin/upload-sessions/:sessionId/signatures`
- **What it does**:
  1. Validates session ownership and verifies `expiresAt` has not passed.
  2. Ensures the requested number of signatures does not exceed session capacity (max 5).
  3. Uses server-side utility `generateUploadSignature` in `src/lib/cloudinary.ts` to compute cryptographic signatures for each image using `api_secret`.
  4. Returns `apiKey`, `cloudName`, `signature`, `timestamp`, `folder`, `publicId`, and `tags`.
  5. **Security**: The `CLOUDINARY_API_SECRET` never leaves the backend server.

### Step 3: Direct Client-to-Cloudinary Upload
- **Files**:
  - `src/components/admin/products/AddProductModal.tsx`
  - `src/lib/client-api/admin/product.ts` (`uploadDirectToCloudinary`)
- **What it does**:
  1. For each file selected by the admin, builds a `FormData` containing the file binary and the signed parameters.
  2. Sends an HTTP `POST` directly to `https://api.cloudinary.com/v1_1/<cloud_name>/image/upload`.
  3. Displays upload progress bar and individual errors per image.

### Step 4: Asset Verification & Registration
- **File**: `src/app/api/admin/upload-sessions/[sessionId]/assets/route.ts`
- **Method**: `POST /api/admin/upload-sessions/:sessionId/assets`
- **What it does**:
  1. The client sends `{ publicId }`.
  2. Server calls `verifyCloudinaryAsset(publicId)` via Cloudinary Admin SDK.
  3. Confirms that the asset exists, that its tags match `session:<sessionId>`, and that it is not already registered.
  4. Saves the verified asset record to `UploadSession.uploadedAssets`.

### Step 5: Save Image Order and Primary Selection
- **File**: `src/app/api/admin/products/[productId]/images/route.ts`
- **Method**: `PATCH /api/admin/products/:productId/images`
- **What it does**:
  1. Admin frontend supports drag-and-drop reordering and a toggle to select the "Primary" image.
  2. Backend validates that all selected `publicId`s were registered under this session.
  3. Validates that **exactly one** image has `isPrimary: true` and that positions are sequential (`0, 1, 2, ...`).
  4. Updates `Product.images` and marks `UploadSession.status = "completed"`.

### Step 6: Publish Product
- **File**: `src/app/api/admin/products/[productId]/publish/route.ts`
- **Method**: `PATCH /api/admin/products/:productId/publish`
- **What it does**:
  1. Checks that at least one verified image is attached.
  2. Ensures valid primary image selection.
  3. Updates `Product.status` to `"published"`.
  4. The product immediately becomes visible to public shoppers on `/shop`.

### Step 7: Background Cleanup of Abandoned Uploads
- **Files**:
  - `src/app/api/cron/cleanup-uploads/route.ts`
  - `src/services/admin/product.service.ts` (`cleanupAbandonedUploads`)
  - `vercel.json`
- **What it does**:
  1. Finds expired upload sessions (`expiresAt < now` and `status: "pending" | "uploading"`).
  2. Deletes Cloudinary assets associated with these uncompleted sessions using `deleteCloudinaryAsset()`.
  3. Deletes draft products that were never completed or published.
  4. Configured to run automatically every 6 hours via Vercel Cron.

---

## 4. Public Storefront Integration (Mock Data Removed)

### What was removed:
- Removed `const mockProducts` completely from `src/store/useAppStore.ts`.
- Removed `products: Product[]` state from the Zustand store.

### How public pages work now:
- **`GET /api/products`** (`src/app/api/products/route.ts`): Queries MongoDB for products where `status === "published"`. Supports search, category filters, and price sorting.
- **`GET /api/products/:id`** (`src/app/api/products/[id]/route.ts`): Queries a single published item by its MongoDB `_id`.
- **Client Pages**:
  - `src/app/components/Home.tsx`: Uses TanStack React Query to fetch the first 4 trending items.
  - `src/app/components/Shop.tsx`: Fetches products and dynamically calculates category filter pills and counts.
  - `src/app/components/ProductDetails.tsx`: Fetches product details and provides multi-image gallery thumbnail switching.
  - `src/app/(protected)/customer/wishlist/page.tsx`: Filters live database products by the customer's saved wishlist IDs.
  - `src/app/(protected)/customer/orders/page.tsx`: Matches order item IDs against live catalog items.

---

## 5. How to Test the Entire Workflow

1. **Start the local server**:
   ```bash
   npm run dev
   ```

2. **Verify Public Store**:
   - Visit `http://localhost:3000/`. You should see seeded products under **Featured Products**.
   - Visit `http://localhost:3000/shop`. Click different categories (`Electronics`, `Wearables`, `Furniture`, `Accessories`, `Fashion`, `Home Decor`).
   - Use the search bar to search for terms like "Sony" or "Chair".
   - Click on an item to view `http://localhost:3000/product/<id>` and verify image galleries.

3. **Verify Admin Product Creation**:
   - Log in as admin (`testadmin1@yopmail.com` / `password123`).
   - Visit `http://localhost:3000/admin/products`.
   - Click **Add New Item**.
   - Fill in product name, category, price, and description.
   - Click **Save Draft**.
   - Select up to 5 images from your computer.
   - Reorder images and select which one is the Primary image.
   - Watch the direct Cloudinary upload progress.
   - Click **Save Images**.
   - On the product card, click **Publish**.
   - Check `http://localhost:3000/shop` to see your newly published product live in the store.
