import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, LogOut, Eye, EyeOff, Package, Palette, ImageIcon, DollarSign, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";
import AdminProductForm from "@/components/admin/AdminProductForm";
import AdminVariantsPanel from "@/components/admin/AdminVariantsPanel";
import AdminImagesPanel from "@/components/admin/AdminImagesPanel";

type ProductCategory = Database["public"]["Enums"]["product_category"];

interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  image_url: string | null;
  price: number | null;
  price_media_docena: number | null;
  price_docena: number | null;
  price_mayoreo: number | null;
  active: boolean;
  sold_out: boolean;
}

export default function Admin() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [variantsProductId, setVariantsProductId] = useState<string | null>(null);
  const [imagesProductId, setImagesProductId] = useState<string | null>(null);
  const [editingPrices, setEditingPrices] = useState<string | null>(null);
  const [priceForm, setPriceForm] = useState({ media: "", docena: "", mayoreo: "" });
  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchProducts();
  }, [isAdmin]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("products").update({ active: !active }).eq("id", id);
    fetchProducts();
  };

  const toggleSoldOut = async (id: string, sold_out: boolean) => {
    await supabase.from("products").update({ sold_out: !sold_out }).eq("id", id);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto definitivamente?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const startEditPrice = (p: Product) => {
    setEditingPrices(p.id);
    setPriceForm({
      media: p.price_media_docena?.toString() || "",
      docena: p.price_docena?.toString() || "",
      mayoreo: p.price_mayoreo?.toString() || "",
    });
  };

  const savePrice = async (id: string) => {
    setSavingPrice(true);
    await supabase.from("products").update({
      price_media_docena: priceForm.media ? parseFloat(priceForm.media) : null,
      price_docena: priceForm.docena ? parseFloat(priceForm.docena) : null,
      price_mayoreo: priceForm.mayoreo ? parseFloat(priceForm.mayoreo) : null,
    }).eq("id", id);
    setEditingPrices(null);
    await fetchProducts();
    setSavingPrice(false);
  };

  if (authLoading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Cargando...</div>;
  }

  const formatPrice = (p: Product) => {
    const parts: string[] = [];
    if (p.price_media_docena) parts.push(`½D: Bs ${p.price_media_docena}`);
    if (p.price_docena) parts.push(`D: Bs ${p.price_docena}`);
    if (p.price_mayoreo) parts.push(`M: Bs ${p.price_mayoreo}`);
    return parts.length > 0 ? parts.join(" · ") : "Sin precios";
  };

  const categoryLabels: Record<string, string> = {
    busos: "Busos", shorts: "Shorts", poleras: "Poleras", chompas: "Chompas", polos: "Polos", otros: "Otros",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-foreground">🛠️ Panel Admin</h1>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-accent hover:text-accent/80 transition-colors font-medium">Ver Tienda</a>
            <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-destructive hover:opacity-80 transition-opacity font-medium">
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Add product */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">{products.length} Modelos</h2>
            <p className="text-xs text-muted-foreground">Gestión de catálogo mayorista</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
          >
            <Plus className="h-4 w-4" />
            Nuevo Modelo
          </button>
        </div>

        <AnimatePresence>
          {showForm && <AdminProductForm onClose={() => setShowForm(false)} onSaved={fetchProducts} />}
        </AnimatePresence>

        <AnimatePresence>
          {variantsProductId && (
            <AdminVariantsPanel
              productId={variantsProductId}
              productName={products.find((p) => p.id === variantsProductId)?.name || ""}
              onClose={() => setVariantsProductId(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {imagesProductId && (
            <AdminImagesPanel
              productId={imagesProductId}
              productName={products.find((p) => p.id === imagesProductId)?.name || ""}
              onClose={() => setImagesProductId(null)}
            />
          )}
        </AnimatePresence>

        {/* Product Cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                    <div className="h-3 bg-secondary rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-opacity ${!p.active ? "opacity-50" : ""}`}
              >
                {/* Main card content */}
                <div className="p-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-20 h-20 rounded-xl object-cover border border-border" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                        Sin foto
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-foreground text-base truncate">{p.name}</h3>
                        <span className="text-xs text-accent font-medium">{categoryLabels[p.category] || p.category}</span>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {p.active ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Activo</span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Oculto</span>
                        )}
                        {p.sold_out && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Agotado</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">{formatPrice(p)}</p>

                    {/* Inline price editor */}
                    {editingPrices === p.id && (
                      <div className="mt-3 bg-secondary/50 rounded-xl p-3 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground">½ Docena</label>
                            <input
                              type="number"
                              step="0.01"
                              value={priceForm.media}
                              onChange={(e) => setPriceForm((f) => ({ ...f, media: e.target.value }))}
                              className="w-full bg-card text-foreground rounded-lg px-2 py-1.5 text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Docena</label>
                            <input
                              type="number"
                              step="0.01"
                              value={priceForm.docena}
                              onChange={(e) => setPriceForm((f) => ({ ...f, docena: e.target.value }))}
                              className="w-full bg-card text-foreground rounded-lg px-2 py-1.5 text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Mayor</label>
                            <input
                              type="number"
                              step="0.01"
                              value={priceForm.mayoreo}
                              onChange={(e) => setPriceForm((f) => ({ ...f, mayoreo: e.target.value }))}
                              className="w-full bg-card text-foreground rounded-lg px-2 py-1.5 text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingPrices(null)}
                            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => savePrice(p.id)}
                            disabled={savingPrice}
                            className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                          >
                            <Save className="h-3 w-3" /> Guardar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action bar */}
                <div className="border-t border-border px-4 py-2.5 flex items-center justify-between bg-secondary/30">
                  <div className="flex gap-1">
                    <button onClick={() => setImagesProductId(p.id)} className="flex items-center gap-1.5 text-xs text-foreground bg-secondary hover:bg-muted px-3 py-2 rounded-xl transition-colors font-medium">
                      <ImageIcon className="h-3.5 w-3.5" /> Fotos
                    </button>
                    <button onClick={() => setVariantsProductId(p.id)} className="flex items-center gap-1.5 text-xs text-foreground bg-secondary hover:bg-muted px-3 py-2 rounded-xl transition-colors font-medium">
                      <Palette className="h-3.5 w-3.5" /> Colores
                    </button>
                    <button onClick={() => startEditPrice(p)} className="flex items-center gap-1.5 text-xs text-foreground bg-secondary hover:bg-muted px-3 py-2 rounded-xl transition-colors font-medium">
                      <DollarSign className="h-3.5 w-3.5" /> Precios
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleSoldOut(p.id, p.sold_out)}
                      className={`p-2 rounded-xl transition-colors ${p.sold_out ? "bg-red-100 text-red-700" : "hover:bg-secondary text-muted-foreground"}`}
                      title={p.sold_out ? "Marcar disponible" : "Marcar agotado"}
                    >
                      <Package className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(p.id, p.active)}
                      className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"
                      title={p.active ? "Ocultar" : "Mostrar"}
                    >
                      {p.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
