import { useTrapStore } from '../../store/trapStore';
import { analyzeInput } from '../../utils/api';

export const LoginPage = () => {
  const {
    loginUsername,
    loginPassword,
    isLoading,
    setLoginUsername,
    setLoginPassword,
    setIsLoading,
    setServerMessage,
  } = useTrapStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerMessage(''); // always start fresh with a string

    try {
      // --- Send USERNAME ---
      const usernameResponse = await analyzeInput({
        userInput: loginUsername,
        page: 'login',
        field: 'username',
      });

      console.log('Username response:', usernameResponse);

      // Store ONLY the message, not the whole object
      setServerMessage(usernameResponse.message || '');

      // --- Send PASSWORD ---
      if (loginPassword) {
        const passwordResponse = await analyzeInput({
          userInput: loginPassword,
          page: 'login',
          field: 'password',
        });

        // Append message nicely (safe for strings)
        setServerMessage((prev) =>
          `${prev}\n\n${passwordResponse.message || ''}`
        );
      }
    } catch (error) {
      setServerMessage(
        error instanceof Error
          ? error.message
          : 'Connection error. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="login-username" className="text-sm font-medium text-gray-800">
          Username
        </label>
        <input
          type="text"
          id="login-username"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          placeholder="Enter your username"
          required
          autoComplete="username"
          className="px-3 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="login-password" className="text-sm font-medium text-gray-800">
          Password
        </label>
        <input
          type="password"
          id="login-password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          className="px-3 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="py-3.5 bg-gradient-to-r from-primary to-secondary text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all mt-2.5 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};
