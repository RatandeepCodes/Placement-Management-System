import { useMemo, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { applyToJob, fetchApplications, fetchJobs, fetchStudentProfile, updateStudentProfile, JobItem } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

const JobApply = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const numericJobId = Number(jobId);
  const userId = Number(localStorage.getItem("user_id") || "0");
  const navigate = useNavigate();
  const location = useLocation();
  const passedJob = (location.state as { job?: JobItem })?.job;

  const queryClient = useQueryClient();

  const [newResumeFilename, setNewResumeFilename] = useState<string>("");
  const [newResumeData, setNewResumeData] = useState<string>("");
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const { data: student } = useQuery({
    queryKey: ["student", userId],
    queryFn: fetchStudentProfile,
    enabled: !!userId,
    retry: false,
  });

  const { data: jobs = [] } = useQuery<JobItem[]>({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["applications", userId],
    queryFn: () => fetchApplications(userId),
    enabled: !!userId,
  });

  const job = passedJob ?? jobs.find((it) => it.job_id === numericJobId);
  const applied = applications.some((app: any) => app.job_id === numericJobId);

  const updateResumeMutation = useMutation({
    mutationFn: (payload: any) => updateStudentProfile(payload),
    onSuccess: () => {
      toast.success("Resume updated successfully");
      queryClient.invalidateQueries({ queryKey: ["student", userId] });
      setNewResumeFilename("");
      setNewResumeData("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload resume.");
    },
  });

  const mutation = useMutation({
    mutationFn: () => applyToJob({ user_id: userId, job_id: numericJobId }),
    onSuccess: () => {
      toast.success("Application submitted successfully.");
      queryClient.invalidateQueries({ queryKey: ["applications", userId] });
      queryClient.invalidateQueries({ queryKey: ["student", userId] });
      navigate("/applications");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to apply to job.");
    },
  });

  if (!job) {
    return (
      <DashboardLayout role="student">
        <div>Job not found or invalid ID.</div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout role="student">
        <div>Please complete your profile before applying and then retry.</div>
      </DashboardLayout>
    );
  }

  const canApply = !applied && Number(student.cgpa) >= Number(job.min_cgpa) && Number(student.backlogs) <= Number(job.max_backlogs);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate("/jobs")}>Back to Jobs</Button>
        <div className="rounded-xl border border-border bg-card p-6">
          <h1 className="text-2xl font-bold">Apply for {job.title}</h1>
          <p className="text-muted-foreground">Company: {job.company_name}</p>
          <p className="text-muted-foreground">Min CGPA: {job.min_cgpa}, Max Backlogs: {job.max_backlogs}</p>
          <p className="text-muted-foreground">Deadline: {formatDateTime(job.deadline)}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Student Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <Label>Name</Label>
              <p>{student.name}</p>
            </div>
            <div>
              <Label>Roll Number</Label>
              <p>{student.roll_no}</p>
            </div>
            <div>
              <Label>Branch</Label>
              <p>{student.branch || "N/A"}</p>
            </div>
            <div className="sm:col-span-2">
              <Label>About</Label>
              <p>{student.about || "No about text provided."}</p>
            </div>
            <div>
              <Label>CGPA</Label>
              <p>{student.cgpa}</p>
            </div>
            <div>
              <Label>Backlogs</Label>
              <p>{student.backlogs}</p>
            </div>
            <div>
              <Label>Contact</Label>
              <p>{student.phone}</p>
            </div>
          </div>

          <div className="mt-4">
            <Label>Resume</Label>
            {student.resume_filename && student.resume_data ? (
              <a href={student.resume_data} download={student.resume_filename} className="text-primary hover:underline">
                Download {student.resume_filename}
              </a>
            ) : (
              <p className="text-muted-foreground">No resume uploaded; upload from profile first.</p>
            )}

            <input
              id="job-apply-resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              ref={resumeInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  setNewResumeFilename(file.name);
                  setNewResumeData(reader.result as string);
                };
                reader.readAsDataURL(file);
              }}
              className="hidden"
            />

            <div className="mt-3">
              <label
                htmlFor="job-apply-resume-upload"
                className="inline-flex h-10 items-center justify-center rounded-md border border-primary bg-white px-4 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                Choose Resume File
              </label>
            </div>
            <div className="mt-2 space-y-2">
              {newResumeFilename && (
                <>
                  <p className="text-sm text-muted-foreground">Selected: {newResumeFilename}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (!student) return;

                        updateResumeMutation.mutate({
                          name: student.name,
                          roll_no: student.roll_no,
                          branch: student.branch,
                          cgpa: student.cgpa,
                          backlogs: student.backlogs,
                          phone: student.phone,
                          year: student.year,
                          about: student.about,
                          resume_filename: newResumeFilename,
                          resume_data: newResumeData,
                        });
                      }}
                      disabled={!newResumeData || updateResumeMutation.status === "pending"}
                    >
                      {updateResumeMutation.status === "pending" ? "Uploading..." : "Upload Resume"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setNewResumeFilename("");
                        setNewResumeData("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
              {student.resume_filename && student.resume_data && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (!student) return;

                    updateResumeMutation.mutate({
                      name: student.name,
                      roll_no: student.roll_no,
                      branch: student.branch,
                      cgpa: student.cgpa,
                      backlogs: student.backlogs,
                      phone: student.phone,
                      year: student.year,
                      about: student.about,
                      resume_filename: "",
                      resume_data: "",
                    });
                  }}
                >
                  Remove current resume
                </Button>
              )}
            </div>
          </div>

          {!canApply && (
            <div className="mt-4 rounded-lg bg-orange-50 border border-orange-200 p-3 text-orange-700">
              {applied ? "You have already applied for this job." : "You are not eligible for this job based on CGPA/backlogs."}
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={() => mutation.mutate()}
              disabled={!canApply || mutation.status === "pending"}
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:from-indigo-600 hover:to-cyan-600 shadow-lg shadow-cyan-500/30"
              size="lg"
            >
              {applied ? "Already Applied" : mutation.status === "pending" ? "Applying..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobApply;
