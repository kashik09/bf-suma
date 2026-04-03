export type WeeklyContentType = "myth" | "insight" | "quick";

export interface DynamicContentItem {
  title: string;
  type: WeeklyContentType;
  href: string;
}

export const dynamicContent = {
  featuredInsight: {
    text: "Small daily habits compound faster when your wellness stack matches your real goal: energy, immunity, focus, or healthy aging.",
    cta: {
      label: "Explore Goal-Based Products",
      href: "/shop"
    }
  },

  weekly: [
    {
      title: "Insight: Why energy dips often come from routine inconsistency, not motivation.",
      type: "insight",
      href: "/faq"
    },
    {
      title: "Myth: More supplements always means better results.",
      type: "myth",
      href: "/faq"
    },
    {
      title: "Quick Win: Build a 2-minute morning wellness checklist.",
      type: "quick",
      href: "/contact"
    },
    {
      title: "Insight: Product clarity lowers checkout hesitation.",
      type: "insight",
      href: "/shop"
    }
  ] as DynamicContentItem[],

  miniArticle: {
    title: "How to pick your first wellness product without overthinking",
    body: "Start with one clear goal, not a long product list. If your main issue is energy crashes, choose one product pathway focused on daily energy support and stick to it consistently. If your priority is immunity, choose one immune-focused option and track how you feel over time. Avoid stacking too many new items at once. Clarity plus consistency usually beats complexity.",
    cta: {
      label: "Shop by Goal",
      href: "/shop"
    }
  },

  story: {
    text: "Most customers do not need a perfect plan. They need a practical first step they can repeat daily. That is where real progress starts."
  }
};
