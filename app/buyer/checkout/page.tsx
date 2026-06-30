"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/axios";
import { useCartStore } from "@/stores/cartStore";
import type { ApiResponse } from "@/types/api";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import {
  CheckCircle,
  Truck,
  ChevronLeft,
  MapPin,
  CreditCard,
  Tag,
  Lock,
} from "lucide-react";
import Link from "next/link";
import SuccessModal from "@/components/shared/SuccessModal";

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: string;
  quantity: number;
  subtotal: number;
  image?: string;
}

interface CartData {
  store: {
    id: number;
    name: string;
  };
  items: CartItem[];
  total: number;
}

interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  is_default: boolean;
}

interface Promo {
  id: number;
  code: string;
  value: number;
  min_purchase: number;
  expired_at: string;
}

interface VoucherValidation {
  id: number;
  code: string;
  value: number;
  min_purchase: number;
  expired_at: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<
    "instant" | "next_day" | "regular"
  >("regular");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherValidation | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CartData | null>>("/cart");
      return res.data.data;
    },
  });

  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Address[]>>("/addresses");
      return res.data.data || [];
    },
  });

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ balance: number }>>("/wallet");
      return res.data.data;
    },
  });

  // Fetch available promos for auto-apply calculation
  const { data: promos } = useQuery({
    queryKey: ["promos"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Promo[]>>("/promos");
      return res.data.data || [];
    },
  });

  // Validate voucher code
  const validateVoucherMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.get<ApiResponse<VoucherValidation>>(`/vouchers/${code}`);
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data) {
        setAppliedVoucher(data);
        setVoucherError(null);
        setVoucherCode("");
      }
    },
    onError: (error: any) => {
      setVoucherError(error.response?.data?.message || "Voucher tidak valid");
      setAppliedVoucher(null);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: {
      address_id: number;
      delivery_method: string;
      voucher_code?: string;
    }) => {
      return api.post("/checkout", data);
    },
    onSuccess: (response) => {
      const order = response.data.data;
      setOrderData(order);
      setShowSuccessModal(true);
      useCartStore.getState().clearCart();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Checkout gagal");
    },
  });

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push("/buyer/orders");
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(typeof price === "string" ? parseFloat(price) : price);
  };

  const deliveryOptions = [
    {
      id: "instant",
      name: "Instant",
      desc: "30-60 menit",
      price: 20000,
      icon: "🚀",
    },
    {
      id: "next_day",
      name: "Next Day",
      desc: "1x24 jam",
      price: 12000,
      icon: "📦",
    },
    {
      id: "regular",
      name: "Regular",
      desc: "2-3 hari",
      price: 8000,
      icon: "🚚",
    },
  ];

  const selectedDelivery = deliveryOptions.find((d) => d.id === deliveryMethod);
  const deliveryFee = selectedDelivery?.price || 0;
  const subtotal = cart?.total || 0;

  // Calculate applicable promo - valid, meets min_purchase, highest value
  const applicablePromo = useMemo(() => {
    if (!promos || promos.length === 0) return null;

    const now = new Date();
    const validPromos = promos.filter((promo) => {
      const isValid = new Date(promo.expired_at) > now;
      const meetsMinPurchase = subtotal >= parseFloat(String(promo.min_purchase));
      return isValid && meetsMinPurchase;
    });

    if (validPromos.length === 0) return null;

    // Sort by value descending and pick the highest
    const sorted = [...validPromos].sort((a, b) => parseFloat(String(b.value)) - parseFloat(String(a.value)));
    return sorted[0];
  }, [promos, subtotal]);

  // Voucher + Promo stacking calculation
  const promoValue = applicablePromo ? parseFloat(String(applicablePromo.value)) : 0;
  const voucherValue = appliedVoucher ? parseFloat(String(appliedVoucher.value)) : 0;
  const totalDiscountPercent = promoValue + voucherValue;

  // Calculate discount amounts
  const promoDiscountAmount = Math.round(subtotal * promoValue / 100);
  const voucherDiscountAmount = Math.round(subtotal * voucherValue / 100);
  const discountAmount = promoDiscountAmount + voucherDiscountAmount;

  // PPN calculated on subtotal BEFORE discount
  const ppnAmount = Math.round(subtotal * 0.12);
  const total = subtotal + deliveryFee + ppnAmount - discountAmount;

  const handleCheckout = () => {
    if (!selectedAddress) {
      alert("Pilih alamat pengiriman");
      return;
    }
    checkoutMutation.mutate({
      address_id: selectedAddress,
      delivery_method: deliveryMethod,
      voucher_code: appliedVoucher?.code || undefined,
    });
  };

  const applyVoucher = () => {
    if (!voucherCode.trim()) return;
    setVoucherError(null);
    // Validate voucher via backend
    validateVoucherMutation.mutate(voucherCode.trim().toUpperCase());
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError(null);
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-ocean-50">
        <Navbar onSearch={() => {}} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-ocean-100 rounded animate-pulse mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-ocean-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-ocean-50 flex flex-col">
        <Navbar onSearch={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-ocean-700 mb-4">
              Keranjang Kosong
            </h2>
            <p className="text-ocean-500 mb-6">
              Tambahkan produk ke keranjang terlebih dahulu
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-ocean-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-ocean-600 transition-colors"
            >
              Mulai Belanja
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onSearch={() => {}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Checkout
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-ocean-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Alamat Pengiriman
                </h2>
              </div>

              {addresses && addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedAddress === addr.id
                          ? "border-ocean-500 bg-ocean-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              {addr.label}
                            </span>
                            {addr.is_default && (
                              <span className="text-xs bg-ocean-500 text-white px-2 py-0.5 rounded-full">
                                Utama
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mt-1">
                            {addr.recipient_name}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {addr.phone}
                          </p>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {addr.address}
                          </p>
                        </div>
                        {selectedAddress === addr.id && (
                          <CheckCircle className="w-6 h-6 text-ocean-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500 mb-4">
                    Belum ada alamat tersimpan
                  </p>
                  <Link
                    href="/buyer/addresses"
                    className="text-ocean-500 hover:text-ocean-600 font-medium"
                  >
                    + Tambah Alamat Baru
                  </Link>
                </div>
              )}
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-ocean-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Metode Pengiriman
                </h2>
              </div>

              <div className="space-y-3">
                {deliveryOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setDeliveryMethod(option.id as any)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      deliveryMethod === option.id
                        ? "border-ocean-500 bg-ocean-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="text-left">
                        <p className="font-semibold text-slate-800">
                          {option.name}
                        </p>
                        <p className="text-sm text-slate-500">{option.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-ocean-600">
                        {formatPrice(option.price)}
                      </span>
                      {deliveryMethod === option.id && (
                        <CheckCircle className="w-6 h-6 text-ocean-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-ocean-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Metode Pembayaran
                </h2>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Seapedia Wallet
                    </p>
                    <p className="text-sm text-slate-500">
                      Saldo:{" "}
                      {wallet ? formatPrice(wallet.balance) : "Loading..."}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-ocean-500 ml-auto" />
                </div>
              </div>
            </div>

            {/* Voucher */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-ocean-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Voucher</h2>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode voucher"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  disabled={!!appliedVoucher || validateVoucherMutation.isPending}
                />
                <button
                  onClick={applyVoucher}
                  disabled={!voucherCode.trim() || !!appliedVoucher || validateVoucherMutation.isPending}
                  className="px-6 py-3 bg-ocean-500 text-white font-semibold rounded-xl hover:bg-ocean-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validateVoucherMutation.isPending ? "Memuat..." : "Pakai"}
                </button>
              </div>
              {voucherError && (
                <p className="text-sm text-red-500 mt-2">{voucherError}</p>
              )}
              {appliedVoucher && (
                <div className="mt-3 flex items-center justify-between bg-ocean-50 border border-ocean-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-ocean-600" />
                    <span className="font-semibold text-ocean-700">{appliedVoucher.code}</span>
                    <span className="text-sm text-ocean-600">({appliedVoucher.value}%)</span>
                  </div>
                  <button onClick={removeVoucher} className="text-sm text-red-500 hover:text-red-600 font-medium">
                    Hapus
                  </button>
                </div>
              )}
              {applicablePromo && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Promo otomatis: {applicablePromo.code} ({applicablePromo.value}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Ringkasan Belanja
              </h2>

              {/* Items Preview */}
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">{item.quantity}x</p>
                      <p className="text-sm font-bold text-ocean-600">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {/* Promo discount line */}
                {applicablePromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo ({applicablePromo.value}%)</span>
                    <span className="font-medium">-{formatPrice(promoDiscountAmount)}</span>
                  </div>
                )}

                {/* Voucher discount line */}
                {appliedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher {appliedVoucher.code} ({appliedVoucher.value}%)</span>
                    <span className="font-medium">-{formatPrice(voucherDiscountAmount)}</span>
                  </div>
                )}

                {/* Combined discount row */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Diskon</span>
                    <span className="font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Pengiriman</span>
                  <span className="font-medium">{formatPrice(deliveryFee)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>PPN (12%)</span>
                  <span className="font-medium">{formatPrice(ppnAmount)}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 mt-4 border-t border-slate-200">
                <span className="text-lg font-bold text-slate-800">Total</span>
                <span className="text-xl font-bold text-ocean-600">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending || !selectedAddress}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-ocean-500 text-white py-4 px-6 rounded-xl font-bold hover:bg-ocean-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ocean-500/30"
              >
                <Lock className="w-5 h-5" />
                {checkoutMutation.isPending ? "Memproses..." : "Bayar Sekarang"}
              </button>

              <p className="text-xs text-slate-400 text-center mt-4">
                Pembayaran aman & terlindungi
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        order={orderData}
      />
    </div>
  );
}
