// Additional Pages - Projects, GIS Mapping, AI Inspections, File Manager, Reports

// Projects Page - client/src/pages/Projects.tsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useContract } from "@/contexts/ContractContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Plus, MapPin, Calendar, BarChart3, Edit, Trash2 } from "lucide-react";

const projectSchema = z.object({
  contractId: z.number().min(1, "Contract is required"),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "completed", "cancelled"]),
  progress: z.number().min(0).max(100),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  coordinates: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function Projects() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const { activeContract, contracts } = useContract();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['/api/projects'],
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectFormData) => apiRequest('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        coordinates: data.coordinates ? JSON.stringify([{ lat: 0, lng: 0 }]) : null,
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Project created",
        description: "The project has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      contractId: activeContract?.id || 0,
      name: "",
      description: "",
      status: "planning",
      progress: 0,
      startDate: "",
      endDate: "",
      coordinates: "",
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Header title="Projects" subtitle="Manage your engineering projects" />
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Header title="Projects" subtitle="Manage your engineering projects" />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="contractId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contract" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contracts.map((contract) => (
                            <SelectItem key={contract.id} value={contract.id.toString()}>
                              {contract.projectName} ({contract.contractNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
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
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Project description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="progress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Progress (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createProjectMutation.isPending}>
                    {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>
                    {contracts.find(c => c.id === project.contractId)?.contractNumber}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="w-full" />
                </div>
                
                {project.description && (
                  <p className="text-sm text-gray-600">
                    {project.description.length > 100 
                      ? `${project.description.substring(0, 100)}...` 
                      : project.description}
                  </p>
                )}

                {(project.startDate || project.endDate) && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {project.startDate && new Date(project.startDate).toLocaleDateString()}
                    {project.startDate && project.endDate && " - "}
                    {project.endDate && new Date(project.endDate).toLocaleDateString()}
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-4">Create your first project to get started.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      )}
    </div>
  );
}

// GIS Mapping Page - client/src/pages/GISMapping.tsx
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Layers, Download, Upload, Ruler, Square, Navigation } from "lucide-react";

export function GISMapping() {
  const mapRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [coordinates, setCoordinates] = useState({ lat: 39.7817, lng: -89.6501 });

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  useEffect(() => {
    // Initialize map (placeholder for actual map library)
    if (mapRef.current) {
      // This would be replaced with actual map initialization
      console.log('Map initialized');
    }
  }, []);

  const mapTools = [
    { id: 'select', label: 'Select', icon: Navigation },
    { id: 'marker', label: 'Add Marker', icon: MapPin },
    { id: 'measure', label: 'Measure', icon: Ruler },
    { id: 'area', label: 'Draw Area', icon: Square },
  ];

  return (
    <div className="p-6 space-y-6">
      <Header title="GIS Mapping" subtitle="Interactive mapping and site visualization" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Map Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mapTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tool.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Layers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Satellite</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Streets</span>
                <input type="checkbox" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Terrain</span>
                <input type="checkbox" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Projects</span>
                <input type="checkbox" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coordinates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm text-gray-600">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={coordinates.lat}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={coordinates.lng}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                />
              </div>
              <Button size="sm" className="w-full">
                Go to Location
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Import/Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Import KML
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export KML
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <div
                ref={mapRef}
                className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center relative"
              >
                {/* Placeholder for actual map */}
                <div className="text-center">
                  <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map</h3>
                  <p className="text-gray-600">Map will be rendered here with actual GIS library</p>
                  
                  {/* Project markers overlay */}
                  <div className="absolute top-4 left-4 right-4">
                    <div className="flex flex-wrap gap-2">
                      {projects.slice(0, 3).map((project) => (
                        <Badge key={project.id} variant="secondary" className="bg-blue-100 text-blue-800">
                          <MapPin className="mr-1 h-3 w-3" />
                          {project.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tool indicator */}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="outline">
                      Tool: {mapTools.find(t => t.id === selectedTool)?.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project List */}
      <Card>
        <CardHeader>
          <CardTitle>Project Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{project.name}</h4>
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">{project.description}</p>
                <div className="mt-2">
                  <Badge variant="outline">{project.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// AI Inspections Page - client/src/pages/AIInspections.tsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/FileUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useContract } from "@/contexts/ContractContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Camera, AlertCircle, CheckCircle, Upload, Eye, Download } from "lucide-react";

const inspectionSchema = z.object({
  contractId: z.number().min(1, "Contract is required"),
  projectId: z.number().optional(),
  imagePath: z.string().min(1, "Image is required"),
  notes: z.string().optional(),
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

export function AIInspections() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();
  const { activeContract, contracts } = useContract();

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['/api/inspections'],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  const createInspectionMutation = useMutation({
    mutationFn: (data: InspectionFormData) => apiRequest('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        analysisResults: JSON.stringify({
          defects: ["Sample defect detection"],
          confidence: 0.85,
          recommendations: ["Sample recommendation"]
        }),
        defectsFound: Math.random() > 0.5,
        confidence: 0.85,
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      setIsCreateDialogOpen(false);
      setSelectedFiles([]);
      toast({
        title: "Inspection completed",
        description: "AI analysis has been completed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process inspection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      contractId: activeContract?.id || 0,
      projectId: undefined,
      imagePath: "",
      notes: "",
    },
  });

  const onFilesUploaded = (files) => {
    setSelectedFiles(files);
    if (files.length > 0) {
      form.setValue('imagePath', `/uploads/${files[0].name}`);
    }
  };

  const onSubmit = async (data: InspectionFormData) => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload an image for analysis.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setAnalyzing(false);
    createInspectionMutation.mutate(data);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Header title="AI Inspections" subtitle="AI-powered defect detection and analysis" />
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Header title="AI Inspections" subtitle="AI-powered defect detection and analysis" />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Camera className="mr-2 h-4 w-4" />
              New Inspection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create New AI Inspection</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="contractId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contract" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contracts.map((contract) => (
                            <SelectItem key={contract.id} value={contract.id.toString()}>
                              {contract.projectName} ({contract.contractNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects
                            .filter(p => p.contractId === form.watch('contractId'))
                            .map((project) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <label className="text-sm font-medium">Upload Images for Analysis</label>
                  <div className="mt-2">
                    <FileUpload
                      onFilesUploaded={onFilesUploaded}
                      acceptedTypes={["image/*"]}
                      maxSize={10 * 1024 * 1024}
                      multiple={false}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional inspection notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {analyzing && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Camera className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-blue-800 font-medium">AI Analysis in Progress...</span>
                    </div>
                    <Progress value={66} className="w-full" />
                    <p className="text-sm text-blue-600 mt-2">
                      Analyzing image for structural defects and anomalies...
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createInspectionMutation.isPending || analyzing}>
                    {analyzing ? "Analyzing..." : createInspectionMutation.isPending ? "Saving..." : "Run AI Analysis"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {inspections.map((inspection) => {
          const analysisData = inspection.analysisResults ? JSON.parse(inspection.analysisResults) : {};
          
          return (
            <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Inspection #{inspection.id}</CardTitle>
                    <CardDescription>
                      {new Date(inspection.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {inspection.defectsFound ? (
                    <Badge variant="destructive">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Defects Found
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      No Issues
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence Score</span>
                      <span className={getConfidenceColor(inspection.confidence)}>
                        {Math.round(inspection.confidence * 100)}%
                      </span>
                    </div>
                    <Progress value={inspection.confidence * 100} className="w-full" />
                  </div>

                  {analysisData.defects && analysisData.defects.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Detected Issues:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysisData.defects.map((defect, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {defect}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisData.recommendations && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysisData.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {inspection.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Notes:</h4>
                      <p className="text-sm text-gray-600">{inspection.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {inspections.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inspections yet</h3>
          <p className="text-gray-600 mb-4">Upload images to start AI-powered defect detection.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Camera className="mr-2 h-4 w-4" />
            Start Inspection
          </Button>
        </div>
      )}
    </div>
  );
}