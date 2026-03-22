import DashboardLayout from "@/components/DashboardLayout";

const AdminPlacements = () => (
  <DashboardLayout role="admin">
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Placements</h1>
      <p className="text-muted-foreground">Track and manage placement progress.</p>
      <div className="bg-card rounded-lg border border-border p-6">(Placeholder) Placements details and reports.</div>
    </div>
  </DashboardLayout>
);

export default AdminPlacements;
