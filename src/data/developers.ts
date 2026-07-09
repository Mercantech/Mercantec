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

export const DEFAULT_CREDITS: ProjectCredits = {
  developers: [MAGS],
};
