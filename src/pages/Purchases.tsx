import React, { useState } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext';
import { mockPurchases, mockBases } from '../data/mockData';
import Button from '../components/ui/Button';
import FilterBar from '../components/layout/FilterBar';
import Table from '../components/ui/Table';
import Card from '../components/ui/Card';

const Purchases: React.FC = () => {
  const { filters } = useFilter();
  const [searchTerm, setSearchTerm] = useState('');

  const getBaseNameById = (id: string) => {
    const base = mockBases.find(b => b.id === id);
    return base ? base.name : 'Unknown Base';
  };

  const filteredPurchases = mockPurchases.filter(purchase => {
    // Apply date filter
    if (filters.dateRange && 
        (purchase.date < filters.dateRange.startDate || 
         purchase.date > filters.dateRange.endDate)) {
      return false;
    }
    
    // Apply base filter
    if (filters.baseId && purchase.baseId !== filters.baseId) {
      return false;
    }
    
    // Apply asset type filter
    if (filters.assetType && purchase.assetType !== filters.assetType) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm && !purchase.assetName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Asset Purchases</h1>
          <p className="text-gray-600">
            Record and view purchase history of military assets
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="primary" 
            icon={<Plus size={16} />}
          >
            New Purchase
          </Button>
        </div>
      </div>

      <FilterBar />

      <Card>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
          </div>
        </div>

        {filteredPurchases.length > 0 ? (
          <Table headers={['Date', 'Asset', 'Type', 'Base', 'Quantity', 'Total Cost']}>
            {filteredPurchases.map(purchase => (
              <tr key={purchase.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {purchase.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-navy-800">
                  {purchase.assetName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {purchase.assetType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getBaseNameById(purchase.baseId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {purchase.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${purchase.cost.toLocaleString()}
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">No purchases found</h3>
            <p className="text-gray-400">
              {searchTerm 
                ? "Try adjusting your search or filters"
                : "Add a new purchase using the button above"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Purchases;