import { useState, FormEvent } from 'react';
import { analyzeInput } from '../../services/api';
import './SearchForm.css';

interface SearchFormProps {
  onMessage: (message: string) => void;
  onLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const SearchForm = ({ onMessage, onLoading, isLoading }: SearchFormProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    onLoading(true);
    onMessage('');

    const result = await analyzeInput(searchQuery, 'search', 'query');
    onMessage(result.message);
    onLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="search">Search Query</label>
        <input
          type="text"
          id="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter search query"
          required
          autoComplete="off"
        />
      </div>
      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

export default SearchForm;

