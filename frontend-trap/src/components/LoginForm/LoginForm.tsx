import { useState, FormEvent } from 'react';
import { analyzeInput } from '../../services/api';
import './LoginForm.css';

interface LoginFormProps {
  onMessage: (message: string) => void;
  onLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const LoginForm = ({ onMessage, onLoading, isLoading }: LoginFormProps): JSX.Element => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    onLoading(true);
    onMessage('');

    const result = await analyzeInput(username, 'login', 'username');
    onMessage(result.message);
    onLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
          autoComplete="off"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
          autoComplete="off"
        />
      </div>
      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;

