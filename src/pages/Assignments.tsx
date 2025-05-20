import React, { useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext';
import { mockAssignments, mockBases } from '../data/mockData';
import Button from '../components/ui/Button';
import FilterBar from '../components/layout/FilterBar';
import Table from '../components/ui/Table';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Assignments: React.FC = () => {
  const { filters } = useFilter();
  const [searchTerm, setSearchTerm] = useState('');

  const getBaseNameById = (id: string) => {
    const base = mockBases.find(b => b.id === id);
    return base ? base.name : 'Unknown Base';
  };

  const filteredAssignments = mockAssignments.filter(assignment => {
    // Apply date filter
    if (filters.dateRange && 
        (assignment.date < filters.dateRange.startDate || 
         assignment.date > filters.dateRange.endDate)) {
      return false;
    }
    
    // Apply base filter
    if (filters.baseId && assignment.baseId !== filters.baseId) {
      return false;
    }
    
    // Apply asset type filter
    if (filters.assetType && assignment.assetType !== filters.assetType) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm && 
        !assignment.assetName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !assignment.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'returned':
        return <Badge variant="info">Returned</Badge>;
      case 'expended':
        return <Badge variant="danger">Expended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Assignments & Expenditures</h1>
          <p className="text-gray-600">
            Track asset assignments to personnel and record expenditures
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="primary" 
            icon={<Plus size={16} />}
          >
            New Assignment
          </Button>
        </div>
      </div>

      <FilterBar />

      <Card>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search assignments or personnel..."
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

        {filteredAssignments.length > 0 ? (
          <Table headers={['Date', 'Asset', 'Assigned To', 'Base', 'Quantity', 'Status']}>
            {filteredAssignments.map(assignment => (
              <tr key={assignment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {assignment.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-navy-800">
                  {assignment.assetName} <span className="text-gray-500 capitalize">({assignment.assetType})</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {assignment.assignedTo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getBaseNameById(assignment.baseId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {assignment.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(assignment.status)}
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">No assignments found</h3>
            <p className="text-gray-400">
              {searchTerm 
                ? "Try adjusting your search or filters"
                : "Create a new assignment using the button above"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Assignments;