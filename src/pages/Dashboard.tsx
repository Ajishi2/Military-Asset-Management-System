import React, { useState } from 'react';
import { BarChart3, PlusCircle, MinusCircle, Package, TrendingUp, Truck, Users } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext';
import { mockBalanceMetrics, mockBases } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import FilterBar from '../components/layout/FilterBar';
import MetricsCard from '../components/dashboard/MetricsCard';
import Card from '../components/ui/Card';
import MovementModal from '../components/dashboard/MovementModal';

const Dashboard: React.FC = () => {
  const { filters } = useFilter();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    baseId: string;
    type: 'purchases' | 'transfers-in' | 'transfers-out';
  }>({
    isOpen: false,
    baseId: '',
    type: 'purchases'
  });

  // Default to first base if none selected
  const activeBaseId = filters.baseId || '1';
  const metrics = mockBalanceMetrics[activeBaseId];

  const getBaseNameById = (id: string) => {
    const base = mockBases.find(b => b.id === id);
    return base ? base.name : 'Unknown Base';
  };

  const openModal = (baseId: string, type: 'purchases' | 'transfers-in' | 'transfers-out') => {
    setModalState({
      isOpen: true,
      baseId,
      type
    });
  };

  const closeModal = () => {
    setModalState({
      ...modalState,
      isOpen: false
    });
  };

  // Chart data
  const chartData = mockBases.map(base => {
    const baseMetrics = mockBalanceMetrics[base.id];
    return {
      name: base.name,
      opening: baseMetrics.openingBalance,
      closing: baseMetrics.closing,
      purchases: baseMetrics.purchases,
      transferIn: baseMetrics.transferIn,
      transferOut: baseMetrics.transferOut,
      assigned: baseMetrics.assigned,
      expended: baseMetrics.expended
    };
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Asset Management Dashboard</h1>
        <p className="text-gray-600">
          Overview of asset balances, movements, and assignments across bases
        </p>
      </div>

      <FilterBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricsCard 
          title="Opening Balance" 
          value={metrics.openingBalance} 
          icon={<Package size={24} className="text-navy-600" />} 
          color="border-navy-600" 
        />
        
        <MetricsCard 
          title="Net Movement" 
          value={metrics.purchases + metrics.transferIn - metrics.transferOut} 
          previousValue={metrics.purchases * 0.8} 
          icon={<TrendingUp size={24} className="text-olive-600" />} 
          color="border-olive-600" 
          onClick={() => {}}
        />
        
        <MetricsCard 
          title="Assigned" 
          value={metrics.assigned} 
          icon={<Users size={24} className="text-blue-600" />} 
          color="border-blue-600" 
        />
        
        <MetricsCard 
          title="Closing Balance" 
          value={metrics.closing} 
          previousValue={metrics.openingBalance} 
          icon={<BarChart3 size={24} className="text-green-600" />} 
          color="border-green-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card 
          title="Purchases" 
          className="lg:col-span-1"
          onClick={() => openModal(activeBaseId, 'purchases')}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-navy-800">
                {metrics.purchases}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                New assets added
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <PlusCircle size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card 
          title="Transfers In" 
          className="lg:col-span-1"
          onClick={() => openModal(activeBaseId, 'transfers-in')}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-navy-800">
                {metrics.transferIn}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Assets received
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Truck size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card 
          title="Transfers Out" 
          className="lg:col-span-1"
          onClick={() => openModal(activeBaseId, 'transfers-out')}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-navy-800">
                {metrics.transferOut}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Assets sent out
              </div>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <MinusCircle size={24} className="text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <Card title="Asset Balances Across Bases">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="opening" name="Opening Balance" fill="#0A2463" />
                <Bar dataKey="closing" name="Closing Balance" fill="#4E6E58" />
                <Bar dataKey="purchases" name="Purchases" fill="#3498db" />
                <Bar dataKey="assigned" name="Assigned" fill="#e67e22" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      <MovementModal 
        isOpen={modalState.isOpen}
        onClose={closeModal}
        baseId={modalState.baseId}
        type={modalState.type}
        startDate={filters.dateRange?.startDate || ''}
        endDate={filters.dateRange?.endDate || ''}
      />
    </div>
  );
};

export default Dashboard;