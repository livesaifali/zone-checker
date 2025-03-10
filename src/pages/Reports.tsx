
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Download, Calendar, ArrowDownToLine } from 'lucide-react';
import { format } from 'date-fns';

interface Zone {
  id: number;
  name: string;
  status: 'pending' | 'uploaded' | null;
  comment: string;
  concernId: string;
  updatedBy?: string;
  lastUpdated?: string;
}

interface ReportData {
  name: string;
  pending: number;
  uploaded: number;
  notStarted: number;
  completionPercentage: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Reports = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const { toast } = useToast();

  useEffect(() => {
    // This would be a database fetch in real app
    const initialZones: Zone[] = [
      { id: 1, name: 'Karachi', status: null, comment: '', concernId: 'KHI001' },
      { id: 2, name: 'Lahore', status: 'pending', comment: 'Need to verify dimensions', concernId: 'LHR001', updatedBy: 'user123', lastUpdated: '2023-08-15' },
      { id: 3, name: 'Islamabad', status: 'uploaded', comment: 'All materials uploaded', concernId: 'ISB001', updatedBy: 'admin', lastUpdated: '2023-08-10' },
      { id: 4, name: 'Hyderabad', status: 'uploaded', comment: '', concernId: 'HYD001', updatedBy: 'user789', lastUpdated: '2023-09-01' },
      { id: 5, name: 'Sukkur', status: 'pending', comment: 'Waiting for inventory list', concernId: 'SUK001', updatedBy: 'user456', lastUpdated: '2023-08-05' },
      { id: 6, name: 'Larkana', status: null, comment: '', concernId: 'LRK001' },
      { id: 7, name: 'Rawalpindi', status: 'uploaded', comment: 'Completed last week', concernId: 'RWP001', updatedBy: 'user123', lastUpdated: '2023-08-20' },
      { id: 8, name: 'Head Office', status: 'uploaded', comment: 'Completed', concernId: 'HQ001', updatedBy: 'admin', lastUpdated: '2023-08-01' },
    ];
    setZones(initialZones);
  }, []);

  useEffect(() => {
    generateReportData();
  }, [zones, reportType, selectedYear, selectedMonth]);

  const generateReportData = () => {
    // For demo purposes, we'll generate some mock data based on the zones
    // In a real app, this would come from the database with real historical data
    
    const data: ReportData[] = [];
    
    if (reportType === 'daily') {
      // Generate last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const pending = Math.floor(Math.random() * 3) + 1;
        const uploaded = Math.floor(Math.random() * 4) + 2;
        const notStarted = 8 - pending - uploaded;
        
        data.push({
          name: format(date, 'MMM dd'),
          pending,
          uploaded,
          notStarted,
          completionPercentage: Math.round((uploaded / 8) * 100)
        });
      }
    } else if (reportType === 'weekly') {
      // Generate last 4 weeks
      for (let i = 4; i >= 1; i--) {
        const weekNum = new Date().getMonth() * 4 + Math.floor(new Date().getDate() / 7) + 1 - i;
        const pending = Math.floor(Math.random() * 3) + 1;
        const uploaded = Math.floor(Math.random() * 4) + 2;
        const notStarted = 8 - pending - uploaded;
        
        data.push({
          name: `Week ${weekNum > 0 ? weekNum : 52 + weekNum}`,
          pending,
          uploaded,
          notStarted,
          completionPercentage: Math.round((uploaded / 8) * 100)
        });
      }
    } else if (reportType === 'monthly') {
      // Generate months for the selected year
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      
      // Only show months up to current month for current year
      const monthsToShow = parseInt(selectedYear) === new Date().getFullYear() 
        ? months.slice(0, currentMonth + 1) 
        : months;
      
      for (const month of monthsToShow) {
        const pending = Math.floor(Math.random() * 3) + 1;
        const uploaded = Math.floor(Math.random() * 4) + 3;
        const notStarted = 8 - pending - uploaded;
        
        data.push({
          name: month,
          pending,
          uploaded,
          notStarted,
          completionPercentage: Math.round((uploaded / 8) * 100)
        });
      }
    }
    
    setReportData(data);
  };

  const handleDownloadReport = () => {
    // In a real app, this would generate and download a CSV/Excel file
    // For demo purposes, we'll just convert our data to CSV format
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Date,Pending,Uploaded,Not Started,Completion %\n";
    
    // Add data rows
    reportData.forEach(item => {
      csvContent += `${item.name},${item.pending},${item.uploaded},${item.notStarted},${item.completionPercentage}%\n`;
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

  // Data for the pie chart - current status overview
  const pieData = [
    { name: 'Uploaded', value: zones.filter(z => z.status === 'uploaded').length },
    { name: 'Pending', value: zones.filter(z => z.status === 'pending').length },
    { name: 'Not Started', value: zones.filter(z => z.status === null).length },
  ];

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
          <Select value={reportType} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setReportType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
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
            <CardTitle className="text-lg">Upload Progress</CardTitle>
            <CardDescription>
              {reportType === 'daily' ? 'Last 7 days' : reportType === 'weekly' ? 'Last 4 weeks' : 'Monthly view'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={reportData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completionPercentage"
                  name="Completion %"
                  stroke="#0088FE"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Report */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
          <CardDescription>
            Status breakdown by {reportType === 'daily' ? 'day' : reportType === 'weekly' ? 'week' : 'month'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={reportData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="uploaded" name="Uploaded" stackId="a" fill="#00C49F" />
              <Bar dataKey="pending" name="Pending" stackId="a" fill="#FFBB28" />
              <Bar dataKey="notStarted" name="Not Started" stackId="a" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
