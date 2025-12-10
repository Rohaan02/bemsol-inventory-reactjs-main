import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../ui/utils';

const StatusChart = ({ data, title, className, ...props }) => {
  const chartColors = [
    'bg-chart-1',
    'bg-chart-2',
    'bg-chart-3',
    'bg-chart-4',
    'bg-chart-5'
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={cn("h-full", className)} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Current inventory status distribution
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart visualization */}
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div className="flex h-full">
              {data.map((item, index) => (
                <div
                  key={index}
                  className={cn(chartColors[index % chartColors.length], "h-full transition-all duration-300")}
                  style={{ width: `${(item.value / total) * 100}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className={cn(
                    chartColors[index % chartColors.length],
                    "w-3 h-3 rounded-sm"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.value} items ({Math.round((item.value / total) * 100)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Total Items</span>
              <span className="text-lg font-bold text-primary">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusChart;