import { motion } from "framer-motion";
import { Plus, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart, QuantityType } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

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
  sold_out: boolean;
}

interface ProductCardProps {
  product: Product;
  index: number;
}

const qtyOptions: { value: QuantityType; label: string; units: number }[] = [
  { value: "docena", label: "Docena (12)", units: 12 },
  { value: "media_docena", label: "Media Docena (6)", units: 6 },
  { value: "cuarta", label: "Cuarta (3)", units: 3 },
];

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedQty, setSelectedQty] = useState<QuantityType>("docena");
  const [added, setAdded] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");

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

  const handleAdd = () => {
    if (disabled) return;
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.image_url,
      quantityType: selectedQty,
      color: selectedColor || undefined,
      size: selectedVariant?.size || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group bg-card rounded-xl overflow-hidden border border-border"
      style={{ boxShadow: "var(--card-shadow)" }}
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
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground font-bold text-sm px-4 py-2 rounded-lg rotate-[-12deg] shadow-lg">
              AGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-foreground text-lg mb-1 truncate">{product.name}</h3>
        {product.price !== null && (
          <p className="text-muted-foreground text-sm mb-2">S/ {product.price.toFixed(2)}</p>
        )}

        {/* Color selector */}
        {uniqueColors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {uniqueColors.map((v) => (
              <button
                key={v.color}
                onClick={() => setSelectedColor(v.color)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  selectedColor === v.color
                    ? "border-accent bg-accent/10 text-accent font-medium"
                    : "border-border text-muted-foreground hover:border-foreground"
                } ${!v.in_stock ? "line-through opacity-50" : ""}`}
              >
                {v.color}
              </button>
            ))}
          </div>
        )}

        {colorSoldOut && !isSoldOut && (
          <div className="flex items-center gap-1 text-destructive text-xs mb-2">
            <AlertTriangle className="h-3 w-3" />
            Color agotado
          </div>
        )}

        {/* Quantity Selector */}
        <select
          value={selectedQty}
          onChange={(e) => setSelectedQty(e.target.value as QuantityType)}
          disabled={disabled}
          className="w-full mb-3 bg-secondary text-foreground text-sm rounded-md px-3 py-2 border border-border outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          {qtyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Add Button */}
        <motion.button
          whileTap={disabled ? {} : { scale: 0.95 }}
          onClick={handleAdd}
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
          {isSoldOut ? "Agotado" : colorSoldOut ? "Color agotado" : added ? "¡Agregado!" : "Añadir al pedido"}
        </motion.button>

        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          Pedido mínimo: Cuarta (3 uds)
        </p>
      </div>
    </motion.div>
  );
}
