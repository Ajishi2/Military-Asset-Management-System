import React, { useState, useEffect } from 'react';
import { useFilter } from '../../contexts/FilterContext.js';
import DateRangePicker from '../ui/DateRangePicker.js';
import Select from '../ui/Select.js';
import Button from '../ui/Button.js';
import { FilterIcon } from 'lucide-react';
import axios from 'axios';

const FilterBar: React.FC = () => {
  const { 
    filters, 
    setBaseFilter, 
    setDateRangeFilter, 
    setAssetTypeFilter, 
    clearFilters 
  } = useFilter();
  
  const [bases, setBases] = useState<any[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bases and equipment types from API
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setLoading(true);
        
        // Fetch bases
        const basesResponse = await axios.get('/api/bases');
        setBases(basesResponse.data);
        
        // Fetch equipment types
        const typesResponse = await axios.get('/api/equipment-types');
        setEquipmentTypes(typesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching filter data:', error);
        setLoading(false);
      }
    };
    
    fetchFilterData();
  }, []);

  // Create equipment type options from API data
  const equipmentTypeOptions = [
    { value: '', label: 'All Types' },
    ...equipmentTypes.map(type => ({
      value: type.type_id.toString(),
      label: type.type_name
    }))
  ];

  // Create base options from API data
  const baseOptions = [
    { value: '', label: 'All Bases' },
    ...bases.map(base => ({
      value: base.base_id.toString(),
      label: base.base_name
    }))
  ];
  
  // Debug current filter values
  useEffect(() => {
    console.log('Current filter values:', {
      baseId: filters.baseId,
      assetType: filters.assetType,
      dateRange: filters.dateRange
    });
  }, [filters]);

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
        {loading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
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