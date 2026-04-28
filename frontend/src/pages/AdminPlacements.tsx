import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import StatusBadge from "@/components/StatusBadge";
import { Building2, CheckCircle, Trophy, Users } from "lucide-react";
import { fetchAdminPlacements } from "@/lib/admin";
import { formatAppliedDateTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminPlacements = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "placements"],
    queryFn: fetchAdminPlacements,
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Placements</h1>
          <p className="text-muted-foreground mt-1">
            Track final outcomes, placement rate, and recruiter contribution across the cycle.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-card p-6">Loading placement reports...</div>
        ) : isError || !data ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-destructive">
            Unable to load placement reports.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardCard
                title="Placed Students"
                value={data.summary.placedStudents}
                icon={Users}
                variant="secondary"
                trend={`${data.summary.placementRate}% placement rate`}
              />
              <DashboardCard
                title="Placement Records"
                value={data.summary.placementRecords}
                icon={Trophy}
                variant="primary"
              />
              <DashboardCard title="Selected" value={data.summary.selectedCount} icon={CheckCircle} variant="accent" />
              <DashboardCard title="Placed" value={data.summary.placedCount} icon={Building2} variant="default" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">Company Breakdown</h2>
                <div className="space-y-3">
                  {data.companyBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No placement data available yet.</p>
                  ) : (
                    data.companyBreakdown.map((company) => (
                      <div
                        key={company.companyId}
                        className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{company.companyName}</p>
                          <p className="text-xs text-muted-foreground">Placements from this company</p>
                        </div>
                        <span className="text-sm font-semibold text-card-foreground">{company.placedCount}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">Branch Breakdown</h2>
                <div className="space-y-3">
                  {data.branchBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No branch-wise placements available yet.</p>
                  ) : (
                    data.branchBreakdown.map((branch) => (
                      <div
                        key={branch.branch}
                        className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{branch.branch}</p>
                          <p className="text-xs text-muted-foreground">Distinct students placed</p>
                        </div>
                        <span className="text-sm font-semibold text-card-foreground">{branch.placedStudents}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold text-card-foreground">Recent Placements</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Recorded</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.placements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No placements have been recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.placements.map((placement) => (
                      <TableRow key={placement.applicationId}>
                        <TableCell className="align-top">
                          <div className="font-medium text-card-foreground">{placement.studentName}</div>
                          <div className="text-xs text-muted-foreground">
                            {placement.rollNo} • {placement.branch} • Year {placement.year}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">{placement.companyName}</TableCell>
                        <TableCell className="align-top">{placement.jobTitle}</TableCell>
                        <TableCell className="align-top">{placement.salary || "Not set"}</TableCell>
                        <TableCell className="align-top text-sm text-muted-foreground">
                          {formatAppliedDateTime(placement.appliedDate)}
                        </TableCell>
                        <TableCell className="align-top">
                          <StatusBadge status={placement.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPlacements;
