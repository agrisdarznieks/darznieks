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
    skipToContent: string;
    language: string;
    switchLight: string;
    switchDark: string;
    switchToEn: string;
    switchToLv: string;
    image: string;
  };
  consent: {
    message: string;
    accept: string;
    decline: string;
  };
  work: {
    title: string;
    description: string;
    empty: string;
    back: string;
    problem: string;
    approach: string;
    outcomes: string;
    featured: string;
    client: string;
    role: string;
    timeframe: string;
    tags: string;
    related: string;
  };
  writing: {
    title: string;
    description: string;
    empty: string;
    back: string;
    tags: string;
    themes: string;
    related: string;
  };
  notFound: {
    title: string;
    body: string;
    home: string;
  };
}
