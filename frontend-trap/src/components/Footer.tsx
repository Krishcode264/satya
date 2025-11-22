import { useTrapStore } from '../store/trapStore';

export const Footer = () => {
  const { setActivePage } = useTrapStore();

  const footerLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Login', page: 'login' as const },
    { label: 'Search', page: 'search' as const },
    { label: 'Feedback', page: 'feedback' as const },
    { label: 'Register', page: 'register' as const },
    { label: 'Upload', page: 'upload' as const },
  ];

  return (
    <footer className="mt-12 border-t-2 border-gray-200 pt-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => setActivePage(link.page)}
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Account Management</li>
              <li>File Sharing</li>
              <li>Search & Discovery</li>
              <li>User Support</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: support@secureportal.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Hours: Mon-Fri 9AM-5PM</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Secure Portal. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};
