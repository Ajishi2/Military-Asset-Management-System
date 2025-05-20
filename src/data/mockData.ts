import { User, Base, Asset, Purchase, Transfer, Assignment, BalanceMetrics } from '../types';
import { addDays, format, subDays } from 'date-fns';

const today = new Date();
const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

// Mock Users
export const mockUsers: User[] = [
  { id: '1', name: 'Admin User', role: 'admin' },
  { id: '2', name: 'Base Commander Alpha', role: 'base_commander', baseId: '1' },
  { id: '3', name: 'Base Commander Beta', role: 'base_commander', baseId: '2' },
  { id: '4', name: 'Logistics Officer Alpha', role: 'logistics_officer', baseId: '1' },
  { id: '5', name: 'Logistics Officer Beta', role: 'logistics_officer', baseId: '2' },
];

// Mock Bases
export const mockBases: Base[] = [
  { id: '1', name: 'Alpha Base', location: 'Northern Region' },
  { id: '2', name: 'Beta Base', location: 'Southern Region' },
  { id: '3', name: 'Charlie Base', location: 'Eastern Region' },
  { id: '4', name: 'Delta Base', location: 'Western Region' },
];

// Mock Assets
export const mockAssets: Asset[] = [
  { id: '1', name: 'Assault Rifle M4', type: 'weapon', serialNumber: 'W001', quantity: 150, baseId: '1', status: 'available' },
  { id: '2', name: 'Humvee', type: 'vehicle', serialNumber: 'V001', quantity: 20, baseId: '1', status: 'available' },
  { id: '3', name: 'Radio Set', type: 'communication', serialNumber: 'C001', quantity: 50, baseId: '1', status: 'available' },
  { id: '4', name: 'Artillery Shells', type: 'ammunition', serialNumber: 'A001', quantity: 500, baseId: '1', status: 'available' },
  { id: '5', name: 'Sniper Rifle', type: 'weapon', serialNumber: 'W002', quantity: 30, baseId: '2', status: 'available' },
  { id: '6', name: 'APC', type: 'vehicle', serialNumber: 'V002', quantity: 15, baseId: '2', status: 'available' },
  { id: '7', name: 'Satellite Phone', type: 'communication', serialNumber: 'C002', quantity: 25, baseId: '2', status: 'available' },
  { id: '8', name: 'Small Arms Ammunition', type: 'ammunition', serialNumber: 'A002', quantity: 1000, baseId: '2', status: 'available' },
];

// Mock Purchases
export const mockPurchases: Purchase[] = [
  { id: '1', assetId: '1', assetName: 'Assault Rifle M4', assetType: 'weapon', quantity: 50, baseId: '1', date: formatDate(subDays(today, 30)), cost: 50000 },
  { id: '2', assetId: '2', assetName: 'Humvee', assetType: 'vehicle', quantity: 5, baseId: '1', date: formatDate(subDays(today, 25)), cost: 250000 },
  { id: '3', assetId: '5', assetName: 'Sniper Rifle', assetType: 'weapon', quantity: 10, baseId: '2', date: formatDate(subDays(today, 20)), cost: 30000 },
  { id: '4', assetId: '6', assetName: 'APC', assetType: 'vehicle', quantity: 3, baseId: '2', date: formatDate(subDays(today, 15)), cost: 450000 },
  { id: '5', assetId: '3', assetName: 'Radio Set', assetType: 'communication', quantity: 20, baseId: '1', date: formatDate(subDays(today, 10)), cost: 15000 },
  { id: '6', assetId: '7', assetName: 'Satellite Phone', assetType: 'communication', quantity: 5, baseId: '2', date: formatDate(subDays(today, 5)), cost: 25000 },
];

