import { PRODUCTS, Product } from "./finance-data";

export interface StockMovement {
  id: string;
  date: string; // e.g. "Aug 23, 2026 3:37 PM"
  productId: string;
  productName: string;
  sku: string;
  movementType: "Damaged" | "Adjustment (Increase)" | "Adjustment (Decrease)" | "Initial Stock" | "Sold (POS)" | "Restock";
  quantityChange: number; // e.g. -12, +15, +21
  currentStock: number;
  note: string;
  purchaseId?: string;
}

const PRODUCTS_KEY = "brg_inventory_products";
const MOVEMENTS_KEY = "brg_inventory_movements";

export function getInventoryProducts(): Product[] {
  if (typeof window === "undefined") return PRODUCTS;
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  // Seed initial products
  saveInventoryProducts(PRODUCTS);
  return PRODUCTS;
}

export function saveInventoryProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getInventoryMovements(): StockMovement[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(MOVEMENTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }

  // Seed initial stock movements for our existing items to make it look realistic (Image 2)
  const products = getInventoryProducts();
  const initialMovements: StockMovement[] = products.map((p, index) => {
    // Generate dates: 1-5 days ago
    const date = new Date(Date.now() - (index * 8 * 3600 * 1000));
    return {
      id: `MVT-${1000 + index}`,
      date: date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }),
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      movementType: "Initial Stock",
      quantityChange: p.stock,
      currentStock: p.stock,
      note: "System import on setup"
    };
  });

  saveInventoryMovements(initialMovements);
  return initialMovements;
}

export function saveInventoryMovements(movements: StockMovement[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
}

export function adjustProductStock(
  productId: string, 
  movementType: StockMovement["movementType"], 
  qtyChange: number, 
  note: string
): { success: boolean; error?: string } {
  const products = getInventoryProducts();
  const prodIdx = products.findIndex(p => p.id === productId);
  if (prodIdx === -1) return { success: false, error: "Product not found." };

  const product = products[prodIdx];
  const oldStock = product.stock;
  
  // If it's a decrease, make sure stock doesn't drop below 0
  const isDecrease = movementType === "Damaged" || movementType === "Adjustment (Decrease)";
  const changeVal = isDecrease ? -Math.abs(qtyChange) : Math.abs(qtyChange);
  const newStock = oldStock + changeVal;
  
  if (newStock < 0) {
    return { success: false, error: "Cannot reduce stock below 0." };
  }

  // Update product stock
  product.stock = newStock;
  products[prodIdx] = product;
  saveInventoryProducts(products);

  // Add stock movement log
  const movements = getInventoryMovements();
  const nextId = `MVT-${1000 + movements.length}`;
  const now = new Date();
  const dateStr = now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  const newMvt: StockMovement = {
    id: nextId,
    date: dateStr,
    productId,
    productName: product.name,
    sku: product.sku,
    movementType,
    quantityChange: changeVal,
    currentStock: newStock,
    note: note.trim() || "—"
  };

  movements.unshift(newMvt); // Add new movements to the top
  saveInventoryMovements(movements);

  return { success: true };
}

export function addNewProduct(productData: Omit<Product, "id" | "stock">, initialStock: number): Product {
  const products = getInventoryProducts();
  const nextId = `i${products.length + 1}`;
  
  const newProduct: Product = {
    ...productData,
    id: nextId,
    stock: initialStock
  };

  products.push(newProduct);
  saveInventoryProducts(products);

  // Add Initial Stock movement log
  if (initialStock > 0) {
    const movements = getInventoryMovements();
    const nextMvtId = `MVT-${1000 + movements.length}`;
    const now = new Date();
    const dateStr = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    const newMvt: StockMovement = {
      id: nextMvtId,
      date: dateStr,
      productId: nextId,
      productName: newProduct.name,
      sku: newProduct.sku,
      movementType: "Initial Stock",
      quantityChange: initialStock,
      currentStock: initialStock,
      note: "Initial product registration"
    };

    movements.unshift(newMvt);
    saveInventoryMovements(movements);
  }

  return newProduct;
}

export function getProductById(id: string): Product | undefined {
  const products = getInventoryProducts();
  return products.find((p) => p.id === id);
}

export interface ReorderSuggestion {
  product: Product;
  deficit: number;
  suggestedQty: number;
  estimatedCost: number;
}

export function getReorderSuggestions(): ReorderSuggestion[] {
  const products = getInventoryProducts();
  return products
    .filter((p) => p.stock <= p.threshold)
    .map((p) => {
      const deficit = Math.max(0, p.threshold - p.stock);
      const suggestedQty = Math.max(deficit + p.threshold, 5);
      return {
        product: p,
        deficit,
        suggestedQty,
        estimatedCost: suggestedQty * p.costPrice,
      };
    });
}
