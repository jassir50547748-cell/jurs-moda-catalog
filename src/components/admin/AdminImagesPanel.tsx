import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { X, Upload, Trash2 } from "lucide-react";

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
  const [colorTag, setColorTag] = useState("");

  const fetchImages = async () => {
    const { data } = await supabase
      .from("product_images")
      .select("id, image_url, color, sort_order")
      .eq("product_id", productId)
      .order("sort_order");
    setImages((data as ProductImage[]) || []);
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
          color: colorTag || null,
          sort_order: images.length,
        });
      }
    }
    setColorTag("");
    await fetchImages();
    setUploading(false);
  };

  const deleteImage = async (id: string) => {
    await supabase.from("product_images").delete().eq("id", id);
    fetchImages();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-card border border-border rounded-xl p-4 md:p-6 mb-8 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Fotos de "{productName}"</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Upload row */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="text-xs text-muted-foreground mb-1 block">Color (opcional)</label>
          <input
            value={colorTag}
            onChange={(e) => setColorTag(e.target.value)}
            placeholder="Ej: Negro"
            className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <label className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
          <Upload className="h-4 w-4" />
          {uploading ? "Subiendo..." : "Subir fotos"}
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : images.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sin fotos adicionales</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border">
              <img src={img.image_url} alt="" className="w-full aspect-square object-cover" />
              {img.color && (
                <span className="absolute bottom-1 left-1 bg-card/80 text-foreground text-[10px] px-1.5 py-0.5 rounded">
                  {img.color}
                </span>
              )}
              <button
                onClick={() => deleteImage(img.id)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
