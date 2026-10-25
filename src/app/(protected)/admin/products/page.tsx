"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminProductsPage() {
  const { products } = useAppStore();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Product Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage inventory, stock levels, and product prices.</p>
        </div>
        <Button className="rounded-full">
          <Plus className="w-4 h-4 mr-1.5" /> Add New Item
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="rounded-2xl overflow-hidden border shadow-xs">
            <div className="aspect-video bg-muted relative">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-5 space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase">{product.category}</span>
              <h3 className="font-bold text-base truncate">{product.name}</h3>
              <p className="text-lg font-black text-foreground">${product.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">In Stock: {product.stock} units</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
