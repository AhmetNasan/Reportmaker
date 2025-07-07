// Sidebar Component - client/src/components/Sidebar.tsx
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContract } from "@/contexts/ContractContext";
import { 
  Home, 
  FileText, 
  MapPin, 
  Camera, 
  Folder, 
  BarChart3, 
  Plus, 
  Upload,
  Building2,
  Calendar,
  Settings
} from "lucide-react";

const navigationItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/contracts", label: "Contracts", icon: FileText },
  { path: "/projects", label: "Projects", icon: MapPin },
  { path: "/gis", label: "GIS Mapping", icon: MapPin },
  { path: "/ai-inspections", label: "AI Inspections", icon: Camera },
  { path: "/files", label: "File Manager", icon: Folder },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const [location] = useLocation();
  const { activeContract, contracts } = useContract();

  const isActiveRoute = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    return location.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Engineering Platform</h1>
        <p className="text-sm text-gray-600">Contract Management System</p>
      </div>

      {/* Active Contract */}
      {activeContract && (
        <div className="mx-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Active Contract</h3>
            <Badge variant="default" className="bg-blue-600">
              {activeContract.status}
            </Badge>
          </div>
          <p className="text-sm text-blue-800 font-medium">{activeContract.projectName}</p>
          <p className="text-xs text-blue-600">{activeContract.contractNumber}</p>
          <p className="text-xs text-blue-600 mt-1">{activeContract.clientName}</p>
        </div>
      )}

      <div className="flex-1 px-4">
        {/* Navigation */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <span
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActiveRoute(item.path)
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/contracts">
              <span className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Contract
                </Button>
              </span>
            </Link>
            <Link href="/files">
              <span className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{contracts.length}</div>
            <div className="text-xs text-gray-600">Contracts</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {contracts.filter(c => c.status === 'active').length}
            </div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Header Component - client/src/components/Header.tsx
interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );
}

// File Upload Component - client/src/components/FileUpload.tsx
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
}

export function FileUpload({ 
  onFilesUploaded, 
  acceptedTypes = ["image/*", ".pdf", ".doc", ".docx"], 
  maxSize = 20 * 1024 * 1024,
  multiple = true 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setUploadedFiles(prev => [...prev, ...acceptedFiles]);
      onFilesUploaded(acceptedFiles);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple,
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports: {acceptedTypes.join(", ")} (max {Math.round(maxSize / 1024 / 1024)}MB)
                </p>
              </div>
            )}
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <File className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({Math.round(file.size / 1024)} KB)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Contract Context - client/src/contexts/ContractContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Contract } from "@shared/schema";

interface ContractContextType {
  activeContract: Contract | null;
  setActiveContract: (contract: Contract | null) => void;
  contracts: Contract[];
  isLoading: boolean;
  error: string | null;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function useContract() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
}

interface ContractProviderProps {
  children: ReactNode;
}

export function ContractProvider({ children }: ContractProviderProps) {
  const [activeContract, setActiveContract] = useState<Contract | null>(null);

  const { data: contracts = [], isLoading, error } = useQuery({
    queryKey: ['/api/contracts'],
  });

  // Set first active contract as default
  useEffect(() => {
    if (contracts.length > 0 && !activeContract) {
      const firstActiveContract = contracts.find(c => c.status === 'active') || contracts[0];
      setActiveContract(firstActiveContract);
    }
  }, [contracts, activeContract]);

  return (
    <ContractContext.Provider
      value={{
        activeContract,
        setActiveContract,
        contracts,
        isLoading,
        error: error?.message || null,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}