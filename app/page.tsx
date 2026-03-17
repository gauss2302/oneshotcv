import Link from 'next/link';
import type { Metadata } from 'next';
import { pricingTiers, testimonials } from '@/lib/landing-content';
import { HeroForm } from '@/components/landing/HeroForm';
import { MobileNav } from '@/components/landing/MobileNav';
import { Reveal } from '@/components/landing/animations';

const PRODUCT_NAME = 'One Shot CV';
const BRAND_SLUG = 'oneshotcv';

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} — Professional resume builder`,
  description:
    'Build a standout CV with templates, design tools, and instant PDF export. No formatting hassle — focus on your story.',
};

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen">
      <header>
        <div className="container nav">
          <Link href="/" className="brand" aria-label={`${PRODUCT_NAME} home`}>
            <div className="logoMark" aria-hidden />
            <span>{BRAND_SLUG}</span>
          </Link>

          <nav aria-label="Primary">
            <ul>
              <li><Link href="#features">Product</Link></li>
              <li><Link href="#how-it-works">Solutions</Link></li>
              <li><Link href="#pricing">Pricing</Link></li>
            </ul>
          </nav>

          <div className="navActions">
            <Link href="/login" className="btn">Log in</Link>
            <Link href="/dashboard" className="btn primary">Sign up</Link>
          </div>
          <MobileNav />
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wings" aria-hidden>
            <div className="wing left" />
            <div className="wing right" />
          </div>

          <div className="container">
            <div className="heroTop">
              <span className="pill landing-reveal landing-reveal-delay-1">Resume builder · One flow to PDF</span>
              <h1 className="landing-reveal landing-reveal-delay-2">Resumes that get noticed</h1>
              <p className="landing-reveal landing-reveal-delay-3">
                One integrated flow: pick a template, fill your story, export to PDF.
                No layout hassle — built for the way you work.
              </p>
              <div className="landing-reveal landing-reveal-delay-4">
                <HeroForm />
              </div>
            </div>

            <div className="moduleWrap landing-reveal landing-reveal-delay-5" aria-hidden>
              <div className="module">
                <div className="moduleHead">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="dot" /> One Shot CV
                  </span>
                  <span style={{ opacity: 0.7 }}>Template · Design · Export</span>
                </div>
                <div className="moduleGrid">
                  <div className="miniCard"><b>Templates</b><span>17+ ATS-friendly</span></div>
                  <div className="miniCard"><b>Design</b><span>Colors · Fonts</span></div>
                  <div className="miniCard"><b>Export</b><span>One-click PDF</span></div>
                  <div className="miniCard"><b>Preview</b><span>Live edit</span></div>
                  <div className="miniCard"><b>Sections</b><span>Reorder</span></div>
                  <div className="miniCard"><b>No watermark</b><span>Pro plans</span></div>
                </div>
              </div>
            </div>

            <div className="logos">
              <div className="logoRow" aria-label="For professionals">
                <span>Designers</span>
                <span>Engineers</span>
                <span>Product</span>
                <span>Marketing</span>
                <span>Executives</span>
              </div>
            </div>
          </div>
        </section>

        <section className="darkPanel" id="how-it-works">
          <Reveal>
            <div className="container darkInner">
              <div>
              <h2>Unified by design.<br />Built for clarity.</h2>
              <p>
                One place to build, tweak, and export your resume. No switching tools—
                templates, design controls, and PDF in a single flow.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link href="/dashboard" className="btn primary">Get started</Link>
                <Link href="#features" className="btn ghostDark">Explore features</Link>
              </div>
              </div>
              <div className="glowDoor" aria-hidden />
            </div>
          </Reveal>
        </section>

        <section className="landing-section" id="features">
          <Reveal>
          <div className="container">
            <div className="sectionTitle">
              <h3>One integrated platform.<br />Greater than the sum of its parts.</h3>
              <p>
                Start with a template, add your experience and skills, then export to PDF.
                Everything shares the same live preview and design controls.
              </p>
            </div>

            <div className="featureGrid">
              <div className="stack" aria-label="Feature list">
                <div className="stackItem">
                  <div className="icon" aria-hidden />
                  <div>
                    <b>Templates</b>
                    <p>17+ professional, ATS-friendly templates. Structured sections and drag-and-drop reorder.</p>
                  </div>
                </div>
                <div className="stackItem">
                  <div className="icon" aria-hidden />
                  <div>
                    <b>Design</b>
                    <p>Colors, fonts, and spacing without code. Your resume stays consistent and print-ready.</p>
                  </div>
                </div>
                <div className="stackItem">
                  <div className="icon" aria-hidden />
                  <div>
                    <b>Export</b>
                    <p>One-click PDF. No watermarks on Pro. Ready to send to recruiters and job boards.</p>
                  </div>
                </div>
              </div>

              <div className="preview" aria-label="UI preview">
                <div className="mockCard">
                  <div className="row">
                    <div className="tag">Live preview</div>
                    <div className="tag">PDF ready</div>
                  </div>
                  <div className="lines">
                    <div className="bar" />
                    <div className="bar" style={{ opacity: 0.75 }} />
                    <div className="bar" style={{ opacity: 0.55 }} />
                  </div>
                </div>
                <div className="mockGrid">
                  <div className="tile"><b>Pick template</b><small>17+ options</small></div>
                  <div className="tile"><b>Edit content</b><small>Live preview</small></div>
                  <div className="tile"><b>Customize design</b><small>Colors & fonts</small></div>
                  <div className="tile"><b>Download PDF</b><small>One click</small></div>
                </div>
              </div>
            </div>

            <div className="sectionTitle" style={{ marginTop: '56px' }}>
              <h3>Numbers don&apos;t lie</h3>
              <p>One flow, zero formatting headaches—measured in time saved and callbacks.</p>
            </div>
            <div className="stats" aria-label="Stats">
              <div className="stat"><b>17+</b><span>Professional templates</span></div>
              <div className="stat"><b>1</b><span>Click to PDF</span></div>
              <div className="stat"><b>0</b><span>Watermarks (Pro)</span></div>
              <div className="stat"><b>∞</b><span>Edits included</span></div>
            </div>
          </div>
          </Reveal>
        </section>

        <section className="landing-section" id="customers" style={{ paddingTop: '24px' }}>
          <Reveal>
          <div className="container">
            <div className="sectionTitle">
              <h3>{PRODUCT_NAME} helps people land the role they want</h3>
              <p>See what others say about building their resume with One Shot CV.</p>
            </div>
            <div className="cards3" aria-label="Testimonials">
              {testimonials.slice(0, 3).map((t) => (
                <div key={t.name} className="tCard">
                  <div className="top">
                    <div className="brandChip">{t.role}</div>
                    <span className="pill">Resume</span>
                  </div>
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <div className="who">
                    <b>{t.name}</b>
                    <small>{t.role}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </Reveal>
        </section>

        <section className="landing-section" id="pricing">
          <Reveal>
          <div className="container">
            <div className="sectionTitle">
              <h3>Simple, transparent pricing</h3>
              <p>Start free. Upgrade when you need unlimited PDF downloads.</p>
            </div>
            <div className="pricingGrid">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`pricingCard ${tier.featured ? 'featured' : ''}`}
                >
                  {tier.featured && (
                    <div style={{ marginBottom: '8px' }}>
                      <span className="pill" style={{ background: 'rgba(255,255,255,.15)', borderColor: 'rgba(255,255,255,.2)', color: '#fff' }}>
                        Most popular
                      </span>
                    </div>
                  )}
                  <b className="pricingCardTitle" style={{ fontSize: '1.1rem' }}>{tier.name}</b>
                  <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{tier.price}</span>
                    {tier.period && <span style={{ opacity: 0.8, fontSize: '0.9rem' }}> {tier.period}</span>}
                  </div>
                  <ul>
                    {tier.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                    <Link
                      href={tier.ctaUrl}
                      className={tier.featured ? 'btn primary' : 'btn'}
                      style={tier.featured ? { background: '#fff', color: '#0b1020', borderColor: 'rgba(255,255,255,.3)' } : undefined}
                    >
                      {tier.ctaLabel}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </Reveal>
        </section>

        <section className="cta">
          <Reveal>
          <div className="container ctaInner">
            <div>
              <h3>Let your resume do the talking</h3>
              <p>
                Start with {PRODUCT_NAME} — choose a template, add your story, export your PDF.
              </p>
            </div>
            <div className="ctaActions">
              <Link href="/dashboard" className="btn primary">Get started</Link>
              <Link href="#features" className="btn ghostDark">Learn more</Link>
            </div>
          </div>
          </Reveal>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="footerGrid">
            <div className="footerBrand">
              <Link href="/" className="brand">
                <div className="logoMark" aria-hidden />
                <span>{BRAND_SLUG}</span>
              </Link>
              <p>
                One place to build, tweak, and export your resume. Professional templates,
                design controls, and one-click PDF—built for the way you work.
              </p>
            </div>
            <div className="col">
              <h4>Product</h4>
              <Link href="#features">Features</Link>
              <Link href="#how-it-works">How it works</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
            <div className="col">
              <h4>Resources</h4>
              <Link href="/dashboard">Get started</Link>
              <Link href="#customers">Testimonials</Link>
            </div>
            <div className="col">
              <h4>Company</h4>
              <Link href="/login">Log in</Link>
              <Link href="/dashboard">Sign up</Link>
            </div>
          </div>
          <div className="footerBottom">
            <span>© {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.</span>
            <span>Privacy · Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
