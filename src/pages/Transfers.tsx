import React, { useState } from 'react';
import { Plus, Search, Truck } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext';
import { mockTransfers, mockBases } from '../data/mockData';
import Button from '../components/ui/Button';
import FilterBar from '../components/layout/FilterBar';
import Table from '../components/ui/Table';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Transfers: React.FC = () => {
  const { filters } = useFilter();
  const [searchTerm, setSearchTerm] = useState('');

  const getBaseNameById = (id: string) => {
    const base = mockBases.find(b => b.id === id);
    return base ? base.name : 'Unknown Base';
  };

  const filteredTransfers = mockTransfers.filter(transfer => {
    // Apply date filter
    if (filters.dateRange && 
        (transfer.date < filters.dateRange.startDate || 
         transfer.date > filters.dateRange.endDate)) {
      return false;
    }
    
    // Apply base filter (either from or to base)
    if (filters.baseId && 
        transfer.fromBaseId !== filters.baseId && 
        transfer.toBaseId !== filters.baseId) {
      return false;
    }
    
    // Apply asset type filter
    if (filters.assetType && transfer.assetType !== filters.assetType) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm && !transfer.assetName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'in_transit':
        return <Badge variant="warning">In Transit</Badge>;
      case 'pending':
        return <Badge variant="info">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Asset Transfers</h1>
          <p className="text-gray-600">
            Manage asset transfers between military bases
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="primary" 
            icon={<Plus size={16} />}
          >
            New Transfer
          </Button>
        </div>
      </div>

      <FilterBar />

      <Card>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transfers..."
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

        {filteredTransfers.length > 0 ? (
          <Table headers={['Date', 'Asset', 'From Base', 'To Base', 'Quantity', 'Status']}>
            {filteredTransfers.map(transfer => (
              <tr key={transfer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transfer.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-navy-800">
                  {transfer.assetName} <span className="text-gray-500 capitalize">({transfer.assetType})</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getBaseNameById(transfer.fromBaseId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getBaseNameById(transfer.toBaseId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transfer.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(transfer.status)}
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="text-center py-12">
            <Truck size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">No transfers found</h3>
            <p className="text-gray-400">
              {searchTerm 
                ? "Try adjusting your search or filters"
                : "Create a new transfer using the button above"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transfers;