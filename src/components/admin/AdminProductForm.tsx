import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
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
  const [priceMediaDocena, setPriceMediaDocena] = useState("");
  const [priceDocena, setPriceDocena] = useState("");
  const [priceMayoreo, setPriceMayoreo] = useState("");
  const [imageFiles, setImageFiles] = useState<{ file: File; color: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({ file, color: "" }));
      setImageFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileColor = (index: number, color: string) => {
    setImageFiles((prev) => prev.map((f, i) => (i === index ? { ...f, color } : f)));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) return null;
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let mainImageUrl: string | null = null;
    if (imageFiles.length > 0) {
      mainImageUrl = await uploadImage(imageFiles[0].file);
    }

    const { data: productData, error } = await supabase.from("products").insert({
      name,
      category,
      price_media_docena: priceMediaDocena ? parseFloat(priceMediaDocena) : null,
      price_docena: priceDocena ? parseFloat(priceDocena) : null,
      price_mayoreo: priceMayoreo ? parseFloat(priceMayoreo) : null,
      image_url: mainImageUrl,
    }).select("id").single();

    if (!error && productData) {
      for (let i = 0; i < imageFiles.length; i++) {
        const url = i === 0 && mainImageUrl ? mainImageUrl : await uploadImage(imageFiles[i].file);
        if (url) {
          await supabase.from("product_images").insert({
            product_id: productData.id,
            image_url: url,
            color: imageFiles[i].color || null,
            sort_order: i,
          });
        }
      }
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
      className="bg-card border border-border rounded-2xl p-5 md:p-6 mb-8 overflow-hidden shadow-lg"
    >
      <h3 className="font-heading text-lg font-bold text-foreground mb-4">Nuevo Modelo</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Nombre del modelo *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 border border-border outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Categoría *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 border border-border outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Precio Media Docena (6 uds)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Bs</span>
            <input
              type="number"
              step="0.01"
              value={priceMediaDocena}
              onChange={(e) => setPriceMediaDocena(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-xl pl-10 pr-4 py-3 border border-border outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Precio Docena (12 uds)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Bs</span>
            <input
              type="number"
              step="0.01"
              value={priceDocena}
              onChange={(e) => setPriceDocena(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-xl pl-10 pr-4 py-3 border border-border outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Precio Mayor Externo (+12)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Bs</span>
            <input
              type="number"
              step="0.01"
              value={priceMayoreo}
              onChange={(e) => setPriceMayoreo(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-xl pl-10 pr-4 py-3 border border-border outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>

        {/* Photo upload with per-photo color assignment */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Fotos del modelo *</label>
          <p className="text-xs text-muted-foreground mb-3">Asigna un color a cada foto para vincularla automáticamente</p>

          <div className="space-y-3 mb-3">
            {imageFiles.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 bg-secondary/50 rounded-xl p-2">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-secondary flex-shrink-0">
                  <img src={URL.createObjectURL(entry.file)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate mb-1">{entry.file.name}</p>
                  <input
                    value={entry.color}
                    onChange={(e) => updateFileColor(i, e.target.value)}
                    placeholder="Color (ej: Negro, Blanco...)"
                    className="w-full bg-card text-foreground rounded-lg px-3 py-1.5 text-sm border border-border outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 rounded-xl text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
            <Upload className="h-4 w-4" />
            Subir Fotos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-[10px] text-muted-foreground mt-2">La primera foto será la portada del modelo</p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={saving || imageFiles.length === 0}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar Modelo"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 rounded-xl text-sm border border-border text-muted-foreground hover:bg-secondary transition-colors"
        >
          Cancelar
        </button>
      </div>
    </motion.form>
  );
}
