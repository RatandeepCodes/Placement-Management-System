interface StatusBadgeProps {
  status: string;
}

const statusMap: Record<string, string> = {
  Applied: "status-applied",
  Shortlisted: "status-shortlisted",
  Interview: "status-shortlisted",
  Selected: "status-selected",
  Placed: "status-selected",
  Rejected: "status-rejected",
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusClass = statusMap[status] || "bg-muted text-muted-foreground";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
