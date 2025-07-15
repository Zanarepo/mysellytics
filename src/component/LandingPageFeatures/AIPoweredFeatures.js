import { FiBarChart, FiAlertCircle, FiShoppingBag, FiStar, FiAlertTriangle, FiLock } from 'react-icons/fi';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const cardVariants = {
  hidden: { opacity: 0, y: 30, rotateX: 0 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.4, delay: i * 0.1, type: 'spring', stiffness: 100 },
  }),
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: 5, transition: { type: 'spring', stiffness: 300 } },
};

function SellyticsFeatures() {
  const features = [
    {
      icon: FiBarChart,
      title: "Sales Trend Analysis",
      description: "See clear, interactive sales trends and forecasts to maximize sales.",
      strongText: "See",
    },
    {
      icon: FiAlertCircle,
      title: "Real-Time Restock Alerts",
      description: "Get notified instantly when stock runs low to avoid stockouts.",
      strongText: "Get",
    },
    {
      icon: FiShoppingBag,
      title: "Market Demand Insights",
      description: "Match inventory to customer demand to seize market opportunities.",
      strongText: "Match",
    },
    {
      icon: FiStar,
      title: "Smart Restock Recommendations",
      description: "Let AI suggest optimal restock amounts to save time and costs.",
      strongText: "Let",
    },
    {
      icon: FiAlertTriangle,
      title: "Anomaly Detection",
      description: "Catch unusual sales patterns fast to spot errors or issues.",
      strongText: "Catch",
    },
    {
      icon: FiLock,
      title: "Theft Detection",
      description: "Keep inventory safe with smart tracking to prevent losses.",
      strongText: "Keep",
    },
  ];

  const inventoryFeatures = features.slice(0, 4);
  const securityFeatures = features.slice(4, 6);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      className="relative w-full px-2 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 bg-gray-900 overflow-hidden"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23d1d5db' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      {/* Wavy Top Border */}
      <svg className="absolute top-0 w-full h-24" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,0 C280,100 720,0 1440,100 L1440,0 Z"
          fill="#4f46e5" // indigo-600
        />
      </svg>

      {/* Wavy Bottom Border */}
      <svg className="absolute bottom-0 w-full h-24" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,100 C280,0 720,100 1440,0 L1440,100 Z"
          fill="#4f46e5" // indigo-600
        />
      </svg>

      <div className="relative w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8" ref={ref}>
        {/* Section Messaging */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-4 sm:mb-12"
        >
          <h2 className="text-xl sm:text-4xl font-bold text-white font-sans mb-4">
            Sellytics — AI-Powered Retail Insights
          </h2>
          <p className="text-sm sm:text-lg text-gray-300 max-w-3xl mx-auto font-sans">
            Running a retail business is tough. Sellytics uses AI-powered analytics to simplify decisions, optimize operations, and boost your bottom line.
          </p>
          <div className="mt-4 h-0.5 w-16 sm:h-1 sm:w-24 bg-gradient-to-r from-indigo-500 to-indigo-300 mx-auto rounded-full" />
        </motion.div>

        {/* Inventory Optimization Features */}
        <div className="mb-8 sm:mb-4">
          <h3 className="text-base sm:text-2xl font-semibold text-white font-sans text-center mb-4 sm:mb-8">
            Inventory Optimization
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-nowrap sm:overflow-x-auto sm:gap-6 scrollbar-hidden">
            {inventoryFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 rounded-lg p-2 sm:p-4 shadow-md hover:shadow-lg hover:bg-gray-700 border border-gray-700 group transition-all duration-300 min-w-[4rem] sm:min-w-[200px] min-h-[4rem]"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={index}
                variants={cardVariants}
                whileHover={{ scale: 1.03, translateY: -3 }}
                aria-label={`Learn more about ${feature.title}`}
                tabIndex={0}
              >
                <motion.div
                  className="text-indigo-400 bg-gray-700 rounded-full p-1 sm:p-2 mt-1 group-hover:text-indigo-300"
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <feature.icon className="w-4 h-4 sm:w-7 sm:h-7" />
                </motion.div>
                <div>
                  <h4 className="text-xs sm:text-lg font-bold text-white font-sans mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                    {feature.title}
                  </h4>
                  <p className="text-2xs sm:text-sm text-gray-300 font-medium font-sans text-ellipsis overflow-hidden whitespace-nowrap">
                    <strong>{feature.strongText}</strong> {feature.description.replace(feature.strongText, '')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Security & Insights Features */}
        <div>
          <h3 className="text-base sm:text-2xl font-semibold text-white font-sans text-center mb-4 sm:mb-2">
            Security & Insights
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-nowrap sm:overflow-x-auto sm:gap-6 scrollbar-hidden">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 rounded-lg p-2 sm:p-4 shadow-md hover:shadow-lg hover:bg-gray-700 border border-gray-700 group transition-all duration-300 min-w-[4rem] sm:min-w-[200px] min-h-[4rem]"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={index + 4}
                variants={cardVariants}
                whileHover={{ scale: 1.03, translateY: -3 }}
                aria-label={`Learn more about ${feature.title}`}
                tabIndex={0}
              >
                <motion.div
                  className="text-indigo-400 bg-gray-700 rounded-full p-1 sm:p-2 mt-1 group-hover:text-indigo-300"
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <feature.icon className="w-4 h-4 sm:w-7 sm:h-7" />
                </motion.div>
                <div>
                  <h4 className="text-xs sm:text-lg font-bold text-white font-sans mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                    {feature.title}
                  </h4>
                  <p className="text-2xs sm:text-sm text-gray-300 font-medium font-sans text-ellipsis overflow-hidden whitespace-nowrap">
                    <strong>{feature.strongText}</strong> {feature.description.replace(feature.strongText, '')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SellyticsFeatures;
