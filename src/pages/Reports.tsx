
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Download, Calendar, ArrowDownToLine, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zoneService, reportService } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Reports = () => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | '15days' | 'monthly'>('daily');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const { toast } = useToast();

  // Fetch zones from API
  const { 
    data: zones = [], 
    isLoading: isLoadingZones,
    error: zonesError 
  } = useQuery({
    queryKey: ['zones'],
    queryFn: zoneService.getAll,
  });

  // Fetch task status report from API
  const { 
    data: taskStatusData = [], 
    isLoading: isLoadingTaskStatus,
    error: taskStatusError,
    refetch: refetchTaskStatus
  } = useQuery({
    queryKey: ['taskStatusReport', reportType],
    queryFn: () => reportService.getTaskStatusReport(reportType),
  });

  // Fetch zone performance report from API
  const { 
    data: zonePerformanceData = [], 
    isLoading: isLoadingZonePerformance,
    error: zonePerformanceError 
  } = useQuery({
    queryKey: ['zonePerformanceReport'],
    queryFn: reportService.getZonePerformanceReport,
  });

  const handleReportTypeChange = (value: 'daily' | 'weekly' | '15days' | 'monthly') => {
    setReportType(value);
  };

  const handleDownloadReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Date,Pending,Updated,Total\n";
    
    // Add data rows
    taskStatusData.forEach((item: any) => {
      const date = item.date ? format(new Date(item.date), 'yyyy-MM-dd') : 'N/A';
      csvContent += `${date},${item.pending || 0},${item.updated || 0},${(item.pending || 0) + (item.updated || 0)}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Report downloaded",
      description: `The ${reportType} report has been downloaded successfully`,
    });
  };

  // Format data for charts
  const formattedTaskStatusData = taskStatusData.map((item: any) => ({
    name: item.date ? format(new Date(item.date), 'MMM dd') : 'N/A',
    pending: item.pending || 0,
    updated: item.updated || 0,
    completionPercentage: item.total ? Math.round((item.updated / item.total) * 100) : 0
  }));

  // Data for the pie chart - current status overview
  const pieData = [
    { 
      name: 'Completed', 
      value: zones.filter((z: any) => z.status === 'uploaded').length 
    },
    { 
      name: 'Updated', 
      value: zones.filter((z: any) => z.status === 'updated').length 
    },
    { 
      name: 'Pending', 
      value: zones.filter((z: any) => z.status === 'pending').length 
    },
    { 
      name: 'Not Started', 
      value: zones.filter((z: any) => z.status === null).length 
    },
  ];

  // Zone performance data for bar chart
  const zonePerformanceChartData = zonePerformanceData.map((item: any) => ({
    name: item.zoneName,
    total: item.totalTasks,
    completed: item.completedTasks,
    completion: item.totalTasks > 0 
      ? Math.round((item.completedTasks / item.totalTasks) * 100) 
      : 0
  }));

  // Show loading state
  if (isLoadingZones || isLoadingTaskStatus || isLoadingZonePerformance) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Checklist Reports</h1>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Show error state
  if (zonesError || taskStatusError || zonePerformanceError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error loading the reports. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Checklist Reports</h1>
          <p className="text-muted-foreground">
            View and download reports for city checklist status
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={reportType} onValueChange={handleReportTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="15days">15 Days</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          {reportType === 'monthly' && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Button onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      
      {/* Current Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completion Status</CardTitle>
            <CardDescription>Current status of all cities</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Task Status Over Time</CardTitle>
            <CardDescription>
              {reportType === 'daily' ? 'Last 7 days' : 
               reportType === 'weekly' ? 'Last 4 weeks' : 
               reportType === '15days' ? 'Last 15 days' : 'Monthly view'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedTaskStatusData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="updated"
                  name="Updated Tasks"
                  stroke="#0088FE"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  name="Pending Tasks"
                  stroke="#FFBB28"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Zone Performance Report */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Performance</CardTitle>
          <CardDescription>
            Task completion status by zone
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={zonePerformanceChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" name="Completed Tasks" fill="#00C49F" />
              <Bar dataKey="total" name="Total Tasks" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
