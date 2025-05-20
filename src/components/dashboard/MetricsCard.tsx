import React, { useState } from 'react';
import Card from '../ui/Card';
import { ArrowUpRight, ArrowDownRight, Plus, Minus, TrendingUp } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  previousValue,
  icon,
  color,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const percentChange = previousValue 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;
  
  const isIncrease = percentChange > 0;
  const percentChangeAbs = Math.abs(percentChange).toFixed(1);

  return (
    <Card 
      className={`transition-all duration-200 border-l-4 ${color} ${isHovered ? 'transform -translate-y-1 shadow-md' : ''}`}
      onClick={onClick}
    >
      <div 
        className="flex items-start justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-navy-800">{value.toLocaleString()}</p>
          
          {previousValue !== undefined && (
            <div className="flex items-center mt-2">
              {isIncrease ? (
                <ArrowUpRight size={16} className="text-green-500 mr-1" />
              ) : (
                <ArrowDownRight size={16} className="text-red-500 mr-1" />
              )}
              <span className={`text-xs font-medium ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                {percentChangeAbs}% from previous
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default MetricsCard;