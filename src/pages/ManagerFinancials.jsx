import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGCard from '@/components/ui/KGCard';
import { 
  LayoutDashboard, Users, FileText, Scale, Truck, ShoppingCart, 
  DollarSign, Loader2, TrendingUp, TrendingDown, Minus 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ManagerFinancials() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [salesQuotes, setSalesQuotes] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchases, setPurchases] = useState([]);



  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      navigate(createPageUrl('ManagerLogin'));
      return;
    }

    const userData = await base44.auth.me();
    setUser(userData);

    const profiles = await base44.entities.UserProfile.filter({ user_email: userData.email });
    if (!profiles.length || profiles[0].role !== 'manager') {
      navigate(createPageUrl('ManagerLogin'));
      return;
    }
    setProfile(profiles[0]);

    const quotes = await base44.entities.SalesQuote.list();
    setSalesQuotes(quotes);

    const pos = await base44.entities.PurchaseOrder.list();
    setPurchaseOrders(pos);

    const allPurchases = await base44.entities.Purchase.list();
    setPurchases(allPurchases);

    setLoading(false);
  };



  // Calculate financials
  const revenue = salesQuotes
    .filter(q => q.status === 'approved' || q.status === 'completed')
    .reduce((sum, q) => sum + (q.total || 0), 0);

  const productionCost = purchaseOrders
    .reduce((sum, po) => sum + (po.total_cost || 0), 0);

  const operationalCost = purchases
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalSpend = productionCost + operationalCost;
  const profit = revenue - totalSpend;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

  // Monthly data for chart
  const getMonthlyData = () => {
    const months = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { month: d.toLocaleDateString('en', { month: 'short' }), revenue: 0, spend: 0, profit: 0 };
    }

    // Add revenue from quotes
    salesQuotes
      .filter(q => q.status === 'approved' || q.status === 'completed')
      .forEach(q => {
        const d = new Date(q.created_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (months[key]) {
          months[key].revenue += q.total || 0;
        }
      });

    // Add spend from POs
    purchaseOrders.forEach(po => {
      const d = new Date(po.created_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].spend += po.total_cost || 0;
      }
    });

    // Add spend from purchases
    purchases.forEach(p => {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].spend += p.amount || 0;
      }
    });

    // Calculate profit
    Object.values(months).forEach(m => {
      m.profit = m.revenue - m.spend;
    });

    return Object.values(months);
  };

  const chartData = getMonthlyData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-[#00C600]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign size={24} className="text-[#00C600]" />
            <h1 className="text-xl text-[#00c600]">Financials</h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KGCard>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-2xl text-[#00C600]">${revenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="text-[#00C600]" size={24} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {salesQuotes.filter(q => q.status === 'approved' || q.status === 'completed').length} completed orders
              </p>
            </KGCard>

            <KGCard>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Spend</p>
                  <p className="text-2xl text-red-500">${totalSpend.toFixed(2)}</p>
                </div>
                <TrendingDown className="text-red-500" size={24} />
              </div>
              <div className="text-xs text-gray-400 mt-2">
                <p>Production: ${productionCost.toFixed(2)}</p>
                <p>Operations: ${operationalCost.toFixed(2)}</p>
              </div>
            </KGCard>

            <KGCard>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Profit</p>
                  <p className={`text-2xl ${profit >= 0 ? 'text-[#00C600]' : 'text-red-500'}`}>
                    ${profit.toFixed(2)}
                  </p>
                </div>
                {profit > 0 ? (
                  <TrendingUp className="text-[#00C600]" size={24} />
                ) : profit < 0 ? (
                  <TrendingDown className="text-red-500" size={24} />
                ) : (
                  <Minus className="text-gray-400" size={24} />
                )}
              </div>
            </KGCard>

            <KGCard>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Margin</p>
                  <p className={`text-2xl ${parseFloat(margin) >= 0 ? 'text-[#00C600]' : 'text-red-500'}`}>
                    {margin}%
                  </p>
                </div>
              </div>
            </KGCard>
          </div>

          {/* Monthly Chart */}
          <KGCard className="mb-8">
            <h2 className="text-lg text-gray-800 mb-4">Monthly Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    formatter={(value) => `$${value.toFixed(2)}`}
                    contentStyle={{ border: '2px solid #00C600', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#00C600" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spend" name="Spend" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </KGCard>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <KGCard>
              <h3 className="text-base text-gray-800 mb-4">Top Revenue Sources</h3>
              <div className="space-y-2">
                {salesQuotes
                  .filter(q => q.status === 'approved' || q.status === 'completed')
                  .sort((a, b) => (b.total || 0) - (a.total || 0))
                  .slice(0, 5)
                  .map((q) => (
                    <div key={q.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm">{q.quote_id}</span>
                      <span className="text-[#00C600]">${q.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  ))}
              </div>
            </KGCard>

            <KGCard>
              <h3 className="text-base text-gray-800 mb-4">Expense Categories</h3>
              <div className="space-y-2">
                {Object.entries(
                  purchases.reduce((acc, p) => {
                    const cat = p.category || 'other';
                    acc[cat] = (acc[cat] || 0) + (p.amount || 0);
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, total]) => (
                    <div key={cat} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm capitalize">{cat}</span>
                      <span className="text-red-500">${total.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </KGCard>
          </div>
    </div>
  );
}