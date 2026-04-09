import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";

type ProductCategory = Database["public"]["Enums"]["product_category"];

interface AdminProductFormProps {
  onClose: () => void;
  onSaved: () => void;
}

const categoryOptions: { value: ProductCategory; label: string }[] = [
  { value: "busos", label: "Busos" },
  { value: "shorts", label: "Shorts" },
  { value: "poleras", label: "Poleras" },
  { value: "chompas", label: "Chompas" },
  { value: "polos", label: "Polos" },
  { value: "otros", label: "Otros" },
];

export default function AdminProductForm({ onClose, onSaved }: AdminProductFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("otros");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let imageUrl: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, imageFile);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("products").insert({
      name,
      category,
      price: price ? parseFloat(price) : null,
      image_url: imageUrl,
    });

    if (!error) {
      onClose();
      onSaved();
    }
    setSaving(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-6 mb-8 overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nombre del modelo *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-secondary text-foreground rounded-lg px-4 py-2.5 border border-border outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Categoría *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full bg-secondary text-foreground rounded-lg px-4 py-2.5 border border-border outline-none focus:ring-2 focus:ring-ring"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Precio (opcional)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Dejar vacío para ocultar"
            className="w-full bg-secondary text-foreground rounded-lg px-4 py-2.5 border border-border outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Foto del modelo *</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full bg-secondary text-foreground rounded-lg px-4 py-2 border border-border text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accent file:text-accent-foreground file:px-3 file:py-1 file:text-sm file:font-medium"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar Modelo"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-lg text-sm border border-border text-muted-foreground hover:bg-secondary transition-colors"
        >
          Cancelar
        </button>
      </div>
    </motion.form>
  );
}
