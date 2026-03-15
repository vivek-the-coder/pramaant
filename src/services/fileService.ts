const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:5001/pramaant-govtrack/asia-south1";

/**
 * Get the logged-in user ID from localStorage.
 * All API calls send this as X-User-Id header so the
 * backend knows which user is making the request.
 */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  try {
    const stored = localStorage.getItem("pramaant_user");
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.id) {
        headers["X-User-Id"] = user.id;
        headers["X-User-Role"] = user.role || "";
      }
    }
  } catch {
    // ignore
  }
  return headers;
}

export async function createFile(data: {
  title: string;
  department: string;
  category: string;
  citizenName: string;
  assignedTo: string;
  priority: string;
  slaDays: number;
}) {
  const res = await fetch(`${API_BASE}/createFile`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export async function getOfficerFiles() {
  const res = await fetch(`${API_BASE}/getOfficerFiles`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json() as Promise<{
    files: {
      fileId: string;
      citizenName: string;
      department: string;
      status: string;
      createdAt: string | null;
      isDelayed: boolean;
    }[];
  }>;
}

export async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboardStats`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export async function searchFiles(query: string) {
  const res = await fetch(
    `${API_BASE}/searchFiles?q=${encodeURIComponent(query)}`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json() as Promise<{
    results: {
      id: string;
      citizenName: string;
      category: string;
      department: string;
      status: string;
      createdAt: string | null;
      movements: {
        id: string;
        action: string;
        fromUser: string;
        toUser: string;
        timestamp: string;
        notes?: string;
      }[];
    }[];
  }>;
}

export async function getFileTimeline(fileId: string) {
  const res = await fetch(
    `${API_BASE}/getFileTimeline?fileId=${encodeURIComponent(fileId)}`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export async function getOfficerDashboard() {
  const res = await fetch(`${API_BASE}/getOfficerDashboard`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export async function forwardFile(data: {
  fileId: string;
  toOfficerId: string;
  toOfficerName: string;
  department: string;
  remarks: string;
}) {
  const res = await fetch(`${API_BASE}/forwardFile`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export async function getOfficerRoster() {
  const res = await fetch(`${API_BASE}/getOfficerRoster`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}
