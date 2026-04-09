import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, LogOut, Eye, EyeOff, Package, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";
import AdminProductForm from "@/components/admin/AdminProductForm";
import AdminVariantsPanel from "@/components/admin/AdminVariantsPanel";

type ProductCategory = Database["public"]["Enums"]["product_category"];

interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  image_url: string | null;
  price: number | null;
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
    if (!confirm("¿Eliminar este producto?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  if (authLoading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-foreground">Panel Admin</h1>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ver tienda</a>
            <button onClick={signOut} className="flex items-center gap-1 text-sm text-destructive hover:opacity-80 transition-opacity">
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">{products.length} Modelos</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Nuevo Modelo
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <AdminProductForm
              onClose={() => setShowForm(false)}
              onSaved={fetchProducts}
            />
          )}
        </AnimatePresence>

        {/* Variants Panel */}
        <AnimatePresence>
          {variantsProductId && (
            <AdminVariantsPanel
              productId={variantsProductId}
              productName={products.find((p) => p.id === variantsProductId)?.name || ""}
              onClose={() => setVariantsProductId(null)}
            />
          )}
        </AnimatePresence>

        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Foto</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Categoría</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Precio</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Estado</th>
                    <th className="text-right px-4 py-3 font-medium text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr key={p.id} className={`${!p.active ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-secondary" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{p.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.price !== null ? `S/ ${p.price.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${p.active ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                            {p.active ? "Activo" : "Oculto"}
                          </span>
                          {p.sold_out && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full w-fit bg-red-100 text-red-700">
                              Agotado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setVariantsProductId(p.id)}
                            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-accent hover:text-accent"
                            title="Gestionar colores"
                          >
                            <Palette className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleSoldOut(p.id, p.sold_out)}
                            className={`p-1.5 rounded-md hover:bg-secondary transition-colors ${p.sold_out ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}
                            title={p.sold_out ? "Marcar disponible" : "Marcar agotado"}
                          >
                            <Package className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleActive(p.id, p.active)}
                            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                            title={p.active ? "Ocultar" : "Mostrar"}
                          >
                            {p.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-destructive"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
