import { useTrapStore } from '../store/trapStore';

export const Header = () => {
  const { activePage, setActivePage } = useTrapStore();

  const navLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Login', page: 'login' as const },
    { label: 'Search', page: 'search' as const },
    { label: 'Feedback', page: 'feedback' as const },
    { label: 'Register', page: 'register' as const },
    { label: 'Upload', page: 'upload' as const },
  ];

  return (
    <header className="bg-white border-b-2 border-gray-200 mb-8">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div
            onClick={() => setActivePage('home')}
            className="cursor-pointer"
          >
            <h1 className="text-2xl font-bold text-gray-800">Secure Portal</h1>
            <p className="text-xs text-gray-500">Your Trusted Platform</p>
          </div>
          <nav className="flex flex-wrap gap-2 md:gap-4">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => setActivePage(link.page)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activePage === link.page
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
