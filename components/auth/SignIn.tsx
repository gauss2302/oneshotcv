"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Linkedin, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async () => {
        setLoading(true);
        await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
        }, {
            onSuccess: () => {
                router.push("/dashboard");
            },
            onError: (ctx) => {
                alert(ctx.error.message);
                setLoading(false);
            }
        });
    };

    const handleSocialSignIn = async (provider: "github" | "google" | "linkedin") => {
         await authClient.signIn.social({
            provider,
            callbackURL: "/dashboard",
        }, {
             onSuccess: () => {
                 router.push("/dashboard");
             },
             onError: (ctx) => {
                 console.error("Social sign-in error:", ctx);
                 alert(ctx.error.message || "An error occurred during sign-in. Please check the console for details.");
             }
         });
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-600">Sign in to continue building your resume</p>
            </div>

            <div className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="johndoe@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 border-gray-300 focus:border-[#FFA239] focus:ring-[#FFA239]/20"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 pr-12 border-gray-300 focus:border-[#FFA239] focus:ring-[#FFA239]/20"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="mt-2 text-right">
                        <Link href="/forgot-password" className="text-sm text-[#FFA239] hover:text-[#FF5656] transition-colors">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <Button
                    onClick={handleSignIn}
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[#FFA239] to-[#FF5656] hover:from-[#FF5656] hover:to-[#FFA239] text-white font-semibold rounded-xl transition-all duration-300"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Signing in...
                        </span>
                    ) : (
                        "Sign in"
                    )}
                </Button>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-gray-500 font-medium">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => handleSocialSignIn("github")}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-[#8CE4FF] hover:bg-[#8CE4FF]/10 flex items-center justify-center transition-all"
                    >
                        <Github size={24} className="text-gray-700" />
                    </button>
                    <button
                        onClick={() => handleSocialSignIn("google")}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-[#8CE4FF] hover:bg-[#8CE4FF]/10 flex items-center justify-center transition-all"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleSocialSignIn("linkedin")}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-[#8CE4FF] hover:bg-[#8CE4FF]/10 flex items-center justify-center transition-all"
                    >
                        <Linkedin size={24} className="text-gray-700" />
                    </button>
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-semibold text-[#FFA239] hover:text-[#FF5656] transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
