import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { Users, Building2, Briefcase, CheckCircle } from "lucide-react";
import { fetchCompanies, fetchJobs } from "@/lib/api";
import { fetchAllStudents, fetchApplications } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

const AdminDashboard = () => {
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: fetchAllStudents,
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  });

  const stats = useMemo(() => {
    const placedCount = applications.filter((app: any) => ["Selected", "Placed"].includes(app.status)).length;
    const appliedCount = applications.filter((app: any) => app.status === "Applied").length;

    const companyMap = companies.reduce<Record<number, any>>((map, c: any) => {
      map[c.company_id] = c;
      return map;
    }, {});

    const popularCompanies = Object.entries(
      applications.reduce<Record<number, number>>((map, app: any) => {
        const job = jobs.find((j: any) => j.job_id === app.job_id);
        if (job) {
          map[job.company_id] = (map[job.company_id] || 0) + 1;
        }
        return map;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([companyId, count]) => ({
        company: companyMap[Number(companyId)]?.name || "Unknown",
        applications: count,
      }));

    const now = new Date();
    const activeJobs = jobs.filter((job: any) => {
      const deadline = job.deadline ? new Date(job.deadline) : null;
      return deadline && deadline > now;
    });

    return {
      students: students.length,
      companies: companies.length,
      jobs: activeJobs.length,
      totalJobs: jobs.length,
      placed: placedCount,
      applied: appliedCount,
      recentCompanies: companies.slice(-8).reverse(),
      popularCompanies,
      selectedApps: applications.filter((app: any) => app.status === "Selected" || app.status === "Placed").slice(0, 5),
    };
  }, [students, companies, jobs, applications]);

  const isLoading = companiesLoading || jobsLoading || studentsLoading || applicationsLoading;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage placements, students, companies, and application pipeline in real-time.</p>
        </div>

        {isLoading ? (
          <div>Loading dashboard metrics...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard title="Total Students" value={stats.students} icon={Users} variant="primary" />
              <DashboardCard title="Total Companies" value={stats.companies} icon={Building2} variant="secondary" />
              <DashboardCard title="Open Jobs" value={stats.jobs} icon={Briefcase} variant="accent" />
              <DashboardCard title="Filled/Placed Students" value={stats.placed} icon={CheckCircle} variant="default" trend={`${Math.round((stats.placed / Math.max(1, stats.students)) * 100)}% placed`} />
            </div>
            <div className="text-xs text-muted-foreground">Showing active jobs only (deadline in future) out of {stats.totalJobs} jobs (API capped to 100 for app stability).</div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">Recent Companies</h2>
                <div className="space-y-3">
                  {stats.recentCompanies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No companies registered yet.</p>
                  ) : (
                    stats.recentCompanies.map((company: any) => (
                      <div key={company.company_id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-card-foreground font-medium">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.industry} • {company.location}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">Top Hiring Companies</h2>
                <div className="space-y-3">
                  {stats.popularCompanies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Application data is not available yet.</p>
                  ) : (
                    stats.popularCompanies.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{item.company}</p>
                          <p className="text-xs text-muted-foreground">{item.applications} applications</p>
                        </div>
                        <span className="text-xs text-secondary">Hot</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Latest Selected Applications</h2>
              <div className="space-y-3">
                {stats.selectedApps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No selected placements yet.</p>
                ) : (
                  stats.selectedApps.map((app: any) => (
                    <div key={app.application_id} className="p-3 rounded-md border border-border">
                      <p className="text-sm font-medium text-card-foreground">{app.name} - {app.title}</p>
                      <p className="text-xs text-muted-foreground">Status: {app.status}</p>
                      <p className="text-xs text-muted-foreground">Applied: {formatDateTime(app.applied_date)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
