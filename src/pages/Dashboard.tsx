import React, { useState, useEffect } from 'react';
import { BarChart3, PlusCircle, MinusCircle, Package, TrendingUp, Truck, Users } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import FilterBar from '../components/layout/FilterBar.js';
import MetricsCard from '../components/dashboard/MetricsCard.js';
import Card from '../components/ui/Card.js';
import MovementModal from '../components/dashboard/MovementModal.js';
import axios from 'axios';  

interface Base {
  base_id: number;
  base_name: string;
  name?: string;
  location: string;
}

interface Metrics {
  openingBalance: number;
  closing: number;
  purchases: number;
  transferIn: number;
  transferOut: number;
  assigned: number;
  expended: number;
  netMovement: number;
  percentChange: number;
}

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

  const [bases, setBases] = useState<Base[]>([]);
  const [metrics, setMetrics] = useState<{[key: string]: Metrics}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default to first base if none selected
  const activeBaseId = filters.baseId || (bases.length > 0 ? bases[0].base_id.toString() : '1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch bases
        const basesResponse = await axios.get('/api/bases');
        const basesData = basesResponse.data;
        setBases(basesData);
        
        // Set default dates if not provided in filters
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const startDate = filters.dateRange?.startDate || oneMonthAgo.toISOString().split('T')[0];
        const endDate = filters.dateRange?.endDate || today.toISOString().split('T')[0];
        
        // Initialize metrics object
        const formattedMetrics: {[key: string]: Metrics} = {};
        
        // Determine which bases to fetch metrics for
        const basesToFetch = filters.baseId 
          ? basesData.filter((base: any) => base.base_id.toString() === filters.baseId)
          : basesData;
        
        // Fetch metrics for each base
        const fetchPromises = basesToFetch.map(async (base: any) => {
          try {
            const baseId = base.base_id.toString();
            
            const metricsResponse = await axios.get('/api/dashboard/metrics', {
              params: {
                base_id: baseId,
                start_date: startDate,
                end_date: endDate,
                type_id: filters.assetType || ''
              }
            });
            
            const metricsData = metricsResponse.data;
            
            // Calculate totals across all equipment types
            let totalOpeningBalance = 0;
            let totalClosingBalance = 0;
            let totalPurchases = 0;
            let totalTransfersIn = 0;
            let totalTransfersOut = 0;
            let totalAssigned = 0;
            let totalExpended = 0;
            
            if (Array.isArray(metricsData)) {
              metricsData.forEach((item: any) => {
                totalOpeningBalance += parseInt(item.opening_balance) || 0;
                totalClosingBalance += parseInt(item.closing_balance) || 0;
                totalPurchases += parseInt(item.total_purchases) || 0;
                totalTransfersIn += parseInt(item.total_transfers_in) || 0;
                totalTransfersOut += parseInt(item.total_transfers_out) || 0;
                totalAssigned += parseInt(item.total_assigned) || 0;
                totalExpended += parseInt(item.total_expended) || 0;
              });
            } else if (metricsData && typeof metricsData === 'object') {
              totalOpeningBalance = parseInt(metricsData.opening_balance) || 0;
              totalClosingBalance = parseInt(metricsData.closing_balance) || 0;
              totalPurchases = parseInt(metricsData.total_purchases) || 0;
              totalTransfersIn = parseInt(metricsData.total_transfers_in) || 0;
              totalTransfersOut = parseInt(metricsData.total_transfers_out) || 0;
              totalAssigned = parseInt(metricsData.total_assigned) || 0;
              totalExpended = parseInt(metricsData.total_expended) || 0;
            }
            
            // Calculate net movement and percent change
            const netMovement = totalPurchases + totalTransfersIn - totalTransfersOut;
            const percentChange = totalOpeningBalance > 0 
              ? ((totalClosingBalance - totalOpeningBalance) / totalOpeningBalance) * 100 
              : 0;
            
            formattedMetrics[baseId] = {
              openingBalance: totalOpeningBalance,
              closing: totalClosingBalance,
              purchases: totalPurchases,
              transferIn: totalTransfersIn,
              transferOut: totalTransfersOut,
              assigned: totalAssigned,
              expended: totalExpended,
              netMovement,
              percentChange
            };
          } catch (err) {
            console.error(`Error fetching metrics for base ${base.base_id}:`, err);
          }
        });
        
        await Promise.all(fetchPromises);
        setMetrics(formattedMetrics);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  const getBaseNameById = (id: string) => {
    const base = bases.find(b => b.base_id.toString() === id);
    return base ? (base.base_name || base.name) : 'Unknown Base';
  };

  const openModal = (baseId: string, type: 'purchases' | 'transfers-in' | 'transfers-out') => {
    setModalState({ isOpen: true, baseId, type });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  // Prepare chart data
  const basesToShow = filters.baseId 
    ? bases.filter(base => base.base_id.toString() === filters.baseId)
    : bases;
    
  const chartData = basesToShow.map(base => {
    const baseId = base.base_id.toString();
    const baseMetrics = metrics[baseId] || {
      openingBalance: 0,
      closing: 0,
      purchases: 0,
      transferIn: 0,
      transferOut: 0,
      assigned: 0,
      expended: 0,
      netMovement: 0,
      percentChange: 0
    };
    
    return {
      name: base.base_name || base.name,
      opening: baseMetrics.openingBalance,
      closing: baseMetrics.closing,
      purchases: baseMetrics.purchases,
      transferIn: baseMetrics.transferIn,
      transferOut: baseMetrics.transferOut,
      assigned: baseMetrics.assigned
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600 text-center">
          <p className="text-xl font-bold mb-2">Error</p>
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-navy-600 text-white rounded hover:bg-navy-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeMetrics = metrics[activeBaseId] || {
    openingBalance: 0,
    closing: 0,
    purchases: 0,
    transferIn: 0,
    transferOut: 0,
    assigned: 0,
    expended: 0,
    netMovement: 0,
    percentChange: 0
  };

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
          value={activeMetrics.openingBalance} 
          icon={<Package size={24} className="text-navy-600" />} 
          color="border-navy-600" 
        />
        
        <MetricsCard 
          title="Net Movement" 
          value={activeMetrics.netMovement}
          previousValue={0}
          percentChange={activeMetrics.percentChange.toFixed(1)}
          icon={<TrendingUp size={24} className="text-olive-600" />} 
          color="border-olive-600" 
          onClick={() => {}}
        />
        
        <MetricsCard 
          title="Assigned" 
          value={activeMetrics.assigned} 
          icon={<Users size={24} className="text-blue-600" />} 
          color="border-blue-600" 
        />
        
        <MetricsCard 
          title="Closing Balance" 
          value={activeMetrics.closing} 
          previousValue={activeMetrics.openingBalance}
          percentChange={activeMetrics.percentChange.toFixed(1)}
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
                {activeMetrics.purchases}
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
                {activeMetrics.transferIn}
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
                {activeMetrics.transferOut}
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
