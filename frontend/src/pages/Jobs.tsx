import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import JobCard from "@/components/JobCard";
import { toast } from "sonner";
import { applyToJob, fetchApplications, fetchJobs, fetchStudentProfile, JobItem } from "@/lib/api";

const Jobs = () => {
  const queryClient = useQueryClient();
  const { data: jobs = [], isLoading, isError } = useQuery<JobItem[]>({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const userId = Number(localStorage.getItem("user_id") || "0");

  const navigate = useNavigate();

  const studentProfileQuery = useQuery({
    queryKey: ["studentProfile", userId],
    queryFn: () => fetchStudentProfile(userId),
    enabled: !!userId,
    retry: false,
  });

  const applicationsQuery = useQuery({
    queryKey: ["applications", userId],
    queryFn: () => fetchApplications(userId),
    enabled: !!userId,
  });

  const appliedIds = useMemo(() => {
    return new Set((applicationsQuery.data || []).map((app: any) => app.job_id));
  }, [applicationsQuery.data]);

  const mutation = useMutation({
    mutationFn: ({ jobId, studentId }: { jobId: number; studentId: number }) =>
      applyToJob({ jobId, studentId }),
    onSuccess: () => {
      toast.success("Application submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["applications", userId] });
      queryClient.invalidateQueries({ queryKey: ["studentProfile", userId] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Could not submit application");
    },
  });

  const tileJobs = useMemo(
    () =>
      jobs.map((job) => ({
        ...job,
        company: job.company_name,
        salary: typeof job.salary === "number" ? `₹${job.salary} LPA` : job.salary,
        minCGPA: job.min_cgpa,
        deadline: job.deadline,
      })),
    [jobs]
  );

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <div>Loading jobs...</div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout role="student">
        <div>Error loading jobs.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Listings</h1>
          <p className="text-muted-foreground mt-1">Browse and apply for available positions.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tileJobs.length === 0 ? (
            <div className="text-muted-foreground">No jobs available at the moment.</div>
          ) : (
            tileJobs.map((job) => (
              <JobCard
                key={job.job_id}
                company={job.company}
                title={job.title}
                salary={job.salary as string}
                minCGPA={job.minCGPA as number}
                deadline={job.deadline}
                applied={appliedIds.has(job.job_id)}
                onApply={() => {
                  const student = studentProfileQuery.data;
                  if (!userId || !student) {
                    toast.error("Please login and complete your student profile before applying.");
                    return;
                  }
                  if (appliedIds.has(job.job_id)) {
                    toast.error("You have already applied to this job.");
                    return;
                  }
                  if (Number(student.cgpa) < Number(job.minCGPA)) {
                    toast.error("Your CGPA does not meet the minimum requirement for this job.");
                    return;
                  }
                  navigate(`/jobs/apply/${job.job_id}`, { state: { job } });
                }}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
