import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { Briefcase, FileText, PhoneCall, CheckCircle } from "lucide-react";
import { fetchJobs, fetchApplications } from "@/lib/api";

const StudentDashboard = () => {
  const userId = Number(localStorage.getItem("user_id") || "0");

  const { data: jobs = [], isLoading: jobsLoading, isError: jobsError } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });
  const { data: applications = [], isLoading: appsLoading, isError: appsError } = useQuery({
    queryKey: ["applications", userId],
    queryFn: () => fetchApplications(userId),
    enabled: !!userId,
  });

  const stats = useMemo(() => ({
    applied: Array.isArray(applications) ? applications.length : 0,
    interviews: Array.isArray(applications) ? applications.filter((a) => ["Shortlisted", "Interview"].includes(a.status)).length : 0,
    placed: Array.isArray(applications) ? applications.filter((a) => ["Selected", "Placed"].includes(a.status)).length : 0,
  }), [applications]);

  if (jobsError || appsError) {
    return (
      <DashboardLayout role="student">
        <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Error loading student data</h2>
          <p className="text-muted-foreground mt-2">Unable to load your dashboard information.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (jobsLoading || appsLoading) {
    return (
      <DashboardLayout role="student">
        <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg border border-border">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your placement overview.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard title="Available Jobs" value={jobs.length} icon={Briefcase} variant="primary" trend="Updated live" />
          <DashboardCard title="Applications Sent" value={stats.applied} icon={FileText} variant="secondary" />
          <DashboardCard title="Interview Calls" value={stats.interviews} icon={PhoneCall} variant="accent" />
          <DashboardCard title="Placement Status" value={stats.placed > 0 ? "On Track" : "Pending"} icon={CheckCircle} variant="default" />
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {applications.slice(-3).reverse().map((app, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-card-foreground">{`Applied to ${app.title} on ${new Date(app.applied_date).toLocaleDateString()}`}</span>
                <span className="text-xs text-muted-foreground">{app.status}</span>
              </div>
            ))}
            {applications.length === 0 && (
              <div className="text-sm text-muted-foreground">No activity yet. Apply to jobs to get started.</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
