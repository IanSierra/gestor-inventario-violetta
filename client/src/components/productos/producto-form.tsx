import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductoSchema, Producto } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface ProductoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto?: Producto;
  mode?: "create" | "edit";
}

// Esquema extendido para validación
const productoFormSchema = insertProductoSchema.extend({
  codigo: z.string().min(3, "El código debe tener al menos 3 caracteres"),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  tipo: z.enum(["renta", "venta"], { message: "Seleccione un tipo válido" }),
  precio: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0, "El precio debe ser mayor o igual a 0")
  ),
  stock: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(0, "El stock debe ser mayor o igual a 0")
  ),
});

type ProductoFormValues = z.infer<typeof productoFormSchema>;

export function ProductoForm({
  open,
  onOpenChange,
  producto,
  mode = "create",
}: ProductoFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = mode === "edit";

  // Configurar formulario
  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoFormSchema),
    defaultValues: {
      codigo: producto?.codigo || "",
      nombre: producto?.nombre || "",
      descripcion: producto?.descripcion || "",
      tipo: producto?.tipo || "renta",
      precio: producto?.precio || 0,
      stock: producto?.stock || 0,
    },
  });

  // Mutación para crear producto
  const createMutation = useMutation({
    mutationFn: async (data: ProductoFormValues) => {
      const res = await apiRequest("POST", "/api/productos", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/productos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/productos/bajo-stock"] });
      onOpenChange(false);
      form.reset();
      toast({
        title: "Producto creado",
        description: "El producto se ha creado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear producto",
        description: error.message || "Ha ocurrido un error al crear el producto",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar producto
  const updateMutation = useMutation({
    mutationFn: async (data: ProductoFormValues) => {
      if (!producto) throw new Error("No se puede editar: producto no especificado");
      const res = await apiRequest("PUT", `/api/productos/${producto.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/productos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/productos/bajo-stock"] });
      queryClient.invalidateQueries({ queryKey: [`/api/productos/${producto?.id}`] });
      onOpenChange(false);
      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar producto",
        description: error.message || "Ha ocurrido un error al actualizar el producto",
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (data: ProductoFormValues) => {
    // Convertir valores numéricos a strings para la API
    const dataForSubmit = {
      ...data,
      precio: data.precio.toString(),
      stock: data.stock.toString()
    };
    
    if (isEditing) {
      updateMutation.mutate(dataForSubmit);
    } else {
      createMutation.mutate(dataForSubmit);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: VD-101" 
                        {...field} 
                        disabled={isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="renta">Renta</SelectItem>
                        <SelectItem value="venta">Venta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del producto</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Vestido Noche Elegante" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción detallada del producto" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
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
              
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
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

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  isEditing ? "Actualizar" : "Guardar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
