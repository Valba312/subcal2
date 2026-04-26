"use client";

import { CheckCircle2, Loader2, Lock, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { useAuth } from "../../components/auth-provider";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

type AuthMode = "login" | "register";

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
};

type LoginFormState = {
  email: string;
  password: string;
};

const DEFAULT_REGISTER_FORM: RegisterFormState = {
  name: "",
  email: "",
  password: "",
};

const DEFAULT_LOGIN_FORM: LoginFormState = {
  email: "",
  password: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady, user, login, register } = useAuth();
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(DEFAULT_REGISTER_FORM);
  const [loginForm, setLoginForm] = useState<LoginFormState>(DEFAULT_LOGIN_FORM);
  const [submittingMode, setSubmittingMode] = useState<AuthMode | null>(null);

  const activeMode = useMemo<AuthMode>(() => {
    const mode = searchParams.get("mode");
    return mode === "login" ? "login" : "register";
  }, [searchParams]);

  const setMode = (mode: AuthMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", mode);
    router.replace(`/auth?${params.toString()}`);
  };

  const validateRegisterForm = () => {
    if (registerForm.name.trim().length < 2) {
      return "Имя должно содержать минимум 2 символа.";
    }

    if (!emailPattern.test(registerForm.email.trim())) {
      return "Введите корректный email.";
    }

    if (registerForm.password.length < 6) {
      return "Пароль должен содержать минимум 6 символов.";
    }

    return null;
  };

  const validateLoginForm = () => {
    if (!emailPattern.test(loginForm.email.trim())) {
      return "Введите корректный email.";
    }

    if (!loginForm.password) {
      return "Введите пароль.";
    }

    return null;
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateRegisterForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmittingMode("register");
    const result = await register({
      name: registerForm.name.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
    });
    setSubmittingMode(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Аккаунт создан");
    router.push("/calculator");
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateLoginForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmittingMode("login");
    const result = await login({
      email: loginForm.email.trim(),
      password: loginForm.password,
    });
    setSubmittingMode(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Вы вошли в аккаунт");
    router.push("/calculator");
  };

  if (!isReady) {
    return (
      <div className="container flex min-h-[calc(100dvh-80px)] items-center py-10">
        <div className="mx-auto h-[520px] w-full max-w-5xl animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="container flex min-h-[calc(100dvh-80px)] items-center py-10">
        <div className="mx-auto w-full max-w-2xl rounded-3xl border bg-card p-8 text-center shadow-soft">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm text-muted-foreground">Вы уже вошли как {user.name}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Аккаунт активен</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Ваши подписки сохраняются в личном профиле. Можно сразу вернуться к калькулятору или аналитике.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/calculator">К калькулятору</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/analytics">К аналитике</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[calc(100dvh-80px)] items-center py-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border bg-card shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
        <section className="border-b bg-muted/35 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <p className="text-sm font-semibold text-primary">SubKeeper ID</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Личный аккаунт для ваших подписок
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Зарегистрируйтесь, чтобы хранить подписки в базе данных, возвращаться к аналитике и работать с
            сервисом под своим профилем.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              "Данные каждого пользователя хранятся отдельно",
              "После регистрации вход выполняется автоматически",
              "Окно использует цвета текущей светлой или темной темы",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border bg-background/80 px-4 py-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <Tabs value={activeMode} onValueChange={(value) => setMode(value as AuthMode)}>
            <TabsList className="grid w-full grid-cols-2 border bg-muted p-1">
              <TabsTrigger
                value="register"
                className="min-w-0 text-muted-foreground data-[state=active]:bg-background data-[state=active]:from-transparent data-[state=active]:to-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Регистрация
              </TabsTrigger>
              <TabsTrigger
                value="login"
                className="min-w-0 text-muted-foreground data-[state=active]:bg-background data-[state=active]:from-transparent data-[state=active]:to-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Вход
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <Field label="Имя" icon={<UserRound className="h-4 w-4" aria-hidden="true" />}>
                  <input
                    autoComplete="name"
                    value={registerForm.name}
                    onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Например, Алексей"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </Field>
                <Field label="Email" icon={<Mail className="h-4 w-4" aria-hidden="true" />}>
                  <input
                    autoComplete="email"
                    type="email"
                    value={registerForm.email}
                    onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="name@example.com"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </Field>
                <Field label="Пароль" icon={<Lock className="h-4 w-4" aria-hidden="true" />}>
                  <input
                    autoComplete="new-password"
                    type="password"
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Минимум 6 символов"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </Field>
                <Button type="submit" disabled={submittingMode === "register"} className="w-full">
                  {submittingMode === "register" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {submittingMode === "register" ? "Создаем аккаунт..." : "Создать аккаунт"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="Email" icon={<Mail className="h-4 w-4" aria-hidden="true" />}>
                  <input
                    autoComplete="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="name@example.com"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </Field>
                <Field label="Пароль" icon={<Lock className="h-4 w-4" aria-hidden="true" />}>
                  <input
                    autoComplete="current-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Введите пароль"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </Field>
                <Button type="submit" disabled={submittingMode === "login"} className="w-full">
                  {submittingMode === "login" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {submittingMode === "login" ? "Входим..." : "Войти"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}

function AuthPageSkeleton() {
  return (
    <div className="container flex min-h-[calc(100dvh-80px)] items-center py-10">
      <div className="mx-auto h-[520px] w-full max-w-5xl animate-pulse rounded-3xl bg-muted" />
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      <span className="flex min-h-12 items-center gap-3 rounded-2xl border bg-background px-4 text-foreground transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </span>
    </label>
  );
}
