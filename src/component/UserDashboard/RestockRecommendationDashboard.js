import { useState } from "react";
import Recommendation from '../DynamicSales/Recommendation';
import RestockAlerts from '../DynamicSales/RestockAlerts';

function RestockAndMarketDemand() {
  const [activeTab, setActiveTab] = useState('alerts');

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-0 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Tab Buttons */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => handleTabSwitch('alerts')}
          className={`px-4 py-2 sm:px-6 sm:py-3 mx-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
            activeTab === 'alerts'
              ? 'bg-indigo-600 text-white dark:bg-indigo-800 dark:text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Restock Alerts
        </button>
        <button
          onClick={() => handleTabSwitch('recommendations')}
          className={`px-4 py-2 sm:px-6 sm:py-3 mx-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'bg-indigo-600 text-white dark:bg-indigo-800 dark:text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Market Demands
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 dark:border dark:border-gray-700">
        {activeTab === 'alerts' ? (
          <RestockAlerts />
        ) : (
          <Recommendation />
        )}
      </div>
    </div>
  );
}

export default RestockAndMarketDemand;