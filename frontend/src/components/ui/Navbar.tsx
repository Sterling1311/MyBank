import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export default function Navbar() {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#156064] text-white">
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🏦 MyBank</h1>

        <div className="hidden md:flex gap-4 items-center">
          <Link to="/dashboard" className="hover:text-[#F8E16C] transition-colors">Dashboard</Link>
          <Link to="/budget" className="hover:text-[#F8E16C] transition-colors">Budget</Link>
          <Link to="/categories" className="hover:text-[#F8E16C] transition-colors">Categories</Link>
          <button onClick={logout} className="bg-[#00C49A] px-4 py-1 rounded-lg hover:bg-white hover:text-[#156064] transition-colors">
            Logout
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#0e4547] px-6 py-4 flex flex-col gap-4 border-t border-[#00C49A]">
          <Link to="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-[#F8E16C] transition-colors py-2">Dashboard</Link>
          <Link to="/budget" onClick={() => setIsOpen(false)} className="hover:text-[#F8E16C] transition-colors py-2">Budget</Link>
          <Link to="/categories" onClick={() => setIsOpen(false)} className="hover:text-[#F8E16C] transition-colors py-2">Categories</Link>
          <button onClick={() => { logout(); setIsOpen(false); }} className="bg-[#00C49A] px-4 py-2 rounded-lg hover:bg-white hover:text-[#156064] transition-colors text-left">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}