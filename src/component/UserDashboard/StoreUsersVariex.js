import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  FaRegMoneyBillAlt,
  FaMoneyCheckAlt,
  FaBoxes,
  FaChartLine,
  FaTasks,
  FaArrowLeft,
  FaReceipt,
  FaUndoAlt,
  FaBoxOpen,
} from 'react-icons/fa';
import DynamicInventory from '../DynamicSales/DynamicInventory';
import ExpenseTracker from './ExpenseTracker';
import ReturnedItems from '../VariexContents/ReturnedItems';
import DebtTracker from './DebtTracker';
import StoreUserDynamicSales from '../DynamicSales/StoreUserDynamicSales';
import StoreUserDynamicProduct from '../DynamicSales/StoreUserDynamicProduct';
import StoreUsersUnpaidSupplies from '../UserDashboard/StoreUsersUnpaidSupplies';
import StoreUsersLatestReceipts from '../VariexContents/StoreUsersLatestReceipts';

const tools = [
  {
    key: 'sales',
    label: 'Sales Tracker',
    icon: <FaChartLine className="text-2xl sm:text-5xl text-indigo-600" />,
    desc: 'Add your sales and see how your business is doing',
    component: <StoreUserDynamicSales />,
  },
  {
    key: 'products',
    label: 'Products & Pricing',
    icon: <FaBoxes className="text-2xl sm:text-5xl text-indigo-600" />,
    desc: 'Add and manage your store’s products, prices, and stock here',
    component: <StoreUserDynamicProduct />,
  },
  {
    key: 'inventory',
    label: 'Manage Inventory (Goods)',
    icon: <FaTasks className="text-2xl sm:text-5xl text-indigo-600" />,
    desc: 'Keep an eye on how much goods you have sold and what is left in your store.',
    component: <DynamicInventory />,
  },
  {
    key: 'receipts',
    label: 'Sales Receipts',
    icon: <FaReceipt className="text-2xl sm:text-5xl text-indigo-600" />,
    desc: 'Monitor store expenses.',
    component: <StoreUsersLatestReceipts />,
  },
  {
    key: 'returns',
    label: 'Returned Items Tracker',
    icon: <FaUndoAlt className="text-2xl sm:text-5xl text-indigo-600" />,
    desc: 'Track returned items from customers.',
    component: <ReturnedItems />,
  },
  {
    key: 'expenses',
    label: 'Expenses Tracker',
    icon: <FaRegMoneyBillAlt className="text-2xl sm:text-5xl text-indigo-600" />,
    desc: 'Keep track of your store spending.',
    component: <ExpenseTracker />,
  },
  {
    key: 'unpaid supplies',
    label: 'Unpaid Supplies',
    icon: <FaBoxOpen className="text-2xl sm:text-5xl text-indigo-600" />,
    desc: 'See who took goods on credit and hasn’t paid yet.',
    component: <StoreUsersUnpaidSupplies />,
  },
  {
    key: 'debts',
    label: 'Debtors',
    icon: <FaMoneyCheckAlt className="text-2xl sm:text-5xl text-indigo-600" />,
    desc: 'Track debtors.',
    component: <DebtTracker />,
  },
];

export default function DynamicDashboard() {
  const [shopName, setShopName] = useState('Store Owner');
  const [activeTool, setActiveTool] = useState(null);

  useEffect(() => {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) return;
    supabase
      .from('stores')
      .select('shop_name')
      .eq('id', storeId)
      .single()
      .then(({ data, error }) => {
        if (!error && data?.shop_name) {
          setShopName(data.shop_name);
        }
      });
  }, []);

  const tool = tools.find(t => t.key === activeTool);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 w-full px-2 sm:px-4">
      <header className="text-center mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-3xl font-bold text-indigo-800 dark:text-white">
          Welcome, {shopName}!
        </h1>
        {!activeTool && (
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-xs sm:text-sm">
            Choose a tool to continue.
          </p>
        )}
      </header>

      {activeTool && (
        <div className="mb-4 sm:mb-6 max-w-7xl mx-auto">
          <button
            onClick={() => setActiveTool(null)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 text-xs sm:text-base"
            aria-label="Go back to tool selection"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <h2 className="text-lg sm:text-2xl font-semibold text-indigo-700 dark:text-indigo-200">
            {tool.label}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{tool.desc}</p>
        </div>
      )}

      {activeTool ? (
        <div className="w-full max-w-7xl mx-auto">
          {tool.component}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 max-w-7xl mx-auto">
          {tools.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTool(t.key)}
              className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-2 sm:p-6 rounded-xl shadow hover:shadow-lg transition h-32 sm:h-48"
              aria-label={`Select ${t.label}`}
            >
              {t.icon}
              <span className="mt-2 text-xs sm:text-base font-medium text-indigo-800 dark:text-white">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}