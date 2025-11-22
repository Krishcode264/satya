import './Tabs.css';

type TabType = 'login' | 'search';

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Tabs = ({ activeTab, onTabChange }: TabsProps): JSX.Element => {
  return (
    <div className="tabs">
      <button
        className={`tab ${activeTab === 'login' ? 'active' : ''}`}
        onClick={() => onTabChange('login')}
      >
        Login
      </button>
      <button
        className={`tab ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => onTabChange('search')}
      >
        Search
      </button>
    </div>
  );
};

export default Tabs;

