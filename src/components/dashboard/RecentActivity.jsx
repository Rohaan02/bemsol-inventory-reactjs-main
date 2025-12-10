import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../ui/utils';

const RecentActivity = ({ activities, className, ...props }) => {
  const statusColors = {
    completed: 'text-status-success',
    pending: 'text-status-warning',
    failed: 'text-status-danger',
    processing: 'text-status-active'
  };

  const statusIcons = {
    completed: '✓',
    pending: '⏱',
    failed: '✗',
    processing: '⟳'
  };

  return (
    <Card className={cn("h-full", className)} {...props}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest system activities and updates
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {activity.action}
                  </p>
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    statusColors[activity.status] || 'text-muted-foreground'
                  )}>
                    {statusIcons[activity.status] || '•'} {activity.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.item} • {activity.user}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;