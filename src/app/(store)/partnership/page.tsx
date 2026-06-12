import Image from "next/image";
import { Car, DollarSign, Heart, Mail, MessageCircle, Plane, Sprout, TrendingUp, Wallet } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { getWhatsAppPrimaryUrl } from "@/config/contact";
import { buildStorefrontMetadata } from "@/lib/seo";

export const metadata = buildStorefrontMetadata({
  title: "Become a BF Suma Distributor in Uganda | Join the Wellness Network",
  description:
    "Join BF Suma Uganda as a distributor or wellness partner. Earn from a growing health supplements business in Uganda. Learn about partnership opportunities today.",
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
      {/* Hero - Split Layout */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500">
        <PageContainer className="grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
          <div className="text-center text-white lg:text-left">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/80">
              Become a Distributor
            </p>
            <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Your Next Step in Wellness & Opportunity
            </h1>
            <p className="mb-6 text-lg text-white/90 sm:text-xl">
              Join BF Suma and build a rewarding path in health, wellbeing, and financial growth.
            </p>
            <a
              href="#get-started"
              className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-semibold text-brand-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Get Started Today
            </a>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Image
              src="/partnership-images/partnership-hero-lifestyle.jpg"
              alt="BF Suma distributor team lifestyle"
              width={600}
              height={450}
              className="aspect-[4/3] rounded-2xl object-cover shadow-2xl"
              priority
            />
          </div>
        </PageContainer>
      </section>

      {/* Intro with side image */}
      <PageContainer className="py-12 sm:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="order-2 lg:order-1">
            <Image
              src="/partnership-images/partnership-products-training.jpg"
              alt="BF Suma products and training session"
              width={600}
              height={450}
              className="aspect-[4/3] rounded-2xl object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              More Than Just Products
            </h2>
            <p className="mb-4 text-lg leading-relaxed text-slate-700">
              At BF Suma, we believe wellness is more than products — it&apos;s an opportunity
              to grow, earn, and make a meaningful impact.
            </p>
            <p className="text-lg leading-relaxed text-slate-700">
              As a distributor, you become part of a dynamic network focused on nutrition,
              health, and everyday well-being.
            </p>
          </div>
        </div>
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

      {/* Success Stories / Social Proof Image */}
      <section className="bg-brand-50">
        <PageContainer className="py-12 sm:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                Join a Thriving Community
              </h2>
              <p className="mb-4 text-lg text-slate-700">
                Our distributors come from all walks of life — entrepreneurs, professionals,
                students, and homemakers united by a shared vision for wellness and success.
              </p>
              <p className="text-lg text-slate-700">
                With training, support, and a proven system, you&apos;ll never walk alone.
              </p>
            </div>
            <Image
              src="/partnership-images/partnership-community-event.jpg"
              alt="BF Suma distributor community event"
              width={600}
              height={450}
              className="aspect-[4/3] rounded-2xl object-cover"
            />
          </div>
        </PageContainer>
      </section>

      {/* More Than Business */}
      <section className="py-12 sm:py-16">
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
      <section id="get-started" className="bg-slate-900 py-16 sm:py-20">
        <PageContainer>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Start Your Journey Today
              </h2>
              <p className="mb-8 text-lg text-slate-300">
                Take the first step toward building your wellness business with BF Suma.
                Our team is ready to guide you.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <a
                  href="mailto:partnerships@bfsumauganda.com"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  <Mail className="h-4 w-4" />
                  Email Us
                </a>
                <a
                  href={whatsappUrl}
                  rel="noreferrer"
                  target="_blank"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand-500 px-6 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Us
                </a>
              </div>
              <p className="mt-8 text-sm text-slate-400">
                BF Suma — Wellness, Backed by Nature & Science.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm lg:max-w-none">
              <Image
                src="/partnership-images/partnership-success-award.jpg"
                alt="BF Suma distributor success and awards"
                width={500}
                height={500}
                className="aspect-square rounded-2xl object-cover object-bottom"
              />
            </div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
