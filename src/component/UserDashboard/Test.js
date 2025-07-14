import { FiBarChart, FiShoppingBag, FiStar, FiAlertTriangle, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const iconVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.2, transition: { type: 'spring', stiffness: 300 } },
};

function Test() {
  const features = [
    {
      icon: FiBarChart,
      title: "Sales Trend Analysis",
      description: "See clear, interactive sales trends and forecasts to maximize sales.",
    },
   
    {
      icon: FiShoppingBag,
      title: "Market Demand Insights",
      description: "Match inventory to customer demand to seize market opportunities.",
    },
    {
      icon: FiStar,
      title: "Smart Restock Recommendations",
      description: "Let AI suggest optimal restock amounts to save time and costs.",
    },
    {
      icon: FiAlertTriangle,
      title: "Anomaly Detection",
      description: "Catch unusual sales patterns fast to spot errors or issues.",
    },
    {
      icon: FiLock,
      title: "Theft/Audit Checks",
      description: "Keep inventory safe with smart audit to track and reconcile products.",
    },
  ];

  return (
    <section className="min-h-screen w-full px-4 py-16 bg-gradient-to-b from-indigo-50 to-indigo-200 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden flex items-center justify-center">
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

      <div className="w-full px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-indigo-900 dark:text-white mb-4 font-sans">
          Sellytics — AI-Powered Retail Insights
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 font-sans">
          Running a retail business is tough. Sellytics uses AI-powered analytics to simplify decisions, optimize operations, and boost your bottom line.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg flex items-start space-x-4 hover:shadow-xl transition-transform duration-300"
              initial="hidden"
              animate="visible"
              custom={index}
              variants={cardVariants}
              whileHover={{ scale: 1.05, translateY: -5 }}
            >
              <motion.div
                className="text-indigo-600 dark:text-indigo-400 mt-1"
                variants={iconVariants}
                initial="rest"
                whileHover="hover"
              >
                <feature.icon size={28} />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-indigo-900 dark:text-white font-sans">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300 font-medium font-sans text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Test;