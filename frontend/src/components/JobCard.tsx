import { Building2, DollarSign, GraduationCap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

interface JobCardProps {
  company: string;
  title: string;
  salary: string;
  minCGPA: number;
  deadline: string;
  onApply?: () => void;
  applied?: boolean;
}

const JobCard = ({ company, title, salary, minCGPA, deadline, onApply, applied = false }: JobCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{company}</p>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          <span>{salary}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" />
          <span>Min CGPA: {minCGPA}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Deadline: {formatDateTime(deadline)}</span>
        </div>
      </div>
      <Button className="w-full mt-4" onClick={onApply} disabled={applied}>
        {applied ? "Already Applied" : "Apply Now"}
      </Button>
    </div>
  );
};

export default JobCard;
