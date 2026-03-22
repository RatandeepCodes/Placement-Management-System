import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { createJob, fetchCompanies, fetchJobs } from "@/lib/api";

const AdminJobs = () => {
  const queryClient = useQueryClient();

  const [companyId, setCompanyId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [minCgpa, setMinCgpa] = useState(0);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobList"],
    queryFn: fetchJobs,
  });

  const mutation = useMutation({
    mutationFn: (payload: any) => createJob(payload),
    onSuccess: () => {
      toast.success("Job posted successfully");
      setTitle("");
      setCompanyId("");
      setMinCgpa(0);
      setMaxBacklogs(0);
      setSalary("");
      setDeadline("");
      queryClient.invalidateQueries(["jobList"]);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to post job");
    },
  });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companyId || !title || !deadline) {
      toast.error("Please fill all required fields.");
      return;
    }

    mutation.mutate({
      company_id: Number(companyId),
      title,
      min_cgpa: Number(minCgpa),
      max_backlogs: Number(maxBacklogs),
      salary,
      deadline,
    });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Job Management</h1>
          <p className="text-muted-foreground">Create and maintain job listings with deadline time selector.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Add Job</h2>
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submit}>
            <div>
              <Label htmlFor="company">Company</Label>
              <Select id="company" value={companyId} onValueChange={(v) => setCompanyId(Number(v))}>
                <option value="">Select company</option>
                {companies.map((company: any) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Software Engineer" required />
            </div>
            <div>
              <Label htmlFor="minCgpa">Min CGPA</Label>
              <Input id="minCgpa" type="number" step="0.01" value={minCgpa} onChange={(e) => setMinCgpa(Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="maxBacklogs">Max Backlogs</Label>
              <Input id="maxBacklogs" type="number" value={maxBacklogs} onChange={(e) => setMaxBacklogs(Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="₹20 LPA" required />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline (date + time)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full" disabled={mutation.isLoading}>
                {mutation.isLoading ? "Saving..." : "Post Job"}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Jobs</h2>
          <div className="space-y-2">
            {jobs.length === 0 ? (
              <p className="text-muted-foreground">No jobs yet.</p>
            ) : (
              jobs.map((job: any) => (
                <div key={job.job_id} className="rounded-lg border border-border p-3">
                  <div className="flex justify-between">
                    <strong>{job.title}</strong>
                    <span className="text-xs text-muted-foreground">{new Date(job.deadline).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{job.company_name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminJobs;
