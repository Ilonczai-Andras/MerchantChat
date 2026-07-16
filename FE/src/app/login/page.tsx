"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/auth";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, isAuthenticated, isLoading: authLoading, user, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleLogout = async () => {
    await signOut();
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Hiba történt";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Betöltés...</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="ui-card w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-6">Bejelentkezve</h1>

          <Link href="/dashboard">
            <button className="ui-button ui-button-default ui-button-size-default w-full mb-3">
              Irányítópultra
            </button>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-sm text-red-600 hover:underline"
          >
            Kijelentkezés
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="ui-card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-2">
          {mode === "login" ? "Bejelentkezés" : "Regisztráció"}
        </h1>
        <p className="text-gray-600 mb-6">
          {mode === "login"
              ? "Jelentkezz be az adminisztrátor panelre"
              : "Hozz létre egy új fiókot"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="ui-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Jelszó</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="ui-input"
            />
          </div>

          <button
            type="submit"
            className="ui-button ui-button-default ui-button-size-default w-full"
            disabled={isLoading}
          >
            {isLoading
              ? "Feldolgozás..."
              : mode === "login"
                ? "Bejelentkezés"
                : "Regisztráció"}
          </button>
        </form>

        <div className="mt-6 text-center">
          {mode === "login" ? (
            <>
              <p className="text-sm text-gray-600">
                Nincs még fiókod?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-blue-600 hover:underline"
                >
                  Regisztrálj
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Van már fiókod?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-blue-600 hover:underline"
                >
                  Jelentkezz be
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
