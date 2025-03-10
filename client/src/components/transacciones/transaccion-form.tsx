import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { transaccionFormSchema, Producto } from "@shared/schema";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TransaccionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Formulario extendido para la creación de transacciones
const transaccionSchema = transaccionFormSchema.extend({
  cliente_nombre: z.string().min(1, "El nombre del cliente es requerido"),
  cliente_domicilio: z.string().min(1, "El domicilio del cliente es requerido"),
  cliente_telefono: z.string().min(8, "El teléfono debe tener al menos 8 caracteres")
    .max(15, "El teléfono no debe exceder 15 caracteres")
    .regex(/^[0-9]+$/, "El teléfono solo debe contener números"),
  id_producto: z.string().min(1, "Debe seleccionar un producto"),
  tipo: z.enum(["renta", "venta"], { message: "Debe seleccionar un tipo de transacción" }),
  fecha_entrega: z.string().min(1, "La fecha de entrega es requerida"),
  fecha_devolucion: z.string().optional(),
  abono: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0, "El abono debe ser mayor o igual a 0")
  ),
  total: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0, "El total debe ser mayor o igual a 0")
  ),
});

type TransaccionFormValues = z.infer<typeof transaccionSchema>;

export function TransaccionForm({
  open,
  onOpenChange,
  onSuccess,
}: TransaccionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tipoTransaccion, setTipoTransaccion] = useState<"renta" | "venta">("renta");
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Obtener lista de productos
  const { data: productos, isLoading: isLoadingProductos } = useQuery<Producto[]>({
    queryKey: ["/api/productos"],
  });

  // Configurar formulario
  const form = useForm<TransaccionFormValues>({
    resolver: zodResolver(transaccionSchema),
    defaultValues: {
      cliente_nombre: "",
      cliente_domicilio: "",
      cliente_telefono: "",
      id_producto: "",
      tipo: "renta",
      fecha_entrega: new Date().toISOString().split("T")[0],
      fecha_devolucion: "",
      abono: 0,
      total: 0,
      fecha_creacion: new Date().toISOString().split("T")[0],
      estado: "pendiente",
      folio: "",
      id_cliente: 0,
    },
  });

  // Actualizar valores por defecto cuando cambia el tipo
  useEffect(() => {
    form.setValue("tipo", tipoTransaccion);
    
    // Si es venta, limpiar fecha de devolución; si es renta, establecer fecha por defecto
    if (tipoTransaccion === "venta") {
      form.setValue("fecha_devolucion", "");
    } else {
      // Calcular fecha de devolución por defecto (3 días después)
      const fechaEntrega = form.getValues("fecha_entrega");
      if (fechaEntrega) {
        const fecha = new Date(fechaEntrega);
        fecha.setDate(fecha.getDate() + 3);
        form.setValue("fecha_devolucion", fecha.toISOString().split("T")[0]);
      }
    }
  }, [tipoTransaccion, form]);

  // Actualizar producto seleccionado cuando cambia
  useEffect(() => {
    const productoId = form.getValues("id_producto");
    if (productoId && productos) {
      const producto = productos.find(p => p.id === parseInt(productoId));
      setProductoSeleccionado(producto || null);
      
      if (producto) {
        form.setValue("total", Number(producto.precio));
      }
    }
  }, [form.watch("id_producto"), productos]);

  // Calcular total pendiente cuando cambia el abono
  useEffect(() => {
    const total = Number(form.getValues("total"));
    const abono = Number(form.getValues("abono"));
    
    // Validar que el abono no sea mayor que el total
    if (abono > total) {
      form.setValue("abono", total);
    }
  }, [form.watch("abono")]);

  // Validar fechas de entrega y devolución
  useEffect(() => {
    const fechaEntrega = form.getValues("fecha_entrega");
    const fechaDevolucion = form.getValues("fecha_devolucion");
    
    if (fechaEntrega && fechaDevolucion && tipoTransaccion === "renta") {
      const entrega = new Date(fechaEntrega);
      const devolucion = new Date(fechaDevolucion);
      
      if (devolucion < entrega) {
        toast({
          title: "Error de fechas",
          description: "La fecha de devolución debe ser posterior a la fecha de entrega",
          variant: "destructive",
        });
        
        // Corregir fecha de devolución (1 día después de entrega)
        const nuevaFecha = new Date(entrega);
        nuevaFecha.setDate(nuevaFecha.getDate() + 1);
        form.setValue("fecha_devolucion", nuevaFecha.toISOString().split("T")[0]);
      }
    }
  }, [form.watch("fecha_entrega"), form.watch("fecha_devolucion")]);

  // Mutación para crear transacción
  const createMutation = useMutation({
    mutationFn: async (data: TransaccionFormValues) => {
      const res = await apiRequest("POST", "/api/transacciones", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transacciones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transacciones/recientes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transacciones/devoluciones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/productos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/productos/bajo-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      onOpenChange(false);
      form.reset();
      toast({
        title: "Transacción creada",
        description: "La transacción se ha creado correctamente",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear transacción",
        description: error.message || "Ha ocurrido un error al crear la transacción",
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (data: TransaccionFormValues) => {
    // Convertir id_producto a número
    const formData = {
      ...data,
      id_producto: parseInt(data.id_producto),
    };
    
    createMutation.mutate(formData);
  };

  // Calcular pendiente por pagar
  const calcularPendiente = () => {
    const total = Number(form.getValues("total")) || 0;
    const abono = Number(form.getValues("abono")) || 0;
    return total - abono;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Nueva Transacción</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="renta" value={tipoTransaccion} onValueChange={(v) => setTipoTransaccion(v as "renta" | "venta")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="renta">Renta</TabsTrigger>
            <TabsTrigger value="venta">Venta</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              {/* Datos del cliente */}
              <h4 className="font-medium text-gray-700">Datos del cliente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cliente_nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cliente_telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="cliente_domicilio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domicilio</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Datos de la transacción */}
              <h4 className="font-medium text-gray-700 pt-2">
                Datos de la {tipoTransaccion === "renta" ? "renta" : "venta"}
              </h4>
              
              <FormField
                control={form.control}
                name="id_producto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Producto</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un producto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingProductos ? (
                          <SelectItem value="loading" disabled>
                            Cargando productos...
                          </SelectItem>
                        ) : (
                          productos?.map((producto) => (
                            <SelectItem 
                              key={producto.id} 
                              value={producto.id.toString()}
                              disabled={producto.stock <= 0}
                            >
                              {producto.nombre} - {producto.codigo} 
                              {producto.stock <= 0 ? " (Sin stock)" : ""}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fecha_entrega"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de entrega</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {tipoTransaccion === "renta" && (
                  <FormField
                    control={form.control}
                    name="fecha_devolucion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de devolución</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Precio de {tipoTransaccion === "renta" ? "renta" : "venta"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          readOnly={productoSeleccionado !== null}
                          className={productoSeleccionado ? "bg-gray-50" : ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? "" : Number(value));
                          }}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="abono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abono</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? "" : Number(value));
                          }}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="border-t pt-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    {tipoTransaccion === "renta" ? "Total a pagar al devolver:" : "Saldo pendiente:"}
                  </p>
                  <p className="text-xl font-semibold text-primary">
                    {formatCurrency(calcularPendiente())}
                  </p>
                </div>
                
                <DialogFooter className="sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar transacción"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
