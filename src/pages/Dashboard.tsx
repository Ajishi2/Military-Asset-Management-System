import React, { useState, useEffect } from 'react';
import { BarChart3, PlusCircle, MinusCircle, Package, TrendingUp, Truck, Users } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import FilterBar from '../components/layout/FilterBar.js';
import MetricsCard from '../components/dashboard/MetricsCard.js';
import Card from '../components/ui/Card.js';
import MovementModal from '../components/dashboard/MovementModal.js';
import api from '../services/api.js';  

interface Base {
  base_id: number;
  base_name: string; // Changed from 'name' to match API response
  name?: string;     // Keep as optional for backward compatibility
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
  console.log('Dashboard component mounted');
  console.log('API base URL:', import.meta.env.VITE_API_BASE_URL);
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

  // Default to first base if none selected, or use the selected base from filters
  const activeBaseId = filters.baseId || (bases.length > 0 ? bases[0].base_id.toString() : '1');

  // Fetch bases and metrics data
  useEffect(() => {
    console.log('Dashboard useEffect triggered with filters:', filters);
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data with filters:', filters);
        
        // Fetch bases using the configured API instance
        const basesResponse = await api.get('/bases');
        const basesData = basesResponse.data;
        console.log('Bases data:', basesData);
        setBases(basesData);
        
        // Set default dates if not provided in filters
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const startDate = filters.dateRange?.startDate || oneMonthAgo.toISOString().split('T')[0];
        const endDate = filters.dateRange?.endDate || today.toISOString().split('T')[0];
        
        // Initialize an empty metrics object
        const formattedMetrics: {[key: string]: Metrics} = {};
        
        // Determine which bases to fetch metrics for based on filters
        const basesToFetch = filters.baseId 
          ? basesData.filter((base: any) => base.base_id.toString() === filters.baseId)
          : basesData;
        
        console.log('Fetching metrics for bases:', basesToFetch.map((b: any) => b.base_name || b.name));
        
        // Fetch metrics for filtered bases to populate the graph
        const fetchPromises = basesToFetch.map(async (base: any) => {
          try {
            const baseId = base.base_id.toString();
            console.log(`Fetching metrics for base ${baseId} with params:`, {
              base_id: baseId,
              start_date: startDate,
              end_date: endDate,
              type_id: filters.assetType || ''
            });
            
            // Use the configured API instance for metrics
            const metricsResponse = await api.get('/dashboard/metrics', {
              params: {
                base_id: baseId,
                start_date: startDate,
                end_date: endDate,
                type_id: filters.assetType || ''
              }
            });
            
            const metricsData = metricsResponse.data;
            
            console.log(`Raw metrics data for base ${baseId}:`, metricsData);
            
            // Transform the metrics data into the expected format
            // Calculate totals across all equipment types for this base
            let totalOpeningBalance = 0;
            let totalClosingBalance = 0;
            let totalPurchases = 0;
            let totalTransfersIn = 0;
            let totalTransfersOut = 0;
            let totalAssigned = 0;
            let totalExpended = 0;
            
            // Process each equipment type's metrics
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
              // Handle case where API returns a single object instead of an array
              totalOpeningBalance = parseInt(metricsData.opening_balance) || 0;
              totalClosingBalance = parseInt(metricsData.closing_balance) || 0;
              totalPurchases = parseInt(metricsData.total_purchases) || 0;
              totalTransfersIn = parseInt(metricsData.total_transfers_in) || 0;
              totalTransfersOut = parseInt(metricsData.total_transfers_out) || 0;
              totalAssigned = parseInt(metricsData.total_assigned) || 0;
              totalExpended = parseInt(metricsData.total_expended) || 0;
            }
            
            // Calculate net movement
            const netMovement = totalPurchases + totalTransfersIn - totalTransfersOut;
            
            // Calculate percent change from opening to closing balance
            const percentChange = totalOpeningBalance > 0 
              ? ((totalClosingBalance - totalOpeningBalance) / totalOpeningBalance) * 100 
              : 0;
            
            // Store the calculated totals
            formattedMetrics[baseId] = {
              openingBalance: totalOpeningBalance,
              closing: totalClosingBalance,
              purchases: totalPurchases,
              transferIn: totalTransfersIn,
              transferOut: totalTransfersOut,
              assigned: totalAssigned,
              expended: totalExpended,
              netMovement: netMovement,
              percentChange: percentChange
            };
            
            console.log(`Calculated metrics for base ${baseId}:`, formattedMetrics[baseId]);
          } catch (err) {
            console.error(`Error fetching metrics for base ${base.base_id}:`, err);
          }
        });
        
        // Wait for all fetches to complete
        await Promise.all(fetchPromises);
        
        console.log('Formatted metrics for all bases:', formattedMetrics);
        setMetrics(formattedMetrics);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]); // Re-fetch when filters change

  // This function is used when displaying modal titles
  const getBaseNameById = (id: string) => {
    const base = bases.find(b => b.base_id.toString() === id);
    return base ? (base.base_name || base.name) : 'Unknown Base';
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

  // Prepare chart data from real API data
  // If a base filter is applied, only show that base, otherwise show all bases
  const basesToShow = filters.baseId 
    ? bases.filter(base => base.base_id.toString() === filters.baseId)
    : bases;
    
  console.log('Bases to show in chart:', basesToShow.map(b => b.base_name || b.name));
  
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
    
    // Log each base's metrics to debug
    console.log(`Metrics for base ${baseId} (${base.base_name || base.name}):`, baseMetrics);
    
    return {
      name: base.base_name || base.name, // Handle both property names
      opening: baseMetrics.openingBalance,
      closing: baseMetrics.closing,
      purchases: baseMetrics.purchases,
      transferIn: baseMetrics.transferIn,
      transferOut: baseMetrics.transferOut,
      assigned: baseMetrics.assigned,
      expended: baseMetrics.expended
    };
  });
  
  console.log('Chart data prepared:', chartData);
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
      </div>
    );
  }
  
  // Show error state
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
  
  // Get active metrics or default empty values
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