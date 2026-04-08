import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import StickyCart from "@/components/StickyCart";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  price: number | null;
}

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, category, image_url, price")
        .eq("active", true)
        .order("created_at", { ascending: false });
      setProducts((data as Product[]) || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, category, search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={setSearch} />
      <Hero />

      <main id="catalogo" className="container mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          <CategoryFilter selected={category} onSelect={setCategory} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border animate-pulse">
                <div className="aspect-square bg-secondary rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-secondary rounded w-16" />
                  <div className="h-5 bg-secondary rounded w-3/4" />
                  <div className="h-10 bg-secondary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No se encontraron modelos</p>
            <p className="text-sm mt-1">Intenta con otra categoría o búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <StickyCart />
    </div>
  );
}
