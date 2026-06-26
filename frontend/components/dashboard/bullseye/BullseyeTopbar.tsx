"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { Bullseye } from "./Bullseye";

interface BullseyeTopbarProps {
  viewTitle: string;
  userName: string;
  userEmail: string;
  userImage?: string | null;
}

export function BullseyeTopbar({
  viewTitle,
  userName,
  userEmail,
  userImage,
}: BullseyeTopbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/login") },
    });
    setOpen(false);
  };

  return (
    <header className="flex h-[66px] flex-none items-center justify-between border-b border-[#E7E1D8] bg-[rgba(252,250,246,0.72)] px-5 backdrop-blur-[8px] sm:px-8">
      <div className="flex items-center gap-[14px]">
        <span className="inline-flex items-center gap-[7px] rounded-full bg-[#1B1815] py-[6px] pl-[10px] pr-[13px] text-[11px] tracking-[0.06em] text-[#FCFAF6] [font-family:var(--font-spline-mono)]">
          <Bullseye size={11} gap="#FCFAF6" />
          One&nbsp;Shot
        </span>
        <span className="text-[14px] text-[#C7BDAC]">/</span>
        <span className="text-[19px] tracking-[-0.01em] text-[#1B1815] [font-family:var(--font-spectral)]">
          {viewTitle}
        </span>
      </div>

      <div className="flex items-center gap-[18px]">
        <Link
          href="/dashboard"
          className="hidden text-[13.5px] text-[#8C857C] transition-colors hover:text-[#1B1815] sm:block"
        >
          Help
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="true"
            className="flex items-center gap-[10px]"
          >
            <span className="flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-full border border-[#DAD2C5] bg-[#E7DFD2] text-[#7A7468]">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <User size={17} strokeWidth={1.6} />
              )}
            </span>
            <span className="hidden text-right leading-[1.2] sm:block">
              <span className="block text-[13.5px] font-semibold text-[#1B1815]">{userName}</span>
              <span className="block max-w-[150px] truncate text-[11.5px] text-[#A39A8C]">
                {userEmail}
              </span>
            </span>
            <ChevronDown
              size={13}
              className={`text-[#A39A8C] transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 overflow-hidden rounded-[12px] border border-[#E7E1D8] bg-white py-1.5 shadow-[0_18px_40px_-18px_rgba(27,24,21,0.3)]"
            >
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="mx-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] text-[#3D372F] transition-colors hover:bg-[#FBF8F3]"
              >
                <User size={17} className="text-[#A39A8C]" strokeWidth={1.6} />
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="mx-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] text-[#3D372F] transition-colors hover:bg-[#FBF8F3]"
              >
                <Settings size={17} className="text-[#A39A8C]" strokeWidth={1.6} />
                Settings
              </Link>
              <div className="my-1.5 border-t border-[#F0EAE1]" />
              <button
                type="button"
                onClick={handleSignOut}
                role="menuitem"
                className="mx-1 flex w-[calc(100%-0.5rem)] items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-[#B83A21] transition-colors hover:bg-[#FBEAE4]"
              >
                <LogOut size={17} strokeWidth={1.6} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
