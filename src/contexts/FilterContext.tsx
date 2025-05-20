import React, { createContext, useContext, useState } from 'react';
import { FilterOptions, EquipmentType } from '../types';
import { format, subDays } from 'date-fns';

interface FilterContextType {
  filters: FilterOptions;
  setBaseFilter: (baseId: string | undefined) => void;
  setDateRangeFilter: (startDate: string, endDate: string) => void;
  setAssetTypeFilter: (assetType: EquipmentType | undefined) => void;
  clearFilters: () => void;
}

const today = new Date();
const defaultStartDate = format(subDays(today, 30), 'yyyy-MM-dd');
const defaultEndDate = format(today, 'yyyy-MM-dd');

const defaultFilters: FilterOptions = {
  dateRange: {
    startDate: defaultStartDate,
    endDate: defaultEndDate
  },
  baseId: undefined,
  assetType: undefined
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  const setBaseFilter = (baseId: string | undefined) => {
    setFilters(prev => ({ ...prev, baseId }));
  };

  const setDateRangeFilter = (startDate: string, endDate: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { startDate, endDate }
    }));
  };

  const setAssetTypeFilter = (assetType: EquipmentType | undefined) => {
    setFilters(prev => ({ ...prev, assetType }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{ 
      filters, 
      setBaseFilter, 
      setDateRangeFilter, 
      setAssetTypeFilter, 
      clearFilters 
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};