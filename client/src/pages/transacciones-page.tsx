import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransaccionForm } from "@/components/transacciones/transaccion-form";
import { Transaccion } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, getEstadoTransaccion } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlusCircle,
  Search,
  Eye,
  Download,
  Filter,
  FileText,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { GenerarFactura } from "@/components/transacciones/generar-factura";

interface TransaccionExtendida extends Transaccion {
  cliente?: {
    id: number;
    nombre: string;
    domicilio: string;
    telefono: string;
  };
  producto?: {
    id: number;
    nombre: string;
    codigo: string;
    tipo: string;
    precio: number;
  };
}

export default function TransaccionesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState<TransaccionExtendida | null>(null);
  const [showDetalleDialog, setShowDetalleDialog] = useState(false);
  const [showFacturaDialog, setShowFacturaDialog] = useState(false);

  // Obtener parámetros de URL
  const searchString = useSearch();
  const params = new URLSearchParams(searchString || "");
  const tipoParam = params.get("tipo");
  
  useEffect(() => {
    if (tipoParam === "renta") {
      setFiltroTipo("renta");
    } else if (tipoParam === "venta") {
      setFiltroTipo("venta");
    }
  }, [tipoParam]);

  // Obtener transacciones
  const {
    data: transacciones,
    isLoading,
    error,
    refetch,
  } = useQuery<TransaccionExtendida[]>({
    queryKey: ["/api/transacciones"],
  });

  // Mutación para actualizar el estado de una transacción
  const updateEstadoMutation = useMutation({
    mutationFn: async ({id, estado}: {id: number, estado: string}) => {
      const res = await apiRequest("PUT", `/api/transacciones/${id}`, { estado });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transacciones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transacciones/recientes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transacciones/devoluciones"] });
      
      toast({
        title: "Estado actualizado",
        description: "El estado de la transacción ha sido actualizado",
      });
      
      setShowDetalleDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar estado",
        description: error.message || "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });

  // Filtrar transacciones según criterios
  const transaccionesFiltradas = () => {
    if (!transacciones) return [];

    let resultado = [...transacciones];

    // Aplicar filtro por tipo
    if (filtroTipo !== "todos") {
      resultado = resultado.filter((t) => t.tipo === filtroTipo);
    }

    // Aplicar filtro por estado
    if (filtroEstado !== "todos") {
      resultado = resultado.filter((t) => t.estado === filtroEstado);
    }

    // Aplicar filtro de búsqueda
    if (filtroBusqueda) {
      const busqueda = filtroBusqueda.toLowerCase();
      resultado = resultado.filter(
        (t) =>
          t.folio.toLowerCase().includes(busqueda) ||
          (t.cliente?.nombre && t.cliente.nombre.toLowerCase().includes(busqueda)) ||
          (t.producto?.nombre && t.producto.nombre.toLowerCase().includes(busqueda))
      );
    }

    // Ordenar por fecha de creación (más recientes primero)
    resultado.sort((a, b) => 
      new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    );

    return resultado;
  };

  // Manejar actualización de estado
  const handleUpdateEstado = (estado: string) => {
    if (transaccionSeleccionada) {
      updateEstadoMutation.mutate({
        id: transaccionSeleccionada.id,
        estado
      });
    }
  };

  // Descargar transacciones como CSV
  const handleDownloadCSV = () => {
    if (!transacciones) return;

    const headers = ["Folio", "Cliente", "Producto", "Tipo", "Fecha", "Estado", "Total"];
    const csvContent = [
      headers.join(","),
      ...transaccionesFiltradas().map((t) =>
        [
          t.folio,
          t.cliente?.nombre ? `"${t.cliente.nombre.replace(/"/g, '""')}"` : "",
          t.producto?.nombre ? `"${t.producto.nombre.replace(/"/g, '""')}"` : "",
          t.tipo,
          t.fecha_creacion,
          t.estado,
          t.total,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transacciones_violetta_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="Transacciones">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Gestión de Transacciones</CardTitle>
              <CardDescription>
                Administra ventas y rentas de vestidos
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowNewForm(true)}
              className="bg-primary text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Nueva Transacción
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por folio, cliente o producto..."
                className="pl-10"
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select
                value={filtroTipo}
                onValueChange={setFiltroTipo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="renta">Renta</SelectItem>
                  <SelectItem value="venta">Venta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Select
                value={filtroEstado}
                onValueChange={setFiltroEstado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="devuelto">Devuelto</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleDownloadCSV}>
              <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
          </div>

          {/* Tabla de transacciones */}
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              Error al cargar las transacciones
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaccionesFiltradas().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                        No hay transacciones que coincidan con los criterios de búsqueda
                      </TableCell>
                    </TableRow>
                  ) : (
                    transaccionesFiltradas().map((transaccion) => {
                      const estado = getEstadoTransaccion(
                        transaccion.estado, 
                        transaccion.tipo, 
                        transaccion.fecha_devolucion
                      );
                      
                      return (
                        <TableRow key={transaccion.id}>
                          <TableCell className="font-medium">{transaccion.folio}</TableCell>
                          <TableCell>{transaccion.cliente?.nombre || "N/A"}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaccion.tipo === "venta"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {transaccion.tipo === "venta" ? "Venta" : "Renta"}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(transaccion.fecha_creacion)}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estado.clase}`}
                            >
                              {estado.texto}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number(transaccion.total))}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menú</span>
                                  <Filter className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setTransaccionSeleccionada(transaccion);
                                    setShowDetalleDialog(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Ver detalles</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setTransaccionSeleccionada(transaccion);
                                    setShowFacturaDialog(true);
                                  }}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Generar factura</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Total: {transaccionesFiltradas().length} transacciones
          </div>
          {(filtroTipo !== "todos" || filtroEstado !== "todos") && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setFiltroTipo("todos");
                setFiltroEstado("todos");
              }}
            >
              Mostrar todas
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Modal para nueva transacción */}
      <TransaccionForm 
        open={showNewForm} 
        onOpenChange={setShowNewForm} 
        onSuccess={() => refetch()}
      />
      
      {/* Modal de detalles de transacción */}
      <Dialog open={showDetalleDialog} onOpenChange={setShowDetalleDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Detalles de Transacción</DialogTitle>
          </DialogHeader>
          
          {transaccionSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Folio</h4>
                  <p className="text-lg font-semibold">{transaccionSeleccionada.folio}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tipo</h4>
                  <p className="text-lg">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaccionSeleccionada.tipo === "venta"
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {transaccionSeleccionada.tipo === "venta" ? "Venta" : "Renta"}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Cliente</h4>
                <div className="border p-3 rounded-md">
                  <p className="font-medium">{transaccionSeleccionada.cliente?.nombre || "N/A"}</p>
                  <p className="text-sm text-gray-500">{transaccionSeleccionada.cliente?.domicilio || "N/A"}</p>
                  <p className="text-sm text-gray-500">Tel: {transaccionSeleccionada.cliente?.telefono || "N/A"}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Producto</h4>
                <div className="border p-3 rounded-md">
                  <p className="font-medium">{transaccionSeleccionada.producto?.nombre || "N/A"}</p>
                  <p className="text-sm text-gray-500">Código: {transaccionSeleccionada.producto?.codigo || "N/A"}</p>
                  <p className="text-sm text-gray-500">Precio: {transaccionSeleccionada.producto ? formatCurrency(Number(transaccionSeleccionada.producto.precio)) : "N/A"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha de Entrega</h4>
                  <p>{formatDate(transaccionSeleccionada.fecha_entrega)}</p>
                </div>
                {transaccionSeleccionada.tipo === "renta" && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Fecha de Devolución</h4>
                    <p>{transaccionSeleccionada.fecha_devolucion ? formatDate(transaccionSeleccionada.fecha_devolucion) : "N/A"}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total</h4>
                  <p className="text-lg font-semibold text-primary">{formatCurrency(Number(transaccionSeleccionada.total))}</p>
                </div>
                {transaccionSeleccionada.abono && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Abono</h4>
                      <p>{formatCurrency(Number(transaccionSeleccionada.abono))}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Pendiente</h4>
                      <p>{formatCurrency(Number(transaccionSeleccionada.total) - Number(transaccionSeleccionada.abono))}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Estado</h4>
                <div className="flex gap-2">
                  <Button
                    variant={transaccionSeleccionada.estado === "pendiente" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateEstado("pendiente")}
                    disabled={updateEstadoMutation.isPending}
                  >
                    Pendiente
                  </Button>
                  <Button
                    variant={transaccionSeleccionada.estado === "entregado" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateEstado("entregado")}
                    disabled={updateEstadoMutation.isPending}
                  >
                    Entregado
                  </Button>
                  {transaccionSeleccionada.tipo === "renta" && (
                    <Button
                      variant={transaccionSeleccionada.estado === "devuelto" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateEstado("devuelto")}
                      disabled={updateEstadoMutation.isPending}
                    >
                      Devuelto
                    </Button>
                  )}
                  <Button
                    variant={transaccionSeleccionada.estado === "completado" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateEstado("completado")}
                    disabled={updateEstadoMutation.isPending}
                  >
                    Completado
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDetalleDialog(false)}
            >
              Cerrar
            </Button>
            <Button 
              onClick={() => {
                setShowDetalleDialog(false);
                setShowFacturaDialog(true);
              }}
            >
              Generar Factura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para generar factura */}
      {transaccionSeleccionada && (
        <GenerarFactura
          open={showFacturaDialog}
          onOpenChange={setShowFacturaDialog}
          transaccion={transaccionSeleccionada}
        />
      )}
    </Layout>
  );
}
