import { useState } from "react";
import Recommendation from '../DynamicSales/Recommendation';
import RestockAlerts from '../DynamicSales/RestockAlerts';

function RestockAndMarketDemand() {
  const [activeTab, setActiveTab] = useState('alerts');

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-white p-0 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      

      {/* Tab Buttons */}
      <div className="flex justify-center mb-6">
       
        <button
          onClick={() => handleTabSwitch('alerts')}
          className={`px-4 py-2 sm:px-6 sm:py-3 mx-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
            activeTab === 'alerts'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Restock Alerts
        </button>

         <button
          onClick={() => handleTabSwitch('recommendations')}
          className={`px-4 py-2 sm:px-6 sm:py-3 mx-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Market Demands
        </button>

      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
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