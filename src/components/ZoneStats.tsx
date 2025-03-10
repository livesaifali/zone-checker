
import { Activity, CheckCircle, AlertTriangle } from 'lucide-react';

interface ZoneStatsProps {
  totalZones: number;
  pendingZones: number;
  uploadedZones: number;
}

const ZoneStats: React.FC<ZoneStatsProps> = ({ 
  totalZones, 
  pendingZones, 
  uploadedZones 
}) => {
  const completionPercentage = totalZones > 0 
    ? Math.round((uploadedZones / totalZones) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="glass-card rounded-lg p-4 flex items-center space-x-4">
        <div className="rounded-full bg-primary/10 p-2">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Zones</p>
          <h3 className="text-2xl font-bold">{totalZones}</h3>
        </div>
      </div>
      
      <div className="glass-card rounded-lg p-4 flex items-center space-x-4">
        <div className="rounded-full bg-amber-100 p-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Pending</p>
          <h3 className="text-2xl font-bold">{pendingZones}</h3>
        </div>
      </div>
      
      <div className="glass-card rounded-lg p-4 flex items-center space-x-4">
        <div className="rounded-full bg-green-100 p-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Uploaded</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{uploadedZones}</h3>
            <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneStats;
