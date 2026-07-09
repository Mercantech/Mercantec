import type { ProjectStatus } from "./students-api";
import { getSiteOrigin } from "./auth/config";

const ACCENT = "#0e38ab";
const ACCENT_BG = "rgba(14, 56, 171, 0.08)";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Kladde",
  pending: "Afventer",
  approved: "Godkendt",
  rejected: "Afvist",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export function renderStatusBadge(status: ProjectStatus): string {
  return `<span class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[status]}">${STATUS_LABELS[status]}</span>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderTechStack(
  items: { name: string; icon?: string | null }[],
): string {
  if (!items.length) {
    return '<p class="text-sm text-muted">Ingen tech angivet</p>';
  }

  return `<div class="flex flex-wrap gap-2">${items
    .map(
      (item) => `
      <span class="inline-flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-white px-2.5 py-1 text-xs font-medium text-text/80">
        <img src="${escapeHtml(item.icon ?? "/tech/dotnet.svg")}" alt="" class="h-3.5 w-3.5" loading="lazy" />
        ${escapeHtml(item.name)}
      </span>`,
    )
    .join("")}</div>`;
}

function firstImageUrl(media: { type: string; url: string }[]): string | null {
  const image = media.find((m) => m.type === "image");
  return image?.url ?? null;
}

export function renderStudentProjectCard(
  project: {
    id: string;
    authorName: string;
    title: string;
    tagline: string;
    description: string;
    techStack: { name: string; icon?: string | null }[];
    status?: ProjectStatus;
    media?: { type: string; url: string }[];
  },
  options: { showStatus?: boolean; linkToDetail?: boolean } = {},
): string {
  const { showStatus = false, linkToDetail = true } = options;
  const thumb = project.media ? firstImageUrl(project.media) : null;
  const href = linkToDetail ? `${getSiteOrigin()}/students/projekt?id=${project.id}` : "#";

  const thumbHtml = thumb
    ? `<img src="${escapeHtml(thumb)}" alt="" class="h-full w-full object-cover" loading="lazy" />`
    : `<span class="font-heading text-xl font-bold text-primary">${escapeHtml(project.title.charAt(0).toUpperCase())}</span>`;

  const statusHtml =
    showStatus && project.status
      ? renderStatusBadge(project.status)
      : `<span class="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Elevprojekt</span>`;

  return `
    <article class="student-project-card group flex h-full flex-col rounded-2xl border border-gray-200/60 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style="border-top: 3px solid ${ACCENT}">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div class="flex min-w-0 items-center gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl" style="background: ${ACCENT_BG}">
            ${thumbHtml}
          </div>
          <div class="min-w-0">
            <h3 class="font-heading text-xl font-bold text-text">${escapeHtml(project.title)}</h3>
            <p class="text-sm text-muted">${escapeHtml(project.tagline || "Elevprojekt")}</p>
            <p class="mt-1 text-xs text-muted">af ${escapeHtml(project.authorName)}</p>
          </div>
        </div>
        ${statusHtml}
      </div>
      <p class="mb-6 flex-1 leading-relaxed text-text/80 line-clamp-4">${escapeHtml(project.description)}</p>
      <div class="mb-6">
        <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Tech stack</p>
        ${renderTechStack(project.techStack)}
      </div>
      ${
        linkToDetail
          ? `<a href="${href}" class="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">Se projekt</a>`
          : ""
      }
    </article>`;
}

export function renderMediaGallery(
  media: { type: string; url: string }[],
): string {
  if (!media.length) {
    return '<p class="text-muted">Ingen billeder eller video endnu.</p>';
  }

  const images = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video" || m.type === "video_embed");

  const imageHtml = images.length
    ? `<div class="grid gap-4 sm:grid-cols-2">${images
        .map(
          (img) =>
            `<figure class="overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm"><img src="${escapeHtml(img.url)}" alt="" class="h-56 w-full object-cover" loading="lazy" /></figure>`,
        )
        .join("")}</div>`
    : "";

  const videoHtml = videos.length
    ? `<div class="grid gap-4">${videos
        .map((video) => {
          if (video.type === "video_embed") {
            return `<div class="aspect-video overflow-hidden rounded-2xl border border-gray-200/60 bg-black shadow-sm"><iframe src="${escapeHtml(video.url)}" title="Projektvideo" class="h-full w-full" allowfullscreen loading="lazy"></iframe></div>`;
          }
          return `<video controls class="w-full rounded-2xl border border-gray-200/60 bg-black shadow-sm" src="${escapeHtml(video.url)}"></video>`;
        })
        .join("")}</div>`
    : "";

  return `<div class="space-y-6">${imageHtml}${videoHtml}</div>`;
}

export { ACCENT, ACCENT_BG, STATUS_LABELS };
