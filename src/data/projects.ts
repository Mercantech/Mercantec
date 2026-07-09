import type { ProjectCredits } from "./developers";
import { GUESTBOOK_CREDITS, SKILLS_CREDITS, UPTIMEDADDY_CREDITS } from "./developers";

export interface TechItem {
  name: string;
  icon: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  techStack: TechItem[];
  url: string;
  github?: string;
  logo: string;
  accentColor: string;
  accentBg: string;
  status: "live" | "beta" | "coming-soon";
  credits?: ProjectCredits;
}

export const projects: Project[] = [
  {
    id: "auth",
    name: "Mercantec Auth",
    tagline: "Én login til alle Mercantec-platforme",
    description:
      "Central identity provider til Mercantec-økosystemet. I stedet for at hver platform bygger sin egen auth, logger brugere ind via OAuth 2.0 + PKCE og får JWT-tokens — med support for skolekonto, Discord, Google, GitHub, Microsoft, MFA og passkeys.",
    features: [
      "OAuth 2.0 authorization code + PKCE",
      "JWT (RS256) med JWKS og refresh token rotation",
      "Multi-provider login og account linking",
      "Per-klient branding og admin-panel",
    ],
    techStack: [
      { name: ".NET", icon: "/tech/dotnet.svg" },
      { name: "Blazor", icon: "/tech/blazor.svg" },
      { name: "PostgreSQL", icon: "/tech/postgresql.svg" },
      { name: "Docker", icon: "/tech/docker.svg" },
      { name: "OAuth 2.0", icon: "/tech/oauth.svg" },
      { name: "JWT", icon: "/tech/jsonwebtokens.svg" },
    ],
    url: "https://auth.mercantec.tech",
    github: "https://github.com/Mercantech/auth",
    logo: "/projects/auth-logo.svg",
    accentColor: "#2a4d5c",
    accentBg: "rgba(42, 77, 92, 0.08)",
    status: "live",
  },
  {
    id: "uptimedaddy",
    name: "UptimeDaddy",
    tagline: "Live uptime-monitorering",
    description:
      "En uptime-monitoreringsplatform hvor du vælger hvilke websites der overvåges, får live dashboards med grafer og historik, deler offentlige status-sider — og modtager Discord-notifikationer når noget går ned.",
    features: [
      "HTTP-overvågning med detaljerede svartidsmålinger",
      "Delbare dashboard-boards og iframe-embed",
      "Discord-integration med slash-kommandoer",
      "Microservice-arkitektur via MQTT",
    ],
    techStack: [
      { name: "React", icon: "/tech/react.svg" },
      { name: "Vite", icon: "/tech/vite.svg" },
      { name: ".NET", icon: "/tech/dotnet.svg" },
      { name: "Go", icon: "/tech/go.svg" },
      { name: "Ruby", icon: "/tech/ruby.svg" },
      { name: "PostgreSQL", icon: "/tech/postgresql.svg" },
      { name: "Docker", icon: "/tech/docker.svg" },
      { name: "MQTT", icon: "/tech/mqtt.svg" },
    ],
    url: "https://uptimedaddy.mercantec.tech",
    github: "https://github.com/Mercantech/UptimeDaddy",
    logo: "/projects/uptimedaddy-logo.png",
    accentColor: "#863bff",
    accentBg: "rgba(134, 59, 255, 0.08)",
    status: "live",
    credits: UPTIMEDADDY_CREDITS,
  },
  {
    id: "gf2-learn",
    name: "GF2 Learn",
    tagline: "Pensum, opgaver og projekter til GF2 programmering",
    description:
      "Central læringsplatform til Grundforløb 2 programmering på Mercantec. Pensum og opgaver er Markdown-baseret med C#-playground i browseren (Monaco + WASM), og elever logger ind via Mercantec Auth for profil og progression.",
    features: [
      "Pensum, opgaver og 7 projektforløb i tre niveauer",
      "Interaktiv C#-playground med Monaco-editor i browseren",
      "Markdown-indhold med custom directives (git-step, exercise, osv.)",
      "OAuth via Mercantec Auth (klient gf2-learn)",
    ],
    techStack: [
      { name: ".NET", icon: "/tech/dotnet.svg" },
      { name: "Blazor", icon: "/tech/blazor.svg" },
      { name: "PostgreSQL", icon: "/tech/postgresql.svg" },
      { name: "Docker", icon: "/tech/docker.svg" },
      { name: "OAuth 2.0", icon: "/tech/oauth.svg" },
    ],
    url: "https://learn.mags.dk",
    github: "https://github.com/Mercantech/GF2-Learn",
    logo: "/projects/gf2-learn-logo.svg",
    accentColor: "#0284c7",
    accentBg: "rgba(2, 132, 199, 0.10)",
    status: "live",
  },
  {
    id: "skills",
    name: "Mercantec Skills",
    tagline: "Konkurrencer, point og publikumsstemmer — samlet ét sted",
    description:
      "Hub til Mercantec Skills-konkurrencer med årgangs-forside. 2026-udgaven er Kryds & Bolle-linkbanken, hvor elever indsender hostede spil, får tjeklistepoint og publikumspriser — med delt tilstand i PostgreSQL på tværs af enheder.",
    features: [
      "Årgangs-forside med aktiv 2026 Kryds & Bolle-konkurrence",
      "Linkbank til elevernes hostede spil (URL, hold, billede)",
      "Tjeklistepoint for krav, hosting, multiplayer og ekstra features",
      "Publikumsafstemning med leaderboard og samlet pointtavle",
      "Delt state i PostgreSQL (JSONB) — synk på tværs af enheder",
    ],
    techStack: [
      { name: "Node.js", icon: "/tech/nodejs.svg" },
      { name: "Express", icon: "/tech/express.svg" },
      { name: "PostgreSQL", icon: "/tech/postgresql.svg" },
      { name: "Docker", icon: "/tech/docker.svg" },
    ],
    url: "https://skills.mercantec.tech",
    github: "https://github.com/Mercantech/Skills",
    logo: "/projects/skills-logo.svg",
    accentColor: "#f8c400",
    accentBg: "rgba(248, 196, 0, 0.12)",
    status: "live",
    credits: SKILLS_CREDITS,
  },
  {
    id: "mercan-guestbook",
    name: "MercanGuestBook",
    tagline: "Mercantecs GitHub-gæstebog — én signatur per elev",
    description:
      "Kollektiv gæstebog hvor elever bidrager via fork og pull request. Hver entry er en markdown-fil med GitHub-profil, website og citat — CI validerer og genererer README med alle signaturer sorteret efter commit-tid.",
    features: [
      "Fork → PR-workflow med 3 elev-godkendelser før merge",
      "Én entry-fil per elev i entries/ (GitHub, website, citat)",
      "GitHub Actions validerer format og auto-genererer README",
      "Gæstebogstabel med links til profiler og personlige sider",
    ],
    techStack: [
      { name: "GitHub", icon: "/tech/github.svg" },
      { name: "Python", icon: "/tech/python.svg" },
      { name: "Markdown", icon: "/tech/markdown.svg" },
    ],
    url: "https://github.com/Mercantech/MercanGuestBook",
    github: "https://github.com/Mercantech/MercanGuestBook",
    logo: "/projects/mercan-guestbook-logo.svg",
    accentColor: "#0e38ab",
    accentBg: "rgba(14, 56, 171, 0.10)",
    status: "live",
    credits: GUESTBOOK_CREDITS,
  },
  {
    id: "dh-rooms",
    name: "DH-Rooms",
    tagline: "Datahouse lokalereservation med Room Finder og Azure AD",
    description:
      "Moderne skemaoversigt for Datahouse på Mercantec. Elever og medarbejdere logger ind med Microsoft (Azure AD), og bookinger hentes fra Exchange Room Mailboxes via Microsoft Graph — samme flow som Room Finder i Outlook.",
    features: [
      "Login med Azure AD (Entra ID) via NextAuth",
      "Kalendervisning fra Room Mailboxes via Microsoft Graph",
      "Skemaoversigt pr. dag: rum på 1. sal og Stue med variabel tidsgranularitet",
      "Lokale bookinger og godkendelsesflow — klar til sync mod Outlook/Room Finder",
    ],
    techStack: [
      { name: "Next.js", icon: "/tech/nextjs.svg" },
      { name: "React", icon: "/tech/react.svg" },
      { name: "Docker", icon: "/tech/docker.svg" },
      { name: "Azure", icon: "/tech/azure.svg" },
      { name: "Microsoft Graph", icon: "/tech/microsoftgraph.svg" },
    ],
    url: "https://rooms.mercantec.tech",
    github: "https://github.com/Mercantech/DH-Rooms",
    logo: "/projects/dh-rooms-logo.svg",
    accentColor: "#0d9488",
    accentBg: "rgba(13, 148, 136, 0.12)",
    status: "live",
  },
  {
    id: "vba-year-report-web",
    name: "VBA — Årsrapport (web)",
    tagline: "Årsrapport fra Outlook via Microsoft Graph",
    description:
      "Webdelen af VBA-projektet: henter Outlook-kalender via Microsoft Graph og genererer projekt-årsrapport med samme logik som VBA-makroen. Login sker via Azure (Microsoft Entra ID), og data hentes via Graph (kalender og evt. mail).",
    features: [
      "Azure/Entra login (MSAL) med delegated scopes",
      "Microsoft Graph: kalender-hentning (inkl. delte kalendere)",
      "Excel-download af rapport (xlsx) og dashboard-visning",
      "Kører med Postgres + session/caching",
    ],
    techStack: [
      { name: "Node.js", icon: "/tech/nodejs.svg" },
      { name: "Express", icon: "/tech/express.svg" },
      { name: "PostgreSQL", icon: "/tech/postgresql.svg" },
      { name: "Docker", icon: "/tech/docker.svg" },
      { name: "Azure", icon: "/tech/azure.svg" },
      { name: "Microsoft Graph", icon: "/tech/microsoftgraph.svg" },
    ],
    url: "https://projekt.gf2.dk",
    github: "https://github.com/Mercantech/VBA/tree/main/year-report-web",
    logo: "/projects/vba-year-report-logo.svg",
    accentColor: "#188a9c",
    accentBg: "rgba(24, 138, 156, 0.10)",
    status: "live",
  },
];

export interface EcosystemNode {
  id: string;
  name: string;
  role: "hub" | "client" | "future";
  url?: string;
}

export const ecosystemNodes: EcosystemNode[] = [
  { id: "auth", name: "Mercantec Auth", role: "hub", url: "https://auth.mercantec.tech" },
  { id: "uptimedaddy", name: "UptimeDaddy", role: "client", url: "https://uptimedaddy.mercantec.tech" },
  { id: "gf2learn", name: "GF2 Learn", role: "client", url: "https://learn.mags.dk" },
  { id: "skills", name: "Mercantec Skills", role: "client", url: "https://skills.mercantec.tech" },
  { id: "dhrooms", name: "DH-Rooms", role: "client", url: "https://rooms.mercantec.tech" },
  { id: "videnstjek", name: "Videnstjek", role: "client" },
  { id: "more", name: "Flere kommer", role: "future" },
];
