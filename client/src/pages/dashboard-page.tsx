import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentSalesTable } from "@/components/dashboard/recent-sales-table";
import { NextReturnsTable } from "@/components/dashboard/next-returns-table";
import { LowStockTable } from "@/components/dashboard/low-stock-table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TransaccionForm } from "@/components/transacciones/transaccion-form";
import { ProductoForm } from "@/components/productos/producto-form";
import { formatCurrency } from "@/lib/utils";
import { 
  LayoutDashboard, 
  DollarSign, 
  CalendarClock, 
  AlertTriangle, 
  PlusCircle, 
  ShoppingCart 
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  totalProductos: number;
  ventasMes: number;
  rentasActivas: number;
  cantidadBajoStock: number;
}

export default function DashboardPage() {
  const [showTransaccionModal, setShowTransaccionModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false);

  // Obtener estadísticas del dashboard
  const { 
    data: stats, 
    isLoading: isLoadingStats, 
    error: statsError,
    refetch: refetchStats
  } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Obtener productos con bajo stock
  const {
    data: productosConBajoStock,
    isLoading: isLoadingBajoStock,
  } = useQuery<any[]>({
    queryKey: ["/api/productos/bajo-stock"],
  });

  return (
    <Layout title="Dashboard">
      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          onClick={() => setShowProductoModal(true)}
          className="bg-primary text-white flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" /> Nuevo producto
        </Button>
        <Button 
          onClick={() => setShowTransaccionModal(true)}
          className="bg-secondary text-white flex items-center gap-2"
        >
          <ShoppingCart className="h-4 w-4" /> Nueva venta
        </Button>
      </div>

      {/* Tarjetas estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Vestidos en inventario"
          value={isLoadingStats ? "..." : stats?.totalProductos || 0}
          icon={LayoutDashboard}
          trend={{
            value: "12%",
            positive: true,
            label: "desde el mes pasado"
          }}
        />
        
        <StatCard 
          title="Ventas del mes"
          value={isLoadingStats ? "..." : formatCurrency(stats?.ventasMes || 0)}
          icon={DollarSign}
          iconClassName="bg-green-500"
          trend={{
            value: "8%",
            positive: true,
            label: "desde el mes pasado"
          }}
        />
        
        <StatCard 
          title="Rentas activas"
          value={isLoadingStats ? "..." : stats?.rentasActivas || 0}
          icon={CalendarClock}
          iconClassName="bg-secondary"
          trend={{
            value: "5%",
            positive: true,
            label: "desde la semana pasada"
          }}
        />
        
        <StatCard 
          title="Stock bajo"
          value={isLoadingStats ? "..." : stats?.cantidadBajoStock || 0}
          icon={AlertTriangle}
          iconClassName="bg-orange-500"
          trend={{
            value: "2",
            positive: false,
            label: "más que ayer"
          }}
        />
      </div>
      
      {/* Alertas */}
      {productosConBajoStock && productosConBajoStock.length > 0 && (
        <Alert className="bg-warning/10 border-l-4 border-warning mb-6">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <AlertTitle className="text-warning">Alerta de stock bajo</AlertTitle>
          <AlertDescription className="text-gray-700">
            Hay {productosConBajoStock.length} productos con menos de 5 unidades en inventario.{" "}
            <Link href="/productos?filter=bajo-stock">
              <Button variant="link" className="p-0 h-auto text-primary font-medium">
                Ver detalles
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RecentSalesTable />
        <NextReturnsTable />
      </div>
      
      {/* Lista productos stock bajo */}
      <div className="mb-6">
        <LowStockTable />
      </div>

      {/* Modales */}
      <ProductoForm 
        open={showProductoModal} 
        onOpenChange={setShowProductoModal} 
      />
      
      <TransaccionForm 
        open={showTransaccionModal} 
        onOpenChange={setShowTransaccionModal}
        onSuccess={() => refetchStats()}
      />
    </Layout>
  );
}
