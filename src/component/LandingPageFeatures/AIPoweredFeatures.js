import { FiBarChart, FiAlertCircle, FiShoppingBag, FiStar, FiAlertTriangle, FiLock } from 'react-icons/fi';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const cardVariants = {
  hidden: { opacity: 0, y: 30, rotateX: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, delay: i * 0.15, type: 'spring', stiffness: 100 },
  }),
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.3, rotate: 5, transition: { type: 'spring', stiffness: 300 } },
};

function Test() {
  const features = [
    {
      icon: FiBarChart,
      title: "Sales Trend Analysis",
      description: "<strong>See</strong> clear, interactive sales trends and forecasts to maximize sales.",
    },
    {
      icon: FiAlertCircle,
      title: "Real-Time Restock Alerts",
      description: "<strong>Get</strong> notified instantly when stock runs low to avoid stockouts.",
    },
    {
      icon: FiShoppingBag,
      title: "Market Demand Insights",
      description: "<strong>Match</strong> inventory to customer demand to seize market opportunities.",
    },
    {
      icon: FiStar,
      title: "Smart Restock Recommendations",
      description: "<strong>Let</strong> AI suggest optimal restock amounts to save time and costs.",
    },
    {
      icon: FiAlertTriangle,
      title: "Anomaly Detection",
      description: "<strong>Catch</strong> unusual sales patterns fast to spot errors or issues.",
    },
    {
      icon: FiLock,
      title: "Theft Detection",
      description: "<strong>Keep</strong> inventory safe with smart tracking to prevent losses.",
    },
  ];

  const inventoryFeatures = features.slice(0, 4);
  const securityFeatures = features.slice(4, 6);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      className="relative w-full px-4 py-16 bg-gradient-to-b from-indigo-100 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden"
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23d1d5db' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      {/* Wavy Top Border */}
      <svg className="absolute top-0 w-full h-24" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,0 C280,100 720,0 1440,100 L1440,0 Z"
          fill="url(#gradient)"
          className="dark:fill-gray-800"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#e0e7ff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#c7d2fe', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Wavy Bottom Border */}
      <svg className="absolute bottom-0 w-full h-24" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,100 C280,0 720,100 1440,0 L1440,100 Z"
          fill="url(#gradient)"
          className="dark:fill-gray-800"
        />
      </svg>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Section Messaging */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 dark:text-white font-sans mb-4">
            Sellytics — AI-Powered Retail Insights
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-sans">
            Running a retail business is tough. Sellytics uses AI-powered analytics to simplify decisions, optimize operations, and boost your bottom line.
          </p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 mx-auto rounded-full" />
        </motion.div>

        {/* Inventory Optimization Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-indigo-900 dark:text-white font-sans text-center mb-8">
            Inventory Optimization
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {inventoryFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-lg flex items-start space-x-4 hover:shadow-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-white dark:hover:from-gray-700 dark:hover:to-gray-800 group transition-all duration-300"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={index}
                variants={cardVariants}
                whileHover={{ scale: 1.05, rotate: 1 }}
              >
                <motion.div
                  className="text-indigo-600 dark:text-indigo-400 mt-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-500"
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <feature.icon size={32} />
                </motion.div>
                <div>
                  <h4 className="text-2xl font-bold text-indigo-900 dark:text-white font-sans mb-2">
                    {feature.title}
                  </h4>
                  <p
                    className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium font-sans"
                    dangerouslySetInnerHTML={{ __html: feature.description }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
         
        </div>

        {/* Security & Insights Features */}
        <div>
          <h3 className="text-2xl font-semibold text-indigo-900 dark:text-white font-sans text-center mb-8">
            Security & Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-lg flex items-start space-x-4 hover:shadow-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-white dark:hover:from-gray-700 dark:hover:to-gray-800 group transition-all duration-300"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={index + 4}
                variants={cardVariants}
                whileHover={{ scale: 1.05, rotate: 1 }}
              >
                <motion.div
                  className="text-indigo-600 dark:text-indigo-400 mt-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-500"
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <feature.icon size={32} />
                </motion.div>
                <div>
                  <h4 className="text-2xl font-bold text-indigo-900 dark:text-white font-sans mb-2">
                    {feature.title}
                  </h4>
                  <p
                    className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium font-sans"
                    dangerouslySetInnerHTML={{ __html: feature.description }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
         
        </div>
      </div>
    </section>
  );
}

export default Test;