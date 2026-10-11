/**
 * Talking-website builds shown on /marketing (only clients who have agreed to be featured). Screenshots and the walkthrough recording live in
 * /public/showcase. Each site has its own voice agent that answers and books through Cal.com.
 */
export const showcase = {
  eyebrow: "Featured build",
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
      highlights: [
        "Voice agent that answers questions and books real appointments",
        "Cinematic scroll hero built from the shop's own chair",
        "Real prices, hours and Booksy reviews, plus online booking",
      ],
    },
  ],
} as const
