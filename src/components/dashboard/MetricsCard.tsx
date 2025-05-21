import React, { useState } from 'react';
import Card from '../ui/Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  percentChange?: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  previousValue,
  percentChange: providedPercentChange,
  icon,
  color,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate percent change if not provided directly
  const displayPercentChange = providedPercentChange || (
    previousValue !== undefined && previousValue !== 0
      ? (((value - previousValue) / previousValue) * 100).toFixed(1)
      : undefined
  );

  // Determine if trend is up or down
  const isPositiveTrend = displayPercentChange && parseFloat(displayPercentChange) > 0;
  const isZeroChange = displayPercentChange && parseFloat(displayPercentChange) === 0;

  return (
    <Card 
      className={`transition-all duration-200 border-l-4 ${color} ${
        isHovered ? 'transform -translate-y-1 shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <div 
        className="flex items-start justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-navy-800">
            {value.toLocaleString()}
          </p>
          
          {displayPercentChange && (
            <div className="flex items-center mt-2">
              {isPositiveTrend ? (
                <ArrowUpRight size={16} className="text-green-500 mr-1" />
              ) : !isZeroChange ? (
                <ArrowDownRight size={16} className="text-red-500 mr-1" />
              ) : (
                <Minus size={16} className="text-gray-500 mr-1" />
              )}
              <span 
                className={`text-xs font-medium ${
                  isPositiveTrend 
                    ? 'text-green-500' 
                    : isZeroChange 
                      ? 'text-gray-500' 
                      : 'text-red-500'
                }`}
              >
                {isZeroChange 
                  ? '0.0% no change' 
                  : `${displayPercentChange}% from previous`
                }
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${
          color.replace('border-', 'bg-').replace('-600', '-100')
        }`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default MetricsCard;
