import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductoForm } from "@/components/productos/producto-form";
import { Producto } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
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
  Pencil,
  Trash2,
  AlertTriangle,
  Download,
  Filter,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductosPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [location, setLocation] = useLocation();
  
  // Obtener parámetros de URL
  const params = new URLSearchParams(useSearch() || "");
  const filterParam = params.get("filter");

  useEffect(() => {
    // Si hay un parámetro filter=bajo-stock, establecer filtro
    if (filterParam === "bajo-stock") {
      setFiltroTipo("bajo-stock");
    }
  }, [filterParam]);

  // Obtener productos
  const {
    data: productos,
    isLoading,
    error,
    refetch,
  } = useQuery<Producto[]>({
    queryKey: ["/api/productos"],
  });

  // Obtener productos con bajo stock
  const { data: productosBajoStock } = useQuery<Producto[]>({
    queryKey: ["/api/productos/bajo-stock"],
  });

  // Mutación para eliminar producto
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/productos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/productos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/productos/bajo-stock"] });
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      });
      setShowDeleteDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar producto",
        description: error.message || "Ha ocurrido un error al eliminar el producto",
        variant: "destructive",
      });
    },
  });

  // Filtrar productos según criterios
  const productosFiltrados = () => {
    if (!productos) return [];

    let resultado = [...productos];

    // Aplicar filtro por tipo
    if (filtroTipo === "renta") {
      resultado = resultado.filter((p) => p.tipo === "renta");
    } else if (filtroTipo === "venta") {
      resultado = resultado.filter((p) => p.tipo === "venta");
    } else if (filtroTipo === "bajo-stock") {
      resultado = resultado.filter((p) => p.stock < 5);
    }

    // Aplicar filtro de búsqueda
    if (filtroBusqueda) {
      const busqueda = filtroBusqueda.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busqueda) ||
          p.codigo.toLowerCase().includes(busqueda) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(busqueda))
      );
    }

    return resultado;
  };

  // Manejar eliminación de producto
  const handleDeleteProducto = () => {
    if (productoSeleccionado) {
      deleteMutation.mutate(productoSeleccionado.id);
    }
  };

  // Descargar inventario como CSV
  const handleDownloadCSV = () => {
    if (!productos) return;

    const headers = ["Código", "Nombre", "Tipo", "Precio", "Stock"];
    const csvContent = [
      headers.join(","),
      ...productos.map((p) =>
        [
          p.codigo,
          `"${p.nombre.replace(/"/g, '""')}"`,
          p.tipo,
          p.precio,
          p.stock,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventario_violetta_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determinar la clase de color para el tipo de producto
  const getTypeClasses = (tipo: string) => {
    return tipo === "venta"
      ? "bg-green-100 text-green-800"
      : "bg-purple-100 text-purple-800";
  };

  // Determinar la clase de color para el stock
  const getStockClasses = (stock: number) => {
    if (stock <= 2) return "text-red-500 font-medium";
    if (stock <= 4) return "text-orange-500 font-medium";
    return "";
  };

  return (
    <Layout title="Productos">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Gestión de Productos</CardTitle>
              <CardDescription>
                Administra el inventario de vestidos para renta y venta
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowNewForm(true)}
              className="bg-primary text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Producto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                className="pl-10"
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={filtroTipo}
                onValueChange={setFiltroTipo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="renta">Renta</SelectItem>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="bajo-stock">Stock Bajo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleDownloadCSV}>
              <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
          </div>

          {/* Alerta de productos con bajo stock */}
          {productosBajoStock && productosBajoStock.length > 0 && filtroTipo !== "bajo-stock" && (
            <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r-lg mb-6 flex">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-warning">
                  Alerta de stock bajo
                </h3>
                <div className="mt-1 text-sm text-gray-700">
                  <p>
                    Hay {productosBajoStock.length} productos con menos de 5 unidades en inventario.{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary font-medium"
                      onClick={() => setFiltroTipo("bajo-stock")}
                    >
                      Ver sólo productos con stock bajo
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de productos */}
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
              Error al cargar los productos
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        No hay productos que coincidan con los criterios de búsqueda
                      </TableCell>
                    </TableRow>
                  ) : (
                    productosFiltrados().map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.codigo}</TableCell>
                        <TableCell>
                          <div>
                            <div>{producto.nombre}</div>
                            {producto.descripcion && (
                              <div className="text-xs text-gray-500 mt-1">
                                {producto.descripcion.length > 50
                                  ? `${producto.descripcion.substring(0, 50)}...`
                                  : producto.descripcion}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeClasses(
                              producto.tipo
                            )}`}
                          >
                            {producto.tipo === "venta" ? "Venta" : "Renta"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(producto.precio))}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={getStockClasses(producto.stock)}>
                            {producto.stock}
                          </span>
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
                                  setProductoSeleccionado(producto);
                                  setShowEditForm(true);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setProductoSeleccionado(producto);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Eliminar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Total: {productosFiltrados().length} productos
          </div>
          {filtroTipo !== "todos" && (
            <Button variant="ghost" onClick={() => setFiltroTipo("todos")}>
              Ver todos
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Formulario para nuevo producto */}
      <ProductoForm 
        open={showNewForm} 
        onOpenChange={setShowNewForm} 
        mode="create"
      />
      
      {/* Formulario para editar producto */}
      <ProductoForm 
        open={showEditForm} 
        onOpenChange={setShowEditForm} 
        producto={productoSeleccionado || undefined}
        mode="edit"
      />
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar producto?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el producto{" "}
              <strong>{productoSeleccionado?.nombre}</strong> del sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProducto}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
