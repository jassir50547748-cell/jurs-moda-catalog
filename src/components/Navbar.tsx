import { motion } from "framer-motion";
import { ShoppingBag, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import CartDrawer from "@/components/CartDrawer";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const { totalItems } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border"
      >
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <a href="/" className="font-heading text-2xl font-bold tracking-tight text-foreground">
            JURS MODA
          </a>

          <div className="flex items-center gap-4">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                  placeholder="Buscar modelos..."
                  className="bg-secondary px-3 py-1.5 rounded-md text-sm outline-none w-48 text-foreground placeholder:text-muted-foreground"
                />
                <button type="button" onClick={() => { setSearchOpen(false); setQuery(""); onSearch?.(""); }}>
                  <Search className="h-5 w-5 text-muted-foreground" />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}

            <button onClick={() => setCartOpen(true)} className="relative">
              <ShoppingBag className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
