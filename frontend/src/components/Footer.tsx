import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 mt-8">
      <div className="max-w-2xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} MyBank — BankBank. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link to="/privacy" className="text-xs text-gray-400 hover:text-[#00C49A] transition-colors">
            Privacy Policy
          </Link>
          <a href="mailto:contact@bankbank.io" className="text-xs text-gray-400 hover:text-[#00C49A] transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}