import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type QuantityType = "docena" | "media_docena" | "cuarta";

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantityType: QuantityType;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  generateWhatsAppUrl: () => string;
}

const WHATSAPP_NUMBER = "51999999999";

const quantityLabels: Record<QuantityType, { label: string; units: number }> = {
  docena: { label: "Docena", units: 12 },
  media_docena: { label: "Media Docena", units: 6 },
  cuarta: { label: "Cuarta", units: 3 },
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const itemKey = (productId: string, color?: string) => `${productId}__${color || ""}`;

  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.quantityType === item.quantityType && i.color === item.color
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.quantityType === item.quantityType && i.color === item.color
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string, color?: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.color === color)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => !(i.productId === productId && i.color === color)));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId && i.color === color ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => {
    const units = quantityLabels[item.quantityType].units;
    return sum + item.quantity * units;
  }, 0);

  const generateWhatsAppUrl = useCallback(() => {
    const lines = items.map((item) => {
      const label = quantityLabels[item.quantityType].label;
      const units = quantityLabels[item.quantityType].units * item.quantity;
      const colorInfo = item.color ? ` | Color: ${item.color}` : "";
      const sizeInfo = item.size ? ` | Talla: ${item.size}` : "";
      return `• ${item.quantity}x ${label} de "${item.name}"${colorInfo}${sizeInfo} (${units} uds)`;
    });

    const message = `Hola Jurs Moda, deseo adquirir los siguientes modelos por mayor:\n\n${lines.join("\n")}\n\nTotal: ${totalItems} unidades\n\nQuedo atento(a) a su confirmación. ¡Gracias!`;
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  }, [items, totalItems]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, generateWhatsAppUrl }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