// Mock Transfers
export const mockTransfers: Transfer[] = [
  { id: '1', assetId: '1', assetName: 'Assault Rifle M4', assetType: 'weapon', quantity: 20, fromBaseId: '1', toBaseId: '3', date: formatDate(subDays(today, 15)), status: 'completed' },
  { id: '2', assetId: '2', assetName: 'Humvee', assetType: 'vehicle', quantity: 2, fromBaseId: '1', toBaseId: '4', date: formatDate(subDays(today, 12)), status: 'completed' },
  { id: '3', assetId: '5', assetName: 'Sniper Rifle', assetType: 'weapon', quantity: 5, fromBaseId: '2', toBaseId: '3', date: formatDate(subDays(today, 10)), status: 'completed' },
  { id: '4', assetId: '6', assetName: 'APC', assetType: 'vehicle', quantity: 1, fromBaseId: '2', toBaseId: '4', date: formatDate(subDays(today, 8)), status: 'completed' },
  { id: '5', assetId: '3', assetName: 'Radio Set', assetType: 'communication', quantity: 10, fromBaseId: '1', toBaseId: '2', date: formatDate(subDays(today, 5)), status: 'in_transit' },
  { id: '6', assetId: '8', assetName: 'Small Arms Ammunition', assetType: 'ammunition', quantity: 200, fromBaseId: '2', toBaseId: '1', date: formatDate(subDays(today, 2)), status: 'pending' },
];

// Mock Assignments
export const mockAssignments: Assignment[] = [
  { id: '1', assetId: '1', assetName: 'Assault Rifle M4', assetType: 'weapon', quantity: 50, baseId: '1', assignedTo: 'Alpha Squad', date: formatDate(subDays(today, 20)), status: 'active' },
  { id: '2', assetId: '2', assetName: 'Humvee', assetType: 'vehicle', quantity: 5, baseId: '1', assignedTo: 'Recon Team', date: formatDate(subDays(today, 18)), status: 'active' },
  { id: '3', assetId: '4', assetName: 'Artillery Shells', assetType: 'ammunition', quantity: 100, baseId: '1', assignedTo: 'Artillery Unit', date: formatDate(subDays(today, 15)), status: 'expended' },
  { id: '4', assetId: '5', assetName: 'Sniper Rifle', assetType: 'weapon', quantity: 10, baseId: '2', assignedTo: 'Sniper Team', date: formatDate(subDays(today, 12)), status: 'active' },
  { id: '5', assetId: '6', assetName: 'APC', assetType: 'vehicle', quantity: 3, baseId: '2', assignedTo: 'QRF', date: formatDate(subDays(today, 10)), status: 'active' },
  { id: '6', assetId: '8', assetName: 'Small Arms Ammunition', assetType: 'ammunition', quantity: 300, baseId: '2', assignedTo: 'Training Unit', date: formatDate(subDays(today, 8)), status: 'expended' },
  { id: '7', assetId: '3', assetName: 'Radio Set', assetType: 'communication', quantity: 15, baseId: '1', assignedTo: 'Command Center', date: formatDate(subDays(today, 30)), returnDate: formatDate(subDays(today, 5)), status: 'returned' },
];

// Mock Balance Metrics
export const mockBalanceMetrics: Record<string, BalanceMetrics> = {
  '1': { // Alpha Base
    openingBalance: 800,
    closing: 920,
    purchases: 200,
    transferIn: 20,
    transferOut: 50,
    assigned: 70,
    expended: 100
  },
  '2': { // Beta Base
    openingBalance: 600,
    closing: 750,
    purchases: 200,
    transferIn: 50,
    transferOut: 20,
    assigned: 50,
    expended: 80
  },
  '3': { // Charlie Base
    openingBalance: 400,
    closing: 450,
    purchases: 50,
    transferIn: 50,
    transferOut: 30,
    assigned: 40,
    expended: 20
  },
  '4': { // Delta Base
    openingBalance: 300,
    closing: 350,
    purchases: 40,
    transferIn: 30,
    transferOut: 10,
    assigned: 30,
    expended: 10
  }
};