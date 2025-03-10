import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, User, Bell, Printer, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Esquema para el formulario de perfil
const profileFormSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  username: z.string().min(3, {
    message: "El nombre de usuario debe tener al menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido.",
  }),
});

// Esquema para el formulario de contraseña
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "La contraseña actual debe tener al menos 6 caracteres.",
  }),
  newPassword: z.string().min(6, {
    message: "La nueva contraseña debe tener al menos 6 caracteres.",
  }),
  confirmPassword: z.string().min(6, {
    message: "La confirmación de contraseña debe tener al menos 6 caracteres.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Esquema para el formulario de notificaciones
const notificationsFormSchema = z.object({
  stockBajo: z.boolean().default(true),
  proximasDevoluciones: z.boolean().default(true),
  ventasNuevas: z.boolean().default(true),
  actualizacionesSistema: z.boolean().default(false),
});

// Esquema para el formulario de empresa
const empresaFormSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  rfc: z.string().min(12, {
    message: "El RFC debe tener al menos 12 caracteres.",
  }).max(13, {
    message: "El RFC no debe exceder 13 caracteres.",
  }),
  direccion: z.string().min(10, {
    message: "La dirección debe tener al menos 10 caracteres.",
  }),
  telefono: z.string().min(8, {
    message: "El teléfono debe tener al menos 8 caracteres.",
  }),
  horario: z.string(),
});

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");

  // Formulario de perfil
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nombre: user?.nombre || "",
      username: user?.username || "",
      email: "usuario@ejemplo.com",
    },
  });

  // Formulario de contraseña
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Formulario de notificaciones
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      stockBajo: true,
      proximasDevoluciones: true,
      ventasNuevas: true,
      actualizacionesSistema: false,
    },
  });

  // Formulario de empresa
  const empresaForm = useForm<z.infer<typeof empresaFormSchema>>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      nombre: "Violett à",
      rfc: "GASP87112716A",
      direccion: "Calle Niños Héroes 89, Col. Bellavista, CP 60050 Uruapan, Mich.",
      telefono: "4521234567",
      horario: "Lunes-Viernes (11:00-14:00 / 16:00-20:00), Sábado (11:00-13:00)",
    },
  });

  // Manejar envío del formulario de perfil
  function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    toast({
      title: "Perfil actualizado",
      description: "La información de tu perfil ha sido actualizada correctamente.",
    });
  }

  // Manejar envío del formulario de contraseña
  function onPasswordSubmit(data: z.infer<typeof passwordFormSchema>) {
    toast({
      title: "Contraseña actualizada",
      description: "Tu contraseña ha sido actualizada correctamente.",
    });
    passwordForm.reset();
  }

  // Manejar envío del formulario de notificaciones
  function onNotificationsSubmit(data: z.infer<typeof notificationsFormSchema>) {
    toast({
      title: "Preferencias actualizadas",
      description: "Tus preferencias de notificaciones han sido actualizadas.",
    });
  }

  // Manejar envío del formulario de empresa
  function onEmpresaSubmit(data: z.infer<typeof empresaFormSchema>) {
    toast({
      title: "Información actualizada",
      description: "La información de la empresa ha sido actualizada correctamente.",
    });
  }

  return (
    <Layout title="Configuración">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid sm:grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="perfil" className="flex items-center gap-2 py-2">
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="flex items-center gap-2 py-2">
            <Bell className="h-4 w-4" />
            <span>Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="empresa" className="flex items-center gap-2 py-2">
            <Printer className="h-4 w-4" />
            <span>Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2 py-2">
            <Settings className="h-4 w-4" />
            <span>Sistema</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Contenido de la pestaña de Perfil */}
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Información de Perfil</CardTitle>
              <CardDescription>
                Actualiza la información de tu cuenta en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
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
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de Usuario</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Guardar Cambios</Button>
                </form>
              </Form>
              
              <Separator />
              
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
                  
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña Actual</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Contraseña</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">Cambiar Contraseña</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenido de la pestaña de Notificaciones */}
        <TabsContent value="notificaciones">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>
                Configura qué notificaciones deseas recibir en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-4">
                  <FormField
                    control={notificationsForm.control}
                    name="stockBajo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Alertas de Stock Bajo</FormLabel>
                          <FormDescription>
                            Notificaciones cuando un producto tenga menos de 5 unidades.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="proximasDevoluciones"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Próximas Devoluciones</FormLabel>
                          <FormDescription>
                            Notificaciones sobre devoluciones programadas para los próximos días.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="ventasNuevas"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Nuevas Ventas</FormLabel>
                          <FormDescription>
                            Notificaciones cuando se registre una nueva venta o renta.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="actualizacionesSistema"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>Actualizaciones del Sistema</FormLabel>
                          <FormDescription>
                            Notificaciones sobre nuevas funcionalidades y actualizaciones.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Guardar Preferencias</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenido de la pestaña de Empresa */}
        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
              <CardDescription>
                Actualiza la información que aparecerá en las facturas y documentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...empresaForm}>
                <form onSubmit={empresaForm.handleSubmit(onEmpresaSubmit)} className="space-y-4">
                  <FormField
                    control={empresaForm.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Empresa</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={empresaForm.control}
                    name="rfc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFC</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={empresaForm.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={empresaForm.control}
                    name="telefono"
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
                  
                  <FormField
                    control={empresaForm.control}
                    name="horario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horario de Atención</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Ejemplo: Lunes-Viernes (11:00-14:00 / 16:00-20:00), Sábado (11:00-13:00)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Guardar Información</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenido de la pestaña de Sistema */}
        <TabsContent value="sistema">
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
              <CardDescription>
                Detalles y configuración del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-md bg-sky-50 p-4">
                  <div className="flex">
                    <Info className="h-5 w-5 text-sky-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sky-900">Acerca del Sistema</h3>
                      <div className="mt-2 text-sm text-sky-800">
                        <p>Sistema de Gestión de Inventario para la boutique Violett à</p>
                        <p className="mt-1">Versión 1.0.0</p>
                        <p className="mt-1">© 2023 Violett à. Todos los derechos reservados.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Estado del Sistema</h3>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Sistema operando normalmente</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Base de Datos</h3>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Conectada</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Realizar Respaldo</h3>
                  <p className="text-sm text-gray-500">
                    Crea un respaldo de todos los datos del sistema incluyendo productos, 
                    clientes, transacciones y configuraciones.
                  </p>
                  <Button>Crear Respaldo</Button>
                </div>
                
                <Separator />
                
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Zona de Peligro</AlertTitle>
                  <AlertDescription>
                    Las siguientes acciones son destructivas y no se pueden deshacer.
                    Proceda con precaución.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Reiniciar Datos de Ejemplo</h3>
                  <p className="text-sm text-gray-500">
                    Elimina todos los datos y restaura el sistema a su estado inicial con 
                    datos de muestra. Esta acción no se puede deshacer.
                  </p>
                  <Button variant="destructive">Reiniciar Datos</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
