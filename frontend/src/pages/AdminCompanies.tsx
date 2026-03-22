import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchCompanies } from "@/lib/api";

const AdminCompanies = () => {
  const { data: companies = [], isLoading, isError } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground">Review and manage recruiter companies.</p>
        </div>

        {isLoading ? (
          <div>Loading companies...</div>
        ) : isError ? (
          <div>Error loading companies.</div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No companies added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company: any) => (
                    <TableRow key={company.company_id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>{company.location}</TableCell>
                      <TableCell>{company.hr_email}</TableCell>
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

export default AdminCompanies;
