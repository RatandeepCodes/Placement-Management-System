import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createStudentProfile, fetchStudentProfile, updateStudentProfile } from "@/lib/api";
import { getRole } from "@/lib/auth";

const Profile = () => {
  const userId = Number(localStorage.getItem("user_id") || "0");
  const queryClient = useQueryClient();

  const profileStorageKey = (field: string) => `profile_${userId}_${field}`;

  const [name, setName] = useState(localStorage.getItem(profileStorageKey("name")) || "");
  const [rollNo, setRollNo] = useState(localStorage.getItem(profileStorageKey("rollNo")) || "");
  const [branch, setBranch] = useState(localStorage.getItem(profileStorageKey("branch")) || "");
  const [cgpa, setCgpa] = useState(Number(localStorage.getItem(profileStorageKey("cgpa")) || "0"));
  const [backlogs, setBacklogs] = useState(Number(localStorage.getItem(profileStorageKey("backlogs")) || "0"));
  const [phone, setPhone] = useState(localStorage.getItem(profileStorageKey("phone")) || "");
  const [year, setYear] = useState(localStorage.getItem(profileStorageKey("year")) || "");
  const [about, setAbout] = useState(localStorage.getItem(profileStorageKey("about")) || "");
  const [resumeFilename, setResumeFilename] = useState(localStorage.getItem(profileStorageKey("resumeFilename")) || "");
  const [resumeData, setResumeData] = useState(localStorage.getItem(profileStorageKey("resumeData")) || "");
  const [avatarUrl, setAvatarUrl] = useState<string>(localStorage.getItem("student_avatar") || "");

  const role = getRole();
  const [ profileMissing, setProfileMissing ] = useState(false);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["student", userId],
    queryFn: fetchStudentProfile,
    enabled: !!userId,
    retry: false,
    onSuccess(data) {
      setProfileMissing(false);
      setName(data.name || "");
      setRollNo(data.roll_no || "");
      setBranch(data.branch || "");
      setCgpa(data.cgpa || 0);
      setBacklogs(data.backlogs || 0);
      setPhone(data.phone || "");
      setYear(data.year || "");
      setAbout(data.about || "");
      localStorage.setItem(profileStorageKey("year"), data.year || "");
      localStorage.setItem(profileStorageKey("about"), data.about || "");
      localStorage.setItem(profileStorageKey("resumeFilename"), data.resume_filename || "");
      localStorage.setItem(profileStorageKey("resumeData"), data.resume_data || "");
    },
    onError: (error: any) => {
      setProfileMissing(true);
      // Use localStorage fallback on any failure
      setName(localStorage.getItem(profileStorageKey("name")) || "");
      setRollNo(localStorage.getItem(profileStorageKey("rollNo")) || "");
      setBranch(localStorage.getItem(profileStorageKey("branch")) || "");
      setCgpa(Number(localStorage.getItem(profileStorageKey("cgpa")) || "0"));
      setBacklogs(Number(localStorage.getItem(profileStorageKey("backlogs")) || "0"));
      setPhone(localStorage.getItem(profileStorageKey("phone")) || "");
      setYear(localStorage.getItem(profileStorageKey("year")) || "");
      setAbout(localStorage.getItem(profileStorageKey("about")) || "");
      setResumeFilename(localStorage.getItem(profileStorageKey("resumeFilename")) || "");
      setResumeData(localStorage.getItem(profileStorageKey("resumeData")) || "");

      if (!error?.message?.includes("Student not found")) {
        toast.error("Could not load profile from server, using cached values.");
      }
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      profileMissing ? createStudentProfile(payload) : updateStudentProfile(payload),
    onSuccess() {
      toast.success(profileMissing ? "Profile created successfully" : "Profile updated successfully");
      setProfileMissing(false);

      localStorage.setItem(profileStorageKey("name"), name);
      localStorage.setItem(profileStorageKey("rollNo"), rollNo);
      localStorage.setItem(profileStorageKey("branch"), branch);
      localStorage.setItem(profileStorageKey("cgpa"), String(cgpa));
      localStorage.setItem(profileStorageKey("backlogs"), String(backlogs));
      localStorage.setItem(profileStorageKey("phone"), phone);
      localStorage.setItem(profileStorageKey("year"), year);
      localStorage.setItem(profileStorageKey("about"), about);
      localStorage.setItem(profileStorageKey("resumeFilename"), resumeFilename);
      localStorage.setItem(profileStorageKey("resumeData"), resumeData);

      setResumeFilename(resumeFilename);
      setResumeData(resumeData);
      queryClient.invalidateQueries(["student", userId]);
      queryClient.invalidateQueries(["jobs"]);
      queryClient.invalidateQueries(["applications", userId]);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to save profile");
    },
  });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User not signed in");
      return;
    }

    const payload = {
      name,
      roll_no: rollNo,
      branch,
      cgpa,
      backlogs,
      phone,
      year,
      about,
      resume_filename: resumeFilename,
      resume_data: resumeData,
    };

    mutation.mutate(payload);
  };

  const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Avatar too large. Limit is ${maxMb} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      localStorage.setItem("student_avatar", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  if (role !== "student") {
    return (
      <DashboardLayout role="student">
        <div className="text-muted-foreground">Only student profile editing is currently supported.</div>
      </DashboardLayout>
    );
  }

  const completionPercent = Math.min(100, Math.round(((name?.length > 0 ? 1 : 0) + (rollNo?.length > 0 ? 1 : 0) + (branch?.length > 0 ? 1 : 0) + (cgpa > 0 ? 1 : 0) + (year?.length > 0 ? 1 : 0)) / 5) * 100);

  const studyTips = [
    "Review notes daily and practice active recall.",
    "Teach a concept to someone else to deepen recall.",
    "Use the Pomodoro method: 25 min work, 5 min break.",
    "Break large topics into smaller study sessions.",
    "Set a weekly target and check progress in a journal.",
    "Use spaced repetition for long-term retention.",
    "Practice with real past placement questions.",
    "Join study groups to compare notes and strategy.",
    "Keep your resume updated as you gain new skills.",
    "Track applications and follow up after interviews.",
    "Practice coding problems with a timebound timer.",
    "Read company job descriptions before applying.",
    "Build a small project to show practical knowledge.",
    "Optimize your GitHub profile for recruiters.",
    "Keep one day for soft skills and communication practice.",
    "Create mock interviews with a friend.",
    "Review your CV and replace vague words with specifics.",
    "Network on LinkedIn with relevant recruiters and alumni.",
    "Maintain a regular sleep schedule for better focus.",
    "Eat well before study sessions to stay energized.",
    "Keep distractions off during focused study times.",
    "Use visual aids like charts and mind maps.",
    "Practice technical concepts via video tutorials.",
    "Update your placement goals at month-end.",
    "Try competitive coding to improve speed.",
    "Prepare elevator pitches for yourself.",
    "Test yourself with mock placement exams.",
    "Take short physical activity breaks between study blocks.",
    "Record your learning in a short video summary.",
    "Use time blocking for effective resources planning.",
  ];

  const tip = studyTips[Math.floor(Math.random() * studyTips.length)];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Profile</h1>
          <p className="text-muted-foreground mt-1">Build your profile to unlock job matches and application tracking.</p>
        </div>

        {isLoading ? (
          <div className="rounded-xl bg-card p-8 text-center">Loading profile...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
            <aside className="rounded-xl border border-border bg-gradient-to-br from-sky-50 via-white to-slate-50 p-6 shadow-lg">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/40 shadow-inner">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary/20 flex items-center justify-center text-4xl font-extrabold text-primary">
                      {name ? name.charAt(0).toUpperCase() : "S"}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <input id="avatarUpload" type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
                  <label htmlFor="avatarUpload" className="inline-flex h-8 items-center justify-center rounded-md border border-primary/30 bg-white px-3 text-xs font-semibold text-primary transition hover:bg-primary/10">
                    {avatarUrl ? "Change Picture" : "Add Picture"}
                  </label>
                  <button type="button" onClick={() => { setAvatarUrl(""); localStorage.removeItem("student_avatar"); }} className="inline-flex h-8 items-center justify-center rounded-md border border-red-300 bg-red-50 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-100" disabled={!avatarUrl}>
                    Remove Picture
                  </button>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground">{name || "Student Name"}</h2>
                  <p className="text-sm font-medium text-muted-foreground">
                    {profile?.user_id ? "University Student" : "New student profile"}
                  </p>
                  <p className="text-sm text-muted-foreground">{branch ? `Branch: ${branch}` : "Branch not set"}</p>
                  <p className="text-sm text-muted-foreground">{rollNo ? `Roll No: ${rollNo}` : "Roll number not set"}</p>
                  <p className="text-sm mt-2 text-muted-foreground">{about ? about : "About section is empty. Add a short bio in Profile form."}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Profile Completion</p>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 ease-out" style={{ width: `${completionPercent}%` }} />
                  </div>
                  <p className="mt-1 text-xs font-medium text-foreground">{completionPercent}% complete</p>
                </div>

                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Current CGPA</p>
                  <p className="text-2xl font-bold text-foreground">{cgpa > 0 ? cgpa.toFixed(2) : "0.00"}</p>
                </div>

                <div className="rounded-lg border border-border bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Backlogs</p>
                  <p className="text-2xl font-bold text-foreground">{backlogs}</p>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground">Quick Tip</h3>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            </aside>

            <section>
              {(profileMissing || isError) && (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-medium text-yellow-900">
                  Student profile not found. Fill and save to create your profile.
                </div>
              )}

              <form className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm" onSubmit={submit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="rollNo">Roll Number</Label>
                    <Input id="rollNo" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} required />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="about">About You</Label>
                    <textarea
                      id="about"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-border px-3 py-2 text-sm"
                      placeholder="Write a short summary of your skills, interests and career goals"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cgpa">CGPA</Label>
                    <Input id="cgpa" type="number" min="0" max="10" step="0.01" value={cgpa} onChange={(e) => setCgpa(Number(e.target.value))} required />
                  </div>
                  <div>
                    <Label htmlFor="backlogs">Backlogs</Label>
                    <Input id="backlogs" type="number" min="0" step="1" value={backlogs} onChange={(e) => setBacklogs(Number(e.target.value))} required />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="resumeUpload">Resume</Label>
                    <input
                      id="resumeUpload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const maxMb = 10;
                        if (file.size > maxMb * 1024 * 1024) {
                          toast.error(`Resume too large. Limit is ${maxMb} MB.`);
                          e.currentTarget.value = "";
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = () => {
                          const encoded = reader.result as string;
                          setResumeData(encoded);
                          setResumeFilename(file.name);
                          localStorage.setItem(profileStorageKey("resumeData"), encoded);
                          localStorage.setItem(profileStorageKey("resumeFilename"), file.name);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="resumeUpload"
                        className="inline-flex h-9 items-center justify-center rounded-md border border-primary bg-white px-4 text-sm font-semibold text-primary transition hover:bg-primary/10"
                      >
                        Add Resume
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResumeFilename("");
                          setResumeData("");
                          localStorage.removeItem(profileStorageKey("resumeFilename"));
                          localStorage.removeItem(profileStorageKey("resumeData"));
                          toast.success("Resume removed. Upload a new one when ready.");
                        }}
                        className="h-9 rounded-md border border-red-300 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        disabled={!resumeFilename}
                      >
                        Remove Resume
                      </button>
                    </div>

                    {resumeFilename ? (
                      <a
                        href={resumeData}
                        download={resumeFilename}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Download current resume ({resumeFilename})
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground">No resume uploaded yet.</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Email</Label>
                    <Input value={localStorage.getItem("email") || ""} disabled />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here. Manage it from account settings.</p>
                  </div>
                </div>

                <Button className="w-full" type="submit" disabled={mutation.isLoading}>
                  {mutation.isLoading ? "Saving..." : profileMissing ? "Create Profile" : "Update Profile"}
                </Button>
              </form>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
