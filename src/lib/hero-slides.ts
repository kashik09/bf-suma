export interface HeroSlide {
  id: string;
  badge: string;
  headline: string;
  subhead: string;
  image: string;
}

export const HERO_SLIDES: HeroSlide[] = [
    {
    id: "catalog",
    badge: " ",
    headline: " ",
    subhead: " ",
    image: "/hero-images/wellness.png"
  },
  {
    id: "supplements",
    badge: "Daily Wellness",
    headline: "TRUSTED WELLNESS ESSENTIALS FOR YOUR DAILY ROUTINE",
    subhead: "Rooted in research, driven by quality: BF SUMA brings you trusted wellness solutions for everyday health.",
    image: "/hero-images/supplements.jpg"
  },
  {
    id: "nutrition",
    badge: "Plant-Based Nutrition",
    headline: "WHOLE-FOOD WELLNESS SUPPORT",
    subhead: "Inspired by nature, designed to support everyday wellbeing.",
    image: "/hero-images/vegetables.jpg"
  },
  {
    id: "lifestyle",
    badge: "Lifestyle Balance",
    headline: "WELLNESS THAT FITS YOUR LIFESTYLE",
    subhead: "Simple, effective support for active living and recovery.",
    image: "/hero-images/lifestyle.jpg"
  },
  {
    id: "daily-vitality",
    badge: "Daily Vitality",
    headline: "FEEL STRONG, STAY ENERGIZED",
    subhead: "Balanced support for energy, movement, and everyday performance.",
    image: "/hero-images/joint-health.jpg"
  },
  {
    id: "joint-health",
    badge: "Joint Health",
    headline: "SUPPORT COMFORTABLE, ACTIVE MOVEMENT",
    subhead: "Formulations selected to help support mobility and everyday comfort.",
    image: "/hero-images/daily-vitality.jpg"
  }
];
