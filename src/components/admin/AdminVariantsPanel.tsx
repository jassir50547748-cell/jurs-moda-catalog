import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Plus, Trash2, X, Pencil, Save, Check } from "lucide-react";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editColor, setEditColor] = useState("");
  const [editSize, setEditSize] = useState("");
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    await supabase.from("product_variants").insert({
      product_id: productId,
      color: newColor.trim(),
      size: newSize.trim() || null,
    });
    setNewColor("");
    setNewSize("");
    await fetchVariants();
    setSaving(false);
  };

  const startEdit = (v: Variant) => {
    setEditingId(v.id);
    setEditColor(v.color);
    setEditSize(v.size || "");
  };

  const saveEdit = async (id: string) => {
    if (!editColor.trim()) return;
    setSaving(true);
    await supabase.from("product_variants").update({
      color: editColor.trim(),
      size: editSize.trim() || null,
    }).eq("id", id);
    setEditingId(null);
    await fetchVariants();
    setSaving(false);
  };

  const toggleStock = async (id: string, inStock: boolean) => {
    await supabase.from("product_variants").update({ in_stock: !inStock }).eq("id", id);
    fetchVariants();
  };

  const deleteVariant = async (id: string) => {
    if (!confirm("¿Eliminar esta variante?")) return;
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
          Gestión de Colores — <span className="text-accent">{productName}</span>
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
          disabled={saving || !newColor.trim()}
          className="flex items-center gap-1 bg-accent text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
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
              {editingId === v.id ? (
                <div className="flex items-center gap-2 flex-1 mr-2">
                  <input
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="flex-1 bg-background text-foreground rounded px-2 py-1 text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    value={editSize}
                    onChange={(e) => setEditSize(e.target.value)}
                    placeholder="Talla"
                    className="w-20 bg-background text-foreground rounded px-2 py-1 text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => saveEdit(v.id)}
                    disabled={saving}
                    className="p-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    title="Guardar"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 rounded-md hover:bg-secondary transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{v.color}</span>
                  {v.size && <span className="text-xs text-muted-foreground">Talla: {v.size}</span>}
                </div>
              )}
              {editingId !== v.id && (
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
                    onClick={() => startEdit(v)}
                    className="p-1 rounded-md hover:bg-accent/10 text-accent transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteVariant(v.id)}
                    className="p-1 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
