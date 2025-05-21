import React, { createContext, useContext, useState } from 'react';
import { FilterOptions, EquipmentType } from '../types/index.js';
import { format, subDays } from 'date-fns';

interface FilterContextType {
  filters: FilterOptions;
  setBaseFilter: (baseId: string | undefined) => void;
  setDateRangeFilter: (startDate: string, endDate: string) => void;
  setAssetTypeFilter: (assetType: EquipmentType | undefined) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Export the provider as a named export
export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const setBaseFilter = (baseId: string | undefined) => {
    setFilters(prev => ({ ...prev, baseId }));
  };

  const setDateRangeFilter = (startDate: string, endDate: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { startDate, endDate },
    }));
  };

  const setAssetTypeFilter = (assetType: EquipmentType | undefined) => {
    setFilters(prev => ({ ...prev, assetType }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: {
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      },
    });
  };

  return (
    <FilterContext.Provider value={{
      filters,
      setBaseFilter,
      setDateRangeFilter,
      setAssetTypeFilter,
      clearFilters,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

// Export the hook as a named export
export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}