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

const FeatureAccess = () => {
  const [stores, setStores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const featureOptions = [
    { value: 'sales', label: 'Sales Tracker' },
    { value: 'Products Tracker', label: 'Products & Pricing Tracker' },
    { value: 'inventory', label: 'Manage Inventory (Goods)' },
    { value: 'receipts', label: 'Sales Receipts' },
    { value: 'returns', label: 'Returned Items Tracker' },
    { value: 'expenses', label: 'Expenses Tracker' },
    { value: 'unpaid supplies', label: 'Unpaid Supplies' },
    { value: 'debts', label: 'Debtors' },
    { value: 'Suppliers', label: 'Suppliers' },
    { value: 'customers', label: 'Customer Manager' },
  ];

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, shop_name, allowed_features')
        .order('id', { ascending: true });
      if (error) throw error;
      console.log('Fetched stores:', data);
      setStores(data);
      setFiltered(data);
      setError('');
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Failed to fetch stores: ' + err.message);
      toast.error('Failed to fetch stores: ' + err.message);
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
      setError('');
      console.log('Search cleared, showing all stores:', stores);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, shop_name, allowed_features')
        .ilike('shop_name', `%${searchValue}%`)
        .order('id', { ascending: true });
      if (error) throw error;
      console.log('Search results for query:', searchValue, 'Results:', data);
      setFiltered(data);
      setError('');
    } catch (err) {
      console.error('Error searching stores:', err);
      setError('Failed to search stores: ' + err.message);
      toast.error('Failed to search stores: ' + err.message);
      const filteredStores = stores.filter((store) =>
        store.shop_name.toLowerCase().includes(searchValue.toLowerCase())
      );
      console.log('Client-side filtered stores:', filteredStores);
      setFiltered(filteredStores);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFeatureChange = (value) => {
    setSelectedFeatures((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleAssign = async (storeId) => {
    try {
      console.log('Assigning features:', selectedFeatures, 'to store:', storeId);
      const { error } = await supabase
        .from('stores')
        .update({ allowed_features: selectedFeatures })
        .eq('id', storeId);
      if (error) throw error;
      setSuccess(`Features assigned successfully to store ${storeId}`);
      toast.success(`Features assigned successfully to store ${storeId}`);
      setError('');
      localStorage.removeItem(`features_${storeId}`);
      fetchStores();
    } catch (err) {
      console.error('Error assigning features:', err);
      setError('Failed to assign features: ' + err.message);
      toast.error('Failed to assign features: ' + err.message);
      setSuccess('');
    }
  };

  const handleUnassign = async (storeId) => {
    try {
      console.log('Unassigning all features for store:', storeId);
      const { error } = await supabase
        .from('stores')
        .update({ allowed_features: [] })
        .eq('id', storeId);
      if (error) throw error;
      setSuccess(`All features unassigned from store ${storeId}`);
      toast.success(`All features unassigned from store ${storeId}`);
      setError('');
      localStorage.removeItem(`features_${storeId}`);
      fetchStores();
    } catch (err) {
      console.error('Error unassigning features:', err);
      setError('Failed to unassign features: ' + err.message);
      toast.error('Failed to unassign features: ' + err.message);
      setSuccess('');
    }
  };

  return (
    <motion.section
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
      <ToastContainer />
      <div className="container mx-auto max-w-7xl">
        <motion.h2
          className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-8 sm:mb-12 font-sans"
          variants={cardVariants}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Manage Store Feature Access
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
                onKeyPress={handleKeyPress}
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
                Assign Features:
                <div className="flex flex-col sm:flex-row gap-2 mt-2 flex-wrap">
                  {featureOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(option.value)}
                        onChange={() => handleFeatureChange(option.value)}
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
                      {store.shop_name} (Current:{' '}
                      {Array.isArray(store.allowed_features)
                        ? store.allowed_features.join(', ')
                        : store.allowed_features || 'None'}
                      )
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

export default FeatureAccess;