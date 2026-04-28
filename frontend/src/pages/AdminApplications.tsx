import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ADMIN_APPLICATION_STATUSES,
  AdminApplicationStatus,
  fetchAdminApplications,
  updateAdminApplicationStatus,
} from "@/lib/admin";
import { ClipboardList, CheckCircle, Clock3, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAppliedDateTime } from "@/lib/utils";

const AdminApplications = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: fetchAdminApplications,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: number;
      status: AdminApplicationStatus;
    }) => updateAdminApplicationStatus(applicationId, status),
    onSuccess: () => {
      toast.success("Application status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "placements"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update application status");
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const companies = useMemo(
    () =>
      Array.from(new Set(applications.map((application) => application.companyName))).sort((left, right) =>
        left.localeCompare(right),
      ),
    [applications],
  );

  const filteredApplications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          application.studentName,
          application.studentEmail,
          application.companyName,
          application.jobTitle,
          application.rollNo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const matchesCompany = companyFilter === "all" || application.companyName === companyFilter;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [applications, companyFilter, search, statusFilter]);

  const summary = useMemo(() => {
    const shortlisted = applications.filter((application) =>
      ["Shortlisted", "Interview"].includes(application.status),
    ).length;

    return {
      total: applications.length,
      applied: applications.filter((application) => application.status === "Applied").length,
      shortlisted,
      placed: applications.filter((application) =>
        ["Selected", "Placed"].includes(application.status),
      ).length,
      rejected: applications.filter((application) => application.status === "Rejected").length,
    };
  }, [applications]);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-1">
            Review the full application pipeline and update outcomes from one place.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-card p-6">Loading applications...</div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-destructive">
            Unable to load admin applications.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <DashboardCard title="Total Applications" value={summary.total} icon={ClipboardList} variant="primary" />
              <DashboardCard title="Applied" value={summary.applied} icon={Clock3} variant="default" />
              <DashboardCard title="Shortlisted" value={summary.shortlisted} icon={CheckCircle} variant="accent" />
              <DashboardCard title="Placed" value={summary.placed} icon={CheckCircle} variant="secondary" />
              <DashboardCard title="Rejected" value={summary.rejected} icon={XCircle} variant="default" />
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by student, company, job, or roll number"
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">All statuses</option>
                  {ADMIN_APPLICATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={companyFilter}
                  onChange={(event) => setCompanyFilter(event.target.value)}
                >
                  <option value="all">All companies</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Eligibility</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Current Status</TableHead>
                    <TableHead>Update Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No applications match the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((application) => (
                      <TableRow key={application.applicationId}>
                        <TableCell className="align-top">
                          <div className="font-medium text-card-foreground">{application.studentName}</div>
                          <div className="text-xs text-muted-foreground">{application.studentEmail}</div>
                          <div className="text-xs text-muted-foreground">
                            {application.rollNo} • {application.branch} • Year {application.year}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="font-medium text-card-foreground">{application.jobTitle}</div>
                          <div className="text-xs text-muted-foreground">
                            CGPA {application.minCgpa} • Backlogs {application.maxBacklogs}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="font-medium text-card-foreground">{application.companyName}</div>
                          <div className="text-xs text-muted-foreground">{application.salary || "Salary not set"}</div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              application.eligibilityStatus === "Eligible"
                                ? "bg-secondary/10 text-secondary"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {application.eligibilityStatus}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Student CGPA {application.cgpa} • Backlogs {application.backlogs}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Resume: {application.hasResume ? application.resumeFilename : "Missing"}
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-sm text-muted-foreground">
                          {formatAppliedDateTime(application.appliedDate)}
                        </TableCell>
                        <TableCell className="align-top">
                          <StatusBadge status={application.status} />
                        </TableCell>
                        <TableCell className="align-top">
                          <select
                            className="flex h-10 w-full min-w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={application.status}
                            disabled={updateMutation.isPending && updatingId === application.applicationId}
                            onChange={(event) => {
                              const nextStatus = event.target.value as AdminApplicationStatus;
                              if (nextStatus === application.status) {
                                return;
                              }

                              setUpdatingId(application.applicationId);
                              updateMutation.mutate({
                                applicationId: application.applicationId,
                                status: nextStatus,
                              });
                            }}
                          >
                            {ADMIN_APPLICATION_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
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

export default AdminApplications;
