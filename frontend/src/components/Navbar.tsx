import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { LayoutDashboard, PiggyBank, Tag, LogOut } from "lucide-react";

export default function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/budget", label: "Budget", icon: PiggyBank },
    { to: "/categories", label: "Categories", icon: Tag },
  ];

  return (
    <>
      {/* Desktop navbar */}
      <nav className="hidden md:flex bg-white border-b border-gray-100 px-8 py-4 justify-between items-center shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🏦</span>
          <span className="text-xl font-bold text-[#156064]">MyBank</span>
        </Link>
        <div className="flex items-center gap-6">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive(to) ? "text-[#156064]" : "text-gray-400 hover:text-[#156064]"}`}>
              <Icon size={16} />
              {label}
              {isActive(to) && <span className="w-1 h-1 rounded-full bg-[#00C49A] ml-1" />}
            </Link>
          ))}
          <button onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors ml-4">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile top bar - logo seulement */}
      <nav className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex justify-center items-center shadow-sm">
        <Link to="/dashboard" className="text-xl font-bold text-[#156064]">🏦 MyBank</Link>
      </nav>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
        <div className="flex justify-around items-center px-2 py-2">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${isActive(to) ? "text-[#156064]" : "text-gray-400"}`}>
              <Icon size={22} strokeWidth={isActive(to) ? 2.5 : 1.5} />
              <span className="text-xs font-medium">{label}</span>
              {isActive(to) && <span className="w-1 h-1 rounded-full bg-[#00C49A]" />}
            </Link>
          ))}
          <button onClick={logout}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={22} strokeWidth={1.5} />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Spacer pour la bottom nav */}
      <div className="md:hidden h-16" />
    </>
  );
}
