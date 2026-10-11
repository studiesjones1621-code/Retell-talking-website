/**
 * Recent talking-website builds shown on /marketing. Screenshots and the walkthrough recording live in
 * /public/showcase. Each site has its own voice agent that answers and books through Cal.com.
 */
export const showcase = {
  eyebrow: "Recent builds",
  heading: "Websites that talk, and book.",
  subcopy:
    "Every build is designed around the business itself, with a voice agent that knows the menu, the prices and the calendar. Visitors ask a question and leave with an appointment.",
  video: {
    src: "/showcase/first-class-cutz-walkthrough.mp4",
    webm: "/showcase/first-class-cutz-walkthrough.webm",
    poster: "/showcase/first-class-cutz-poster.jpg",
    title: "First Class Cutz by Reem",
    caption: "A full walkthrough: the cinematic hero, services, reviews and prices, then a live call with the voice agent.",
  },
  builds: [
    {
      name: "First Class Cutz by Reem",
      category: "Barbershop",
      description: "The real barber chair turned into a pilot seat, then a jet flies through the clouds into the menu.",
      image: "/showcase/first-class-cutz.webp",
      url: "https://temporary-express-onyx-lc2ix7l.vercel.app",
    },
    {
      name: "Tye & Company",
      category: "Beauty salon & hair loss studio",
      description: "Billowing silk and a rising crown introduce a hair loss consultation the agent can book.",
      image: "/showcase/tye-and-company.webp",
      url: "https://prompt-sapphire-mq0k1bf.vercel.app",
    },
    {
      name: "Evexia Weight Loss & Wellness",
      category: "Medical wellness clinic",
      description: "Two offices, telemedicine and hormone therapy, with an agent that books the right location.",
      image: "/showcase/evexia.webp",
      url: "https://spry-glacier-sdpv8h1.vercel.app",
    },
    {
      name: "Charm Medical Aesthetics",
      category: "Med spa",
      description: "Their real filler syringe rises through a cream wave, then comes apart in 3D as you scroll.",
      image: "/showcase/charm.webp",
      url: "https://zippy-maple-elrrtte.vercel.app",
    },
  ],
} as const
