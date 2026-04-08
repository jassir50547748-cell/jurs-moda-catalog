import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, MessageCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function StickyCart() {
  const { items, totalItems, removeItem, generateWhatsAppUrl, clearCart } = useCart();

  if (items.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-2xl"
      >
        <div className="container mx-auto px-4 py-3">
          {/* Thumbnails row */}
          <div className="flex items-center gap-3 mb-3 overflow-x-auto pb-1">
            {items.map((item) => (
              <div key={item.productId} className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-accent bg-secondary">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">
              {totalItems} unidades
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={clearCart}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-secondary transition-colors"
            >
              Vaciar
            </button>
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Finalizar Pedido por WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
