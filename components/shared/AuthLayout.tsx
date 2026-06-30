"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axios";
import type { AxiosError } from "axios";
import { Eye, EyeOff, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import Cookies from "js-cookie";

interface FieldErrors {
  [key: string]: string[];
}

export default function AuthLayout() {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Illustration (55%) */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-[#E0F7F4] via-[#E8F5F2] to-[#D4EDE8] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0F6E56]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#0F6E56]/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative h-full w-full flex flex-col items-center justify-center p-8 lg:p-12">
          {/* Illustration */}
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isLogin ? "/illustrations/auth-login.svg" : "/illustrations/auth-register.svg"}
              alt={isLogin ? "Login illustration" : "Register illustration"}
              className="w-full h-auto drop-shadow-lg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-[#0F6E56]/20">
              <Sparkles className="w-4 h-4 text-[#0F6E56]" />
              <span className="text-xs font-medium text-[#0F6E56] tracking-wide uppercase">
                {isLogin ? "Platform Belanja Terpercaya" : "Bergabung Sekarang"}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-[#042C53] mt-4 max-w-sm">
              {isLogin 
                ? "Belanja mudah, aman, dan terpercaya untuk semua kebutuhan Anda" 
                : "Mulai pengalaman belanja terbaik bersama kami"
              }
            </h3>
          </motion.div>

          {/* Brand name */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className="text-3xl font-bold text-[#042C53] tracking-tight">
              SEAPEDIA
            </span>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form (45%) */}
      <div className="w-full lg:w-[45%] bg-white flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </motion.div>
      </div>
    </div>
  );
}

// Login Form
function LoginForm() {
  const router = useRouter();
  const { setAuth, setToken } = useAuthStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await api.post("/auth/login", formData);

      if (response.data.success) {
        const { user, active_role, roles, token } = response.data.data;
        
        // Save token to cookies
        Cookies.set("token", token, { expires: 7, secure: true, sameSite: "Lax" });
        
        // Set token and auth data to store
        setToken(token);
        setAuth(user, active_role, roles);

        const redirectMap: Record<string, string> = {
          buyer: "/",
          seller: "/seller/dashboard",
          driver: "/driver/dashboard",
          admin: "/admin/dashboard",
        };

        router.push(redirectMap[active_role] || "/");
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ errors?: FieldErrors; message?: string }>;
      const data = axiosError.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      }
      setError(data?.message || "Login gagal. Silakan periksa email dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <span className="text-2xl font-bold text-[#042C53] tracking-tight">
          SEAPEDIA
        </span>
      </div>

      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A] tracking-tight">
          Selamat datang kembali
        </h2>
        <p className="text-[#6B7280] mt-2 text-sm sm:text-base">
          Masuk ke akun SEAPEDIA Anda
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-1.5"
        >
          <Label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-[#0F6E56]/30 border-[#E5E3DC] focus:border-[#0F6E56]"
          />
          {fieldErrors.email && (
            <p className="text-sm text-red-500">{fieldErrors.email[0]}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-[#1A1A1A]">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-[#0F6E56] hover:text-[#0F6E56]/80 transition-colors"
            >
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="h-11 pr-10 transition-shadow focus-visible:ring-2 focus-visible:ring-[#0F6E56]/30 border-[#E5E3DC] focus:border-[#0F6E56]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-sm text-red-500">{fieldErrors.password[0]}</p>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-red-50 border border-red-100 px-4 py-3"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#042C53] hover:bg-[#042C53]/90 text-white font-medium transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 rounded-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </span>
            ) : (
              "Masuk"
            )}
          </Button>
        </motion.div>

        <motion.p
          className="mt-8 text-center text-sm text-[#6B7280]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Belum punya akun?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-[#0F6E56] hover:text-[#0F6E56]/80 transition-colors underline-offset-2 hover:underline"
          >
            Daftar sekarang
          </Link>
        </motion.p>
      </form>
    </>
  );
}

// Register Form
function RegisterForm() {
  const router = useRouter();
  const { setAuth, setToken } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "" as "buyer" | "seller" | "driver" | "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState("");

  const clearFieldError = (name: string) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    clearFieldError(name);
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as "buyer" | "seller" | "driver",
    }));
    if (error) setError("");
    clearFieldError("role");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess("");

    if (formData.password !== formData.password_confirmation) {
      setFieldErrors({
        password_confirmation: ["Konfirmasi password tidak cocok dengan password"],
      });
      return;
    }

    if (!formData.role) {
      setFieldErrors({ role: ["Silakan pilih role"] });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
      });

      if (response.data.success) {
        const { user, active_role, token } = response.data.data;
        
        // Save token to cookies
        Cookies.set("token", token, { expires: 7, secure: true, sameSite: "Lax" });
        
        // Set token and auth data to store
        setToken(token);
        setAuth(user, active_role, [active_role]);

        setSuccess("Registrasi berhasil! Mengalihkan ke halaman utama...");
        
        // Redirect based on role after successful registration
        const redirectMap: Record<string, string> = {
          buyer: "/",
          seller: "/seller/dashboard",
          driver: "/driver/dashboard",
          admin: "/admin/dashboard",
        };

        setTimeout(() => {
          router.push(redirectMap[active_role] || "/");
        }, 1500);
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ errors?: FieldErrors; message?: string }>;
      const data = axiosError.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      }
      setError(data?.message || "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <span className="text-2xl font-bold text-[#042C53] tracking-tight">
          SEAPEDIA
        </span>
      </div>

      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A] tracking-tight">
          Buat akun baru
        </h2>
        <p className="text-[#6B7280] mt-2 text-sm sm:text-base">
          Bergabung dengan SEAPEDIA hari ini
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-1.5"
        >
          <Label htmlFor="username" className="text-sm font-medium text-[#1A1A1A]">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Masukkan username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-[#0F6E56]/30 border-[#E5E3DC] focus:border-[#0F6E56]"
          />
          {fieldErrors.username && (
            <p className="text-sm text-red-500">{fieldErrors.username[0]}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1.5"
        >
          <Label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-[#0F6E56]/30 border-[#E5E3DC] focus:border-[#0F6E56]"
          />
          {fieldErrors.email && (
            <p className="text-sm text-red-500">{fieldErrors.email[0]}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-1.5"
        >
          <Label htmlFor="role" className="text-sm font-medium text-[#1A1A1A]">
            Daftar sebagai
          </Label>
          <Select
            value={formData.role}
            onValueChange={handleRoleChange}
            disabled={isLoading}
          >
            <SelectTrigger className="h-11 w-full border-[#E5E3DC] focus:border-[#0F6E56] focus:ring-[#0F6E56]/30">
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buyer">Pembeli</SelectItem>
              <SelectItem value="seller">Penjual</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.role && (
            <p className="text-sm text-red-500">{fieldErrors.role[0]}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-1.5"
        >
          <Label htmlFor="password" className="text-sm font-medium text-[#1A1A1A]">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 karakter"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength={8}
              className="h-11 pr-10 transition-shadow focus-visible:ring-2 focus-visible:ring-[#0F6E56]/30 border-[#E5E3DC] focus:border-[#0F6E56]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-sm text-red-500">{fieldErrors.password[0]}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-1.5"
        >
          <Label htmlFor="password_confirmation" className="text-sm font-medium text-[#1A1A1A]">
            Konfirmasi Password
          </Label>
          <div className="relative">
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Ulangi password"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="h-11 pr-10 transition-shadow focus-visible:ring-2 focus-visible:ring-[#0F6E56]/30 border-[#E5E3DC] focus:border-[#0F6E56]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
              aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password_confirmation && (
            <p className="text-sm text-red-500">{fieldErrors.password_confirmation[0]}</p>
          )}
        </motion.div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 flex items-start gap-3"
          >
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </motion.div>
        )}

        {error && !success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-red-50 border border-red-100 px-4 py-3"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            type="submit"
            disabled={isLoading || !!success}
            className="w-full h-11 bg-[#042C53] hover:bg-[#042C53]/90 text-white font-medium transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 rounded-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </span>
            ) : (
              "Daftar"
            )}
          </Button>
        </motion.div>

        <motion.p
          className="mt-8 text-center text-sm text-[#6B7280]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Sudah punya akun?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-[#0F6E56] hover:text-[#0F6E56]/80 transition-colors underline-offset-2 hover:underline"
          >
            Masuk
          </Link>
        </motion.p>
      </form>
    </>
  );
}
