"use client";
// Header component with authentication

import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, LogOut, User, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-25 h-8 bg-gradient-to-br from-[#FFA239] to-[#FF5656] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#FFA239]/20">
          One Shot
        </div>
        <span className="font-bold text-xl text-gray-800">Dashboard</span>
      </Link>

      <div className="flex items-center gap-4">
        {session ? (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-gray-500" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-none">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-none">
                  {session.user.email}
                </p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-200">
                <Link
                  href="/dashboard"
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard size={16} className="text-gray-400" />
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={16} className="text-gray-400" />
                  Profile
                </Link>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} className="text-gray-400" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-[#FFA239] font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gray-900 text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
