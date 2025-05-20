export type Role = 'admin' | 'base_commander' | 'logistics_officer';

export type User = {
  id: string;
  name: string;
  role: Role;
  baseId?: string; // For base commanders and logistics officers
};

export type Base = {
  id: string;
  name: string;
  location: string;
};

export type EquipmentType = 'weapon' | 'vehicle' | 'ammunition' | 'communication';

export type Asset = {
  id: string;
  name: string;
  type: EquipmentType;
  serialNumber: string;
  quantity: number;
  baseId: string;
  status: 'available' | 'assigned' | 'expended' | 'in_transit';
};

export type Purchase = {
  id: string;
  assetId: string;
  assetName: string;
  assetType: EquipmentType;
  quantity: number;
  baseId: string;
  date: string;
  cost: number;
};

export type Transfer = {
  id: string;
  assetId: string;
  assetName: string;
  assetType: EquipmentType;
  quantity: number;
  fromBaseId: string;
  toBaseId: string;
  date: string;
  status: 'pending' | 'in_transit' | 'completed';
};

export type Assignment = {
  id: string;
  assetId: string;
  assetName: string;
  assetType: EquipmentType;
  quantity: number;
  baseId: string;
  assignedTo: string;
  date: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'expended';
};

export type BalanceMetrics = {
  openingBalance: number;
  closing: number;
  purchases: number;
  transferIn: number;
  transferOut: number;
  assigned: number;
  expended: number;
};

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type FilterOptions = {
  dateRange?: DateRange;
  baseId?: string;
  assetType?: EquipmentType;
};