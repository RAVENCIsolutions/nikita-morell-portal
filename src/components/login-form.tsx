"use client";

import { useState, FormEvent } from "react";
import { toast } from "react-hot-toast";
import { AuthResponse } from "@/types/api";
import Link from "next/link";
import { Route } from "next";

interface LoginFormProps {
  onLoginSuccess: (token: string) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        toast.success("Login Successful!", {
          position: "top-center",
        });
        // Add a slight delay before triggering state update and reload
        setTimeout(() => {
          if (data.sessionToken) {
            onLoginSuccess(data.sessionToken);
          }
          window.location.reload();
        }, 1000);
      } else {
        toast.error(data.message || "Invalid credentials", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="pt-8 pb-4 px-6 max-w-md w-full bg-white shadow-lg shadow-neutral-500/10">
        <div className={`mb-6 pb-4 grid place-content-center w-full border-b`}>
          <img
            src={`/nikita-morell-full-logo.png`}
            alt="Nikita Morell"
            className={`h-16`}
          />
        </div>
        <h2 className="mb-1 mx-auto max-w-sm font-serif text-center text-3xl font-extrabold text-gray-900">
          Unlock the Architecture Website Library
        </h2>
        <h3 className={`text-center text-lg`}>Let's get you logged in!</h3>
        <form className={`mt-8 space-y-6 w-full`} onSubmit={handleSubmit}>
          <div className={`space-y-4`}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 bg-neutral-900 hover:bg-white border border-transparent hover:border-neutral-900 focus:outline-none font-medium text-white hover:text-neutral-900 transition-all duration-300 ease-in-out"
            >
              {loading ? "Verifying..." : "Get Access Now"}
            </button>
          </div>

          <div className="text-center text-sm">
            Need an account?{" "}
            <Link
              href={`/get-access` as Route}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign up here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
