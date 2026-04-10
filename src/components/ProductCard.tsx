import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertTriangle, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart, QuantityType } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import ProductDetailModal from "./ProductDetailModal";

interface Variant {
  id: string;
  color: string;
  size: string | null;
  in_stock: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  price: number | null;
  price_media_docena?: number | null;
  price_docena?: number | null;
  price_mayoreo?: number | null;
  sold_out: boolean;
}

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    supabase
      .from("product_variants")
      .select("id, color, size, in_stock")
      .eq("product_id", product.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setVariants(data as Variant[]);
          const firstInStock = data.find((v: any) => v.in_stock);
          setSelectedColor(firstInStock ? firstInStock.color : data[0].color);
        }
      });
  }, [product.id]);

  const isSoldOut = product.sold_out;
  const selectedVariant = variants.find((v) => v.color === selectedColor);
  const colorSoldOut = selectedVariant ? !selectedVariant.in_stock : false;
  const disabled = isSoldOut || colorSoldOut;

  const uniqueColors = [...new Map(variants.map((v) => [v.color, v])).values()];

  const displayPrice = product.price_docena || product.price_media_docena || product.price;

  const handleQuickAdd = () => {
    if (disabled) return;
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.image_url,
      quantityType: "docena",
      color: selectedColor || undefined,
      size: selectedVariant?.size || undefined,
      unitPrice: product.price_docena || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="group bg-card rounded-xl overflow-hidden border border-border cursor-pointer"
        style={{ boxShadow: "var(--card-shadow)" }}
        onClick={() => setShowModal(true)}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isSoldOut ? "grayscale" : ""}`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sin imagen</div>
          )}

          {isSoldOut && (
            <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground font-bold text-sm px-4 py-2 rounded-lg rotate-[-12deg] shadow-lg">AGOTADO</span>
            </div>
          )}

          {/* View hint */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all duration-300 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="h-8 w-8 text-primary-foreground drop-shadow-lg" />
            </motion.div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-semibold text-foreground text-lg mb-1 truncate">{product.name}</h3>
          {displayPrice !== null && displayPrice !== undefined && (
            <p className="text-muted-foreground text-sm mb-2">S/ {Number(displayPrice).toFixed(2)}</p>
          )}

          {/* Color pills */}
          {uniqueColors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {uniqueColors.map((v) => (
                <span
                  key={v.color}
                  className={`text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground ${!v.in_stock ? "line-through opacity-50" : ""}`}
                >
                  {v.color}
                </span>
              ))}
            </div>
          )}

          {/* Quick add */}
          <motion.button
            whileTap={disabled ? {} : { scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleQuickAdd();
            }}
            disabled={disabled}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
              disabled
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : added
                ? "bg-green-600 text-primary-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Plus className="h-4 w-4" />
            {isSoldOut ? "Agotado" : added ? "¡Agregado!" : "Docena rápida"}
          </motion.button>

          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Toca la foto para ver más opciones
          </p>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showModal && (
          <ProductDetailModal
            product={product as any}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
