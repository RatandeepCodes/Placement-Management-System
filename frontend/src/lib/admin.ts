import { getToken } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const ADMIN_APPLICATION_STATUSES = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Selected",
  "Placed",
  "Rejected",
] as const;

export type AdminApplicationStatus = (typeof ADMIN_APPLICATION_STATUSES)[number];

async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  if (text && text.trim().startsWith("<")) {
    if (!response.ok) {
      throw new Error(`Server error ${response.status}: ${response.statusText}`);
    }

    return {} as T;
  }

  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: string }).message)
        : response.statusText || "Request failed";
    throw new Error(message);
  }

  return data as T;
}

export interface AdminDashboardData {
  summary: {
    totalStudents: number;
    totalCompanies: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    shortlistedApplications: number;
    placedApplications: number;
    placedStudents: number;
    placementRate: number;
  };
  recentApplications: Array<{
    applicationId: number;
    status: AdminApplicationStatus;
    appliedDate: string;
    studentId: number;
    studentName: string;
    branch: string;
    jobId: number;
    jobTitle: string;
    companyId: number;
    companyName: string;
  }>;
  topCompanies: Array<{
    companyId: number;
    companyName: string;
    applicationCount: number;
    placedCount: number;
  }>;
}

export interface AdminStudentItem {
  studentId: number;
  userId: number;
  name: string;
  email: string;
  rollNo: string;
  branch: string;
  year: string;
  cgpa: number;
  backlogs: number;
  phone: string;
  about: string;
  resumeFilename?: string;
  hasResume: boolean;
  applicationCount: number;
  shortlistedCount: number;
  placedCount: number;
  lastAppliedDate?: string;
  placementStatus: "Placed" | "In Process" | "Not Applied";
}

export interface AdminCompanyItem {
  companyId: number;
  name: string;
  industry: string;
  location: string;
  hrEmail: string;
  jobCount: number;
  activeJobCount: number;
  applicationCount: number;
  placedCount: number;
}

export interface AdminJobItem {
  jobId: number;
  companyId: number;
  companyName: string;
  title: string;
  minCgpa: number;
  maxBacklogs: number;
  salary: string;
  deadline: string;
  applicationCount: number;
  shortlistedCount: number;
  placedCount: number;
}

export interface AdminApplicationItem {
  applicationId: number;
  status: AdminApplicationStatus;
  appliedDate: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  rollNo: string;
  branch: string;
  year: string;
  cgpa: number;
  backlogs: number;
  phone: string;
  hasResume: boolean;
  resumeFilename?: string;
  jobId: number;
  jobTitle: string;
  minCgpa: number;
  maxBacklogs: number;
  salary: string;
  deadline: string;
  companyId: number;
  companyName: string;
  eligibilityStatus: "Eligible" | "Ineligible";
}

export interface AdminPlacementsData {
  summary: {
    totalStudents: number;
    placementRecords: number;
    placedStudents: number;
    selectedCount: number;
    placedCount: number;
    placementRate: number;
  };
  placements: Array<{
    applicationId: number;
    status: "Selected" | "Placed";
    appliedDate: string;
    studentId: number;
    studentName: string;
    rollNo: string;
    branch: string;
    year: string;
    jobId: number;
    jobTitle: string;
    companyId: number;
    companyName: string;
    salary: string;
  }>;
  companyBreakdown: Array<{
    companyId: number;
    companyName: string;
    placedCount: number;
  }>;
  branchBreakdown: Array<{
    branch: string;
    placedStudents: number;
  }>;
}

export const fetchAdminDashboard = () => adminRequest<AdminDashboardData>("/api/admin/dashboard");
export const fetchAdminStudents = () => adminRequest<AdminStudentItem[]>("/api/admin/students");
export const fetchAdminCompanies = () => adminRequest<AdminCompanyItem[]>("/api/admin/companies");
export const createAdminCompany = (payload: {
  name: string;
  industry: string;
  location: string;
  hrEmail: string;
}) =>
  adminRequest<{ message: string; companyId: number }>("/api/admin/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const fetchAdminJobs = () => adminRequest<AdminJobItem[]>("/api/admin/jobs");
export const createAdminJob = (payload: {
  companyId: number;
  title: string;
  minCgpa: number;
  maxBacklogs: number;
  salary: string;
  deadline: string;
}) =>
  adminRequest<{ message: string; jobId: number }>("/api/admin/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const fetchAdminApplications = () =>
  adminRequest<AdminApplicationItem[]>("/api/admin/applications");
export const updateAdminApplicationStatus = (applicationId: number, status: AdminApplicationStatus) =>
  adminRequest<{ message: string }>(`/api/admin/applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
export const fetchAdminPlacements = () =>
  adminRequest<AdminPlacementsData>("/api/admin/placements");
