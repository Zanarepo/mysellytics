import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: 'spring', stiffness: 100 } },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { type: 'spring', stiffness: 300 } },
};

const StoreAccess = () => {
  const [stores, setStores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedDashboards, setSelectedDashboards] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dashboardOptions = [
    { value: 'fix_scan', label: 'Fix Scan' },
    { value: 'flex_scan', label: 'Flex Scan' },
    { value: 'ai_insights', label: 'AI Insights' },
  ];

  const fetchStores = async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('id, shop_name, allowed_dashboard')
      .order('id', { ascending: true });
    if (!error) {
      setStores(data);
      setFiltered(data);
    } else {
      console.error('Error fetching stores:', error);
      setError('Failed to fetch stores');
      toast.error('Failed to fetch stores');
      setStores([]);
      setFiltered([]);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearch = async () => {
    if (!searchValue) {
      setFiltered(stores);
      return;
    }
    const { data, error } = await supabase
      .from('stores')
      .select('id, shop_name, allowed_dashboard')
      .ilike('shop_name', `%${searchValue}%`)
      .order('id', { ascending: true });
    if (!error) {
      setFiltered(data);
      setError('');
    } else {
      console.error('Error searching stores:', error);
      setError('Failed to fetch stores');
      toast.error('Failed to fetch stores');
      setFiltered([]);
    }
  };

  const handleDashboardChange = (value) => {
    setSelectedDashboards((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleAssign = async (storeId) => {
    try {
      // Serialize selectedDashboards as a comma-separated string for text column
      const dashboardString = selectedDashboards.join(',');
      console.log('Assigning dashboards:', dashboardString, 'to store:', storeId);
      const { error } = await supabase
        .from('stores')
        .update({ allowed_dashboard: dashboardString })
        .eq('id', storeId);
      if (error) throw error;
      setSuccess(`Dashboards assigned successfully to store ${storeId}`);
      toast.success(`Dashboards assigned successfully to store ${storeId}`);
      setError('');
      localStorage.removeItem(`dashboard_${storeId}`);
      fetchStores();
    } catch (err) {
      console.error('Error assigning dashboards:', err);
      setError('Failed to assign dashboards');
      toast.error('Failed to assign dashboards: ' + err.message);
      setSuccess('');
    }
  };

  const handleUnassign = async (storeId) => {
    try {
      console.log('Unassigning all dashboards for store:', storeId);
      const { error } = await supabase
        .from('stores')
        .update({ allowed_dashboard: '' })
        .eq('id', storeId);
      if (error) throw error;
      setSuccess(`All dashboards unassigned from store ${storeId}`);
      toast.success(`All dashboards unassigned from store ${storeId}`);
      setError('');
      localStorage.removeItem(`dashboard_${storeId}`);
      fetchStores();
    } catch (err) {
      console.error('Error unassigning dashboards:', err);
      setError('Failed to unassign dashboards');
      toast.error('Failed to unassign dashboards: ' + err.message);
      setSuccess('');
    }
  };

  return (
    <motion.section
      className="py-12 sm:py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
      <ToastContainer />
      <div className="container mx-auto max-w-7xl">
        <motion.h2
          className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-12 font-sans"
          variants={cardVariants}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Manage Sidebar Access
        </motion.h2>
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
          variants={cardVariants}
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search by store name"
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <motion.button
                onClick={handleSearch}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white py-2 px-4 rounded-lg font-medium hover:shadow-indigo-500/30"
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
              >
                Search
              </motion.button>
            </div>
            <div>
              <label className="text-gray-900 dark:text-white font-medium">
                Assign Dashboards:
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  {dashboardOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedDashboards.includes(option.value)}
                        onChange={() => handleDashboardChange(option.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-900 dark:text-white">{option.label}</span>
                    </label>
                  ))}
                </div>
              </label>
            </div>
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
            {success && <p className="text-green-500 dark:text-green-400">{success}</p>}
            <div className="mt-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Stores</h3>
              <ul className="mt-2 space-y-2">
                {filtered.map((store) => (
                  <li
                    key={store.id}
                    className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-gray-900 dark:text-gray-400">
                      {store.shop_name} (Current: {store.allowed_dashboard ? store.allowed_dashboard.split(',').filter(Boolean).join(', ') : 'None'})
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleAssign(store.id)}
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white py-1 px-3 rounded-lg font-medium hover:shadow-indigo-500/30"
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                      >
                        Assign
                      </motion.button>
                      <motion.button
                        onClick={() => handleUnassign(store.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white py-1 px-3 rounded-lg font-medium hover:shadow-red-500/30"
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                      >
                        Unassign
                      </motion.button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default StoreAccess;