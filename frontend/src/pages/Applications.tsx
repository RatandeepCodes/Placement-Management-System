import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchApplications } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

const Applications = () => {
  const userId = Number(localStorage.getItem("user_id") || "0");

  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey: ["applications", userId],
    queryFn: () => fetchApplications(userId),
    enabled: !!userId,
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground mt-1">Track the status of your job applications.</p>
        </div>

        {isLoading ? (
          <div>Loading applications...</div>
        ) : isError ? (
          <div>Error fetching applications.</div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.application_id}>
                      <TableCell className="font-medium">{app.title}</TableCell>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>{formatDateTime(app.applied_date)}</TableCell>
                      <TableCell>
                        <StatusBadge status={app.status || "Applied"} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Applications;
