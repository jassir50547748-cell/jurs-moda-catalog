import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";

interface Variant {
  id: string;
  color: string;
  size: string | null;
  in_stock: boolean;
}

interface AdminVariantsPanelProps {
  productId: string;
  productName: string;
  onClose: () => void;
}

export default function AdminVariantsPanel({ productId, productName, onClose }: AdminVariantsPanelProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchVariants = async () => {
    const { data } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: true });
    setVariants((data as Variant[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const addVariant = async () => {
    if (!newColor.trim()) return;
    await supabase.from("product_variants").insert({
      product_id: productId,
      color: newColor.trim(),
      size: newSize.trim() || null,
    });
    setNewColor("");
    setNewSize("");
    fetchVariants();
  };

  const toggleStock = async (id: string, inStock: boolean) => {
    await supabase.from("product_variants").update({ in_stock: !inStock }).eq("id", id);
    fetchVariants();
  };

  const deleteVariant = async (id: string) => {
    await supabase.from("product_variants").delete().eq("id", id);
    fetchVariants();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-card border border-accent/30 rounded-xl p-6 mb-8 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">
          Colores/Tallas — <span className="text-accent">{productName}</span>
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Add new variant */}
      <div className="flex gap-2 mb-4">
        <input
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          placeholder="Color (ej: Negro)"
          className="flex-1 bg-secondary text-foreground rounded-lg px-3 py-2 border border-border text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        <input
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          placeholder="Talla (opcional)"
          className="w-28 bg-secondary text-foreground rounded-lg px-3 py-2 border border-border text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        <button
          onClick={addVariant}
          className="flex items-center gap-1 bg-accent text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar
        </button>
      </div>

      {/* Variants list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : variants.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay variantes. Agrega colores arriba.</p>
      ) : (
        <div className="space-y-2">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">{v.color}</span>
                {v.size && <span className="text-xs text-muted-foreground">Talla: {v.size}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStock(v.id, v.in_stock)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    v.in_stock
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {v.in_stock ? "Disponible" : "Agotado"}
                </button>
                <button
                  onClick={() => deleteVariant(v.id)}
                  className="p-1 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
