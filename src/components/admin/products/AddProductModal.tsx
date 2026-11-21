"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  Star,
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  Check,
  Send,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { PRODUCT_CATEGORIES } from "@/lib/validations/product";
import {
  createProductDraftApi,
  generateUploadSignaturesApi,
  registerUploadedAssetApi,
  updateProductImagesApi,
  publishProductApi,
  uploadDirectToCloudinary,
} from "@/lib/client-api/admin";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-key";

const addProductFormSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120, "Product name is too long"),
  shortDescription: z.string().trim().max(200, "Short description is too long").optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000, "Description is too long"),
  price: z.number().positive("Price must be greater than 0"),
  originalPrice: z.number().positive("Original price must be greater than 0").optional(),
  category: z.string().min(1, "Please select a category"),
  stock: z.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  features: z.array(z.object({ value: z.string().min(1, "Feature cannot be empty") })).optional(),
});

type AddProductFormData = z.infer<typeof addProductFormSchema>;

interface LocalImageItem {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
  status: "idle" | "uploading" | "registering" | "success" | "error";
  progress: number;
  error?: string;
  publicId?: string;
  secureUrl?: string;
}

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddProductModal({ open, onOpenChange, onSuccess }: AddProductModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddProductFormData>({
    resolver: zodResolver(addProductFormSchema),
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

  const [images, setImages] = useState<LocalImageItem[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  const [activeStep, setActiveStep] = useState<"form" | "uploading" | "finished">("form");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Stored state for active draft & upload session
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  // Drag and drop tracking
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const featureInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

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

      const totalImages = images.length + files.length;
      if (totalImages > 5) {
        setImageError("You can upload a maximum of 5 images.");
        return;
      }

      const validItems: LocalImageItem[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setImageError("Only image files (PNG, JPG, WEBP) are allowed.");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setImageError("Each image must be under 5 MB.");
          return;
        }

        const id = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        validItems.push({
          id,
          file,
          previewUrl: URL.createObjectURL(file),
          isPrimary: images.length === 0 && validItems.length === 0, // first image becomes primary by default
          status: "idle",
          progress: 0,
        });
      }

      setImageError(null);
      setImages((prev) => {
        const next = [...prev, ...validItems];
        // Ensure at least one is primary
        if (!next.some((img) => img.isPrimary) && next.length > 0) {
          next[0].isPrimary = true;
        }
        return next;
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [images]
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      const filtered = prev.filter((_, i) => i !== index);
      // If removed was primary, make the first one primary
      if (removed?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
    setImageError(null);
  }, []);

  const setPrimaryImage = useCallback((index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  }, []);

  const moveImage = useCallback((index: number, direction: "left" | "right") => {
    setImages((prev) => {
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  }, []);

  // Native HTML5 Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    setImages((prev) => {
      const copy = [...prev];
      const [draggedItem] = copy.splice(draggedIndex, 1);
      copy.splice(targetIndex, 0, draggedItem);
      return copy;
    });
    setDraggedIndex(null);
  };

  // Perform upload of a single image direct to Cloudinary & register asset
  const uploadAndRegisterSingleImage = async (
    item: LocalImageItem,
    index: number,
    signatureConfig: any,
    sessionId: string
  ): Promise<{ publicId: string; secureUrl: string }> => {
    // 1. Direct upload to Cloudinary
    setImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, status: "uploading", progress: 10, error: undefined } : img
      )
    );

    const cloudinaryResult = await uploadDirectToCloudinary(
      item.file,
      signatureConfig,
      (progressPercent) => {
        setImages((prev) =>
          prev.map((img, i) =>
            i === index ? { ...img, progress: Math.min(progressPercent, 90) } : img
          )
        );
      }
    );

    // 2. Register asset with server
    setImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, status: "registering", progress: 95 } : img
      )
    );

    await registerUploadedAssetApi(sessionId, {
      publicId: cloudinaryResult.public_id,
      secureUrl: cloudinaryResult.secure_url,
    });

    setImages((prev) =>
      prev.map((img, i) =>
        i === index
          ? {
              ...img,
              status: "success",
              progress: 100,
              publicId: cloudinaryResult.public_id,
              secureUrl: cloudinaryResult.secure_url,
            }
          : img
      )
    );

    return {
      publicId: cloudinaryResult.public_id,
      secureUrl: cloudinaryResult.secure_url,
    };
  };

  // Workflow executor
  const executeCreationWorkflow = async (data: AddProductFormData, autoPublish: boolean) => {
    if (images.length === 0) {
      setImageError("Please select at least one product image.");
      return;
    }

    if (!images.some((img) => img.isPrimary)) {
      setPrimaryImage(0);
    }

    setIsProcessing(true);
    setActiveStep("uploading");
    setStatusMessage("Step 1/4: Creating product draft & upload session...");

    try {
      // Step 1: Create draft and session on backend
      const draftRes = await createProductDraftApi({
        name: data.name,
        shortDescription: data.shortDescription || "",
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        category: data.category,
        stock: data.stock,
        features: data.features?.map((f) => f.value) || [],
        expectedImages: images.length,
      });

      const draftData = draftRes?.data?.data;
      if (!draftData) {
        throw new Error("Invalid response from server when creating draft");
      }

      const { productId, uploadSessionId } = draftData;
      setCurrentProductId(productId);
      setCurrentSessionId(uploadSessionId);

      // Step 2: Request signed Cloudinary upload parameters
      setStatusMessage("Step 2/4: Generating signed Cloudinary credentials...");
      const sigRes = await generateUploadSignaturesApi(uploadSessionId, {
        count: images.length,
      });

      const signatures = sigRes?.data?.data?.signatures || [];
      if (signatures.length < images.length) {
        throw new Error("Server did not return enough upload signatures");
      }

      // Step 3: Upload images directly from browser to Cloudinary & register each
      setStatusMessage("Step 3/4: Uploading images directly to Cloudinary...");
      const registeredResults: Array<{ publicId: string; secureUrl: string; isPrimary: boolean; position: number }> = [];

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const sig = signatures[i].signatureConfig;
        try {
          const res = await uploadAndRegisterSingleImage(item, i, sig, uploadSessionId);
          registeredResults.push({
            publicId: res.publicId,
            secureUrl: res.secureUrl,
            isPrimary: item.isPrimary,
            position: i,
          });
        } catch (err: any) {
          setImages((prev) =>
            prev.map((img, idx) =>
              idx === i
                ? {
                    ...img,
                    status: "error",
                    error: err?.response?.data?.message || err?.message || "Upload failed",
                  }
                : img
            )
          );
          throw new Error(`Failed to upload "${item.file.name}". You can retry failed images.`);
        }
      }

      // Step 4: Associate images and update product
      setStatusMessage("Step 4/4: Finalizing product image ordering...");
      await updateProductImagesApi(productId, {
        images: registeredResults,
      });

      // Step 5: Publish if requested
      if (autoPublish) {
        setStatusMessage("Publishing product catalog item...");
        await publishProductApi(productId);
        setIsPublished(true);
        toast.success("Product published successfully to catalog!");
      } else {
        setIsPublished(false);
        toast.success("Product draft and images saved successfully!");
      }

      queryClient.invalidateQueries({ queryKey: [queryKeys.adminProducts] });
      setActiveStep("finished");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to complete product creation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublishCurrentDraft = async () => {
    if (!currentProductId) return;
    setIsProcessing(true);
    try {
      await publishProductApi(currentProductId);
      setIsPublished(true);
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminProducts] });
      toast.success("Product published successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to publish product");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    reset();
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setImageError(null);
    setFeatureInput("");
    setActiveStep("form");
    setCurrentProductId(null);
    setCurrentSessionId(null);
    setIsPublished(false);
    onOpenChange(false);
  };

  const inputClass = (hasError: boolean, hasIcon = true) =>
    `w-full h-10 ${hasIcon ? "pl-9" : "px-3"} pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
      hasError
        ? "border-destructive focus:ring-2 focus:ring-destructive/30"
        : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
    }`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Create Product & Direct Cloudinary Upload
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Draft creation, signed direct uploads, image ordering, and instant publishing.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {activeStep === "finished" ? (
          <div className="py-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">
                {isPublished ? "Product Published Successfully!" : "Product Draft Saved Successfully!"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {isPublished
                  ? "All verified images have been uploaded directly to Cloudinary and the product is now visible in the catalog."
                  : "Your product draft and direct-uploaded Cloudinary assets are saved safely. You can publish now or keep it as draft."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product ID:</span>
                <span className="font-mono font-medium text-foreground">{currentProductId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upload Session:</span>
                <span className="font-mono text-muted-foreground truncate max-w-[200px]">{currentSessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified Images:</span>
                <span className="font-semibold text-foreground">{images.length} uploaded</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-bold capitalize ${isPublished ? "text-emerald-600" : "text-amber-600"}`}>
                  {isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              {!isPublished && (
                <Button
                  type="button"
                  onClick={handlePublishCurrentDraft}
                  disabled={isProcessing}
                  className="gap-1.5 rounded-xl text-xs"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Publish Now
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="rounded-xl text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        ) : activeStep === "uploading" ? (
          <div className="py-8 space-y-6">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary">{statusMessage}</p>
                <p className="text-[11px] text-muted-foreground">
                  Direct upload from your browser to Cloudinary CDN with server-side signature.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs">Image Upload Progress</Label>
              {images.map((img) => (
                <div
                  key={img.id}
                  className="p-3 rounded-xl border bg-card flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={img.previewUrl}
                      alt="thumbnail"
                      className="w-10 h-10 rounded-lg object-cover border shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate max-w-[200px]">{img.file.name}</p>
                        {img.isPrimary && (
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {(img.file.size / 1024).toFixed(0)} KB • Status:{" "}
                        <span className="capitalize font-semibold">{img.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {img.status === "uploading" && (
                      <span className="text-xs font-mono text-primary font-semibold">{img.progress}%</span>
                    )}
                    {img.status === "registering" && (
                      <span className="text-xs text-amber-600 font-medium">Verifying…</span>
                    )}
                    {img.status === "success" && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                        <Check className="w-4 h-4" /> Done
                      </span>
                    )}
                    {img.status === "error" && (
                      <span className="inline-flex items-center gap-1 text-destructive font-bold text-xs">
                        <AlertCircle className="w-4 h-4" /> Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-name">Product Name *</Label>
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
              <Label htmlFor="product-short-desc">Short Tagline (Optional)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="product-short-desc"
                  type="text"
                  placeholder="A brief one-liner for search and highlights"
                  {...register("shortDescription")}
                  className={inputClass(!!errors.shortDescription)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-desc">Full Description *</Label>
              <textarea
                id="product-desc"
                rows={3}
                placeholder="Detailed description with key specifications…"
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
                <Label htmlFor="product-price">Selling Price ($) *</Label>
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
                  Original Price ($){" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
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
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="product-category">Category *</Label>
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
                <Label htmlFor="product-stock">Stock Quantity *</Label>
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

            {/* Features */}
            <div className="space-y-2">
              <Label>
                Features{" "}
                <span className="text-muted-foreground font-normal">(optional, max 10)</span>
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
                    placeholder="e.g. 30 Hour Battery Life"
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

            {/* Product Images with Ordering, Drag-Drop, and Primary Selection */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">
                    Product Images ({images.length}/5) *
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Drag to reorder positions. Click the star to mark primary thumbnail. Max 5 MB each.
                  </p>
                </div>
                {images.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5 h-8 text-xs rounded-lg"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>Choose Images</span>
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />

              {images.length === 0 ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${
                    imageError ? "border-destructive bg-destructive/5" : "border-border"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground mb-2 stroke-1" />
                  <p className="text-sm font-medium text-foreground">Click to select product images</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Images will be uploaded directly to Cloudinary with secure signature
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {images.map((img, i) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(i)}
                      className={`relative group aspect-square rounded-xl overflow-hidden border bg-muted transition-all select-none cursor-move ${
                        img.isPrimary ? "ring-2 ring-primary border-primary shadow-sm" : "border-border"
                      } ${draggedIndex === i ? "opacity-40 scale-95" : "opacity-100"}`}
                    >
                      <img
                        src={img.previewUrl}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                      />

                      {/* Position & Primary indicator */}
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                        <span className="w-5 h-5 rounded-md bg-black/60 text-white text-[10px] font-bold flex items-center justify-center backdrop-blur-xs">
                          #{i + 1}
                        </span>
                        {img.isPrimary && (
                          <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            Primary
                          </span>
                        )}
                      </div>

                      {/* Top right actions */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                        <button
                          type="button"
                          title={img.isPrimary ? "Primary image" : "Set as primary"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryImage(i);
                          }}
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                            img.isPrimary
                              ? "bg-amber-500 text-white"
                              : "bg-black/50 text-white/80 hover:text-amber-300"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${img.isPrimary ? "fill-current" : ""}`} />
                        </button>

                        <button
                          type="button"
                          title="Remove image"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(i);
                          }}
                          className="w-6 h-6 rounded-md bg-black/50 text-white/80 hover:text-rose-400 hover:bg-black/70 flex items-center justify-center transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom reorder arrows */}
                      <div className="absolute bottom-1.5 inset-x-1.5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(i, "left");
                          }}
                          className="w-6 h-6 rounded bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
                          title="Move left"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <span className="text-[9px] font-medium text-white/80 bg-black/50 px-1 py-0.5 rounded">
                          Drag
                        </span>
                        <button
                          type="button"
                          disabled={i === images.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(i, "right");
                          }}
                          className="w-6 h-6 rounded bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
                          title="Move right"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {imageError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {imageError}
                </p>
              )}
            </div>

            {/* Actions footer */}
            <div className="pt-4 border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isProcessing}
                onClick={handleSubmit((data) => executeCreationWorkflow(data, false))}
                className="gap-1.5 rounded-xl text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft & Upload</span>
              </Button>

              <Button
                type="button"
                disabled={isProcessing}
                onClick={handleSubmit((data) => executeCreationWorkflow(data, true))}
                className="gap-1.5 rounded-xl text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save & Publish</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
