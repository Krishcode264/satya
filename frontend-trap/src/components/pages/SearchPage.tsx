import { useTrapStore } from '../../store/trapStore';
import { analyzeInput } from '../../utils/api';

export const SearchPage = () => {
  const { searchQuery, isLoading, setSearchQuery, setIsLoading, setServerMessage } = useTrapStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerMessage('');

    try {
      const response = await analyzeInput({
        userInput: searchQuery,
        page: 'search',
        field: 'query',
      });
      setServerMessage(response);
    } catch (error) {
      setServerMessage(error instanceof Error ? error.message : 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="search-query" className="text-sm font-medium text-gray-800">
          Search Query
        </label>
        <input
          type="text"
          id="search-query"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter your search query"
          required
          autoComplete="off"
          className="px-3 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="py-3.5 bg-gradient-to-r from-primary to-secondary text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all mt-2.5 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

