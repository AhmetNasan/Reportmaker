// Main Application Component - client/src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContractProvider } from "@/contexts/ContractContext";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/pages/Dashboard";
import { Contracts } from "@/pages/Contracts";
import { Projects } from "@/pages/Projects";
import { GISMapping } from "@/pages/GISMapping";
import { AIInspections } from "@/pages/AIInspections";
import { FileManager } from "@/pages/FileManager";
import { Reports } from "@/pages/Reports";
import { NotFound } from "@/pages/not-found";
import { queryClient } from "@/lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/projects" component={Projects} />
      <Route path="/gis" component={GISMapping} />
      <Route path="/ai-inspections" component={AIInspections} />
      <Route path="/files" component={FileManager} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Router />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ContractProvider>
          <AppContent />
          <Toaster />
        </ContractProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;