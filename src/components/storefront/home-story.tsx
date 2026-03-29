import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const storyPoints = [
  "We focus on products that are easy to understand and easy to reorder.",
  "We prioritize responsive local support before and after checkout.",
  "We keep the buying process simple: clear listing, clear availability, clear next steps."
];

export function HomeStory() {
  return (
    <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="space-y-3.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Our Story</p>
        <h2 className="text-2xl font-semibold leading-tight text-slate-900">Built for people who want wellness products without confusion.</h2>
        <p className="text-sm leading-relaxed text-slate-700">
          BF Suma was shaped around one promise: make trusted health essentials easier to discover, compare, and order locally.
          We aim to remove guesswork by keeping product details clear and support within reach.
        </p>

        <ul className="space-y-2">
          {storyPoints.map((point) => (
            <li className="flex items-start gap-2 text-sm leading-relaxed text-slate-700" key={point}>
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
          href="/shop"
        >
          Explore Products
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-soft">
        <div
          className="h-52 w-full bg-cover bg-center sm:h-64"
          style={{ backgroundImage: "url('/catalog-images/joshoppers.com/quad-reishi-capsules.webp')" }}
        />
      </div>
    </section>
  );
}
