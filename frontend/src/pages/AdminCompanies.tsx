import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Briefcase, ClipboardList, Trophy } from "lucide-react";
import { toast } from "sonner";
import { createAdminCompany, fetchAdminCompanies } from "@/lib/admin";

const AdminCompanies = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [hrEmail, setHrEmail] = useState("");

  const { data: companies = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "companies"],
    queryFn: fetchAdminCompanies,
  });

  const summary = useMemo(
    () =>
      companies.reduce(
        (accumulator, company) => {
          accumulator.totalCompanies += 1;
          accumulator.activeJobs += company.activeJobCount;
          accumulator.applications += company.applicationCount;
          accumulator.placed += company.placedCount;
          return accumulator;
        },
        {
          totalCompanies: 0,
          activeJobs: 0,
          applications: 0,
          placed: 0,
        },
      ),
    [companies],
  );

  const createCompanyMutation = useMutation({
    mutationFn: createAdminCompany,
    onSuccess: () => {
      toast.success("Company created successfully");
      setName("");
      setIndustry("");
      setLocation("");
      setHrEmail("");
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create company");
    },
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createCompanyMutation.mutate({ name, industry, location, hrEmail });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground mt-1">
            Maintain recruiter records and monitor which companies are driving applications and placements.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-card p-6">Loading companies...</div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-destructive">
            Unable to load companies.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardCard title="Companies" value={summary.totalCompanies} icon={Building2} variant="primary" />
              <DashboardCard title="Active Jobs" value={summary.activeJobs} icon={Briefcase} variant="accent" />
              <DashboardCard
                title="Applications"
                value={summary.applications}
                icon={ClipboardList}
                variant="default"
              />
              <DashboardCard title="Placements" value={summary.placed} icon={Trophy} variant="secondary" />
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Add Company</h2>
              <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submit}>
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" value={name} onChange={(event) => setName(event.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="company-industry">Industry</Label>
                  <Input id="company-industry" value={industry} onChange={(event) => setIndustry(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="company-location">Location</Label>
                  <Input id="company-location" value={location} onChange={(event) => setLocation(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="company-email">HR Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={hrEmail}
                    onChange={(event) => setHrEmail(event.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={createCompanyMutation.isPending}>
                    {createCompanyMutation.isPending ? "Saving..." : "Create Company"}
                  </Button>
                </div>
              </form>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>HR Email</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Placements</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No companies added yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    companies.map((company) => (
                      <TableRow key={company.companyId}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.industry || "Not set"}</TableCell>
                        <TableCell>{company.location || "Not set"}</TableCell>
                        <TableCell>{company.hrEmail || "Not set"}</TableCell>
                        <TableCell>
                          {company.jobCount} total • {company.activeJobCount} active
                        </TableCell>
                        <TableCell>{company.applicationCount}</TableCell>
                        <TableCell>{company.placedCount}</TableCell>
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

export default AdminCompanies;
