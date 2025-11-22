import { useTrapStore } from '../../store/trapStore';
import { analyzeInput } from '../../utils/api';

export const RegisterPage = () => {
  const {
    registerName,
    registerEmail,
    registerPassword,
    isLoading,
    setRegisterName,
    setRegisterEmail,
    setRegisterPassword,
    setIsLoading,
    setServerMessage,
  } = useTrapStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerMessage('');

    try {
      const messages: string[] = [];

      // Send name
      if (registerName) {
        const nameResponse = await analyzeInput({
          userInput: registerName,
          page: 'register',
          field: 'name',
        });
        messages.push(nameResponse.message || '');
      }

      // Send email
      if (registerEmail) {
        const emailResponse = await analyzeInput({
          userInput: registerEmail,
          page: 'register',
          field: 'email',
        });
        messages.push(emailResponse.message || '');
      }

      // Send password
      if (registerPassword) {
        const passwordResponse = await analyzeInput({
          userInput: registerPassword,
          page: 'register',
          field: 'password',
        });
        messages.push(passwordResponse.message || '');
      }

      setServerMessage(messages.join('\n\n'));
    } catch (error) {
      setServerMessage(error instanceof Error ? error.message : 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="register-name" className="text-sm font-medium text-gray-800">
          Full Name
        </label>
        <input
          type="text"
          id="register-name"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          placeholder="Enter your full name"
          required
          autoComplete="name"
          className="px-3 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="register-email" className="text-sm font-medium text-gray-800">
          Email Address
        </label>
        <input
          type="email"
          id="register-email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          placeholder="Enter your email"
          required
          autoComplete="email"
          className="px-3 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="register-password" className="text-sm font-medium text-gray-800">
          Password
        </label>
        <input
          type="password"
          id="register-password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          placeholder="Create a password"
          required
          autoComplete="new-password"
          className="px-3 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="py-3.5 bg-gradient-to-r from-primary to-secondary text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all mt-2.5 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

