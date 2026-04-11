import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { X, Upload, Trash2, Save, Pencil } from "lucide-react";

interface ProductImage {
  id: string;
  image_url: string;
  color: string | null;
  sort_order: number;
}

interface Props {
  productId: string;
  productName: string;
  onClose: () => void;
}

export default function AdminImagesPanel({ productId, productName, onClose }: Props) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadColor, setUploadColor] = useState("");
  const [editingColors, setEditingColors] = useState<Record<string, string>>({});
  const [savingColors, setSavingColors] = useState(false);

  const fetchImages = async () => {
    const { data } = await supabase
      .from("product_images")
      .select("id, image_url, color, sort_order")
      .eq("product_id", productId)
      .order("sort_order");
    const imgs = (data as ProductImage[]) || [];
    setImages(imgs);
    // Initialize editing state
    const colors: Record<string, string> = {};
    imgs.forEach((img) => { colors[img.id] = img.color || ""; });
    setEditingColors(colors);
    setLoading(false);
  };

  useEffect(() => { fetchImages(); }, [productId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        await supabase.from("product_images").insert({
          product_id: productId,
          image_url: urlData.publicUrl,
          color: uploadColor || null,
          sort_order: images.length,
        });
      }
    }
    setUploadColor("");
    await fetchImages();
    setUploading(false);
  };

  const deleteImage = async (id: string) => {
    if (!confirm("¿Eliminar esta foto?")) return;
    await supabase.from("product_images").delete().eq("id", id);
    fetchImages();
  };

  const saveAllColors = async () => {
    setSavingColors(true);
    for (const img of images) {
      const newColor = editingColors[img.id] || null;
      if (newColor !== img.color) {
        await supabase.from("product_images").update({ color: newColor || null }).eq("id", img.id);
      }
    }
    await fetchImages();
    setSavingColors(false);
  };

  const hasChanges = images.some((img) => (editingColors[img.id] || "") !== (img.color || ""));

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-card border border-border rounded-2xl p-5 md:p-6 mb-8 overflow-hidden shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold text-foreground">
          📸 Fotos — <span className="text-accent">{productName}</span>
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Upload row */}
      <div className="flex flex-wrap gap-3 mb-6 items-end bg-secondary/50 rounded-xl p-4">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-medium text-foreground mb-1.5 block">Color de las fotos nuevas</label>
          <input
            value={uploadColor}
            onChange={(e) => setUploadColor(e.target.value)}
            placeholder="Ej: Negro, Blanco..."
            className="w-full bg-card text-foreground rounded-xl px-4 py-3 text-sm border border-border outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <label className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity">
          <Upload className="h-4 w-4" />
          {uploading ? "Subiendo..." : "Subir fotos"}
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : images.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sin fotos adicionales. Sube imágenes arriba.</p>
      ) : (
        <>
          <div className="space-y-3">
            {images.map((img) => (
              <div key={img.id} className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1">
                    <Pencil className="h-2.5 w-2.5" /> Color asignado
                  </label>
                  <input
                    value={editingColors[img.id] || ""}
                    onChange={(e) => setEditingColors((prev) => ({ ...prev, [img.id]: e.target.value }))}
                    placeholder="Sin color asignado"
                    className="w-full bg-card text-foreground rounded-lg px-3 py-1.5 text-sm border border-border outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  onClick={() => deleteImage(img.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors flex-shrink-0"
                  title="Eliminar foto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Save Changes button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveAllColors}
              disabled={savingColors || !hasChanges}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingColors ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
