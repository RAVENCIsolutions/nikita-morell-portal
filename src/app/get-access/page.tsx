"use client";

import { useState } from "react";
import { Toaster } from "react-hot-toast";
import SignupForm from "@/components/signup-form";
import NotionContent from "@/components/notion-content";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegistrationPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleSignupSuccess = (token: string) => {
    setIsAuthenticated(true);
    // Optionally redirect to the content page or show content directly
    router.push("/");
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Toaster position="top-right" />
        <main className="container mx-auto px-4 py-8">
          <NotionContent />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <main className="container mx-auto px-4 py-8">
        <SignupForm onSignupSuccess={handleSignupSuccess} />
      </main>
    </div>
  );
}
