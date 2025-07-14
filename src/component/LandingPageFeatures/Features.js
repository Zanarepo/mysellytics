import { FiBox, FiTrendingUp, FiDollarSign, FiUsers, FiCamera, FiBarChart2, FiFileText, FiRefreshCw, FiPrinter, FiTag, FiBookOpen, FiActivity, FiLayers } from 'react-icons/fi';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20, rotate: 2 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.6, delay: i * 0.15, type: 'spring', stiffness: 100 },
  }),
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.2, rotate: 10, transition: { type: 'spring', stiffness: 300 } },
};

function Test() {
  const featureGroups = [
    {
      title: "Inventory & Operations",
      features: [
        { icon: FiBox, title: 'Live Stock Alerts', desc: 'Get instant notifications when stock runs low.' },
        { icon: FiCamera, title: 'Barcode Scanner', desc: 'Quickly add products into your store using our scanner.' },
        { icon: FiRefreshCw, title: 'Returns Tracker', desc: 'Manage returned items seamlessly.' },
        { icon: FiPrinter, title: 'Quick Receipts', desc: 'Generate customer receipts on the spot.' },
        { icon: FiLayers, title: 'Multi-Store View', desc: 'Control all your shops from one dashboard.' },
      ],
    },
    {
      title: "Financial Management",
      features: [
        { icon: FiTrendingUp, title: 'Daily Sales Overview', desc: 'See your sales numbers at a glance.' },
        { icon: FiDollarSign, title: 'Easy Expense Log', desc: 'Quickly record and categorize expenses.' },
        { icon: FiTag, title: 'Dynamic Pricing', desc: 'Adjust prices on the go for any item.' },
        { icon: FiBookOpen, title: 'Debt Manager', desc: 'Keep tabs on loans and repayments.' },
        { icon: FiActivity, title: 'Outstanding Bills', desc: 'Monitor unpaid supplies and credits.' },
      ],
    },
    {
      title: "Customer & Insights",
      features: [
        { icon: FiUsers, title: 'Customer Hub', desc: 'Store customer info and track interactions.' },
        { icon: FiBarChart2, title: 'Insightful Reports', desc: 'Simple tables for smarter decisions.' },
        { icon: FiFileText, title: 'Download Reports', desc: 'Export data as CSV or PDF in one click.' },
      ],
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-20 dark:opacity-10">
          <circle cx="10%" cy="20%" r="5" fill="currentColor" className="text-indigo-600 dark:text-indigo-400" />
          <circle cx="80%" cy="30%" r="8" fill="currentColor" className="text-indigo-600 dark:text-indigo-400" />
          <circle cx="40%" cy="70%" r="6" fill="currentColor" className="text-indigo-600 dark:text-indigo-400" />
          <circle cx="90%" cy="80%" r="4" fill="currentColor" className="text-indigo-600 dark:text-indigo-400" />
        </svg>
      </div>

      {/* Wavy Top Border */}
      <svg className="absolute top-0 w-full h-16" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path
          d="M0,0 C280,60 720,0 1440,60 L1440,0 Z"
          fill="url(#gradient)"
          className="dark:fill-gray-800"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#e0e7ff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-indigo-900 dark:text-gray-100 mb-12 font-sans"
          style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          All-in-One Business Toolkit
        </motion.h2>

        {featureGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-12">
            <motion.h3
              className="text-2xl font-semibold text-indigo-900 dark:text-gray-100 mb-6 font-sans relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: groupIndex * 0.2 }}
            >
              <span className="relative inline-block">
                {group.title}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg flex items-start space-x-4 hover:shadow-2xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-gray-800 dark:hover:to-gray-700 border border-indigo-100 dark:border-indigo-900 transition-all duration-300 group"
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  variants={cardVariants}
                  whileHover={{ scale: 1.05, translateY: -5, boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}
                >
                  <motion.div
                    className="text-indigo-600 dark:text-indigo-900 bg-indigo-100 dark:bg-indigo-900 rounded-full p-2 mt-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-300"
                    variants={iconVariants}
                    initial="rest"
                    whileHover="hover"
                  >
                    <feature.icon size={32} />
                  </motion.div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-sans group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {feature.title}
                    </h4>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 font-medium font-sans text-sm sm:text-base">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Test;