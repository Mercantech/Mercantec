/** Kanonisk tech-liste med ikoner — bruges til filtre og som reference for projekter. */
export const TECH_CATALOG: { name: string; icon: string }[] = [
  { name: ".NET", icon: "/tech/dotnet.svg" },
  { name: "Azure", icon: "/tech/azure.png" },
  { name: "Blazor", icon: "/tech/blazor.svg" },
  { name: "Docker", icon: "/tech/docker.svg" },
  { name: "Express", icon: "/tech/express.svg" },
  { name: "GitHub", icon: "/tech/github.svg" },
  { name: "Go", icon: "/tech/go.svg" },
  { name: "JWT", icon: "/tech/jsonwebtokens.svg" },
  { name: "Markdown", icon: "/tech/markdown.svg" },
  { name: "Microsoft Graph", icon: "/tech/microsoftgraph.png" },
  { name: "MQTT", icon: "/tech/mqtt.svg" },
  { name: "Next.js", icon: "/tech/nextjs.svg" },
  { name: "Node.js", icon: "/tech/nodejs.svg" },
  { name: "OAuth 2.0", icon: "/tech/oauth.svg" },
  { name: "PostgreSQL", icon: "/tech/postgresql.svg" },
  { name: "Python", icon: "/tech/python.svg" },
  { name: "React", icon: "/tech/react.svg" },
  { name: "Ruby", icon: "/tech/ruby.svg" },
  { name: "Vite", icon: "/tech/vite.svg" },
];

export const TECH_ICONS = Object.fromEntries(
  TECH_CATALOG.map((item) => [item.name, item.icon]),
) as Record<string, string>;

export function getTechIcon(name: string): string {
  return TECH_ICONS[name] ?? "/tech/dotnet.svg";
}

export function sortTechNames(names: Iterable<string>): string[] {
  const order = new Map(TECH_CATALOG.map((item, index) => [item.name, index]));
  return Array.from(new Set(names)).sort(
    (a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999) || a.localeCompare(b, "da"),
  );
}
