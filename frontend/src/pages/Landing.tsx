import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Briefcase, Users, Building2, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Track Placements",
    description: "Monitor placement drives, results, and statistics in real-time with detailed analytics.",
  },
  {
    icon: Briefcase,
    title: "Apply for Jobs",
    description: "Browse and apply for job openings posted by top companies visiting your campus.",
  },
  {
    icon: Building2,
    title: "Manage Companies",
    description: "Coordinate with companies, schedule interviews, and manage the entire recruitment process.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              Placement Cell Management
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6">
              College Placement Portal
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline your campus placement process. Connect students with top companies,
              track applications, and manage the entire recruitment lifecycle in one place.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/login">
                  Login <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Everything You Need</h2>
            <p className="text-muted-foreground">Powerful tools for students, admins, and companies.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-background rounded-lg border border-border p-6 hover-lift"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="p-3 rounded-lg bg-primary/10 inline-flex mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 PlaceCell — College Placement Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
