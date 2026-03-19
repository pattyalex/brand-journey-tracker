import React, { createContext, useContext } from "react";
import { useProductionBoard } from "@/pages/production/hooks/useProductionBoard";

// ─── Context value type ────────────────────────────────────────────────
// Mirrors the return type of useProductionBoard.  Production.tsx still
// calls the hook itself (so callbacks can reference local state), then
// passes the result into this provider.

export type ProductionContextValue = ReturnType<typeof useProductionBoard>;

const ProductionContext = createContext<ProductionContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────
// Wraps the kanban board subtree inside the /production page.
// Production.tsx passes in the already-computed board values.

export interface ProductionProviderProps {
  children: React.ReactNode;
  value: ProductionContextValue;
}

export const ProductionProvider: React.FC<ProductionProviderProps> = ({
  children,
  value,
}) => {
  return (
    <ProductionContext.Provider value={value}>
      {children}
    </ProductionContext.Provider>
  );
};

// ─── Consumer hook ─────────────────────────────────────────────────────

export function useProductionContext(): ProductionContextValue {
  const ctx = useContext(ProductionContext);
  if (!ctx) {
    throw new Error(
      "useProductionContext must be used within a <ProductionProvider>",
    );
  }
  return ctx;
}
