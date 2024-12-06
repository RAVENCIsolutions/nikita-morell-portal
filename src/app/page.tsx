"use client";

import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import LoginForm from "@/components/login-form";
import NotionContent from "@/components/notion-content";
import LogoutButton from "@/components/logout-button";

export default function LoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Expected JSON but got ${contentType}`);
        }

        const data = await response.json();
        setIsAuthenticated(data.success);
      } catch (error) {
        console.error("Session check error:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error ? `Error: ${error}` : "Loading..."}
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <section className="flex flex-col min-h-screen">
        <Toaster position="top-right" />
        <main className={`flex-grow`}>
          <NotionContent />
        </main>

        <footer
          className={`px-5 py-1 fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-neutral-600 text-neutral-500`}
        >
          <p className={`text-sm italic`}>
            Designed for{" "}
            <a href={`https://nikitamorell.com`} className={`text-neutral-200`}>
              Nikita Morell
            </a>
          </p>
          <LogoutButton />
        </footer>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <main className="container mx-auto px-4 py-8">
        <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
      </main>
    </div>
  );
}
