/**
 * Every fact here was taken from cleanritecenter.com, not invented.
 * The voice agent's prompt is generated from this same file, so the site and
 * the agent can never quote different prices or hours.
 */

export const business = {
  name: "Clean Rite Center",
  legalName: "Laundry Capital Co LLC",
  tagline: "A Laundromat Superstore Since 2000",
  since: 2000,

  // Their corporate office. Individual stores are found through the locator —
  // this is a multi-location chain, not one storefront.
  corporate: {
    line1: "9777 Queens Blvd, Suite 620",
    city: "Rego Park",
    state: "NY",
    zip: "11374",
  },

  // The published number is a TEXT line for active orders, not a sales phone.
  // Labelling it correctly matters: a customer who calls it expecting a human
  // gets nothing.
  textLine: "(929) 357-1728",
  textLineHref: "sms:+19293571728",
  email: "info@cleanritecenter.com",

  locatorUrl: "https://www.cleanritecenter.com/location-finder/",
  orderUrl: "https://www.cleanritecenter.com/delivery/",
  facebook: "https://www.facebook.com/cleanritecenter",
  instagram: "https://www.instagram.com/cleanritecenter/",

  // Counts come from their own store locator feed, not from marketing copy.
  // The homepage claims New England and Ohio; the locator lists no stores in
  // either, so they are left off rather than promised.
  storeCounts: [
    { place: "Brooklyn", n: 17 },
    { place: "The Bronx", n: 12 },
    { place: "Queens", n: 7 },
    { place: "Staten Island", n: 3 },
    { place: "Manhattan", n: 1 },
    { place: "Baltimore area", n: 2 },
    { place: "Allentown, PA", n: 1 },
  ],
  totalStores: 43,

  pricing: {
    base: "$29.99",
    baseUnit: "first 15 lbs",
    additional: "$2.19",
    additionalUnit: "per additional lb",
    note: "You review and confirm the total after we weigh your laundry, so there are no surprise charges.",
  },

  delivery: {
    freeRadiusMiles: 3,
    maxRadiusMiles: 10,
    partners: "Uber and DoorDash",
  },

  turnarounds: ["4-hour rapid clean", "24 hour", "2 day"],
  reviewCount: "20,000+",
} as const

export const services = [
  {
    title: "Self Service",
    blurb:
      "150+ washers and dryers, from 20 lb to 80 lb. Carts, folding tables, detergent, and attendants on the floor.",
    image: "/crc/self-service.jpg",
  },
  {
    title: "Wash, Dry & Fold",
    blurb:
      "Drop off a bag. We wash it, dry it, fold it, and have it waiting. Rapid 4-hour turnaround available.",
    image: "/crc/laundry-stack.png",
  },
  {
    title: "Pickup & Delivery",
    blurb:
      "Free pickup and delivery within 3 miles. Track every step by text, from pickup to your door.",
    image: "/crc/pickup-delivery.jpg",
  },
  {
    title: "Comforters & Bulky Items",
    blurb:
      "Machines up to 80 lb handle the comforters, duvets and blankets a home washer cannot.",
    // No usable photo exists for this one, so the card renders a typographic
    // tile instead of borrowing an unrelated image.
    image: null,
    tile: { stat: "80 lb", label: "machines" },
  },
] as const

export const whyUs = [
  {
    stat: "150+",
    title: "machines per store",
    body: "You are not waiting for a washer. Do a week of laundry in a single trip.",
  },
  {
    stat: "4 hrs",
    title: "rapid turnaround",
    body: "Drop it off in the morning and it is folded and ready by the afternoon.",
  },
  {
    stat: "24/7",
    title: "at many locations",
    body: "Overnight shift, early start, or a Sunday night catch-up — the doors are open.",
  },
  {
    stat: "25 yrs",
    title: "in the neighborhood",
    body: "Since 2000, across the five boroughs and beyond. Over 20,000 five-star reviews.",
  },
] as const

export const amenities = [
  "Free WiFi and cable TV",
  "Free parking",
  "Attendants on the floor",
  "Card-operated machines with rewards",
  "Vending and lounge seating",
  "Detergent and supplies on site",
] as const

/** Verbatim from the reviews published on cleanritecenter.com. */
export const testimonials = [
  {
    quote:
      "Totally recommend. I used the 4-hour rapid clean service and I will 1000000% be using it again!",
    name: "Zella W.",
  },
  {
    quote:
      "2 day, 24 hour and even 4 hour turnarounds. And there's a comforter cleaning service.",
    name: "Yoni G.",
  },
  {
    quote:
      "Literally the only laundromat I know of in NYC that offers 4hr wash & fold turnaround — very friendly staff.",
    name: "Daniel E.",
  },
] as const

export const steps = [
  { n: "01", title: "Book a pickup", body: "Tell us where you are and when you want it collected." },
  { n: "02", title: "Bag it up", body: "Leave it at your door. A driver collects it and you get a text." },
  { n: "03", title: "We weigh and wash", body: "You confirm the total before anything is charged." },
  { n: "04", title: "Folded, back to you", body: "Delivered to your door with tracking the whole way." },
] as const

/** Real Maryland storefronts from the locator feed, with their own phone numbers. */
export const marylandStores = [
  {
    address: "4618 A Edmondson Avenue",
    city: "Baltimore",
    state: "MD",
    zip: "21229",
    phone: "667-210-2669",
  },
  {
    address: "7017 Liberty Road",
    city: "Gwynn Oak",
    state: "MD",
    zip: "21207",
    phone: "443-551-3748",
  },
] as const
