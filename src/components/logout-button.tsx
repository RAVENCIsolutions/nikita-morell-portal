"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Logged out successfully");
        // Reload the page after a brief delay to show the success message
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      toast.error("Error during logout");
      console.error("Logout error:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-200 border border-transparent hover:border-neutral-900 text-neutral-200 hover:text-neutral-900 transition-all duration-300 ease-in-out rounded"
    >
      Logout
    </button>
  );
}
