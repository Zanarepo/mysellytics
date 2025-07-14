import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesTrends = () => {
  const [trends, setTrends] = useState([]);
  const [juneTopProduct, setJuneTopProduct] = useState(null);
  const [juneTopProducts, setJuneTopProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCharts, setShowCharts] = useState(true);
  const [storeId] = useState(localStorage.getItem('store_id') || null);

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) {
        setError('No store selected. Please log in or select a store.');
        setLoading(false);
        return;
      }

      try {
        // Fetch sales trends
        const { data: trendsData, error: trendsError } = await supabase
          .from('sales_trends')
          .select('month, total_quantity, monthly_growth, top_products')
          .eq('store_id', parseInt(storeId))
          .order('month', { ascending: true })
          .limit(100);

        if (trendsError) throw trendsError;

        // Fetch valid product IDs for this store from dynamic_sales
        const { data: salesData, error: salesError } = await supabase
          .from('dynamic_sales')
          .select('dynamic_product_id')
          .eq('store_id', parseInt(storeId))
          .gte('sold_at', '2025-01-01T00:00:00Z')
          .lte('sold_at', '2025-07-31T23:59:59Z');

        if (salesError) throw salesError;

        const validProductIds = new Set(salesData.map(sale => sale.dynamic_product_id.toString()));

        // Fetch June sales for top product and top 5 products
        const { data: juneData, error: juneError } = await supabase
          .from('dynamic_sales')
          .select('dynamic_product_id, quantity')
          .eq('store_id', parseInt(storeId))
          .gte('sold_at', '2025-06-01T00:00:00Z')
          .lte('sold_at', '2025-06-30T23:59:59Z');

        if (juneError) throw juneError;

        // Aggregate June sales
        const juneSalesAggregated = juneData.reduce((acc, sale) => {
          const productId = sale.dynamic_product_id.toString();
          acc[productId] = (acc[productId] || 0) + parseInt(sale.quantity);
          return acc;
        }, {});

        // Find top product for June
        const topJuneProduct = Object.entries(juneSalesAggregated).reduce(
          (max, [id, qty]) => (parseInt(qty) > parseInt(max.qty) ? { id, qty } : max),
          { id: null, qty: 0 }
        );

        // Get top 5 products for June
        const topFiveJuneProducts = Object.entries(juneSalesAggregated)
          .sort(([, qtyA], [, qtyB]) => parseInt(qtyB) - parseInt(qtyA))
          .slice(0, 5)
          .reduce((acc, [id, qty]) => ({ ...acc, [id]: qty }), {});

        // Fetch product names for valid products
        const productIds = [
          ...new Set([
            ...trendsData.flatMap(trend => Object.keys(trend.top_products || {}).filter(id => validProductIds.has(id))),
            ...Object.keys(juneSalesAggregated),
          ].filter(id => id).map(id => parseInt(id))),
        ];
        const { data: productsData, error: productsError } = await supabase
          .from('dynamic_product')
          .select('id, name')
          .in('id', productIds);

        if (productsError) throw productsError;

        const productMap = new Map(productsData.map(p => [p.id.toString(), p.name || `Unknown Product ${p.id}`]));

        // Process trends with store-specific top products
        const processedTrends = trendsData.map(trend => {
          const topProductsWithNames = {};
          for (const [id, qty] of Object.entries(trend.top_products || {})) {
            if (validProductIds.has(id)) {
              const name = productMap.get(id);
              if (name) {
                topProductsWithNames[name] = qty;
              }
            }
          }
          const topProduct = Object.entries(topProductsWithNames).reduce(
            (max, [name, qty]) => (parseInt(qty) > parseInt(max.qty) ? { name, qty } : max),
            { name: null, qty: 0 }
          );
          return {
            ...trend,
            top_products: topProductsWithNames,
            top_product: topProduct.name ? `${topProduct.name}: ${topProduct.qty}` : 'No sales',
          };
        });

        // Remove duplicates
        const uniqueTrends = Array.from(
          new Map(processedTrends.map(t => [t.month, t])).values()
        );

        // Set June top product
        const juneTopProductName = topJuneProduct.id ? productMap.get(topJuneProduct.id) : null;
        setJuneTopProduct(
          juneTopProductName && topJuneProduct.qty > 0
            ? { name: juneTopProductName, quantity: topJuneProduct.qty }
            : null
        );

        // Set June top 5 products with names
        const juneTopProductsWithNames = {};
        for (const [id, qty] of Object.entries(topFiveJuneProducts)) {
          const name = productMap.get(id) || `Unknown Product ${id}`;
          juneTopProductsWithNames[name] = qty;
        }
        setJuneTopProducts(juneTopProductsWithNames);

        setTrends(uniqueTrends);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch sales trends: ' + err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [storeId]);

  // Prepare data for Monthly Growth Chart
  const growthChartData = {
    labels: trends.map((t) => t.month),
    datasets: [
      {
        label: 'Monthly Growth (%)',
        data: trends.map((t) => Math.min(Math.max(t.monthly_growth * 100, -100), 100)),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare data for Top Products Chart (June 2025)
  const topProductsChartData = {
    labels: Object.keys(juneTopProducts),
    datasets: [
      {
        label: 'Top Products in June 2025',
        data: Object.values(juneTopProducts),
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 } } },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 10 } } },
      x: { ticks: { font: { size: 10 } } },
    },
  };

  // Insights for Monthly Growth
  const growthInsight = trends.length > 0 ? (
    trends[trends.length - 1].monthly_growth > 0 ? (
      <p className="text-green-600">
        ⬆ Positive growth in {trends[trends.length - 1].month}: {Math.round(trends[trends.length - 1].monthly_growth * 100)}% increase.
      </p>
    ) : (
      <p className="text-red-600">
        ⬇ Negative or no growth in {trends[trends.length - 1].month}: {Math.round(trends[trends.length - 1].monthly_growth * 100)}%.
      </p>
    )
  ) : <p>No growth data available.</p>;

  // Insights for Top Products (June 2025)
  const topProductNames = Object.keys(juneTopProducts)
    .sort((a, b) => parseInt(juneTopProducts[b]) - parseInt(juneTopProducts[a]))
    .slice(0, 5);
  const totalTopProductsQuantity = Object.entries(juneTopProducts)
    .filter(([name]) => topProductNames.includes(name))
    .reduce((sum, [, qty]) => sum + parseInt(qty || 0), 0);
  const topProductsInsight = topProductNames.length > 0 ? (
    <p className={totalTopProductsQuantity > 10 ? 'text-green-600' : 'text-gray-600'}>
      {totalTopProductsQuantity > 10 ? '⬆ ' : ''}Top products in June 2025: {topProductNames.join(', ')}
    </p>
  ) : <p>No top products data available for June 2025.</p>;

  // June Top Product Insight
  const juneTopProductInsight = juneTopProduct ? (
    <p className={juneTopProduct.quantity > 10 ? 'text-green-600' : 'text-gray-600'}>
      {juneTopProduct.quantity > 10 ? '⬆ ' : ''}Top product in June 2025: {juneTopProduct.name} ({juneTopProduct.quantity} units)
    </p>
  ) : <p>No sales data available for June 2025.</p>;

  if (!storeId) {
    return (
      <div className="container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-4">Sales Trends</h1>
        <div className="text-center py-4 text-red-600">
          Please log in or select a store to view sales trends.
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-white min-h-screen">

      <button
        onClick={() => setShowCharts(!showCharts)}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
      >
        {showCharts ? 'Hide Charts' : 'Show Charts'}
      </button>

      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-indigo-600 mb-2">June 2025 Top Product</h2>
        {juneTopProductInsight}
      </div>
<div className="overflow-x-auto mb-8">
  <table className="w-full table-auto bg-white rounded-lg shadow overflow-hidden">
    <thead>
      <tr className="bg-indigo-600 text-white text-xs sm:text-sm">
        <th className="w-1/3 px-2 py-2 sm:px-3 sm:py-2 text-left whitespace-nowrap">Month</th>
        <th className="w-1/3 px-2 py-2 sm:px-3 sm:py-2 text-left whitespace-nowrap">Total Quantity</th>
        <th className="w-1/3 px-2 py-2 sm:px-3 sm:py-2 text-left whitespace-nowrap">Monthly Growth</th>
      </tr>
    </thead>
    <tbody>
      {trends.map((trend, index) => (
        <tr key={index} className="border-b hover:bg-gray-100 text-xs sm:text-sm">
          <td className="w-1/3 px-2 py-2 sm:px-3 sm:py-2 text-left whitespace-nowrap">{trend.month}</td>
          <td className="w-1/3 px-2 py-2 sm:px-3 sm:py-2 text-left whitespace-nowrap">{trend.total_quantity}</td>
          <td className="w-1/3 px-2 py-2 sm:px-3 sm:py-2 text-left whitespace-nowrap">
            <span className={trend.monthly_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
              {trend.monthly_growth >= 0 ? '⬆' : '⬇'} {Math.round(trend.monthly_growth * 100)}%
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      {showCharts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-indigo-600 mb-2">Monthly Growth</h2>
            <div className="h-64 sm:h-80">
              <Line data={growthChartData} options={chartOptions} />
            </div>
            <div className="mt-2 text-sm">{growthInsight}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-indigo-600 mb-2">Top Products in June 2025</h2>
            <div className="h-64 sm:h-80">
              <Bar data={topProductsChartData} options={chartOptions} />
            </div>
            <div className="mt-2 text-sm">{topProductsInsight}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTrends;