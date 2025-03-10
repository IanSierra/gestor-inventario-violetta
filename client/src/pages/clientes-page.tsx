import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cliente } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  Search,
  Pencil,
  Eye,
  Filter,
  Download,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Esquema para validación del formulario de cliente
const clienteSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  domicilio: z.string().min(5, "El domicilio debe tener al menos 5 caracteres"),
  telefono: z.string()
    .min(8, "El teléfono debe tener al menos 8 caracteres")
    .max(15, "El teléfono no debe exceder 15 caracteres")
    .regex(/^[0-9]+$/, "El teléfono solo debe contener números")
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

export default function ClientesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showDetallesDialog, setShowDetallesDialog] = useState(false);

  // Configurar formulario
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: "",
      domicilio: "",
      telefono: ""
    },
  });

  // Resetear formulario cuando cambia el modo o cliente seleccionado
  const resetForm = () => {
    if (formMode === "edit" && clienteSeleccionado) {
      form.reset({
        nombre: clienteSeleccionado.nombre,
        domicilio: clienteSeleccionado.domicilio,
        telefono: clienteSeleccionado.telefono
      });
    } else {
      form.reset({
        nombre: "",
        domicilio: "",
        telefono: ""
      });
    }
  };

  // Obtener clientes
  const {
    data: clientes,
    isLoading,
    error,
  } = useQuery<Cliente[]>({
    queryKey: ["/api/clientes"],
  });

  // Mutación para crear cliente
  const createMutation = useMutation({
    mutationFn: async (data: ClienteFormValues) => {
      const res = await apiRequest("POST", "/api/clientes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clientes"] });
      toast({
        title: "Cliente creado",
        description: "El cliente se ha creado correctamente",
      });
      setShowFormDialog(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear cliente",
        description: error.message || "Ha ocurrido un error al crear el cliente",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar cliente
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ClienteFormValues }) => {
      const res = await apiRequest("PUT", `/api/clientes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clientes"] });
      toast({
        title: "Cliente actualizado",
        description: "El cliente se ha actualizado correctamente",
      });
      setShowFormDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar cliente",
        description: error.message || "Ha ocurrido un error al actualizar el cliente",
        variant: "destructive",
      });
    },
  });

  // Filtrar clientes según criterios de búsqueda
  const clientesFiltrados = () => {
    if (!clientes) return [];

    if (!filtroBusqueda) return clientes;

    const busqueda = filtroBusqueda.toLowerCase();
    return clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(busqueda) ||
        cliente.telefono.includes(busqueda) ||
        cliente.domicilio.toLowerCase().includes(busqueda)
    );
  };

  // Manejar nuevo cliente
  const handleNuevoCliente = () => {
    setFormMode("create");
    setClienteSeleccionado(null);
    resetForm();
    setShowFormDialog(true);
  };

  // Manejar edición de cliente
  const handleEditarCliente = (cliente: Cliente) => {
    setFormMode("edit");
    setClienteSeleccionado(cliente);
    setShowFormDialog(true);
  };

  // Manejar envío del formulario
  const onSubmit = (data: ClienteFormValues) => {
    if (formMode === "create") {
      createMutation.mutate(data);
    } else if (formMode === "edit" && clienteSeleccionado) {
      updateMutation.mutate({ id: clienteSeleccionado.id, data });
    }
  };

  // Descargar clientes como CSV
  const handleDownloadCSV = () => {
    if (!clientes) return;

    const headers = ["ID", "Nombre", "Domicilio", "Teléfono"];
    const csvContent = [
      headers.join(","),
      ...clientesFiltrados().map((c) =>
        [
          c.id,
          `"${c.nombre.replace(/"/g, '""')}"`,
          `"${c.domicilio.replace(/"/g, '""')}"`,
          c.telefono,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes_violetta_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Efecto para cargar datos de cliente en el formulario
  useEffect(() => {
    resetForm();
  }, [clienteSeleccionado, formMode]);

  return (
    <Layout title="Clientes">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Gestión de Clientes</CardTitle>
              <CardDescription>
                Administra los clientes de la boutique
              </CardDescription>
            </div>
            <Button
              onClick={handleNuevoCliente}
              className="bg-primary text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar clientes..."
                className="pl-10"
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleDownloadCSV}>
              <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
          </div>

          {/* Tabla de clientes */}
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
              Error al cargar los clientes
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Domicilio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                        No hay clientes que coincidan con los criterios de búsqueda
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientesFiltrados().map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nombre}</TableCell>
                        <TableCell>{cliente.telefono}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {cliente.domicilio}
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
                                  setClienteSeleccionado(cliente);
                                  setShowDetallesDialog(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Ver detalles</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditarCliente(cliente)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Editar</span>
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
            Total: {clientesFiltrados().length} clientes
          </div>
        </CardFooter>
      </Card>

      {/* Formulario de cliente (crear/editar) */}
      <Dialog open={showFormDialog} onOpenChange={(open) => {
        setShowFormDialog(open);
        if (!open) form.reset();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Nuevo Cliente" : "Editar Cliente"}
            </DialogTitle>
            <DialogDescription>
              Completa la información del cliente para continuar.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="domicilio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domicilio</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFormDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Guardando..."
                    : formMode === "create"
                    ? "Crear"
                    : "Actualizar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de detalles del cliente */}
      <Dialog open={showDetallesDialog} onOpenChange={setShowDetallesDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          
          {clienteSeleccionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{clienteSeleccionado.nombre}</h3>
                  <p className="text-sm text-gray-500">ID: {clienteSeleccionado.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 border-t pt-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Teléfono</h4>
                  <p className="text-lg">{clienteSeleccionado.telefono}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Domicilio</h4>
                  <p className="text-lg">{clienteSeleccionado.domicilio}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDetallesDialog(false)}
            >
              Cerrar
            </Button>
            <Button 
              onClick={() => {
                setShowDetallesDialog(false);
                handleEditarCliente(clienteSeleccionado!);
              }}
            >
              Editar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
