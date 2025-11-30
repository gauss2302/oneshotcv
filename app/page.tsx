import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FileX, LayoutTemplate, Palette, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFA239] to-[#FF5656] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#FFA239]/20">
            CV
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            One Shot CV
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-[#FFA239] font-medium transition-colors">
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/main_hero.png"
            alt="Background"
            fill
            className="object-cover blur-[2px] opacity-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/90" />
        </div>

        <div className="container relative z-10 mx-auto px-6 py-12 md:py-24 flex flex-col items-center text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#FEEE91]/30 text-[#FFA239] font-semibold text-sm mb-6 border border-[#FEEE91]">
            ✨ Create your perfect resume in minutes
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight max-w-4xl">
            All you need is <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA239] to-[#FF5656]">
              ONE SHOT
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Stop struggling with formatting. Build a professional, eye-catching resume that gets you hired.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[#FFA239] to-[#FF5656] text-white font-bold text-lg shadow-xl shadow-[#FFA239]/30 hover:shadow-2xl hover:shadow-[#FFA239]/40 hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              Create Resume <ArrowRight size={20} />
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 font-bold text-lg border border-gray-200 hover:bg-white transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why is resume building so hard?</h2>
            <p className="text-gray-600 text-lg">
              We've all been there. You spend hours tweaking margins instead of writing content.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PainPointCard
              icon={<FileX size={32} className="text-[#FF5656]" />}
              title="Broken Formatting"
              description="One small change shifts the entire document. Margins don't align, and bullet points go rogue."
              color="bg-[#FF5656]/10"
            />
            <PainPointCard
              icon={<LayoutTemplate size={32} className="text-[#FFA239]" />}
              title="Rigid Structure"
              description="Templates that don't adapt to your content. Too much whitespace or not enough room."
              color="bg-[#FFA239]/10"
            />
            <PainPointCard
              icon={<Palette size={32} className="text-[#8CE4FF]" />}
              title="Bland Design"
              description="Looking like everyone else with standard black and white text documents that get ignored."
              color="bg-[#8CE4FF]/10"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The "One Shot" Solution</h2>
            <p className="text-gray-600 text-lg">
              Create a job-winning resume in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

            <StepCard
              number="01"
              title="Pick a Template"
              description="Choose from our professionally designed, ATS-friendly templates."
              color="#8CE4FF"
            />
            <StepCard
              number="02"
              title="Fill Your Info"
              description="Enter your details. Our real-time preview shows you exactly what you get."
              color="#FEEE91"
            />
            <StepCard
              number="03"
              title="Download & Apply"
              description="Export as PDF instantly. No watermarks, no hidden fees. Just one shot."
              color="#FFA239"
            />
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-gray-900 text-white font-bold text-xl shadow-xl hover:bg-gray-800 hover:scale-105 transition-all"
            >
              Build My Resume Now <CheckCircle size={24} className="text-[#8CE4FF]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFA239] to-[#FF5656] flex items-center justify-center text-white font-bold text-sm">
              CV
            </div>
            <span className="font-bold text-gray-900">ResumeConstructor</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ResumeConstructor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PainPointCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description, color }: { number: string, title: string, description: string, color: string }) {
  return (
    <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl">
      <div 
        className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-lg mb-6"
        style={{ backgroundColor: color, color: '#1f2937' }}
      >
        {number}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
