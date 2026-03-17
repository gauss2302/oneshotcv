/**
 * Landing page content — pricing tiers and testimonials.
 * Replace placeholders with your real data.
 */

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  featured?: boolean;
  ctaLabel: string;
  ctaUrl: string;
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Basic',
    price: 'Free',
    period: 'forever',
    features: [
      'Create unlimited resumes',
      '17+ professional templates',
      'Design customization',
      'Live preview',
    ],
    featured: false,
    ctaLabel: 'Get Started',
    ctaUrl: '/dashboard',
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    features: [
      'Everything in Basic',
      'Unlimited PDF downloads',
      'No watermarks',
      'Priority support',
      'Export to multiple formats',
    ],
    featured: true,
    ctaLabel: 'Subscribe',
    ctaUrl: '/dashboard?subscription=required',
  },
  {
    name: 'Advanced',
    price: 'Custom',
    period: '',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom branding',
      'API access',
    ],
    featured: false,
    ctaLabel: 'Contact us',
    ctaUrl: '/dashboard',
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: 'One Shot CV saved me hours. The templates are clean and the PDF export is flawless.',
    name: 'Alex Chen',
    role: 'Product Designer',
  },
  {
    quote: 'Finally a resume builder that doesn’t look generic. I got callbacks within a week.',
    name: 'Jordan Lee',
    role: 'Software Engineer',
  },
  {
    quote: 'Simple, fast, and the design options let me match my personal brand. Highly recommend.',
    name: 'Sam Taylor',
    role: 'Marketing Lead',
  },
  {
    quote: 'Best resume tool I’ve used. The live preview and one-click PDF made applying so much easier.',
    name: 'Morgan Reed',
    role: 'Founder',
  },
];
