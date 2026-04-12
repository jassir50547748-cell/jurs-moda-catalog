import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const quantityLabels: Record<string, string> = {
  docena: "Docena",
  media_docena: "Media Docena",
};

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice, generateWhatsAppUrl } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-card">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-foreground font-heading text-xl">
            Tu Pedido Mayorista
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            {totalItems} unidades en tu carrito
          </p>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          <AnimatePresence>
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-muted-foreground"
              >
                <MessageCircle className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Tu carrito está vacío</p>
                <p className="text-xs mt-1">Agrega modelos desde el catálogo</p>
              </motion.div>
            ) : (
              items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.color}-${item.quantityType}`}
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="bg-secondary/50 rounded-xl p-3"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-secondary">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{item.name}</h4>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                          {quantityLabels[item.quantityType] || item.quantityType}
                        </span>
                      </div>
                      {/* Show selected colors clearly */}
                      {item.color && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.color.split(", ").map((c) => (
                            <span key={c} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                              🎨 {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color)}
                        className="w-9 h-9 rounded-l-lg bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors active:bg-muted"
                      >
                        <Minus className="h-4 w-4 text-foreground" />
                      </button>
                      <div className="w-12 h-9 border-y border-border flex items-center justify-center bg-card">
                        <span className="text-sm font-bold text-foreground">{item.quantity}</span>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color)}
                        className="w-9 h-9 rounded-r-lg bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors active:bg-muted"
                      >
                        <Plus className="h-4 w-4 text-foreground" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.unitPrice && (
                        <span className="text-sm font-bold text-foreground">
                          Bs {(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      )}
                      <button
                        onClick={() => removeItem(item.productId, item.color)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="border-t border-border pt-4 flex-col gap-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">Total estimado</span>
              <span className="text-2xl font-bold text-foreground font-heading">
                Bs {totalPrice.toFixed(2)}
              </span>
            </div>

            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-primary-foreground py-3.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Enviar Pedido por WhatsApp
            </a>

            <button
              onClick={clearCart}
              className="w-full text-sm text-muted-foreground hover:text-destructive transition-colors py-2"
            >
              Vaciar carrito
            </button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
