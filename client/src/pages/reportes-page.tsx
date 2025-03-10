import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DownloadIcon, PieChartIcon, BarChartIcon, ListIcon, TableIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface VentasPorMes {
  mes: string;
  ventas: number;
  rentas: number;
  total: number;
}

interface ProductoPopular {
  id: number;
  nombre: string;
  codigo: string;
  cantidad: number;
  tipo: string;
}

interface EstadisticasTipos {
  name: string;
  value: number;
  color: string;
}

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState<string>(
    format(new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1), "yyyy-MM-dd")
  );
  const [fechaFin, setFechaFin] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  // Datos de ejemplo para ventas por mes
  const dataVentasPorMes: VentasPorMes[] = [
    { mes: "Enero", ventas: 12500, rentas: 8300, total: 20800 },
    { mes: "Febrero", ventas: 15800, rentas: 9200, total: 25000 },
    { mes: "Marzo", ventas: 14200, rentas: 8700, total: 22900 },
    { mes: "Abril", ventas: 16500, rentas: 10200, total: 26700 },
    { mes: "Mayo", ventas: 18900, rentas: 11500, total: 30400 },
    { mes: "Junio", ventas: 21200, rentas: 12800, total: 34000 },
  ];

  // Datos de ejemplo para productos populares
  const dataProductosPopulares: ProductoPopular[] = [
    { id: 1, nombre: "Vestido Noche Elegante", codigo: "VD-101", cantidad: 12, tipo: "renta" },
    { id: 2, nombre: "Vestido Cocktail Rosa", codigo: "VD-245", cantidad: 9, tipo: "venta" },
    { id: 3, nombre: "Vestido Largo Sirena", codigo: "VD-189", cantidad: 8, tipo: "renta" },
    { id: 4, nombre: "Vestido Fiesta Brillante", codigo: "VD-322", cantidad: 7, tipo: "renta" },
    { id: 5, nombre: "Vestido Gala Dorado", codigo: "VD-456", cantidad: 6, tipo: "renta" },
  ];

  // Datos de ejemplo para tipos de transacciones
  const dataTiposTransacciones: EstadisticasTipos[] = [
    { name: "Ventas", value: 38, color: "#4CAF50" },
    { name: "Rentas", value: 62, color: "#9C27B0" },
  ];

  // Estado de ventas actuales
  const dataEstadoVentas: EstadisticasTipos[] = [
    { name: "Completadas", value: 45, color: "#4CAF50" },
    { name: "Pendientes", value: 15, color: "#FF9800" },
    { name: "Entregadas", value: 30, color: "#2196F3" },
    { name: "Devueltas", value: 10, color: "#9C27B0" },
  ];

  // Colores para gráficos
  const COLORS = ["#4CAF50", "#9C27B0", "#2196F3", "#FF9800", "#F44336"];

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", { locale: es });
  };

  // Exportar a CSV
  const exportToCSV = (data: any[], filename: string) => {
    let csvContent = "";
    
    // Extraer encabezados
    const headers = Object.keys(data[0]);
    csvContent += headers.join(",") + "\n";
    
    // Agregar filas
    data.forEach(item => {
      const row = headers.map(header => {
        const cell = item[header];
        // Escapar comas y comillas
        const cellStr = cell !== undefined && cell !== null ? cell.toString() : "";
        return cellStr.includes(",") ? `"${cellStr.replace(/"/g, '""')}"` : cellStr;
      });
      csvContent += row.join(",") + "\n";
    });
    
    // Crear y descargar el archivo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="Reportes">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reportes y Estadísticas</CardTitle>
          <CardDescription>
            Visualiza estadísticas de ventas, rentas y productos populares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="fecha-fin">Fecha Fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button>Aplicar Filtro</Button>
            </div>
          </div>

          <Tabs defaultValue="ventas">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="ventas" className="flex items-center gap-2">
                <BarChartIcon className="h-4 w-4" /> Ventas
              </TabsTrigger>
              <TabsTrigger value="productos" className="flex items-center gap-2">
                <ListIcon className="h-4 w-4" /> Productos
              </TabsTrigger>
              <TabsTrigger value="distribucion" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" /> Distribución
              </TabsTrigger>
              <TabsTrigger value="estado" className="flex items-center gap-2">
                <TableIcon className="h-4 w-4" /> Estado
              </TabsTrigger>
            </TabsList>

            {/* Contenido de la pestaña Ventas */}
            <TabsContent value="ventas">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Ventas y Rentas por Mes</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportToCSV(dataVentasPorMes, 'ventas_por_mes')}
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" /> Exportar
                    </Button>
                  </div>
                  <CardDescription>
                    Comparativa de ingresos por ventas y rentas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dataVentasPorMes}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => formatCurrency(Number(value))}
                          labelFormatter={(label) => `Mes: ${label}`}
                        />
                        <Legend />
                        <Bar 
                          dataKey="ventas" 
                          name="Ventas" 
                          fill="#4CAF50" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="rentas" 
                          name="Rentas" 
                          fill="#9C27B0" 
                          radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Periodo: {formatDate(fechaInicio)} - {formatDate(fechaFin)}
                  </p>
                  <p className="font-semibold text-lg mt-2">
                    Total de ventas en el periodo: {formatCurrency(105800)}
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Contenido de la pestaña Productos */}
            <TabsContent value="productos">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Productos Más Populares</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportToCSV(dataProductosPopulares, 'productos_populares')}
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" /> Exportar
                    </Button>
                  </div>
                  <CardDescription>
                    Los vestidos más vendidos o rentados en el periodo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dataProductosPopulares.map((producto) => (
                          <TableRow key={producto.id}>
                            <TableCell className="font-medium">{producto.codigo}</TableCell>
                            <TableCell>{producto.nombre}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  producto.tipo === "venta"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {producto.tipo === "venta" ? "Venta" : "Renta"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{producto.cantidad}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Periodo: {formatDate(fechaInicio)} - {formatDate(fechaFin)}
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Contenido de la pestaña Distribución */}
            <TabsContent value="distribucion">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Distribución de Transacciones</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportToCSV(dataTiposTransacciones, 'distribucion_transacciones')}
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" /> Exportar
                    </Button>
                  </div>
                  <CardDescription>
                    Proporción entre ventas y rentas realizadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="h-80 w-full max-w-lg">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataTiposTransacciones}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {dataTiposTransacciones.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `${value}%`}
                          labelFormatter={(label) => ``}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Periodo: {formatDate(fechaInicio)} - {formatDate(fechaFin)}
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Contenido de la pestaña Estado */}
            <TabsContent value="estado">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Estado de Transacciones</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportToCSV(dataEstadoVentas, 'estado_transacciones')}
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" /> Exportar
                    </Button>
                  </div>
                  <CardDescription>
                    Distribución de transacciones según su estado actual
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="h-80 w-full max-w-lg">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataEstadoVentas}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {dataEstadoVentas.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `${value}%`}
                          labelFormatter={(label) => ``}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Periodo: {formatDate(fechaInicio)} - {formatDate(fechaFin)}
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Layout>
  );
}
