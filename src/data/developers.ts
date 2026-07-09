export interface DeveloperCredit {
  name: string;
  github?: string;
  website?: string;
}

export interface ProjectCredits {
  developers: DeveloperCredit[];
  moreUrl?: string;
  moreLabel?: string;
}

export const MAGS: DeveloperCredit = {
  name: "MAGS",
  github: "https://github.com/MAGS-GH",
  website: "https://mags.dk",
};

export const KASPER: DeveloperCredit = {
  name: "Kasper",
  github: "https://github.com/KasperHBC",
};

export const MTKONGE: DeveloperCredit = {
  name: "mtkonge",
  github: "https://github.com/mtkonge",
  website: "https://mtko.dk",
};

export const SFJA: DeveloperCredit = {
  name: "sfja2004",
  github: "https://github.com/sfja2004",
  website: "https://www.sfja.dk",
};

export const UPTIMEDADDY_CREDITS: ProjectCredits = {
  developers: [
    { name: "Daniel", github: "https://github.com/Danielsteenberg-bot" },
    { name: "Kevin", github: "https://github.com/KevinNielsen00" },
    { name: "Kim", github: "https://github.com/krixzy" },
    MAGS,
  ],
  moreUrl: "https://uptimedaddy.mercantec.tech/developers",
  moreLabel: "Se alle udviklere",
};

export const SKILLS_CREDITS: ProjectCredits = {
  developers: [MAGS, KASPER],
};

export const GUESTBOOK_CREDITS: ProjectCredits = {
  developers: [MAGS, MTKONGE, SFJA],
};

export const DEFAULT_CREDITS: ProjectCredits = {
  developers: [MAGS],
};
