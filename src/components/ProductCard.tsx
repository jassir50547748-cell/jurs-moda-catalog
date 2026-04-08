import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCart, QuantityType } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  price: number | null;
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

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.image_url,
      quantityType: selectedQty,
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
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sin imagen
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
          <p className="text-muted-foreground text-sm mb-3">S/ {product.price.toFixed(2)}</p>
        )}

        {/* Quantity Selector */}
        <select
          value={selectedQty}
          onChange={(e) => setSelectedQty(e.target.value as QuantityType)}
          className="w-full mb-3 bg-secondary text-foreground text-sm rounded-md px-3 py-2 border border-border outline-none focus:ring-2 focus:ring-ring"
        >
          {qtyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Add Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
            added
              ? "bg-green-600 text-primary-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          <Plus className="h-4 w-4" />
          {added ? "¡Agregado!" : "Añadir al pedido"}
        </motion.button>
      </div>
    </motion.div>
  );
}
