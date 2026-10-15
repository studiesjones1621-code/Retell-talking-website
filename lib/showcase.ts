/**
 * Talking-website builds shown on /marketing. Each recording is a screen capture of a live build, with a tab to switch
 * between them. Files live in /public/showcase. Real businesses appear only once the owner has agreed; concept demos
 * use fictional names, people and details.
 */
export const showcase = {
  eyebrow: "Featured builds",
  heading: "Websites that talk, and book.",
  subcopy:
    "Every build is designed around the business itself, with a voice agent that knows the menu, the prices and the calendar. Visitors ask a question and leave with an appointment.",
  videos: [
    {
      id: "first-class-cutz",
      title: "First Class Cutz by Reem",
      category: "Barbershop",
      src: "/showcase/first-class-cutz-walkthrough.mp4",
      webm: "/showcase/first-class-cutz-walkthrough.webm",
      poster: "/showcase/first-class-cutz-poster.jpg",
      caption: "A full walkthrough: the cinematic hero, services, reviews and prices, then a live call with the voice agent.",
    },
    {
      id: "lumen-skin",
      title: "Lumen Skin Studio",
      category: "Skincare concept demo",
      src: "/showcase/lumen-skin-walkthrough.mp4",
      webm: "/showcase/lumen-skin-walkthrough.webm",
      poster: "/showcase/lumen-skin-poster.jpg",
      caption: "A skincare studio concept: treatments, a 3D look beneath the skin, reviews, then a live call with the voice agent.",
    },
  ],
} as const
