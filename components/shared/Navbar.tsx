"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Wallet,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Home,
  Package,
  ClipboardList,
  Truck,
  Store,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import SearchBar from "@/components/landing/SearchBar";

interface NavbarProps {
  onSearch: (search: string) => void;
}

interface WalletData {
  balance: number;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const { user, activeRole, isLoggedIn } = useAuthStore();
  const totalItems = useCartStore((state) => state.totalItems);
  const { logout, switchRole } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { data: walletData } = useQuery({
    queryKey: ["wallet-navbar"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<WalletData>>("/wallet");
      return res.data.data;
    },
    enabled: isLoggedIn,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchRole = async (role: string) => {
    try {
      await switchRole({ role: role as "buyer" | "seller" | "driver" });
    } catch {
      // Error handled by useAuth
    }
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const buyerLinks = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/buyer/products", label: "Produk", icon: Package },
    { href: "/buyer/cart", label: "Keranjang", icon: ShoppingCart },
    { href: "/buyer/orders", label: "Pesanan", icon: ClipboardList },
  ];

  const sellerLinks = [
    { href: "/seller/dashboard", label: "Dashboard", icon: Home },
    { href: "/seller/store", label: "Toko", icon: Store },
    { href: "/seller/products", label: "Produk", icon: Package },
    { href: "/seller/orders", label: "Pesanan", icon: ClipboardList },
  ];

  const driverLinks = [
    { href: "/driver/dashboard", label: "Dashboard", icon: Home },
    { href: "/driver/active", label: "Delivery Aktif", icon: Truck },
    { href: "/driver/jobs", label: "Job Tersedia", icon: Package },
    { href: "/driver/history", label: "Riwayat", icon: ClipboardList },
  ];

  const getNavLinks = () => {
    switch (activeRole) {
      case "seller":
        return sellerLinks;
      case "driver":
        return driverLinks;
      default:
        return buyerLinks;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "buyer":
        return "bg-gradient-to-r from-ocean-400 to-ocean-600";
      case "seller":
        return "bg-gradient-to-r from-emerald-400 to-emerald-600";
      case "driver":
        return "bg-gradient-to-r from-amber-400 to-amber-600";
      default:
        return "bg-ocean-500";
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg shadow-ocean-900/5"
          : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <span className="text-2xl lg:text-3xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-ocean-600 to-ocean-400 bg-clip-text text-transparent">
                  Sea
                </span>
                <span className="bg-gradient-to-r from-ocean-500 to-cyan-400 bg-clip-text text-transparent">
                  pedia
                </span>
              </span>
            </motion.div>
          </Link>

          {isLoggedIn && (
            <div className="hidden lg:flex items-center gap-1">
              {getNavLinks().map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-ocean-50 text-ocean-700 shadow-sm"
                          : "text-ocean-600 hover:bg-ocean-50 hover:text-ocean-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                      {link.href === "/buyer/cart" && totalItems > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {totalItems > 99 ? "99+" : totalItems}
                        </motion.span>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md">
              <SearchBar onSearch={onSearch} />
            </div>

            <Link href="/buyer/cart">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2.5 bg-ocean-50 rounded-xl hover:bg-ocean-100 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-ocean-600" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                    >
                      {totalItems > 99 ? "99+" : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href="/buyer/wallet"
                  className="hidden sm:flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-ocean-50 to-cyan-50 rounded-xl hover:from-ocean-100 hover:to-cyan-100 transition-all duration-200 border border-ocean-100"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-ocean-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Wallet className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-ocean-700">
                    {walletData ? formatPrice(walletData.balance) : "Loading..."}
                  </span>
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 bg-ocean-50 rounded-xl hover:bg-ocean-100 transition-colors border border-ocean-100"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-xs font-semibold text-ocean-700">
                        {user?.username}
                      </span>
                      <span
                        className={`text-[10px] font-medium text-white px-1.5 py-0.5 rounded ${getRoleBadgeColor(
                          activeRole || ""
                        )}`}
                      >
                        {activeRole === "buyer"
                          ? "Pembeli"
                          : activeRole === "seller"
                          ? "Penjual"
                          : "Driver"}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-ocean-500" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-ocean-100 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-100">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-xl flex items-center justify-center shadow-md">
                              <span className="text-white text-lg font-bold">
                                {user?.username?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-ocean-800">
                                {user?.username}
                              </p>
                              <p className="text-xs text-ocean-500">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            href="/buyer/wallet"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-ocean-700 hover:bg-ocean-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
                              <Wallet className="w-4 h-4 text-ocean-600" />
                            </div>
                            <span className="text-sm font-medium">
                              Saldo:{" "}
                              <span className="text-ocean-600 font-semibold">
                                {walletData
                                  ? formatPrice(walletData.balance)
                                  : "Loading..."}
                              </span>
                            </span>
                          </Link>
                        </div>

                        {user && (
                          <div className="border-t border-ocean-100 py-2">
                            <p className="px-4 py-1.5 text-xs text-ocean-400 font-semibold uppercase tracking-wider">
                              Ganti Role
                            </p>
                            {["buyer", "seller", "driver"].map((role) => (
                              <motion.button
                                whileHover={{ x: 4 }}
                                key={role}
                                onClick={() => handleSwitchRole(role)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ${
                                  activeRole === role
                                    ? "bg-ocean-100 text-ocean-800 font-semibold"
                                    : "text-ocean-600 hover:bg-ocean-50 hover:text-ocean-700"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    activeRole === role
                                      ? "bg-ocean-500 text-white"
                                      : "bg-ocean-100 text-ocean-600"
                                  }`}
                                >
                                  {role === "buyer" ? (
                                    <ShoppingCart className="w-4 h-4" />
                                  ) : role === "seller" ? (
                                    <Store className="w-4 h-4" />
                                  ) : (
                                    <Truck className="w-4 h-4" />
                                  )}
                                </div>
                                {role === "buyer"
                                  ? "Mode Pembeli"
                                  : role === "seller"
                                  ? "Mode Penjual"
                                  : "Mode Driver"}
                                {activeRole === role && (
                                  <span className="ml-auto text-xs bg-ocean-500 text-white px-2 py-0.5 rounded-full">
                                    Aktif
                                  </span>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        )}

                        <div className="border-t border-ocean-100 py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <LogOut className="w-4 h-4 text-red-500" />
                            </div>
                            <span className="text-sm font-medium">Keluar</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 lg:px-6 py-2 text-sm font-semibold text-ocean-700 hover:text-ocean-500 transition-colors"
                  >
                    Masuk
                  </motion.button>
                </Link>
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(28, 138, 196, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 lg:px-6 py-2 text-sm font-bold bg-gradient-to-r from-ocean-500 to-cyan-500 text-white rounded-xl hover:from-ocean-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-ocean-500/30"
                  >
                    Daftar
                  </motion.button>
                </Link>
              </>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 bg-ocean-50 rounded-xl hover:bg-ocean-100 transition-colors"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="w-5 h-5 text-ocean-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="w-5 h-5 text-ocean-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="md:hidden px-4 pb-3">
        <SearchBar onSearch={onSearch} />
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-ocean-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {isLoggedIn ? (
                <>
                  {getNavLinks().map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link key={link.href} href={link.href}>
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? "bg-ocean-100 text-ocean-700"
                              : "text-ocean-600 hover:bg-ocean-50"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {link.label}
                          {link.href === "/buyer/cart" && totalItems > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {totalItems}
                            </span>
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <div className="block px-4 py-3 text-center text-ocean-700 font-medium">
                      Masuk
                    </div>
                  </Link>
                  <Link href="/auth/register">
                    <div className="block px-4 py-3 text-center bg-ocean-500 text-white rounded-xl font-semibold">
                      Daftar
                    </div>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
