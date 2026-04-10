import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useCart, QuantityType } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface Variant {
  id: string;
  color: string;
  size: string | null;
  in_stock: boolean;
}

interface ProductImage {
  id: string;
  image_url: string;
  color: string | null;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  price: number | null;
  price_media_docena: number | null;
  price_docena: number | null;
  price_mayoreo: number | null;
  sold_out: boolean;
}

interface Props {
  product: Product;
  onClose: () => void;
}

const qtyOptions: { value: QuantityType; label: string; units: number }[] = [
  { value: "media_docena", label: "Media Docena (6 uds)", units: 6 },
  { value: "docena", label: "Docena (12 uds)", units: 12 },
];

export default function ProductDetailModal({ product, onClose }: Props) {
  const { addItem } = useCart();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedQty, setSelectedQty] = useState<QuantityType>("docena");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [varRes, imgRes] = await Promise.all([
        supabase.from("product_variants").select("id, color, size, in_stock").eq("product_id", product.id),
        supabase.from("product_images").select("id, image_url, color, sort_order").eq("product_id", product.id).order("sort_order"),
      ]);
      if (varRes.data && varRes.data.length > 0) {
        setVariants(varRes.data as Variant[]);
        const firstInStock = varRes.data.find((v: any) => v.in_stock);
        setSelectedColor(firstInStock ? firstInStock.color : varRes.data[0].color);
      }
      if (imgRes.data) {
        setImages(imgRes.data as ProductImage[]);
      }
    };
    fetchData();
  }, [product.id]);

  const allImages = (() => {
    const imgs: { url: string; color: string | null }[] = [];
    if (product.image_url) imgs.push({ url: product.image_url, color: null });
    images.forEach((img) => imgs.push({ url: img.image_url, color: img.color }));
    return imgs;
  })();

  useEffect(() => {
    if (selectedColor && allImages.length > 0) {
      const idx = allImages.findIndex((img) => img.color?.toLowerCase() === selectedColor.toLowerCase());
      if (idx >= 0) setCurrentImageIndex(idx);
    }
  }, [selectedColor, allImages.length]);

  const uniqueColors = [...new Map(variants.map((v) => [v.color, v])).values()];
  const selectedVariant = variants.find((v) => v.color === selectedColor);
  const isSoldOut = product.sold_out;
  const colorSoldOut = selectedVariant ? !selectedVariant.in_stock : false;
  const disabled = isSoldOut || colorSoldOut;

  const currentPrice = selectedQty === "docena" ? product.price_docena : product.price_media_docena;

  const goNext = useCallback(() => {
    setCurrentImageIndex((i) => (i + 1) % Math.max(allImages.length, 1));
  }, [allImages.length]);

  const goPrev = useCallback(() => {
    setCurrentImageIndex((i) => (i - 1 + Math.max(allImages.length, 1)) % Math.max(allImages.length, 1));
  }, [allImages.length]);

  const handleAdd = () => {
    if (disabled) return;
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: allImages[currentImageIndex]?.url || product.image_url,
      quantityType: selectedQty,
      color: selectedColor || undefined,
      size: selectedVariant?.size || undefined,
      unitPrice: currentPrice || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goPrev() : goNext();
    }
    setTouchStart(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Image Slider */}
        <div
          className="relative aspect-square bg-secondary overflow-hidden rounded-t-2xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            {allImages.length > 0 ? (
              <motion.img
                key={currentImageIndex}
                src={allImages[currentImageIndex]?.url}
                alt={product.name}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.25 }}
                className={`w-full h-full object-cover ${isSoldOut ? "grayscale" : ""}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sin imagen</div>
            )}
          </AnimatePresence>

          {allImages.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-2 hover:bg-card transition-colors">
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-2 hover:bg-card transition-colors">
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </>
          )}

          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? "bg-accent w-4" : "bg-card/60"}`}
                />
              ))}
            </div>
          )}

          {isSoldOut && (
            <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground font-bold text-lg px-6 py-3 rounded-xl rotate-[-12deg] shadow-lg">AGOTADO</span>
            </div>
          )}

          <button onClick={onClose} className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm rounded-full p-2 hover:bg-card transition-colors">
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-5">
          <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1">{product.category}</p>
          <h2 className="text-xl font-bold text-foreground mb-3">{product.name}</h2>

          {/* Prices in Bs */}
          <div className="flex flex-wrap gap-3 mb-4">
            {product.price_media_docena && (
              <div className="bg-secondary rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Media Docena</p>
                <p className="text-sm font-bold text-foreground">Bs {Number(product.price_media_docena).toFixed(2)}</p>
              </div>
            )}
            {product.price_docena && (
              <div className="bg-secondary rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Docena</p>
                <p className="text-sm font-bold text-foreground">Bs {Number(product.price_docena).toFixed(2)}</p>
              </div>
            )}
            {product.price_mayoreo && (
              <div className="bg-secondary rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Mayor (+12)</p>
                <p className="text-sm font-bold text-foreground">Bs {Number(product.price_mayoreo).toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Color selector with stock bubbles */}
          {uniqueColors.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((v) => (
                  <button
                    key={v.color}
                    onClick={() => setSelectedColor(v.color)}
                    className={`relative text-xs px-3 py-1.5 rounded-full border transition-all ${
                      selectedColor === v.color
                        ? "border-accent bg-accent/10 text-accent font-medium"
                        : "border-border text-muted-foreground hover:border-foreground"
                    } ${!v.in_stock ? "opacity-60" : ""}`}
                  >
                    {v.color}
                    {!v.in_stock && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                        <X className="h-2.5 w-2.5 text-destructive-foreground" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colorSoldOut && !isSoldOut && (
            <p className="text-destructive text-xs mb-3">Este color está agotado</p>
          )}

          {/* Quantity */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Cantidad</p>
            <div className="grid grid-cols-2 gap-2">
              {qtyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedQty(opt.value)}
                  disabled={disabled}
                  className={`text-sm py-2.5 rounded-lg border transition-all ${
                    selectedQty === opt.value
                      ? "border-accent bg-accent/10 text-accent font-medium"
                      : "border-border text-muted-foreground hover:border-foreground"
                  } disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated price */}
          {currentPrice && !disabled && (
            <div className="mb-4 bg-accent/5 border border-accent/20 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground">Precio estimado</p>
              <p className="text-lg font-bold text-accent">Bs {Number(currentPrice).toFixed(2)}</p>
            </div>
          )}

          <motion.button
            whileTap={disabled ? {} : { scale: 0.95 }}
            onClick={handleAdd}
            disabled={disabled}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
              disabled
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : added
                ? "bg-green-600 text-primary-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            {isSoldOut ? "Agotado" : colorSoldOut ? "Color agotado" : added ? "¡Agregado!" : "Añadir al pedido"}
          </motion.button>

          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Pedido mínimo: Media Docena (6 uds)
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
