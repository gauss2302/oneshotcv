"use client";
// Header component with authentication

import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
        >
          <div className="w-28 h-9 bg-[#457b9d] rounded-[16px] flex items-center justify-center text-white font-bold text-base shadow-[var(--shadow-sm)] group-hover:shadow-md transition-all">
            One Shot
          </div>
          <span className="font-semibold text-lg text-gray-800 hidden sm:block">
            Dashboard
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-2.5 hover:bg-gray-50/80 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isMenuOpen ? "bg-gray-50/80" : ""
                }`}
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-200/50 shadow-sm">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={18} className="text-gray-600" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate max-w-[140px]">
                    {session.user.email}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 animate-in fade-in zoom-in-95 duration-200"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-3 py-2 border-b border-gray-200 mb-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Account
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 flex items-center gap-3 transition-colors rounded-lg mx-1"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                  >
                    <LayoutDashboard size={18} className="text-gray-400" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 flex items-center gap-3 transition-colors rounded-lg mx-1"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                  >
                    <User size={18} className="text-gray-400" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 flex items-center gap-3 transition-colors rounded-lg mx-1"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                  >
                    <Settings size={18} className="text-gray-400" />
                    <span className="font-medium">Settings</span>
                  </Link>
                  <div className="my-1.5 border-t border-gray-200" />
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 flex items-center gap-3 transition-colors rounded-lg mx-1 font-medium"
                    role="menuitem"
                  >
                    <LogOut size={18} className="text-red-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-gray-600 hover:text-[#457b9d] font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50/80"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-[#457b9d] text-white px-5 py-2 rounded-[16px] font-semibold hover:bg-[#1565e0] transition-all shadow-[var(--shadow-sm)] hover:shadow-md"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Backdrop overlay when menu is open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 pointer-events-auto"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
