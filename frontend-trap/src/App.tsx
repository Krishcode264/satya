import { useTrapStore } from './store/trapStore';
import { Header } from './components/Header';
import { HomePage } from './components/pages/HomePage';
import { LoginPage } from './components/pages/LoginPage';
import { SearchPage } from './components/pages/SearchPage';
import { FeedbackPage } from './components/pages/FeedbackPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { UploadPage } from './components/pages/UploadPage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ServerMessage } from './components/ServerMessage';
import { Footer } from './components/Footer';

function App() {
  const { activePage, isLoading } = useTrapStore();

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'login':
        return <LoginPage />;
      case 'search':
        return <SearchPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'register':
        return <RegisterPage />;
      case 'upload':
        return <UploadPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <Header />
          
          <main className="px-6 md:px-10 py-8 min-h-[60vh]">
            {renderPage()}
            
            {isLoading && (
              <div className="mt-6">
                <LoadingSpinner />
              </div>
            )}
            
            <div className="mt-6">
              <ServerMessage />
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
