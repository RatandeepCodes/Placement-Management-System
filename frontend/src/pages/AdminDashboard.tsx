import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import StatusBadge from "@/components/StatusBadge";
import { Users, Building2, Briefcase, CheckCircle, ClipboardList, Trophy } from "lucide-react";
import { fetchAdminDashboard } from "@/lib/admin";
import { formatAppliedDateTime } from "@/lib/utils";

const AdminDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchAdminDashboard,
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track placement health, pipeline activity, and hiring momentum from a single admin view.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-card p-6">Loading dashboard metrics...</div>
        ) : isError || !data ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-destructive">
            Unable to load admin dashboard metrics.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <DashboardCard title="Total Students" value={data.summary.totalStudents} icon={Users} variant="primary" />
              <DashboardCard title="Active Jobs" value={data.summary.activeJobs} icon={Briefcase} variant="accent" />
              <DashboardCard
                title="Applications"
                value={data.summary.totalApplications}
                icon={ClipboardList}
                variant="default"
              />
              <DashboardCard
                title="Placed Students"
                value={data.summary.placedStudents}
                icon={Trophy}
                variant="secondary"
                trend={`${data.summary.placementRate}% placement rate`}
              />
              <DashboardCard title="Companies" value={data.summary.totalCompanies} icon={Building2} variant="default" />
              <DashboardCard
                title="Shortlisted"
                value={data.summary.shortlistedApplications}
                icon={CheckCircle}
                variant="secondary"
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              {data.summary.totalJobs} jobs are configured in total, with {data.summary.activeJobs} still open and{" "}
              {data.summary.placedApplications} applications already marked as selected or placed.
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">Recent Applications</h2>
                <div className="space-y-3">
                  {data.recentApplications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No applications have been submitted yet.</p>
                  ) : (
                    data.recentApplications.map((application) => (
                      <div key={application.applicationId} className="rounded-lg border border-border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-card-foreground">{application.studentName}</p>
                            <p className="text-xs text-muted-foreground">
                              {application.jobTitle} • {application.companyName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {application.branch || "Branch not set"} • {formatAppliedDateTime(application.appliedDate)}
                            </p>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">Top Hiring Companies</h2>
                <div className="space-y-3">
                  {data.topCompanies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Application data is not available yet.</p>
                  ) : (
                    data.topCompanies.map((company) => (
                      <div
                        key={company.companyId}
                        className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{company.companyName}</p>
                          <p className="text-xs text-muted-foreground">
                            {company.applicationCount} applications • {company.placedCount} selected/placed
                          </p>
                        </div>
                        <span className="text-xs text-secondary">Hot</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Placement Snapshot</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Companies Hiring</p>
                  <p className="mt-2 text-2xl font-bold text-card-foreground">{data.summary.totalCompanies}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Students Placed</p>
                  <p className="mt-2 text-2xl font-bold text-card-foreground">{data.summary.placedStudents}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Placement Rate</p>
                  <p className="mt-2 text-2xl font-bold text-card-foreground">{data.summary.placementRate}%</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
