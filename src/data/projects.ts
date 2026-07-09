import type { ProjectCredits } from "./developers";
import { UPTIMEDADDY_CREDITS } from "./developers";

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
  { id: "videnstjek", name: "Videnstjek", role: "client" },
  { id: "more", name: "Flere kommer", role: "future" },
];
