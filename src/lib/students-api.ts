import { mercantecFetch } from "./auth/fetch";

function getApiBase(): string {
  const configured = import.meta.env.PUBLIC_STUDENTS_API_URL as string | undefined;

  if (configured && configured.trim() !== "" && configured !== "/") {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

function apiUrl(path: string): string {
  const base = getApiBase();
  return base ? `${base}${path}` : path;
}

export type ProjectStatus = "draft" | "pending" | "approved" | "rejected";
export type MediaType = "image" | "video" | "video_embed";

export interface TechStackItem {
  name: string;
  icon?: string | null;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  sortOrder: number;
}

export interface StudentProject {
  id: string;
  authorName: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  techStack: TechStackItem[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  status: ProjectStatus;
  rejectionReason?: string | null;
  media: MediaItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentProjectList {
  items: StudentProject[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateProjectInput {
  title: string;
  tagline: string;
  description: string;
  features: string[];
  techStack: TechStackItem[];
  githubUrl?: string;
  liveUrl?: string;
}

export type UpdateProjectInput = CreateProjectInput;

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `API-fejl (${response.status})`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getStudentsApiBaseUrl(): string {
  return getApiBase();
}

export async function fetchApprovedProjects(
  page = 1,
  pageSize = 12,
): Promise<StudentProjectList> {
  const response = await fetch(
    apiUrl(`/api/student-projects?page=${page}&pageSize=${pageSize}`),
  );
  return parseJson<StudentProjectList>(response);
}

export async function fetchApprovedProject(id: string): Promise<StudentProject> {
  const response = await fetch(apiUrl(`/api/student-projects/${id}`));
  return parseJson<StudentProject>(response);
}

export async function fetchMyProjects(): Promise<StudentProject[]> {
  const response = await mercantecFetch(apiUrl("/api/student-projects/mine"));
  return parseJson<StudentProject[]>(response);
}

export async function createProject(
  input: CreateProjectInput,
): Promise<StudentProject> {
  const response = await mercantecFetch(apiUrl("/api/student-projects"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<StudentProject>(response);
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<StudentProject> {
  const response = await mercantecFetch(apiUrl(`/api/student-projects/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<StudentProject>(response);
}

export async function submitProject(id: string): Promise<StudentProject> {
  const response = await mercantecFetch(
    apiUrl(`/api/student-projects/${id}/submit`),
    { method: "POST" },
  );
  return parseJson<StudentProject>(response);
}

export async function uploadProjectMedia(
  projectId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<MediaItem> {
  const formData = new FormData();
  formData.append("file", file);

  // mercantecFetch doesn't support upload progress — use XHR wrapper when needed
  if (onProgress && typeof XMLHttpRequest !== "undefined") {
    return uploadWithProgress(projectId, formData, onProgress);
  }

  const response = await mercantecFetch(
    apiUrl(`/api/student-projects/${projectId}/media`),
    { method: "POST", body: formData },
  );
  return parseJson<MediaItem>(response);
}

async function uploadWithProgress(
  projectId: string,
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<MediaItem> {
  const { getAccessToken, refreshAccessToken } = await import("./auth/storage");

  const doUpload = (token: string | null) =>
    new Promise<MediaItem>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl(`/api/student-projects/${projectId}/media`));
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as MediaItem);
          return;
        }
        if (xhr.status === 401) {
          reject(new Error("__UNAUTHORIZED__"));
          return;
        }
        try {
          const body = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(body.error ?? `Upload fejlede (${xhr.status})`));
        } catch {
          reject(new Error(`Upload fejlede (${xhr.status})`));
        }
      };

      xhr.onerror = () => reject(new Error("Netværksfejl under upload."));
      xhr.send(formData);
    });

  try {
    return await doUpload(getAccessToken());
  } catch (err) {
    if (err instanceof Error && err.message === "__UNAUTHORIZED__") {
      const newToken = await refreshAccessToken();
      return doUpload(newToken);
    }
    throw err;
  }
}

export async function addVideoEmbed(
  projectId: string,
  url: string,
): Promise<MediaItem> {
  const response = await mercantecFetch(
    apiUrl(`/api/student-projects/${projectId}/media/embed`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    },
  );
  return parseJson<MediaItem>(response);
}

export async function deleteProjectMedia(
  projectId: string,
  mediaId: string,
): Promise<void> {
  const response = await mercantecFetch(
    apiUrl(`/api/student-projects/${projectId}/media/${mediaId}`),
    { method: "DELETE" },
  );
  if (!response.ok) {
    await parseJson(response);
  }
}

export async function fetchPendingProjects(): Promise<StudentProject[]> {
  const response = await mercantecFetch(
    apiUrl("/api/admin/student-projects?status=pending"),
  );
  return parseJson<StudentProject[]>(response);
}

export async function approveProject(id: string): Promise<StudentProject> {
  const response = await mercantecFetch(
    apiUrl(`/api/admin/student-projects/${id}/approve`),
    { method: "POST" },
  );
  return parseJson<StudentProject>(response);
}

export async function rejectProject(
  id: string,
  reason: string,
): Promise<StudentProject> {
  const response = await mercantecFetch(
    apiUrl(`/api/admin/student-projects/${id}/reject`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  );
  return parseJson<StudentProject>(response);
}
