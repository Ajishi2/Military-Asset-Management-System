import React from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button.js';
import Table from '../ui/Table.js';
import { Purchase, Transfer } from '../../types/index.js';


interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseId: string;
  type: 'purchases' | 'transfers-in' | 'transfers-out';
  startDate: string;
  endDate: string;
}

const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  baseId,
  type,
  startDate,
  endDate
}) => {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case 'purchases':
        return 'Asset Purchases';
      case 'transfers-in':
        return 'Transfers In';
      case 'transfers-out':
        return 'Transfers Out';
      default:
        return '';
    }
  };

  const getBaseNameById = (id: string) => {
    const base = mockBases.find(b => b.id === id);
    return base ? base.name : 'Unknown Base';
  };

  const filteredPurchases = mockPurchases.filter(
    purchase => purchase.baseId === baseId && 
    purchase.date >= startDate && 
    purchase.date <= endDate
  );

  const filteredTransfersIn = mockTransfers.filter(
    transfer => transfer.toBaseId === baseId && 
    transfer.date >= startDate && 
    transfer.date <= endDate
  );

  const filteredTransfersOut = mockTransfers.filter(
    transfer => transfer.fromBaseId === baseId && 
    transfer.date >= startDate && 
    transfer.date <= endDate
  );

  const renderPurchasesTable = () => (
    <Table headers={['Date', 'Asset', 'Type', 'Quantity', 'Cost']}>
      {filteredPurchases.map(purchase => (
        <tr key={purchase.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {purchase.date}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {purchase.assetName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {purchase.assetType.charAt(0).toUpperCase() + purchase.assetType.slice(1)}
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
  );

  const renderTransfersTable = (transfers: Transfer[], showFromBase: boolean) => (
    <Table headers={[
      'Date', 
      'Asset', 
      'Type', 
      'Quantity', 
      showFromBase ? 'From Base' : 'To Base',
      'Status'
    ]}>
      {transfers.map(transfer => (
        <tr key={transfer.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {transfer.date}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {transfer.assetName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {transfer.assetType.charAt(0).toUpperCase() + transfer.assetType.slice(1)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {transfer.quantity}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {showFromBase 
              ? getBaseNameById(transfer.fromBaseId)
              : getBaseNameById(transfer.toBaseId)
            }
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              transfer.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : transfer.status === 'in_transit'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
            </span>
          </td>
        </tr>
      ))}
    </Table>
  );

  const renderContent = () => {
    switch (type) {
      case 'purchases':
        return renderPurchasesTable();
      case 'transfers-in':
        return renderTransfersTable(filteredTransfersIn, true);
      case 'transfers-out':
        return renderTransfersTable(filteredTransfersOut, false);
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-navy-800">
            {getTitle()} - {getBaseNameById(baseId)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
          
          {(
            (type === 'purchases' && filteredPurchases.length === 0) ||
            (type === 'transfers-in' && filteredTransfersIn.length === 0) ||
            (type === 'transfers-out' && filteredTransfersOut.length === 0)
          ) && (
            <div className="text-center py-8 text-gray-500">
              No data available for the selected period.
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovementModal;