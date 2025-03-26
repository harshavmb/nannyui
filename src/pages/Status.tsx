
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Activity, BarChart, AlertTriangle, CheckCircle, Server } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Status = () => {
  // Sample data for the status page
  const metrics = [
    { 
      name: 'Uptime', 
      value: '99.98%', 
      status: 'optimal', 
      icon: Clock,
      description: 'Last 30 days' 
    },
    { 
      name: 'Response Time', 
      value: '87ms', 
      status: 'good', 
      icon: Activity,
      description: 'Average over 24h' 
    },
    { 
      name: 'Availability', 
      value: '99.99%', 
      status: 'optimal', 
      icon: BarChart,
      description: 'Across all regions' 
    },
    { 
      name: 'Error Rate', 
      value: '0.02%', 
      status: 'good', 
      icon: AlertTriangle,
      description: 'Last 24 hours' 
    },
  ];

  const incidents = [
    {
      date: '2023-10-25',
      title: 'Increased latency in EU region',
      duration: '42 minutes',
      status: 'resolved',
      description: 'Our EU servers experienced higher than normal latency due to network congestion. The issue was resolved by scaling up resources.'
    },
    {
      date: '2023-10-22',
      title: 'Planned maintenance',
      duration: '15 minutes',
      status: 'maintenance',
      description: 'Scheduled maintenance to upgrade database systems. No downtime was experienced.'
    },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'warning':
        return 'text-amber-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const incidentStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</span>;
      case 'ongoing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" /> Ongoing</span>;
      case 'maintenance':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Server className="w-3 h-3 mr-1" /> Maintenance</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto">
          <div className="container py-8 px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
              <p className="text-muted-foreground mt-2">
                Current status of the Linux Agents API service.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric, i) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-lg">
                        <metric.icon className="mr-2 h-5 w-5 text-muted-foreground" />
                        {metric.name}
                      </CardTitle>
                      <CardDescription>{metric.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">{metric.value}</span>
                        <span className={`font-medium ${statusColor(metric.status)}`}>
                          {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Service Status</CardTitle>
                  <CardDescription>Current operational status of all services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'API Endpoints', status: 'operational' },
                      { name: 'Authentication Service', status: 'operational' },
                      { name: 'Database', status: 'operational' },
                      { name: 'File Storage', status: 'operational' },
                      { name: 'Notification Service', status: 'operational' },
                      { name: 'Metrics Collection', status: 'operational' },
                    ].map((service) => (
                      <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{service.name}</span>
                        <span className="inline-flex items-center text-sm">
                          <span className={`w-2 h-2 rounded-full mr-2 ${service.status === 'operational' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {service.status === 'operational' ? 'Operational' : 'Disrupted'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Incidents</CardTitle>
                  <CardDescription>Issues from the past 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Incident</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incidents.length > 0 ? (
                        incidents.map((incident) => (
                          <TableRow key={incident.date + incident.title}>
                            <TableCell className="font-medium">{incident.date}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{incident.title}</div>
                                <div className="text-sm text-muted-foreground">{incident.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>{incident.duration}</TableCell>
                            <TableCell>{incidentStatusBadge(incident.status)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <p className="text-muted-foreground">No incidents reported in the last 7 days.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <Footer />
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default Status;
