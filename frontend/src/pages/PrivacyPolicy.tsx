import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-2 text-[#156064] font-bold text-xl">
          🏦 MyBank
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link to="/dashboard" className="flex items-center gap-1 text-xs text-[#00C49A] hover:underline mb-6">
          <ArrowLeft size={12} />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-[#156064] mb-2">Privacy Policy</h1>
        <p className="text-xs text-gray-400 mb-8">Last updated: July 2025</p>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-2">1. Who we are</h2>
            <p>MyBank is a personal finance management application developed by BankBank. We are committed to protecting your personal data in compliance with the General Data Protection Regulation (GDPR) and applicable French law.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-2">2. Data we collect</h2>
            <p>We collect and process the following personal data:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Email address (used as your unique identifier)</li>
              <li>Password (stored securely using bcrypt hashing — never in plain text)</li>
              <li>Financial operations you create (label, amount, date, category)</li>
              <li>Budget allocations you define</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-2">3. Purpose of data processing</h2>
            <p>Your data is processed solely for the purpose of providing the MyBank service:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Account authentication and security</li>
              <li>Storage and display of your financial operations</li>
              <li>Budget tracking and statistics</li>
            </ul>
            <p className="mt-2">We do not sell, share, or transfer your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-2">4. Data retention</h2>
            <p>Your data is retained for as long as your account is active. Upon account deletion, all associated data is permanently removed from our systems within 30 days.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-2">5. Your rights (GDPR)</h2>
            <p>Under the GDPR, you have the following rights:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Right of access</strong> — you can request a copy of your data</li>
              <li><strong>Right to rectification</strong> — you can correct inaccurate data</li>
              <li><strong>Right to erasure</strong> — you can request deletion of your account and data</li>
              <li><strong>Right to portability</strong> — you can request your data in a portable format</li>
              <li><strong>Right to object</strong> — you can object to processing of your data</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at: <a href="mailto:privacy@bankbank.io" className="text-[#00C49A] hover:underline">privacy@bankbank.io</a></p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-2">6. Security</h2>
            <p>We implement technical and organizational measures to protect your data:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Passwords hashed with bcrypt (industry standard)</li>
              <li>Authentication via JWT tokens (RS256 algorithm)</li>
              <li>HTTPS encryption for all communications</li>
              <li>No sensitive data stored in browser local storage except the authentication token</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-2">7. Cookies</h2>
            <p>MyBank does not use tracking cookies. We only use a JWT authentication token stored in your browser's localStorage, which is strictly necessary for the application to function.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-2">8. Contact</h2>
            <p>For any questions about this privacy policy or your personal data, please contact us at: <a href="mailto:privacy@bankbank.io" className="text-[#00C49A] hover:underline">privacy@bankbank.io</a></p>
          </section>

        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-6 mt-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} MyBank — BankBank</p>
        </div>
      </footer>
    </div>
  );
}