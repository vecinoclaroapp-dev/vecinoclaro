"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { googleOAuthEnabled } from "@/lib/oauth-config";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import {
  Building2,
  Wallet,
  ShieldCheck,
  Zap,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

type Props = {
  onAuthed: () => void;
  onBack?: () => void;
  initialMode?: "login" | "register";
};

export function AuthScreen({ onAuthed, onBack, initialMode = "login" }: Props) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPass, setShowPass] = useState(false);
  const login = useLogin();
  const register = useRegister();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login.mutateAsync({ email: form.email, password: form.password });
        toast.success("Bienvenido de vuelta");
        onAuthed();
      } else {
        if (form.name.trim().length < 2) {
          toast.error("Ingresa tu nombre completo");
          return;
        }
        await register.mutateAsync(form);
        toast.success("Cuenta creada. ¡Configuremos tu condominio!");
        onAuthed();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const googleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Lado izquierdo: Brand + valor */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">VecinoClaro</p>
              <p className="text-xs text-amber-300 leading-tight tracking-wider font-semibold">VENEZUELA</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-amber-300 font-semibold text-sm mb-3 tracking-wide uppercase">Gestión bimonetaria</p>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
              Administra tu condominio en <span className="text-amber-300">dólares</span> y <span className="text-amber-300">bolívares</span>, sin caos.
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-md">
              La plataforma hecha para la realidad venezolana. Tasa BCV automática, pago móvil, Zelle y libro contable inmutable.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { icon: Wallet, label: "Contabilidad USD/VES" },
              { icon: TrendingUp, label: "Tasa BCV en tiempo real" },
              { icon: ShieldCheck, label: "Auditoría criptográfica" },
              { icon: Zap, label: "Pagos locales VE" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-4 w-4 text-amber-300" />
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-sm text-emerald-200">
          <div className="flex items-center gap-2"><Users className="h-4 w-4" /> +120 condominios</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> 100% local VE</div>
        </div>
      </div>

      {/* Lado derecho: Formulario */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Botón volver a landing */}
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
            </button>
          )}

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-11 w-11 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">VecinoClaro</p>
              <p className="text-xs text-muted-foreground leading-tight tracking-wider">VENEZUELA</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold">
              {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? "Accede a la administración de tu condominio."
                : "Empieza gratis. Sin tarjeta de crédito."}
            </p>
          </div>

          {googleOAuthEnabled && (
            <>
              <Button
                variant="outline"
                className="w-full mb-4 gap-2 h-11"
                onClick={googleSignIn}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </Button>
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">o con tu correo</span></div>
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-5">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    className="pl-9 h-11"
                    placeholder="Junta de Condominio"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9 h-11"
                  placeholder="admin@condominio.ve"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pass">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pass"
                  type={showPass ? "text" : "password"}
                  className="pl-9 pr-10 h-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPass ? "Ocultar" : "Mostrar"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "register" && <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 gap-1.5"
              disabled={login.isPending || register.isPending}
            >
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button onClick={() => setMode("register")} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                  Regístrate gratis
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button onClick={() => setMode("login")} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                  Inicia sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
