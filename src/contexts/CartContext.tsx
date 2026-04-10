import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type QuantityType = "docena" | "media_docena";

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantityType: QuantityType;
  quantity: number;
  color?: string;
  size?: string;
  unitPrice?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  generateWhatsAppUrl: () => string;
}

const WHATSAPP_NUMBER = "59175544239";

const quantityLabels: Record<QuantityType, { label: string; units: number }> = {
  docena: { label: "Docena", units: 12 },
  media_docena: { label: "Media Docena", units: 6 },
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

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

  const totalPrice = items.reduce((sum, item) => {
    if (!item.unitPrice) return sum;
    return sum + item.unitPrice * item.quantity;
  }, 0);

  const generateWhatsAppUrl = useCallback(() => {
    const lines = items.map((item) => {
      const label = quantityLabels[item.quantityType].label;
      const units = quantityLabels[item.quantityType].units * item.quantity;
      const colorInfo = item.color ? ` | Color: ${item.color}` : "";
      const sizeInfo = item.size ? ` | Talla: ${item.size}` : "";
      const priceInfo = item.unitPrice ? ` | S/ ${(item.unitPrice * item.quantity).toFixed(2)}` : "";
      return `• ${item.quantity}x ${label} de "${item.name}"${colorInfo}${sizeInfo} (${units} uds)${priceInfo}`;
    });

    const priceSection = totalPrice > 0 ? `\n\nMonto Total Estimado: S/ ${totalPrice.toFixed(2)}` : "";
    const message = `Hola Jurs Moda, deseo adquirir los siguientes modelos por mayor (Docenas/Medias):\n\n${lines.join("\n")}\n\nTotal: ${totalItems} unidades${priceSection}\n\nQuedo atento(a) a su confirmación. ¡Gracias!`;
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  }, [items, totalItems, totalPrice]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, generateWhatsAppUrl }}>
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
