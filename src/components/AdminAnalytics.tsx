import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Calendar, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  Award, 
  Layers, 
  Filter,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { OrderRecord, Product, StoreSettings } from '../types';
import { formatCurrency } from '../utils/whatsapp';

interface AdminAnalyticsProps {
  orders: OrderRecord[];
  products: Product[];
  settings: StoreSettings;
  onAddSampleOrders?: () => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  orders,
  products,
  settings,
  onAddSampleOrders,
}) => {
  const [timeRange, setTimeRange] = useState<'7days' | '14days' | '30days' | 'all'>('7days');
  const [chartMetric, setChartMetric] = useState<'orders' | 'revenue'>('orders');

  // Filter orders by selected time range
  const filteredOrders = useMemo(() => {
    if (orders.length === 0) return [];
    if (timeRange === 'all') return orders;

    const days = timeRange === '7days' ? 7 : timeRange === '14days' ? 14 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0);

    return orders.filter((o) => {
      // try createdAt first, or parse date string (YYYY-MM-DD or formatted)
      const orderDate = o.createdAt 
        ? new Date(o.createdAt) 
        : o.date && o.date.includes('-') 
          ? new Date(o.date) 
          : new Date();
      return orderDate >= cutoffDate;
    });
  }, [orders, timeRange]);

  // High-level KPI computations
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [filteredOrders]);

  const totalOrdersCount = filteredOrders.length;

  const totalUnitsSold = useMemo(() => {
    return filteredOrders.reduce((sum, o) => {
      const itemsCount = o.items?.reduce((iSum, item) => iSum + item.quantity, 0) || 0;
      return sum + itemsCount;
    }, 0);
  }, [filteredOrders]);

  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // 1. Group Orders by Day for Daily Orders Chart
  const dailyChartData = useMemo(() => {
    const daysCount = timeRange === '7days' ? 7 : timeRange === '14days' ? 14 : 30;
    const dateMap = new Map<string, { dateStr: string; label: string; orders: number; revenue: number }>();

    // Generate consecutive dates up to today
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });
      
      dateMap.set(isoDate, {
        dateStr: isoDate,
        label: `${dayName} ${monthDay}`,
        orders: 0,
        revenue: 0,
      });
    }

    // Populate actual counts from filtered orders
    filteredOrders.forEach((o) => {
      let iso = '';
      if (o.createdAt) {
        iso = o.createdAt.slice(0, 10);
      } else if (o.date && o.date.includes('-')) {
        iso = o.date;
      }
      
      if (iso && dateMap.has(iso)) {
        const current = dateMap.get(iso)!;
        current.orders += 1;
        current.revenue += o.total;
      } else if (iso) {
        // If outside generated sequence (e.g. for 'all' mode)
        const d = new Date(iso);
        const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
        const monthDay = d.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });
        dateMap.set(iso, {
          dateStr: iso,
          label: `${dayName} ${monthDay}`,
          orders: 1,
          revenue: o.total,
        });
      }
    });

    return Array.from(dateMap.values());
  }, [filteredOrders, timeRange]);

  // 2. Best-Selling Products calculation
  const bestSellingProducts = useMemo(() => {
    const productSalesMap = new Map<
      string,
      {
        id: string;
        name: string;
        image: string;
        quantity: number;
        revenue: number;
        category: string;
      }
    >();

    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const prodId = item.id;
        const matchingProduct = products.find((p) => p.id === prodId || p.name === item.name);
        const category = matchingProduct?.category || 'عام';
        const image = matchingProduct?.image || item.image;

        if (productSalesMap.has(item.name)) {
          const entry = productSalesMap.get(item.name)!;
          entry.quantity += item.quantity;
          entry.revenue += item.subtotal || item.price * item.quantity;
        } else {
          productSalesMap.set(item.name, {
            id: prodId,
            name: item.name,
            image,
            quantity: item.quantity,
            revenue: item.subtotal || item.price * item.quantity,
            category,
          });
        }
      });
    });

    return Array.from(productSalesMap.values()).sort((a, b) => b.quantity - a.quantity);
  }, [filteredOrders, products]);

  // Top 5 Products for the Bar Chart
  const topProductsChartData = useMemo(() => {
    return bestSellingProducts.slice(0, 6).map((item) => ({
      name: item.name.length > 18 ? item.name.slice(0, 18) + '...' : item.name,
      fullName: item.name,
      'الكمية المباعة': item.quantity,
      'إجمالي الإيراد': item.revenue,
    }));
  }, [bestSellingProducts]);

  // Category breakdown for Pie Chart
  const categoryData = useMemo(() => {
    const catMap = new Map<string, number>();
    bestSellingProducts.forEach((item) => {
      catMap.set(item.category, (catMap.get(item.category) || 0) + item.quantity);
    });

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];
    return Array.from(catMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [bestSellingProducts]);

  // Find peak day
  const peakDay = useMemo(() => {
    if (dailyChartData.length === 0) return null;
    return [...dailyChartData].sort((a, b) => b.orders - a.orders)[0];
  }, [dailyChartData]);

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Analytics Header & Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                لوحة الإحصائيات ورسوم الأداء
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                متابعة دقيقة لعدد الطلبات اليومية وأكثر المنتجات مبيعاً وحجم المبيعات
              </p>
            </div>
          </div>
        </div>

        {/* Time range selector pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 self-stretch sm:self-auto text-xs font-bold">
          <button
            onClick={() => setTimeRange('7days')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl transition cursor-pointer ${
              timeRange === '7days' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            آخر 7 أيام
          </button>
          <button
            onClick={() => setTimeRange('14days')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl transition cursor-pointer ${
              timeRange === '14days' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            آخر 14 يوماً
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl transition cursor-pointer ${
              timeRange === '30days' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            آخر 30 يوماً
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl transition cursor-pointer ${
              timeRange === 'all' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            الكل
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Total Orders */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الطلبات</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {totalOrdersCount}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>خلال الفترة المحددة</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المبيعات</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {formatCurrency(totalRevenue, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1.5">
            قيمة الفواتير المطلوبة
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">القطع المباعة</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {totalUnitsSold} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">قطعة</span>
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold mt-1.5">
            من مختلف الأصناف
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">متوسط قيمة الطلب</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {formatCurrency(averageOrderValue, settings.currency)}
          </div>
          <div className="text-[11px] text-purple-700 dark:text-purple-400 font-bold mt-1.5">
            لكل فاتورة مستلمة
          </div>
        </div>

      </div>

      {/* ==================== CHART 1: DAILY ORDERS & REVENUE ==================== */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100">
                رسم بياني: عدد الطلبات اليومية
              </h4>
              <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                مباشر
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              توزيع عدد طلبات الشراء عبر الأيام ومقارنة حركة المبيعات اليومية
            </p>
          </div>

          {/* Metric toggle: Orders vs Revenue */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setChartMetric('orders')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                chartMetric === 'orders'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              عدد الطلبات (طلبات)
            </button>
            <button
              onClick={() => setChartMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                chartMetric === 'revenue'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              حجم المبيعات ({settings.currency})
            </button>
          </div>
        </div>

        {/* Recharts Area / Line Chart */}
        <div className="h-72 w-full pt-2" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b820" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#64748b40' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#64748b40' }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1 text-right border border-slate-700" dir="rtl">
                        <div className="font-bold text-slate-300 border-b border-slate-700 pb-1">
                          📅 {data.label}
                        </div>
                        <div className="flex items-center justify-between gap-4 font-black text-emerald-400">
                          <span>عدد الطلبات:</span>
                          <span className="font-mono text-sm">{data.orders} طلب</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 font-bold text-blue-300">
                          <span>إجمالي المبيعات:</span>
                          <span className="font-mono text-sm">{formatCurrency(data.revenue, settings.currency)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {chartMetric === 'orders' ? (
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="عدد الطلبات"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#orderGradient)"
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="المبيعات"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Peak day highlight snippet */}
        {peakDay && peakDay.orders > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>
                <strong>اليوم الأعلى طلباً:</strong> سجل يوم {peakDay.label} أعلى نشاط بإجمالي <strong>{peakDay.orders} طلبات</strong> بمبيعات بلغت <strong>{formatCurrency(peakDay.revenue, settings.currency)}</strong>.
              </span>
            </span>
          </div>
        )}
      </div>

      {/* ==================== CHARTS 2 & 3: BEST SELLERS & CATEGORY BREAKDOWN ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Products Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>رسم بياني: أكثر المنتجات مبيعاً (بالقطع المباعة)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ترتيب الأصناف الأكثر طلباً من قبل الزبائن في الفواتير
            </p>
          </div>

          {topProductsChartData.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
              لا توجد مبيعات مسجلة في هذه الفترة لعرض الرسم البياني.
            </div>
          ) : (
            <div className="h-72 w-full pt-2" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductsChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b820" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    width={110}
                    axisLine={{ stroke: '#64748b40' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1 text-right border border-slate-700" dir="rtl">
                            <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                              🏷️ {data.fullName}
                            </div>
                            <div className="flex justify-between gap-4 font-black text-emerald-400">
                              <span>القطع المباعة:</span>
                              <span className="font-mono">{data['الكمية المباعة']} قطعة</span>
                            </div>
                            <div className="flex justify-between gap-4 font-bold text-blue-300">
                              <span>إجمالي الإيراد:</span>
                              <span className="font-mono">{formatCurrency(data['إجمالي الإيراد'], settings.currency)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="الكمية المباعة"
                    fill="#10b981"
                    radius={[0, 8, 8, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Share Donut / Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between transition-colors">
          <div>
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="font-black text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>توزيع المبيعات حسب الأقسام</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                نسبة إقبال العملاء على كل فئة
              </p>
            </div>

            {categoryData.length === 0 ? (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
                لا توجد بيانات أصناف كافية
              </div>
            ) : (
              <div className="h-56 w-full relative" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value} قطعة`, `قسم ${name}`]}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', textAlign: 'right' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-400 font-bold">المجموع</span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100">{totalUnitsSold}</span>
                </div>
              </div>
            )}
          </div>

          {/* Category Legends */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {categoryData.slice(0, 6).map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                <span className="truncate text-slate-600 dark:text-slate-400 font-medium">{cat.name}:</span>
                <strong className="text-slate-900 dark:text-slate-100 font-mono">{cat.value}</strong>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ==================== LEADERBOARD TABLE OF BEST SELLERS ==================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-5 sm:p-6 space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>جدول صدارة المنتجات الأكثر طلباً ومبيعاً</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              تفاصيل الكميات المباعة والإيراد الناتج عن كل منتج مرتبة تنازلياً
            </p>
          </div>

          <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
            {bestSellingProducts.length} منتج مسجل مبيعاته
          </span>
        </div>

        {bestSellingProducts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            لا توجد مبيعات في الفترة المختارة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-3 text-center">الترتيب</th>
                  <th className="py-3 px-3">المنتج</th>
                  <th className="py-3 px-3 text-center">القسم</th>
                  <th className="py-3 px-3 text-center">الكمية المباعة</th>
                  <th className="py-3 px-3 text-left">إجمالي الإيراد</th>
                  <th className="py-3 px-3 text-center">نسبة المساهمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bestSellingProducts.map((item, index) => {
                  const sharePercentage = totalUnitsSold > 0 ? Math.round((item.quantity / totalUnitsSold) * 100) : 0;
                  return (
                    <tr key={item.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      {/* Rank */}
                      <td className="py-3 px-3 text-center">
                        {index === 0 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-black text-xs">
                            🥇 1
                          </span>
                        ) : index === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs">
                            🥈 2
                          </span>
                        ) : index === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-black text-xs border border-amber-200 dark:border-amber-800">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-slate-400 dark:text-slate-500">
                            #{index + 1}
                          </span>
                        )}
                      </td>

                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80'}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80';
                            }}
                          />
                          <div>
                            <div className="font-black text-slate-900 dark:text-slate-100 line-clamp-1">{item.name}</div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">كود: {item.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300 font-semibold">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-lg text-xs">
                          {item.category}
                        </span>
                      </td>

                      {/* Quantity Sold */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block font-black text-emerald-700 dark:text-emerald-400 text-sm font-mono bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-xl">
                          {item.quantity} قطعة
                        </span>
                      </td>

                      {/* Revenue */}
                      <td className="py-3 px-3 text-left font-black text-slate-900 dark:text-slate-100 font-mono text-sm">
                        {formatCurrency(item.revenue, settings.currency)}
                      </td>

                      {/* Share progress bar */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${sharePercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{sharePercentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
