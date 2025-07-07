// Dashboard Page - client/src/pages/Dashboard.tsx
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FileText, MapPin, Calendar, AlertCircle } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function Dashboard() {
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['/api/contracts'],
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: inspections = [], isLoading: inspectionsLoading } = useQuery({
    queryKey: ['/api/inspections'],
  });

  if (contractsLoading || projectsLoading || inspectionsLoading) {
    return (
      <div className="p-6">
        <Header title="Dashboard" subtitle="Overview of your engineering projects" />
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  const contractStats = contracts.reduce((acc, contract) => {
    acc[contract.status] = (acc[contract.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(contractStats).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count
  }));

  const pieData = Object.entries(contractStats).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));

  return (
    <div className="p-6 space-y-6">
      <Header title="Dashboard" subtitle="Overview of your engineering projects" />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
            <p className="text-xs text-muted-foreground">
              {activeContracts} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inspections.length}</div>
            <p className="text-xs text-muted-foreground">
              {inspections.filter(i => i.defectsFound).length} with defects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contract Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contracts</CardTitle>
          <CardDescription>Latest contract activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts.slice(0, 5).map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{contract.projectName}</p>
                    <p className="text-sm text-gray-600">{contract.clientName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                    {contract.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    ${parseFloat(contract.contractValue).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Contracts Page - client/src/pages/Contracts.tsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Calendar, DollarSign, Building2 } from "lucide-react";

const contractSchema = z.object({
  contractNumber: z.string().min(1, "Contract number is required"),
  clientName: z.string().min(1, "Client name is required"),
  projectName: z.string().min(1, "Project name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  contractValue: z.string().min(1, "Contract value is required"),
  status: z.enum(["planning", "active", "completed", "cancelled"]),
  description: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

export function Contracts() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: contracts = [], isLoading, error } = useQuery({
    queryKey: ['/api/contracts'],
  });

  const createContractMutation = useMutation({
    mutationFn: (data: ContractFormData) => apiRequest('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Contract created",
        description: "The contract has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractNumber: "",
      clientName: "",
      projectName: "",
      startDate: "",
      endDate: "",
      contractValue: "",
      status: "planning",
      description: "",
    },
  });

  const onSubmit = (data: ContractFormData) => {
    createContractMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Header title="Contracts" subtitle="Manage your engineering contracts" />
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Header title="Contracts" subtitle="Manage your engineering contracts" />
        <div className="text-center text-red-600">
          Error loading contracts. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Header title="Contracts" subtitle="Manage your engineering contracts" />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Number</FormLabel>
                        <FormControl>
                          <Input placeholder="CON-2025-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Client company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="contractValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Value</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="1000000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Contract description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createContractMutation.isPending}>
                    {createContractMutation.isPending ? "Creating..." : "Create Contract"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {contracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{contract.projectName}</CardTitle>
                  <CardDescription>{contract.contractNumber}</CardDescription>
                </div>
                <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                  {contract.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="mr-2 h-4 w-4" />
                  {contract.clientName}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="mr-2 h-4 w-4" />
                  ${parseFloat(contract.contractValue).toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                </div>
                {contract.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {contract.description.length > 100 
                      ? `${contract.description.substring(0, 100)}...` 
                      : contract.description}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {contracts.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first contract.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Contract
          </Button>
        </div>
      )}
    </div>
  );
}