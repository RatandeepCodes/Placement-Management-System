import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate("/login", { replace: true });
  }, [navigate]);

  return <div className="min-h-screen flex items-center justify-center">Logging out...</div>;
};

export default Logout;
