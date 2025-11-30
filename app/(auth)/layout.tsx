import React from "react";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Left Panel - Colorful Brand Side */}
            <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-[#8CE4FF] via-[#FEEE91] to-[#FFA239] overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-[#FF5656] rounded-full opacity-20 blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#8CE4FF] rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full opacity-10 blur-2xl" />
                
                {/* Content */}
                <div className="relative z-10 text-center px-8 max-w-md">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        One Shot CV
                    </h1>
                    <p className="text-xl text-gray-800 mb-8">
                        Create professional resumes that stand out and get you hired
                    </p>
                    <div className="flex justify-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-8 h-8 rounded-lg bg-[#FF5656]" />
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-8 h-8 rounded-lg bg-[#FFA239]" />
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-8 h-8 rounded-lg bg-[#8CE4FF]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form Side */}
            <div className="flex items-center justify-center py-12 bg-white">
                <div className="mx-auto w-full max-w-md px-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
