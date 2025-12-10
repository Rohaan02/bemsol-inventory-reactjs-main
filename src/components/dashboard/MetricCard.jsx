import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../ui/utils';

const MetricCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className,
  ...props 
}) => {
  const trendColors = {
    up: 'text-status-success',
    down: 'text-status-danger',
    neutral: 'text-muted-foreground',
    warning: 'text-status-warning'
  };

  const iconColors = {
    up: 'text-status-success',
    down: 'text-status-danger',
    neutral: 'text-muted-foreground',
    warning: 'text-status-warning'
  };

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-200", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", iconColors[trend] || 'text-muted-foreground')} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className={cn("text-xs mt-2", trendColors[trend] || 'text-muted-foreground')}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;