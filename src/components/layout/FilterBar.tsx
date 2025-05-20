import React from 'react';
import { useFilter } from '../../contexts/FilterContext';
import { mockBases } from '../../data/mockData';
import DateRangePicker from '../ui/DateRangePicker';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { FilterIcon } from 'lucide-react';

const FilterBar: React.FC = () => {
  const { 
    filters, 
    setBaseFilter, 
    setDateRangeFilter, 
    setAssetTypeFilter, 
    clearFilters 
  } = useFilter();

  const equipmentTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'weapon', label: 'Weapons' },
    { value: 'vehicle', label: 'Vehicles' },
    { value: 'ammunition', label: 'Ammunition' },
    { value: 'communication', label: 'Communication' }
  ];

  const baseOptions = [
    { value: '', label: 'All Bases' },
    ...mockBases.map(base => ({
      value: base.id,
      label: base.name
    }))
  ];

  const handleStartDateChange = (startDate: string) => {
    if (filters.dateRange) {
      setDateRangeFilter(startDate, filters.dateRange.endDate);
    }
  };

  const handleEndDateChange = (endDate: string) => {
    if (filters.dateRange) {
      setDateRangeFilter(filters.dateRange.startDate, endDate);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center mb-4">
        <FilterIcon size={20} className="text-navy-600 mr-2" />
        <h2 className="text-lg font-medium text-navy-800">Filters</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DateRangePicker
          startDate={filters.dateRange?.startDate || ''}
          endDate={filters.dateRange?.endDate || ''}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          label="Date Range"
        />

        <Select
          label="Base"
          options={baseOptions}
          value={filters.baseId || ''}
          onChange={setBaseFilter}
        />

        <Select
          label="Equipment Type"
          options={equipmentTypeOptions}
          value={filters.assetType || ''}
          onChange={(value) => setAssetTypeFilter(value as any)}
        />
      </div>
      <div className="flex justify-end mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearFilters}
          className="mr-2"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;