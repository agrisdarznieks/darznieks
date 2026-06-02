export type Lang = "en" | "lv";

export interface Dictionary {
  name: string;
  tagline: string;
  bio: string;
  sections: {
    building: string;
    findMe: string;
  };
  links: {
    temturis: string;
    caballero: string;
    bb: string;
    linkedin: string;
    threads: string;
    x: string;
    substack: string;
    instagram: string;
  };
  footer: string;
  a11y: {
    switchLight: string;
    switchDark: string;
    switchToEn: string;
    switchToLv: string;
  };
}
