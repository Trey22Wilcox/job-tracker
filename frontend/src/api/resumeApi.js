const API_BASE = import.meta.env.VITE_API_URL;

export async function analyzeResume(jobDescription) {
  const response = await fetch(`${API_BASE}/api/resume/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobDescription }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Failed to analyze resume");
  }

  return response.json();
}
