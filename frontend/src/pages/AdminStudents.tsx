import DashboardLayout from "@/components/DashboardLayout";

const AdminStudents = () => (
  <DashboardLayout role="admin">
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Students</h1>
      <p className="text-muted-foreground">Manage student profiles and data.</p>
      <div className="bg-card rounded-lg border border-border p-6">(Placeholder) Student management dashboard.</div>
    </div>
  </DashboardLayout>
);

export default AdminStudents;
