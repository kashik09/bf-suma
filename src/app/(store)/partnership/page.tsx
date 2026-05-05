import { Car, DollarSign, Heart, Mail, MessageCircle, Plane, Sprout, TrendingUp, Wallet } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { getWhatsAppPrimaryUrl } from "@/config/contact";
import { buildStorefrontMetadata } from "@/lib/seo";

export const metadata = buildStorefrontMetadata({
  title: "Become a Distributor",
  description:
    "Join BF Suma as a distributor. Earn with every sale, grow your network, and unlock travel rewards, car incentives, and financial independence.",
  path: "/partnership"
});

const BENEFITS = [
  {
    icon: DollarSign,
    title: "Earn with Every Sale",
    points: [
      "High retail margins on every product",
      "Monthly cash bonuses based on performance"
    ]
  },
  {
    icon: TrendingUp,
    title: "Grow Beyond Sales",
    points: [
      "Additional growth perks and performance incentives",
      "Structured rewards as your network expands"
    ]
  },
  {
    icon: Plane,
    title: "Be Rewarded for Your Success",
    points: [
      "Intercontinental and international travel opportunities",
      "Exclusive incentive programs"
    ]
  },
  {
    icon: Car,
    title: "Achieve More",
    points: [
      "Luxury car awards",
      "Recognition for your growth and dedication"
    ]
  }
] as const;

const MORE_THAN_BUSINESS = [
  {
    icon: Wallet,
    title: "Financial Independence",
    description: "Build sustainable income on your own terms"
  },
  {
    icon: Sprout,
    title: "Personal Growth",
    description: "Develop leadership and business skills"
  },
  {
    icon: Heart,
    title: "Community Impact",
    description: "Help others achieve better health and wellbeing"
  }
] as const;

export default function PartnershipPage() {
  const whatsappUrl = getWhatsAppPrimaryUrl(
    "Hi BF Suma, I'd like to learn about becoming a distributor."
  );

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 py-16 text-white sm:py-20">
        <PageContainer className="space-y-4 text-center">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Your Next Step in Wellness & Opportunity Starts Here
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/90 sm:text-xl">
            Join BF Suma and build a rewarding path in health, wellbeing, and financial growth.
          </p>
        </PageContainer>
      </section>

      {/* Intro */}
      <PageContainer className="py-10 sm:py-12">
        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-slate-700">
          At BF Suma, we believe wellness is more than products — it's an opportunity to grow,
          earn, and make a meaningful impact. As a distributor, you become part of a dynamic
          network focused on nutrition, health, and everyday well-being.
        </p>
      </PageContainer>

      {/* Benefits Grid */}
      <PageContainer className="pb-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-slate-900">{benefit.title}</h3>
              <ul className="space-y-2">
                {benefit.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </PageContainer>

      {/* More Than Business */}
      <section className="bg-slate-50 py-12 sm:py-16">
        <PageContainer>
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 sm:mb-10">
            More Than Business
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {MORE_THAN_BUSINESS.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-soft"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* CTA Section */}
      <PageContainer className="py-12 sm:py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center shadow-soft">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Start Your Journey Today
          </h2>
          <p className="mb-6 text-slate-700">
            Take the first step toward building your wellness business with BF Suma.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="mailto:partnerships@bfsumauganda.com"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Mail className="h-4 w-4" />
              Email Us
            </a>
            <a
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Us
            </a>
          </div>
          <p className="mt-8 text-sm text-slate-500">
            BF Suma — Wellness, Backed by Nature & Science. A compass to the path for a bright
            future right ahead of you.
          </p>
        </div>
      </PageContainer>
    </main>
  );
}
