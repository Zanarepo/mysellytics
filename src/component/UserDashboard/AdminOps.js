import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaClock, FaTasks, FaCalendarAlt, FaArrowLeft, FaHome } from 'react-icons/fa';
import StoreClocking from './StoreClocking';
import AdminTasks from './AdminTasks';
import StaffSchedules from './StaffSchedules';
import { useNavigate } from 'react-router-dom';

const opsTools = [
  {
    key: 'clocking',
    label: 'Staff Clocking',
    icon: <FaClock className="text-2xl sm:text-5xl text-indigo-600" />,
    desc: 'Manage clock-in and clock-out records of staff',
    component: <StoreClocking />,
  },
  {
    key: 'tasks',
    label: 'Task Manager',
    icon: <FaTasks className="text-2xl sm:text-5xl text-indigo-600" />,
    desc: 'Assign and track staff tasks efficiently',
    component: <AdminTasks />,
  },
  {
    key: 'schedules',
    label: 'Staff Schedules',
    icon: <FaCalendarAlt className="text-2xl sm:text-5xl text-indigo-600" />,
    desc: 'Manage work schedules and shifts for your staff',
    component: <StaffSchedules />,
  },
];

export default function AdminOps() {
  const [shopName, setShopName] = useState('Store Admin');
  const [activeTool, setActiveTool] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storeId = localStorage.getItem('store_id');
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

  const tool = opsTools.find((t) => t.key === activeTool);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 w-full p-4">
      <header className="text-center mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-3xl font-bold text-indigo-800 dark:text-white">
          Admin Operations for {shopName}
        </h1>
        {!activeTool && (
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-xs sm:text-sm">
            Manage clocking, tasks, and staff schedules in one place.
          </p>
        )}
      </header>

      {/* Active Tool Display */}
      {activeTool ? (
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTool('')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 text-xs sm:text-base"
          >
            <FaArrowLeft className="mr-2" /> Back to Operations
          </button>
          <h2 className="text-lg sm:text-2xl font-semibold text-indigo-800 dark:text-indigo-200">
            {tool.label}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{tool.desc}</p>
          <div className="w-full mt-4">
            {React.cloneElement(tool.component, { setActiveTool })}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-xs sm:text-sm"
            >
              <FaHome className="mr-2" /> Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            {opsTools.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTool(t.key)}
                className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-xl shadow hover:shadow-lg transition h-36 sm:h-48"
              >
                {t.icon}
                <span className="mt-2 text-xs sm:text-base font-medium text-indigo-800 dark:text-white">
                  {t.label}
                </span>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm text-center mt-1">
                  {t.desc}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
