interface StatusBadgeProps {
  status: "Applied" | "Shortlisted" | "Selected" | "Rejected";
}

const statusMap = {
  Applied: "status-applied",
  Shortlisted: "status-shortlisted",
  Selected: "status-selected",
  Rejected: "status-rejected",
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
