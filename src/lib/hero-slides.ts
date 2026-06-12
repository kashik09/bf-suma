export interface HeroSlide {
  id: string;
  badge: string;
  headline: string;
  subhead: string;
  image: string;
  alt: string;
  whatsappMessage: string | null;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "catalog",
    badge: " ",
    headline: " ",
    subhead: " ",
    image: "/hero-images/wellness.png",
    alt: "BF Suma wellness product catalog available in Uganda",
    whatsappMessage: null
  },
  {
    id: "supplements",
    badge: "Daily Wellness",
    headline: "TRUSTED WELLNESS ESSENTIALS FOR YOUR DAILY ROUTINE",
    subhead: "Trusted wellness essentials for daily routines — delivered in Kampala.",
    image: "/hero-images/supplements.jpg",
    alt: "BF Suma health supplements range available in Uganda",
    whatsappMessage: "Hi! I'm interested in BF Suma's wellness supplements. Can you help me choose the right one for my needs?"
  },
  {
    id: "nutrition",
    badge: "Plant-Based Nutrition",
    headline: "WHOLE-FOOD WELLNESS SUPPORT",
    subhead: "Inspired by nature, designed to support everyday wellbeing.",
    image: "/hero-images/vegetables.jpg",
    alt: "Plant-based wellness nutrition from BF Suma Uganda",
    whatsappMessage: "Hi! I'd love to learn about BF Suma's plant-based nutrition products."
  },
  {
    id: "lifestyle",
    badge: "Lifestyle Balance",
    headline: "WELLNESS THAT FITS YOUR LIFESTYLE",
    subhead: "Simple, effective support for active living and recovery.",
    image: "/hero-images/lifestyle.jpg",
    alt: "BF Suma wellness lifestyle products in Kampala Uganda",
    whatsappMessage: "Hi! I'm looking for products to support an active lifestyle. What would you recommend?"
  },
  {
    id: "daily-vitality",
    badge: "Daily Vitality",
    headline: "FEEL STRONG, STAY ENERGIZED",
    subhead: "Balanced support for energy, movement, and everyday performance.",
    image: "/hero-images/joint-health.jpg",
    alt: "BF Suma joint and vitality supplements in Uganda",
    whatsappMessage: "Hi! I'm interested in products for daily energy and vitality."
  }
];
