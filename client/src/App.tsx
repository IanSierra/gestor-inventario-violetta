import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ProductosPage from "@/pages/productos-page";
import TransaccionesPage from "@/pages/transacciones-page";
import ClientesPage from "@/pages/clientes-page";
import ReportesPage from "@/pages/reportes-page";
import ConfiguracionPage from "@/pages/configuracion-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect } from "react";

// Ajustar configuración global de fechas
const configureGlobalSettings = () => {
  // Configurar idioma de fechas en español
  if (typeof Intl !== 'undefined') {
    Intl.DateTimeFormat.supportedLocalesOf(['es-MX']).length > 0 &&
      Intl.DateTimeFormat.supportedLocalesOf(['es']).length > 0;
  }
};

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/productos" component={ProductosPage} />
      <ProtectedRoute path="/transacciones" component={TransaccionesPage} />
      <ProtectedRoute path="/clientes" component={ClientesPage} />
      <ProtectedRoute path="/reportes" component={ReportesPage} />
      <ProtectedRoute path="/configuracion" component={ConfiguracionPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    configureGlobalSettings();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
