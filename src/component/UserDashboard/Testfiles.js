import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { FaMoneyBillWave, FaBars, FaTimes, FaStore, FaConciergeBell } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AdminProfile from './AdminProfile';
import Stores from './Stores';
import StoreUsers from './StoreUsers';
import Owners from './Owners';
import DashboardAccess from '../Ops/DashboardAccess';
import PriceUpdateCompo from '../Payments/PriceUpdateCompo';

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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Stores');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState('shop_name');
  const [searchValue, setSearchValue] = useState('');
  const [dashboard, setDashboard] = useState('fix_scan');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.role !== 'admin') {
        navigate('/unauthorized');
      }
    };
    checkAdmin();
  }, [navigate]);

  const handleSearch = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, shop_name, owner_id, allowed_dashboard')
        .ilike(searchCriteria, `%${searchValue}%`);
      if (error) throw error;
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
      setUsers([]);
    }
  };

  const handleAssign = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ allowed_dashboard: dashboard })
        .eq('id', userId);
      if (error) throw error;
      setSuccess(`Dashboard assigned successfully to user ${userId}`);
      setError('');
      handleSearch(); // Refresh user list
    } catch (err) {
      setError('Failed to assign dashboard');
      setSuccess('');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Stores':
        return (
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <Stores />
          </div>
        );
      case 'Store Users':
        return (
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <StoreUsers />
          </div>
        );
      case 'Owners':
        return (
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <Owners />
          </div>
        );
      case 'Admin Profile':
        return (
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <AdminProfile />
          </div>
        );
      case 'Pricing':
        return (
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <PriceUpdateCompo />
          </div>
        );
      case 'Access':
        return (
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
              variants={cardVariants}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                Assign Dashboard Access
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={searchCriteria}
                    onChange={(e) => setSearchCriteria(e.target.value)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="shop_name">Shop Name</option>
                    <option value="owner_id">Owner ID</option>
                  </select>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={`Enter ${searchCriteria.replace('_', ' ')}`}
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
                    Assign Dashboard:
                    <select
                      value={dashboard}
                      onChange={(e) => setDashboard(e.target.value)}
                      className="ml-2 p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="fix_scan">Fix Scan</option>
                      <option value="flex_scan">Flex Scan</option>
                    </select>
                  </label>
                </div>
                {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
                {success && <p className="text-green-500 dark:text-green-400">{success}</p>}
                <div className="mt-4">
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Users</h4>
                  <ul className="mt-2 space-y-2">
                    {users.map((u) => (
                      <li
                        key={u.id}
                        className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      >
                        <span className="text-gray-900 dark:text-gray-400">
                          {u.shop_name || u.owner_id} (Current: {u.allowed_dashboard || 'None'})
                        </span>
                        <motion.button
                          onClick={() => handleAssign(u.id)}
                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white py-1 px-3 rounded-lg font-medium hover:shadow-indigo-500/30"
                          variants={buttonVariants}
                          initial="rest"
                          whileHover="hover"
                        >
                          Assign
                        </motion.button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        );
      default:
        return (
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            Dashboard Content
          </div>
        );
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 mt-20">
      <aside
        className={`fixed md:static top-20 left-0 h-[calc(100vh-5rem)] transition-all duration-300 bg-gray-100 dark:bg-gray-800 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0 md:w-16'
        } ${sidebarOpen ? 'block' : 'hidden md:block'}`}
      >
        <div className="p-4 md:p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold text-indigo-800 dark:text-white ${sidebarOpen ? 'block' : 'hidden'}`}>
              Menu
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-indigo-800 dark:text-indigo-200 md:hidden"
              aria-label="Close sidebar"
            >
              <FaTimes size={24} />
            </button>
          </div>
          <nav className="mt-4 pt-4">
            <ul className="space-y-2">
              {[
                { name: 'Admin Profile', icon: FaStore, aria: 'Admin Profile: View and edit admin profile' },
                { name: 'Owners', icon: FaConciergeBell, aria: 'Store Owners: Manage store owners' },
                { name: 'Store Users', icon: FaConciergeBell, aria: 'Store Users: Manage store users' },
                { name: 'Stores', icon: FaConciergeBell, aria: 'Stores: Manage stores' },
                { name: 'Pricing', icon: FaMoneyBillWave, aria: 'Pricing: Manage pricing plans' },
                { name: 'Access', icon: FaMoneyBillWave, aria: 'Access Dashboard: Manage store access' },
              ].map((item) => (
                <li
                  key={item.name}
                  data-tour={item.name.toLowerCase().replace(' ', '-')}
                  onClick={() => handleNavClick(item.name)}
                  className={`flex items-center p-2 rounded cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-600 transition ${
                    activeTab === item.name ? 'bg-indigo-200 dark:bg-indigo-600' : ''
                  }`}
                  aria-label={item.aria}
                >
                  <item.icon className={`text-indigo-800 dark:text-indigo-200 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                  <span className={`text-indigo-800 dark:text-indigo-200 ${sidebarOpen ? 'block' : 'hidden'}`}>
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div
          data-tour="dark-mode"
          className={`p-4 md:p-6 mt-auto flex items-center justify-between ${sidebarOpen ? 'block' : 'hidden md:flex'}`}
        >
          <span className={`text-indigo-800 dark:text-indigo-200 ${sidebarOpen ? 'block' : 'hidden'}`}>
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <div className="w-11 h-6 bg-indigo-800 dark:bg-gray-600 rounded-full transition-colors duration-300">
              <span
                className={`absolute left-1 top-1 bg-white dark:bg-indigo-200 w-4 h-4 rounded-full transition-transform duration-300 ${
                  darkMode ? 'translate-x-5' : ''
                }`}
              ></span>
            </div>
          </label>
        </div>
      </aside>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-24 md:top-24 transition-all duration-300 z-50 rounded-full p-2 bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 md:block hidden ${
          sidebarOpen ? 'left-64' : 'left-4'
        }`}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-0'
        }`}
      >
        <header className="flex md:hidden items-center justify-between p-4 bg-white dark:bg-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-indigo-800 dark:text-indigo-200"
            aria-label="Open sidebar"
          >
            <FaBars size={24} />
          </button>
          <h1 className="text-xl font-bold text-indigo-800 dark:text-indigo-200">
            {activeTab}
          </h1>
          <div style={{ width: 24 }}></div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;