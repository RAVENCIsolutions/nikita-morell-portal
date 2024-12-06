"use client";

import { useState, FormEvent } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface SignupFormProps {
  onSignupSuccess: (token: string) => void;
}

export default function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      // Log the raw response for debugging
      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Invalid server response");
      }

      if (data.success) {
        toast.success(
          "Signup successful! Check your email for access details.",
        );
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Detailed signup error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during signup",
      );
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
        <h2 className="mb-1 w-full font-serif text-center text-3xl font-extrabold text-gray-900">
          Let's Get You Access to the Architecture Website Library
        </h2>
        <h3 className={`text-center text-lg`}>
          Your login details will be sent straight to your inbox.
        </h3>
        <form className={`mt-8 space-y-6`} onSubmit={handleSubmit}>
          <div className={`space-y-4`}>
            <div>
              <label htmlFor="email" className="sr-only">
                First Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
          </div>

          <button
            type="submit"
            disabled={loading || name.length === 0 || email.length === 0}
            className="group relative w-full flex justify-center py-2 px-4 bg-neutral-900 hover:bg-white disabled:bg-neutral-400 border border-transparent hover:border-neutral-900 disabled:border-transparent focus:outline-none font-medium text-white hover:text-neutral-900 disabled:text-neutral-600/70 transition-all duration-300 ease-in-out"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
