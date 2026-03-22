const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getToken = () => localStorage.getItem("token") || "";

const decodeJwtPayload = (token: string) => {
  try {
    const base64Url = token.split(".")[1] ?? "";
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
};

export const setSession = (token: string) => {
  localStorage.setItem("token", token);
  const payload = decodeJwtPayload(token);
  if (payload) {
    if (payload.role) localStorage.setItem("role", payload.role);
    if (payload.id) localStorage.setItem("user_id", String(payload.id));
    return payload;
  }
  return null;
};

export const setEmail = (email: string) => {
  localStorage.setItem("email", email);
};

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();

  if (text && text.trim().startsWith("<")) {
    // Backend returned HTML (likely route mismatch or server error page), don't crash with JSON parse.
    if (!res.ok) {
      throw new Error(`Server error ${res.status}: ${res.statusText}`);
    }
    return ({} as T);
  }

  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = null;
    }
  }

  if (!res.ok) {
    const message = data?.message || (text && !text.trim().startsWith("<") ? text : res.statusText || "Request failed");
    throw new Error(typeof message === "string" ? message : "Request failed");
  }

  if (data !== null) {
    return data as T;
  }

  if (text && !text.trim().startsWith("<")) {
    // JSON parse is impossible here if it reaches this; but fall back to text cast.
    return (text as unknown) as T;
  }

  return ({} as T);
}


export interface JobItem {
  job_id: number;
  company_id: number;
  company_name: string;
  title: string;
  min_cgpa: number;
  max_backlogs: number;
  salary: string;
  deadline: string;
}

export interface ApplicationItem {
  application_id: number;
  student_id: number;
  job_id: number;
  status: string;
  applied_date: string;
  name: string;
  title: string;
}

export const registerUser = (payload: { email: string; password: string; role: "student" | "admin" }) =>
  apiRequest<{ message: string }>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });

export const loginUser = (payload: { email: string; password: string }) =>
  apiRequest<{ token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });

export const fetchJobs = (limit = 100) => apiRequest<JobItem[]>(`/api/jobs?limit=${limit}`);

export const fetchApplications = (user_id?: number) => {
  const url = user_id ? `/api/applications?user_id=${user_id}` : "/api/applications";
  return apiRequest<ApplicationItem[]>(url);
};

export const applyToJob = (payload: {
  student_id?: number;
  user_id?: number;
  studentId?: number;
  userId?: number;
  job_id?: number;
  jobId?: number;
  status?: string;
  applied_date?: string;
  appliedDate?: string;
}) => {
  const body = {
    student_id: payload.student_id ?? payload.studentId,
    user_id: payload.user_id ?? payload.userId,
    job_id: payload.job_id ?? payload.jobId,
    status: payload.status,
    applied_date: payload.applied_date ?? payload.appliedDate,
  };
  return apiRequest<{ message: string }>("/api/applications/apply", { method: "POST", body: JSON.stringify(body) });
};

export const fetchCompanies = () => apiRequest<any[]>("/api/companies");

export const createJob = (payload: {
  company_id: number;
  title: string;
  min_cgpa: number;
  max_backlogs: number;
  salary: string;
  deadline: string;
}) => apiRequest<{ message: string }>("/api/jobs", { method: "POST", body: JSON.stringify(payload) });
export interface StudentProfile {
  student_id: number;
  user_id: number;
  name: string;
  roll_no: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  phone: string;
  year: string;
  about?: string;
  resume_filename?: string;
  resume_data?: string;
}

export const fetchStudentProfile = () => apiRequest<StudentProfile>("/api/students/profile");

export const updateStudentProfile = (payload: Partial<StudentProfile>) =>
  apiRequest<{ message: string }>("/api/students/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const createStudentProfile = (payload: Omit<StudentProfile, "student_id">) =>
  apiRequest<{ message: string }>("/api/students", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchAllStudents = () => apiRequest<any[]>("/api/students");
