import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Filter, Calendar, BarChart2 } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Sample data for reports visualization
const PERFORMANCE_DATA = [
  { name: 'Jan', human: 85, ai: 92 },
  { name: 'Feb', human: 78, ai: 88 },
  { name: 'Mar', human: 82, ai: 90 },
  { name: 'Apr', human: 86, ai: 91 },
  { name: 'May', human: 90, ai: 89 },
  { name: 'Jun', human: 88, ai: 93 },
];

const SENTIMENT_DATA = [
  { name: 'Jan', positive: 65, neutral: 20, negative: 15 },
  { name: 'Feb', positive: 60, neutral: 25, negative: 15 },
  { name: 'Mar', positive: 70, neutral: 20, negative: 10 },
  { name: 'Apr', positive: 72, neutral: 18, negative: 10 },
  { name: 'May', positive: 75, neutral: 15, negative: 10 },
  { name: 'Jun', positive: 80, neutral: 12, negative: 8 },
];

const ISSUE_RESOLUTION_DATA = [
  { name: 'Technical', resolved: 85, escalated: 15 },
  { name: 'Billing', resolved: 78, escalated: 22 },
  { name: 'Product', resolved: 92, escalated: 8 },
  { name: 'Account', resolved: 88, escalated: 12 },
  { name: 'Other', resolved: 90, escalated: 10 },
];

export default function Reports() {
  const [reportPeriod, setReportPeriod] = useState<string>("last30days");
  const [reportType, setReportType] = useState<string>("performance");
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // This would fetch real data in a production app
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['/api/reports', reportType, reportPeriod],
    queryFn: () => Promise.resolve({
      performance: PERFORMANCE_DATA,
      sentiment: SENTIMENT_DATA,
      resolution: ISSUE_RESOLUTION_DATA
    })
  });

  const handleGenerateReport = () => {
    // In a real app, this would trigger an API call to generate the report
    console.log("Generating report with:", { reportType, reportPeriod, startDate, endDate });
  };

  const handleExportReport = (format: string) => {
    // In a real app, this would trigger an API call to download the report
    console.log(`Exporting report as ${format}`);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <Button 
            onClick={() => handleExportReport(exportFormat)}
            className="bg-primary-500 hover:bg-primary-600 shadow-sm shadow-primary-300/20"
          >
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>

        <Tabs defaultValue="visualizations" className="w-full">
          <TabsList className="bg-slate-800 rounded-lg p-1 mb-4">
            <TabsTrigger 
              value="visualizations"
              className="py-2 px-4 rounded-md data-[state=active]:text-white data-[state=active]:bg-primary-500 data-[state=active]:shadow-sm"
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Visualizations
            </TabsTrigger>
            <TabsTrigger 
              value="custom-reports"
              className="py-2 px-4 rounded-md data-[state=active]:text-white data-[state=active]:bg-primary-500 data-[state=active]:shadow-sm"
            >
              <FileText className="mr-2 h-4 w-4" />
              Custom Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualizations" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border border-slate-700 shadow-md shadow-slate-900/50 rounded-lg lg:col-span-3">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Performance Metrics</CardTitle>
                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last7days">Last 7 days</SelectItem>
                        <SelectItem value="last30days">Last 30 days</SelectItem>
                        <SelectItem value="last90days">Last 90 days</SelectItem>
                        <SelectItem value="thisYear">This year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <CardDescription>
                    Comparing AI vs human agent performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={PERFORMANCE_DATA}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }} 
                        />
                        <Legend />
                        <Bar dataKey="ai" name="AI Response" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="human" name="Human Response" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border border-slate-700 shadow-md shadow-slate-900/50 rounded-lg lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle>Sentiment Analysis</CardTitle>
                  <CardDescription>
                    Distribution of customer sentiment across conversations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={SENTIMENT_DATA}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        stackOffset="sign"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }} 
                        />
                        <Legend />
                        <Bar dataKey="positive" name="Positive" fill="#10b981" stackId="stack" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="neutral" name="Neutral" fill="#f59e0b" stackId="stack" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="negative" name="Negative" fill="#ef4444" stackId="stack" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border border-slate-700 shadow-md shadow-slate-900/50 rounded-lg">
                <CardHeader className="pb-3">
                  <CardTitle>Issue Resolution</CardTitle>
                  <CardDescription>
                    Resolution rates by issue category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={ISSUE_RESOLUTION_DATA}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis type="number" stroke="#888" />
                        <YAxis dataKey="name" type="category" stroke="#888" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }} 
                        />
                        <Legend />
                        <Bar dataKey="resolved" name="Resolved" fill="#3b82f6" stackId="a" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="escalated" name="Escalated" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="custom-reports" className="space-y-4">
            <Card className="bg-slate-800 border border-slate-700 shadow-md shadow-slate-900/50 rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" /> Custom Report Generator
                </CardTitle>
                <CardDescription>Generate detailed reports with custom parameters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select 
                      value={reportType}
                      onValueChange={setReportType}
                    >
                      <SelectTrigger id="reportType" className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance Metrics</SelectItem>
                        <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                        <SelectItem value="resolution">Issue Resolution</SelectItem>
                        <SelectItem value="takeover">AI-to-Human Takeover</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input 
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input 
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-700" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="exportFormat">Export Format</Label>
                      <Select 
                        value={exportFormat}
                        onValueChange={setExportFormat}
                      >
                        <SelectTrigger id="exportFormat" className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Select export format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="additionalFilters">Additional Filters</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="additionalFilters"
                          placeholder="E.g., tag:urgent, status:completed"
                          className="bg-slate-700 border-slate-600 w-full"
                        />
                        <Button variant="outline" className="bg-slate-700 border-slate-600 hover:bg-slate-600 shadow-sm shadow-slate-900/50">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-700 pt-4 flex justify-end">
                <Button 
                  className="bg-primary-500 hover:bg-primary-600 shadow-sm shadow-primary-300/20"
                  onClick={handleGenerateReport}
                >
                  <FileText className="mr-2 h-4 w-4" /> Generate Report
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-slate-800 border border-slate-700 shadow-md shadow-slate-900/50 rounded-lg">
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Configure automated report delivery.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-3 border border-slate-700 rounded-lg bg-slate-800">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-medium">Weekly Performance Report</p>
                          <p className="text-sm text-slate-400">Every Monday at 9:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600 hover:bg-slate-600 shadow-sm shadow-slate-900/50">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="shadow-sm shadow-red-900/20">
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-slate-700 rounded-lg bg-slate-800">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-medium">Monthly Comprehensive Report</p>
                          <p className="text-sm text-slate-400">1st day of month at 10:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600 hover:bg-slate-600 shadow-sm shadow-slate-900/50">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="shadow-sm shadow-red-900/20">
                          Delete
                        </Button>
                      </div>
                    </div>

                    <Button className="bg-primary-500 hover:bg-primary-600 shadow-sm shadow-primary-300/20 mt-2">
                      + Add Scheduled Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}