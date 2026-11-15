"use client";

import { useState, useRef, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Package,
  DollarSign,
  Layers,
  Hash,
  FileText,
  ImagePlus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ListPlus,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Wearables",
  "Furniture",
  "Accessories",
  "Fashion",
  "Home Decor",
] as const;

const addProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(120, "Product name is too long"),
  shortDescription: z.string().min(5, "Short description must be at least 5 characters").max(200, "Short description is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description is too long"),
  price: z.number({ message: "Price is required" }).positive("Price must be greater than 0"),
  originalPrice: z.number().positive("Original price must be greater than 0").optional(),
  category: z.string().min(1, "Please select a category"),
  stock: z.number({ message: "Stock quantity is required" }).int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  features: z.array(z.object({ value: z.string().min(1, "Feature cannot be empty") })).optional(),
});

type AddProductFormData = z.infer<typeof addProductSchema>;

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      price: undefined as unknown as number,
      originalPrice: undefined,
      category: "",
      stock: undefined as unknown as number,
      features: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const featureInputRef = useRef<HTMLInputElement>(null);

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    if (fields.some((f) => f.value === trimmed)) {
      toast.error("This feature is already added.");
      return;
    }
    if (fields.length >= 10) {
      toast.error("Maximum 10 features allowed.");
      return;
    }
    append({ value: trimmed });
    setFeatureInput("");
    featureInputRef.current?.focus();
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
  };

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const totalImages = selectedImages.length + files.length;
      if (totalImages > 5) {
        setImageError("You can upload a maximum of 5 images.");
        return;
      }

      const validFiles: File[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setImageError("Only image files are allowed.");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setImageError("Each image must be under 5 MB.");
          return;
        }
        validFiles.push(file);
      }

      setImageError(null);
      setSelectedImages((prev) => [...prev, ...validFiles]);
      setImagePreviews((prev) => [
        ...prev,
        ...validFiles.map((file) => URL.createObjectURL(file)),
      ]);

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [selectedImages.length]
  );

  const removeImage = useCallback(
    (index: number) => {
      URL.revokeObjectURL(imagePreviews[index]);
      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
      setImageError(null);
    },
    [imagePreviews]
  );

  const onSubmit = async (data: AddProductFormData) => {
    if (selectedImages.length === 0) {
      setImageError("Please upload at least one product image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("short_description", data.shortDescription);
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      if (data.originalPrice) {
        formData.append("original_price", String(data.originalPrice));
      }
      formData.append("category", data.category);
      formData.append("stock", String(data.stock));

      data.features?.forEach((f) => formData.append("features", f.value));

      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      // await axios.post("/api/admin/products", formData);

      toast.success("Product added successfully!");
      handleClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleClose = () => {
    reset();
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviews([]);
    setImageError(null);
    setFeatureInput("");
    onOpenChange(false);
  };

  const inputClass = (hasError: boolean, hasIcon = true) =>
    `w-full h-10 ${hasIcon ? "pl-9" : "px-3"} pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
      hasError
        ? "border-destructive focus:ring-2 focus:ring-destructive/30"
        : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
    }`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Add New Product
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Fill in the product details below. Images will be uploaded as files.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product Name</Label>
            <div className="relative">
              <Package className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="product-name"
                type="text"
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                {...register("name")}
                className={inputClass(!!errors.name)}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-short-desc">Short Description</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="product-short-desc"
                type="text"
                placeholder="A brief tagline or one-liner for the product"
                {...register("shortDescription")}
                className={inputClass(!!errors.shortDescription)}
              />
            </div>
            {errors.shortDescription && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.shortDescription.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-desc">Full Description</Label>
            <textarea
              id="product-desc"
              rows={3}
              placeholder="Detailed product description with key selling points…"
              {...register("description")}
              className={`w-full px-3 py-2.5 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none resize-none ${
                errors.description
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="product-price">Selling Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("price", { valueAsNumber: true })}
                  className={inputClass(!!errors.price)}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-original-price">
                List Price{" "}
                <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional)</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="product-original-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("originalPrice", { valueAsNumber: true })}
                  className={inputClass(!!errors.originalPrice)}
                />
              </div>
              {errors.originalPrice && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.originalPrice.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="product-category">Category</Label>
              <div className="relative">
                <Layers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  id="product-category"
                  {...register("category")}
                  className={`${inputClass(!!errors.category)} appearance-none cursor-pointer`}
                >
                  <option value="">Select a category</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-stock">Stock Quantity</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("stock", { valueAsNumber: true })}
                  className={inputClass(!!errors.stock)}
                />
              </div>
              {errors.stock && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.stock.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Features{" "}
              <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional, max 10)</span>
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <ListPlus className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  ref={featureInputRef}
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={handleFeatureKeyDown}
                  placeholder="e.g. Noise Cancelling"
                  className={inputClass(false)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                disabled={!featureInput.trim()}
                className="h-10 px-3 shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {fields.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {fields.map((field, i) => (
                  <span
                    key={field.id}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-muted px-2.5 py-1 rounded-full border"
                  >
                    {field.value}
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Product Images{" "}
              <span className="text-muted-foreground font-normal normal-case tracking-normal">(max 5, under 5 MB each)</span>
            </Label>

            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${
                imageError
                  ? "border-destructive bg-destructive/5"
                  : "border-border"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <ImagePlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">
                Click to upload images
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PNG, JPG, WEBP up to 5 MB
              </p>
            </div>

            {imageError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {imageError}
              </p>
            )}

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 pt-1">
                {imagePreviews.map((src, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
                  >
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(i);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/90 text-muted-foreground hover:text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-1.5 min-w-[160px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
