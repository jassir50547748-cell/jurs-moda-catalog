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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
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

    // Upload main image (first file)
    let mainImageUrl: string | null = null;
    if (imageFiles.length > 0) {
      mainImageUrl = await uploadImage(imageFiles[0]);
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
      // Upload additional images
      for (let i = 0; i < imageFiles.length; i++) {
        const url = i === 0 && mainImageUrl ? mainImageUrl : await uploadImage(imageFiles[i]);
        if (url) {
          await supabase.from("product_images").insert({
            product_id: productData.id,
            image_url: url,
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
      className="bg-card border border-border rounded-xl p-4 md:p-6 mb-8 overflow-hidden"
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

        {/* Tiered Pricing */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Precio Media Docena (6 uds)</label>
          <input
            type="number"
            step="0.01"
            value={priceMediaDocena}
            onChange={(e) => setPriceMediaDocena(e.target.value)}
            placeholder="S/"
            className="w-full bg-secondary text-foreground rounded-lg px-4 py-2.5 border border-border outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Precio Docena (12 uds)</label>
          <input
            type="number"
            step="0.01"
            value={priceDocena}
            onChange={(e) => setPriceDocena(e.target.value)}
            placeholder="S/"
            className="w-full bg-secondary text-foreground rounded-lg px-4 py-2.5 border border-border outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Precio Mayor Externo (+12)</label>
          <input
            type="number"
            step="0.01"
            value={priceMayoreo}
            onChange={(e) => setPriceMayoreo(e.target.value)}
            placeholder="S/"
            className="w-full bg-secondary text-foreground rounded-lg px-4 py-2.5 border border-border outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        {/* Multi-photo upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1">Fotos del modelo *</label>
          <div className="flex flex-wrap gap-3 mb-2">
            {imageFiles.map((file, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-secondary">
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground mt-1">Añadir</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-[10px] text-muted-foreground">La primera foto será la portada del modelo</p>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={saving || imageFiles.length === 0}
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
