export type TemplateCategory = "festival" | "seasonal" | "growth" | "promotion"

export interface FestivalTemplate {
  id: string
  name: string
  emoji: string
  category: TemplateCategory
  prompt: string
  suggestTone: "professional" | "casual" | "festive"
}

export const FESTIVAL_TEMPLATES: FestivalTemplate[] = [
  // ── Festival ──────────────────────────────────────────────────────────────────
  {
    id: "diwali",
    name: "Diwali Special",
    emoji: "🪔",
    category: "festival",
    suggestTone: "festive",
    prompt:
      "Diwali special — 25% off all services this Diwali week. Light up your look for the festival of lights!",
  },
  {
    id: "eid",
    name: "Eid Mubarak",
    emoji: "🌙",
    category: "festival",
    suggestTone: "festive",
    prompt:
      "Eid Mubarak! Celebrate with a special 20% discount on all grooming and beauty services this Eid.",
  },
  {
    id: "christmas",
    name: "Christmas Sale",
    emoji: "🎄",
    category: "festival",
    suggestTone: "festive",
    prompt:
      "Christmas offer — gift yourself a makeover! 30% off all services Dec 20–26. Merry Christmas!",
  },
  {
    id: "new_year",
    name: "New Year Offer",
    emoji: "🎆",
    category: "festival",
    suggestTone: "festive",
    prompt:
      "Start the new year looking your best! 20% off all services in January. New year, new you.",
  },
  {
    id: "holi",
    name: "Holi Offer",
    emoji: "🌈",
    category: "festival",
    suggestTone: "festive",
    prompt:
      "Get festival-ready for Holi! Special pre-Holi hair treatment + 15% off all services this week.",
  },
  {
    id: "navratri",
    name: "Navratri Special",
    emoji: "💃",
    category: "festival",
    suggestTone: "festive",
    prompt:
      "Navratri special — glow up for the festive dances! 20% off makeup and styling services.",
  },
  {
    id: "valentines",
    name: "Valentine's Day",
    emoji: "❤️",
    category: "festival",
    suggestTone: "festive",
    prompt:
      "Valentine's Day special — look your best for your someone special. Couples package at 25% off.",
  },
  {
    id: "womens_day",
    name: "Women's Day",
    emoji: "💜",
    category: "festival",
    suggestTone: "festive",
    prompt:
      "Celebrating you this Women's Day! 30% off all services for women on March 8th only.",
  },
  {
    id: "independence",
    name: "Independence Day",
    emoji: "🇮🇳",
    category: "festival",
    suggestTone: "festive",
    prompt:
      "Happy Independence Day! Celebrate freedom with 15% off all services on August 15th.",
  },
  // ── Seasonal ──────────────────────────────────────────────────────────────────
  {
    id: "summer",
    name: "Summer Special",
    emoji: "☀️",
    category: "seasonal",
    suggestTone: "casual",
    prompt:
      "Beat the summer heat with our cooling treatment + express blowout. 20% off all hair services this summer.",
  },
  {
    id: "monsoon",
    name: "Monsoon Care",
    emoji: "🌧️",
    category: "seasonal",
    suggestTone: "casual",
    prompt:
      "Monsoon hair care special — frizz control + deep conditioning. 15% off all hair services this July.",
  },
  {
    id: "winter",
    name: "Winter Warmth",
    emoji: "❄️",
    category: "seasonal",
    suggestTone: "casual",
    prompt:
      "Winter care package — deep moisture treatment + head massage. Keep your skin and hair healthy.",
  },
  // ── Growth ────────────────────────────────────────────────────────────────────
  {
    id: "referral",
    name: "Referral Drive",
    emoji: "🤝",
    category: "growth",
    suggestTone: "casual",
    prompt:
      "Bring a friend and both of you get 15% off your next visit! Our referral offer is live now.",
  },
  {
    id: "loyalty",
    name: "Loyalty Reward",
    emoji: "⭐",
    category: "growth",
    suggestTone: "professional",
    prompt:
      "As a valued loyal customer, enjoy an exclusive 20% off your next appointment. Thank you for being with us!",
  },
  {
    id: "winback",
    name: "We Miss You",
    emoji: "💌",
    category: "growth",
    suggestTone: "casual",
    prompt:
      "We miss you! It's been a while. Come back and enjoy 20% off on your next visit. We have exciting new services waiting for you.",
  },
  {
    id: "birthday",
    name: "Birthday Special",
    emoji: "🎂",
    category: "growth",
    suggestTone: "festive",
    prompt:
      "Happy birthday! Enjoy a complimentary hair wash + 25% off any service during your birthday month. Our gift to you!",
  },
  // ── Promotion ─────────────────────────────────────────────────────────────────
  {
    id: "weekend",
    name: "Weekend Deal",
    emoji: "🛍️",
    category: "promotion",
    suggestTone: "casual",
    prompt:
      "Weekend special — walk-ins welcome! 15% off all services this Saturday and Sunday only. Limited slots.",
  },
  {
    id: "new_service",
    name: "New Service Launch",
    emoji: "✨",
    category: "promotion",
    suggestTone: "professional",
    prompt:
      "Exciting news! We just launched a brand-new premium service. Try it at an introductory price this month.",
  },
  {
    id: "flash_sale",
    name: "Flash Sale",
    emoji: "⚡",
    category: "promotion",
    suggestTone: "festive",
    prompt:
      "48-hour flash sale! 30% off all services this weekend only. Limited slots — book now before they're gone.",
  },
  {
    id: "anniversary",
    name: "Anniversary Offer",
    emoji: "🎉",
    category: "promotion",
    suggestTone: "festive",
    prompt:
      "We're celebrating our anniversary and giving back to our amazing customers! 25% off everything this week.",
  },
]

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  festival:  "Festival",
  seasonal:  "Seasonal",
  growth:    "Growth",
  promotion: "Promotion",
}
