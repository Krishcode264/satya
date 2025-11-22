import { useTrapStore } from '../../store/trapStore';
import type { PageType } from '../../store/trapStore';

export const HomePage = () => {
  const { setActivePage } = useTrapStore();

  const features: Array<{
    title: string;
    description: string;
    link: PageType;
    icon: string;
  }> = [
    {
      title: 'User Login',
      description: 'Access your secure account with your credentials',
      link: 'login',
      icon: '🔐',
    },
    {
      title: 'Search',
      description: 'Search through our database and resources',
      link: 'search',
      icon: '🔍',
    },
    {
      title: 'Feedback',
      description: 'Share your thoughts and suggestions with us',
      link: 'feedback',
      icon: '💬',
    },
    {
      title: 'Register',
      description: 'Create a new account to get started',
      link: 'register',
      icon: '📝',
    },
    {
      title: 'File Upload',
      description: 'Upload and share your documents securely',
      link: 'upload',
      icon: '📤',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome to Secure Portal</h2>
        <p className="text-gray-600">
          Your trusted platform for secure access and services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div
            key={feature.link}
            onClick={() => setActivePage(feature.link)}
            className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{feature.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <span className="text-primary text-sm font-medium group-hover:underline">
                  Go to {feature.title} →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-gray-800 mb-2">About Our Platform</h3>
        <p className="text-sm text-gray-600">
          We provide a secure and reliable platform for all your needs. Whether you're looking to
          access your account, search for information, provide feedback, or manage your files,
          we've got you covered.
        </p>
      </div>
    </div>
  );
};

