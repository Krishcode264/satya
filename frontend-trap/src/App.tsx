import { useState } from 'react';
import Header from './components/Header/Header';
import Tabs from './components/Tabs/Tabs';
import LoginForm from './components/LoginForm/LoginForm';
import SearchForm from './components/SearchForm/SearchForm';
import Spinner from './components/Spinner/Spinner';
import ServerMessage from './components/ServerMessage/ServerMessage';
import Footer from './components/Footer/Footer';
import './App.css';

type TabType = 'login' | 'search';

function App() {
  const [serverMessage, setServerMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('login');

  const handleTabChange = (tab: TabType): void => {
    setActiveTab(tab);
    setServerMessage('');
  };

  const handleMessage = (message: string): void => {
    setServerMessage(message);
  };

  const handleLoading = (loading: boolean): void => {
    setIsLoading(loading);
  };

  return (
    <div className="app">
      <div className="container">
        <Header />
        <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

        {activeTab === 'login' ? (
          <LoginForm 
            onMessage={handleMessage} 
            onLoading={handleLoading} 
            isLoading={isLoading}
          />
        ) : (
          <SearchForm 
            onMessage={handleMessage} 
            onLoading={handleLoading} 
            isLoading={isLoading}
          />
        )}

        {isLoading && <Spinner />}
        <ServerMessage message={serverMessage} />
        <Footer />
      </div>
    </div>
  );
}

export default App;

