"use client";

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface FlyingProduct {
  id: number;
  imageUrl: string;
  startPosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
}

interface FlyingToCartContextType {
  flyToCart: (productId: number, imageUrl: string, startPos: { x: number; y: number }) => void;
}

const FlyingToCartContext = createContext<FlyingToCartContextType | null>(null);

export function useFlyingToCart() {
  const context = useContext(FlyingToCartContext);
  if (!context) {
    throw new Error("useFlyingToCart must be used within FlyingToCartProvider");
  }
  return context;
}

export function FlyingToCartProvider({ children }: { children: React.ReactNode }) {
  const [flyingProducts, setFlyingProducts] = useState<FlyingProduct[]>([]);
  const cartIconRef = useRef<HTMLDivElement>(null);

  const flyToCart = useCallback(
    (productId: number, imageUrl: string, startPos: { x: number; y: number }) => {
      // Get cart icon position
      let targetPos = { x: window.innerWidth - 80, y: 100 };

      if (cartIconRef.current) {
        const rect = cartIconRef.current.getBoundingClientRect();
        targetPos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }

      const newProduct: FlyingProduct = {
        id: Date.now() + productId,
        imageUrl,
        startPosition: startPos,
        targetPosition: targetPos,
      };

      setFlyingProducts((prev) => [...prev, newProduct]);

      // Remove after animation completes
      setTimeout(() => {
        setFlyingProducts((prev) => prev.filter((p) => p.id !== newProduct.id));
      }, 800);
    },
    []
  );

  return (
    <FlyingToCartContext.Provider value={{ flyToCart }}>
      {children}

      {/* Flying products animation layer */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <AnimatePresence>
          {flyingProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{
                position: "fixed",
                left: product.startPosition.x,
                top: product.startPosition.y,
                width: 60,
                height: 60,
                opacity: 1,
                scale: 1,
                zIndex: 9999,
              }}
              animate={{
                left: product.targetPosition.x - 30,
                top: product.targetPosition.y - 30,
                opacity: 0,
                scale: 0.2,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.4, 0, 0.2, 1],
              }}
              style={{
                position: "fixed",
                borderRadius: "50%",
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(28, 138, 196, 0.4)",
              }}
            >
              <Image
                src={product.imageUrl}
                alt="Product"
                width={60}
                height={60}
                className="w-full h-full object-cover"
                unoptimized
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hidden cart icon reference for animation target */}
      <div
        ref={cartIconRef}
        className="fixed top-[70px] right-[60px] w-0 h-0 opacity-0 pointer-events-none"
      />
    </FlyingToCartContext.Provider>
  );
}

// Cart icon bounce animation trigger
export function useCartBounce() {
  const [isBouncing, setIsBouncing] = useState(false);

  const triggerBounce = useCallback(() => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 500);
  }, []);

  return { isBouncing, triggerBounce };
}
