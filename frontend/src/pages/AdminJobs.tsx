import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Briefcase, CheckCircle, ClipboardList, Clock3 } from "lucide-react";
import { createAdminJob, fetchAdminCompanies, fetchAdminJobs } from "@/lib/admin";
import { formatDateTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminJobs = () => {
  const queryClient = useQueryClient();

  const [companyId, setCompanyId] = useState("");
  const [title, setTitle] = useState("");
  const [minCgpa, setMinCgpa] = useState(0);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: companies = [] } = useQuery({
    queryKey: ["admin", "companies"],
    queryFn: fetchAdminCompanies,
  });

  const { data: jobs = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: fetchAdminJobs,
  });

  const mutation = useMutation({
    mutationFn: createAdminJob,
    onSuccess: () => {
      toast.success("Job posted successfully");
      setTitle("");
      setCompanyId("");
      setMinCgpa(0);
      setMaxBacklogs(0);
      setSalary("");
      setDeadline("");
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to post job");
    },
  });

  const summary = useMemo(
    () =>
      jobs.reduce(
        (accumulator, job) => {
          accumulator.totalJobs += 1;
          accumulator.totalApplications += job.applicationCount;
          accumulator.totalPlacements += job.placedCount;

          if (job.deadline && new Date(job.deadline).getTime() > Date.now()) {
            accumulator.openJobs += 1;
          }

          return accumulator;
        },
        {
          totalJobs: 0,
          openJobs: 0,
          totalApplications: 0,
          totalPlacements: 0,
        },
      ),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const isOpen = job.deadline ? new Date(job.deadline).getTime() > Date.now() : false;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [job.title, job.companyName, job.salary].join(" ").toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && isOpen) ||
        (statusFilter === "closed" && !isOpen);

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!companyId || !title || !deadline) {
      toast.error("Please fill all required fields.");
      return;
    }

    mutation.mutate({
      companyId: Number(companyId),
      title,
      minCgpa: Number(minCgpa),
      maxBacklogs: Number(maxBacklogs),
      salary,
      deadline: deadline.length === 16 ? `${deadline.replace("T", " ")}:00` : deadline.replace("T", " "),
    });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Job Management</h1>
          <p className="text-muted-foreground">
            Create hiring opportunities, review eligibility criteria, and monitor application volume per job.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard title="Total Jobs" value={summary.totalJobs} icon={Briefcase} variant="primary" />
          <DashboardCard title="Open Jobs" value={summary.openJobs} icon={Clock3} variant="accent" />
          <DashboardCard title="Applications" value={summary.totalApplications} icon={ClipboardList} variant="default" />
          <DashboardCard title="Placements" value={summary.totalPlacements} icon={CheckCircle} variant="secondary" />
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Add Job</h2>
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submit}>
            <div>
              <Label htmlFor="company">Company</Label>
              <select
                id="company"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
              >
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.companyId} value={company.companyId}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
            <div>
              <Label htmlFor="minCgpa">Min CGPA</Label>
              <Input
                id="minCgpa"
                type="number"
                step="0.01"
                value={minCgpa}
                onChange={(event) => setMinCgpa(Number(event.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="maxBacklogs">Max Backlogs</Label>
              <Input
                id="maxBacklogs"
                type="number"
                value={maxBacklogs}
                onChange={(event) => setMaxBacklogs(Number(event.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                value={salary}
                onChange={(event) => setSalary(event.target.value)}
                placeholder="₹20 LPA"
                required
              />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline (date + time)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Post Job"}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Existing Jobs</h2>
            <div className="grid w-full gap-3 md:max-w-2xl md:grid-cols-2">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by company, title, or salary"
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All jobs</option>
                <option value="open">Open jobs</option>
                <option value="closed">Closed jobs</option>
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            {isLoading ? (
              <div className="p-6 text-muted-foreground">Loading jobs...</div>
            ) : isError ? (
              <div className="p-6 text-destructive">Unable to load jobs.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Placements</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No jobs match the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job) => {
                      const isOpen = job.deadline ? new Date(job.deadline).getTime() > Date.now() : false;

                      return (
                        <TableRow key={job.jobId}>
                          <TableCell className="align-top">
                            <div className="font-medium text-card-foreground">{job.title}</div>
                            <div className="text-xs text-muted-foreground">{job.companyName}</div>
                            <div className="text-xs text-muted-foreground">{job.salary || "Salary not set"}</div>
                          </TableCell>
                          <TableCell className="align-top text-sm text-muted-foreground">
                            CGPA {job.minCgpa} • Max backlogs {job.maxBacklogs}
                          </TableCell>
                          <TableCell className="align-top text-sm text-muted-foreground">
                            {formatDateTime(job.deadline)}
                          </TableCell>
                          <TableCell className="align-top">{job.applicationCount}</TableCell>
                          <TableCell className="align-top">
                            {job.placedCount} placed • {job.shortlistedCount} shortlisted
                          </TableCell>
                          <TableCell className="align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                isOpen ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isOpen ? "Open" : "Closed"}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminJobs;
