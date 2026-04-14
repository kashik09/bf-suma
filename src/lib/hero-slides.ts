export interface HeroSlide {
  id: string;
  badge: string;
  headline: string;
  subhead: string;
  image: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "supplements",
    badge: "Daily Supplements",
    headline: "PREMIUM SUPPLEMENTS FOR DAILY WELLNESS",
    subhead: "Trusted nutrition support for energy, focus, and day-to-day vitality.",
    image: "/hero-images/supplements.jpg"
  },
  {
    id: "nutrition",
    badge: "Plant-Based Nutrition",
    headline: "WHOLE-FOOD WELLNESS SUPPORT",
    subhead: "Nutrient-focused choices inspired by balanced, plant-forward living.",
    image: "/hero-images/vegetables.jpg"
  },
  {
    id: "lifestyle",
    badge: "Lifestyle Balance",
    headline: "WELLNESS THAT FITS YOUR LIFESTYLE",
    subhead: "Flexible options for busy workdays, active routines, and recovery time.",
    image: "/hero-images/lifestyle.jpg"
  },
  {
    id: "joint-health",
    badge: "Joint Health",
    headline: "SUPPORT COMFORTABLE, ACTIVE MOVEMENT",
    subhead: "Formulations selected to help support mobility and everyday comfort.",
    image: "/hero-images/joint-health.jpg"
  }
];
