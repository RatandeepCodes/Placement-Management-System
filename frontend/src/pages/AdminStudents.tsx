import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { Input } from "@/components/ui/input";
import { Users, CheckCircle, FileText, GraduationCap } from "lucide-react";
import { fetchAdminStudents } from "@/lib/admin";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminStudents = () => {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: students = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: fetchAdminStudents,
  });

  const branches = useMemo(
    () => Array.from(new Set(students.map((student) => student.branch).filter(Boolean))).sort(),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [student.name, student.email, student.rollNo, student.branch, student.phone]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesBranch = branchFilter === "all" || student.branch === branchFilter;
      const matchesStatus = statusFilter === "all" || student.placementStatus === statusFilter;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [branchFilter, search, statusFilter, students]);

  const summary = useMemo(
    () => ({
      total: students.length,
      placed: students.filter((student) => student.placementStatus === "Placed").length,
      inProcess: students.filter((student) => student.placementStatus === "In Process").length,
      resumes: students.filter((student) => student.hasResume).length,
    }),
    [students],
  );

  const statusClass = (status: string) => {
    if (status === "Placed") return "bg-secondary/10 text-secondary";
    if (status === "In Process") return "bg-accent/10 text-accent";
    return "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">
            Review student profiles, academic readiness, and placement activity.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-card p-6">Loading students...</div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-destructive">
            Unable to load student records.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardCard title="Total Students" value={summary.total} icon={Users} variant="primary" />
              <DashboardCard title="Placed" value={summary.placed} icon={CheckCircle} variant="secondary" />
              <DashboardCard title="In Process" value={summary.inProcess} icon={GraduationCap} variant="accent" />
              <DashboardCard title="Resumes Uploaded" value={summary.resumes} icon={FileText} variant="default" />
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, email, roll number, branch, or phone"
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={branchFilter}
                  onChange={(event) => setBranchFilter(event.target.value)}
                >
                  <option value="all">All branches</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">All placement states</option>
                  <option value="Not Applied">Not Applied</option>
                  <option value="In Process">In Process</option>
                  <option value="Placed">Placed</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Academic</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No students match the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell className="align-top">
                          <div className="font-medium text-card-foreground">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{student.email}</div>
                          <div className="text-xs text-muted-foreground">
                            {student.rollNo} • Year {student.year || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="text-sm text-card-foreground">{student.branch || "Branch not set"}</div>
                          <div className="text-xs text-muted-foreground">
                            CGPA {student.cgpa.toFixed(2)} • Backlogs {student.backlogs}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="text-sm text-card-foreground">{student.applicationCount} total</div>
                          <div className="text-xs text-muted-foreground">
                            {student.shortlistedCount} shortlisted • {student.placedCount} placed
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last activity: {student.lastAppliedDate ? formatDate(student.lastAppliedDate) : "None"}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(
                              student.placementStatus,
                            )}`}
                          >
                            {student.placementStatus}
                          </span>
                        </TableCell>
                        <TableCell className="align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              student.hasResume
                                ? "bg-secondary/10 text-secondary"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {student.hasResume ? "Available" : "Missing"}
                          </span>
                        </TableCell>
                        <TableCell className="align-top text-sm text-muted-foreground">
                          {student.phone || "Phone not set"}
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

export default AdminStudents;
