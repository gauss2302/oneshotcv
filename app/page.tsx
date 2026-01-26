import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  FileX,
  LayoutTemplate,
  Palette,
  CheckCircle,
  LayoutGrid,
  Eye,
  Download,
  LayoutDashboard,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

const PRODUCT_NAME = 'One Shot CV';

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} — Professional resume builder`,
  description:
    'Build a standout CV with templates, design tools, and instant PDF export. No formatting hassle — focus on your story.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background-primary)] font-sans text-[var(--color-foreground-primary)]">
      {/* Navigation */}
      <nav
        className="container mx-auto px-4 md:px-6 py-6 flex justify-between items-center"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label={`${PRODUCT_NAME} home`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFA239] to-[#FF5656] flex items-center justify-center text-white font-bold text-xl shadow-md shadow-[#FFA239]/25">
            CV
          </div>
          <span className="text-xl font-bold text-[var(--color-foreground-primary)]">
            {PRODUCT_NAME}
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="#features" className="hidden sm:inline-block text-[var(--color-foreground-secondary)] hover:text-[#FFA239] font-medium transition-colors text-sm md:text-base">
            Product
          </Link>
          <Link href="#how-it-works" className="hidden sm:inline-block text-[var(--color-foreground-secondary)] hover:text-[#FFA239] font-medium transition-colors text-sm md:text-base">
            How it works
          </Link>
          <Button variant="outline" size="default" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="default" size="default" asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden min-h-[560px] md:min-h-[600px] flex items-center"
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/main_hero.png"
            alt=""
            fill
            className="object-cover blur-[2px]"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/90" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-6 py-12 md:py-24 flex flex-col items-center text-center">
          <div
            className={cn(
              'inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6',
              'bg-[#FFA239]/10 text-[#FFA239] border border-[#FFA239]/20'
            )}
          >
            Professional resumes in minutes
          </div>
          <h1
            id="hero-heading"
            className="text-4xl md:text-6xl lg:text-[3rem] font-bold leading-tight mb-6 tracking-tight max-w-4xl"
          >
            A resume that stands out —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA239] to-[#FF5656]">
              without the layout hassle
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-foreground-secondary)] mb-8 max-w-2xl mx-auto leading-relaxed">
            A simple constructor, ready-made templates, and instant PDF export. Focus on your story, not formatting.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Button variant="default" size="lg" asChild>
              <Link href="/dashboard" className="inline-flex items-center gap-2">
                Create Resume <ArrowRight size={20} aria-hidden />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Problems / Why Section */}
      <section
        className="py-16 md:py-20 bg-[var(--color-background-secondary)]"
        aria-labelledby="problems-heading"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="text-sm font-medium text-[var(--color-foreground-tertiary)] uppercase tracking-wider mb-2">
              Why {PRODUCT_NAME}
            </p>
            <h2 id="problems-heading" className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[var(--color-foreground-primary)]">
              Still a pain to build a resume?
            </h2>
            <p className="text-[var(--color-foreground-secondary)] text-base md:text-lg leading-relaxed">
              We&apos;ve all been there — hours spent tweaking margins instead of writing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-[#FF5656]/10 flex items-center justify-center mb-2">
                  <FileX size={24} className="text-[#FF5656]" aria-hidden />
                </div>
                <span className="text-xs font-mono text-[var(--color-foreground-tertiary)]">001</span>
                <CardTitle className="text-xl">Broken formatting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  One small edit shifts the whole document. Margins misalign, bullets go rogue.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-[#FFA239]/10 flex items-center justify-center mb-2">
                  <LayoutTemplate size={24} className="text-[#FFA239]" aria-hidden />
                </div>
                <span className="text-xs font-mono text-[var(--color-foreground-tertiary)]">002</span>
                <CardTitle className="text-xl">Rigid structure</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  Templates that don&apos;t fit your content. Too much whitespace or not enough room.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-background-tertiary)] flex items-center justify-center mb-2">
                  <Palette size={24} className="text-[var(--color-foreground-secondary)]" aria-hidden />
                </div>
                <span className="text-xs font-mono text-[var(--color-foreground-tertiary)]">003</span>
                <CardTitle className="text-xl">Bland design</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  The usual black-and-white docs that look like everyone else&apos;s and get overlooked.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features / Product Section */}
      <section
        id="features"
        className="py-16 md:py-20 scroll-mt-20"
        aria-labelledby="features-heading"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="text-sm font-medium text-[var(--color-foreground-tertiary)] uppercase tracking-wider mb-2">
              Product
            </p>
            <h2 id="features-heading" className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[var(--color-foreground-primary)]">
              Everything you need for a strong resume
            </h2>
            <p className="text-[var(--color-foreground-secondary)] text-base md:text-lg leading-relaxed">
              Templates, design controls, live preview, and PDF export — all in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-[#FFA239]/10 flex items-center justify-center mb-2">
                  <LayoutGrid size={20} className="text-[#FFA239]" aria-hidden />
                </div>
                <CardTitle className="text-lg">Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  17+ professional templates for every industry — Classic, Minimalist, Tech, Academic, and more.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-[#FFA239]/10 flex items-center justify-center mb-2">
                  <Palette size={20} className="text-[#FFA239]" aria-hidden />
                </div>
                <CardTitle className="text-lg">Design panel</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  Theme color, fonts, font sizes, and spacing. Customize your resume without touching code.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-[#FFA239]/10 flex items-center justify-center mb-2">
                  <Eye size={20} className="text-[#FFA239]" aria-hidden />
                </div>
                <CardTitle className="text-lg">Real-time preview</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  See changes instantly as you edit. No guessing — what you type is what you get.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-[#FFA239]/10 flex items-center justify-center mb-2">
                  <Download size={20} className="text-[#FFA239]" aria-hidden />
                </div>
                <CardTitle className="text-lg">PDF export</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  One-click download as A4 PDF. No watermarks, no extra steps. Ready to send.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-[#FFA239]/10 flex items-center justify-center mb-2">
                  <LayoutDashboard size={20} className="text-[#FFA239]" aria-hidden />
                </div>
                <CardTitle className="text-lg">Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  Create and manage multiple resumes. Switch templates, duplicate, or delete — all in one place.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-[#FFA239]/10 flex items-center justify-center mb-2">
                  <Camera size={20} className="text-[#FFA239]" aria-hidden />
                </div>
                <CardTitle className="text-lg">Photo in resume</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  Upload a photo, crop it, and attach it to your CV. Look professional at a glance.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-16 md:py-20 bg-[var(--color-background-secondary)] scroll-mt-20"
        aria-labelledby="how-heading"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 id="how-heading" className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[var(--color-foreground-primary)]">
              The One Shot solution
            </h2>
            <p className="text-[var(--color-foreground-secondary)] text-base md:text-lg leading-relaxed">
              A job-winning resume in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-0.5 bg-[var(--color-border-default)] -z-10" aria-hidden />
            <Card className="flex flex-col items-center text-center relative">
              <div className="w-14 h-14 rounded-full bg-[var(--color-background-tertiary)] flex items-center justify-center text-xl font-bold text-[var(--color-foreground-primary)] mb-6">
                01
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Pick a template</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  Choose from our professional, ATS-friendly templates.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center relative">
              <div className="w-14 h-14 rounded-full bg-[var(--color-background-tertiary)] flex items-center justify-center text-xl font-bold text-[var(--color-foreground-primary)] mb-6">
                02
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Fill your info</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  Enter your details. Personal, education, experience, skills — with live preview as you type.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center relative">
              <div className="w-14 h-14 rounded-full bg-[var(--color-background-tertiary)] flex items-center justify-center text-xl font-bold text-[var(--color-foreground-primary)] mb-6">
                03
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Download & apply</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[var(--color-foreground-secondary)] leading-relaxed">
                  Export as PDF in one click. No watermarks, no hidden fees.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 md:mt-16 text-center">
            <Button variant="default" size="lg" asChild>
              <Link href="/dashboard" className="inline-flex items-center gap-2">
                Create Resume <CheckCircle size={20} aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        className="py-16 md:py-20"
        aria-labelledby="cta-heading"
      >
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 id="cta-heading" className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[var(--color-foreground-primary)]">
            Ready to build a resume that gets noticed?
          </h2>
          <p className="text-[var(--color-foreground-secondary)] text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Start with {PRODUCT_NAME} — choose a template, add your story, and export your PDF.
          </p>
          <Button variant="default" size="lg" asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-default)] bg-[var(--color-background-primary)] py-12">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
            aria-label={`${PRODUCT_NAME} home`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFA239] to-[#FF5656] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              CV
            </div>
            <span className="font-bold text-[var(--color-foreground-primary)]">{PRODUCT_NAME}</span>
          </Link>
          <p className="text-[var(--color-foreground-tertiary)] text-sm">
            © {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
