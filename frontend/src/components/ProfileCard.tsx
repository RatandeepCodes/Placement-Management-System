import { Mail, Phone, BookOpen, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  name: string;
  branch: string;
  cgpa: number;
  phone: string;
  email: string;
}

const ProfileCard = ({ name, branch, cgpa, phone, email }: ProfileCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-8 max-w-lg mx-auto">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-card-foreground">{name}</h2>
        <p className="text-muted-foreground">{branch}</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-card-foreground">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span>CGPA: {cgpa}</span>
        </div>
        <div className="flex items-center gap-3 text-card-foreground">
          <Phone className="h-5 w-5 text-primary" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-3 text-card-foreground">
          <Mail className="h-5 w-5 text-primary" />
          <span>{email}</span>
        </div>
      </div>
      <Button className="w-full mt-6">Edit Profile</Button>
    </div>
  );
};

export default ProfileCard;
