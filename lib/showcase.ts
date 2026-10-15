/**
 * Talking-website builds shown on /marketing, in this order. Each recording is a screen capture of a live build.
 * Files live in /public/showcase. Real businesses appear only once the owner has agreed; concept demos use fictional
 * names, people and details.
 */
export const showcase = {
  eyebrow: "Featured builds",
  heading: "Websites that talk, and book.",
  subcopy:
    "Every build is designed around the business itself, with a voice agent that knows the menu, the prices and the calendar. Visitors ask a question and leave with an appointment.",
  videos: [
    {
      id: "onduty-jackets",
      title: "ONDUTY",
      category: "Clothing store",
      src: "/showcase/onduty-jackets-walkthrough.mp4",
      webm: "/showcase/onduty-jackets-walkthrough.webm",
      poster: "/showcase/onduty-jackets-poster.jpg",
      caption: "An outerwear store where the jacket sways with your mouse, splits into its four layers in 3D, then lines up the full collection.",
      sound: "Sound on",
    },
    {
      id: "lumen-skin",
      title: "Lumen Skin Studio",
      category: "Skincare concept demo",
      src: "/showcase/lumen-skin-walkthrough.mp4",
      webm: "/showcase/lumen-skin-walkthrough.webm",
      poster: "/showcase/lumen-skin-poster.jpg",
      caption: "A skincare studio with every treatment and price, a 3D look beneath the skin, reviews, then a live call with the voice agent.",
      sound: "Sound on to hear the agent",
    },
    {
      id: "first-class-cutz",
      title: "First Class Cutz by Reem",
      category: "Barbershop",
      src: "/showcase/first-class-cutz-walkthrough.mp4",
      webm: "/showcase/first-class-cutz-walkthrough.webm",
      poster: "/showcase/first-class-cutz-poster.jpg",
      caption: "A barbershop with a cinematic hero, services, reviews and prices, then a live call with the voice agent.",
      sound: "Sound on to hear the agent",
    },
  ],
} as const
