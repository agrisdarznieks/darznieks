import { Merriweather, Merriweather_Sans } from "next/font/google";

export const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const merriweatherSans = Merriweather_Sans({
  variable: "--font-merriweather-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});
