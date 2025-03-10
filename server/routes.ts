import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProductoSchema, 
  insertClienteSchema, 
  insertTransaccionSchema,
  transaccionFormSchema
} from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configura autenticación
  setupAuth(app);

  // ----- API para productos -----
  app.get("/api/productos", async (req: Request, res: Response) => {
    try {
      const productos = await storage.getAllProductos();
      res.status(200).json(productos);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productos" });
    }
  });

  app.get("/api/productos/bajo-stock", async (req: Request, res: Response) => {
    try {
      const productos = await storage.getProductosBajoStock(10);
      res.status(200).json(productos);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productos con bajo stock" });
    }
  });

  app.get("/api/productos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const producto = await storage.getProducto(id);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.status(200).json(producto);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el producto" });
    }
  });

  app.post("/api/productos", async (req: Request, res: Response) => {
    try {
      const productoData = insertProductoSchema.parse(req.body);
      
      // Verificar si el código ya existe
      const existingProducto = await storage.getProductoByCodigo(productoData.codigo);
      if (existingProducto) {
        return res.status(400).json({ message: "El código del producto ya existe" });
      }
      
      const nuevoProducto = await storage.createProducto(productoData);
      res.status(201).json(nuevoProducto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de producto inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error al crear el producto" });
    }
  });

  app.put("/api/productos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const productoData = insertProductoSchema.partial().parse(req.body);
      
      // Si se actualiza el código, verificar que no exista
      if (productoData.codigo) {
        const existingProducto = await storage.getProductoByCodigo(productoData.codigo);
        if (existingProducto && existingProducto.id !== id) {
          return res.status(400).json({ message: "El código del producto ya existe" });
        }
      }
      
      const productoActualizado = await storage.updateProducto(id, productoData);
      if (!productoActualizado) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.status(200).json(productoActualizado);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de producto inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error al actualizar el producto" });
    }
  });

  app.delete("/api/productos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteProducto(id);
      if (!result) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.status(200).json({ message: "Producto eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el producto" });
    }
  });

  // ----- API para clientes -----
  app.get("/api/clientes", async (req: Request, res: Response) => {
    try {
      const clientes = await storage.getAllClientes();
      res.status(200).json(clientes);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener clientes" });
    }
  });

  app.get("/api/clientes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const cliente = await storage.getCliente(id);
      if (!cliente) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      res.status(200).json(cliente);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el cliente" });
    }
  });

  app.post("/api/clientes", async (req: Request, res: Response) => {
    try {
      const clienteData = insertClienteSchema.parse(req.body);
      const nuevoCliente = await storage.createCliente(clienteData);
      res.status(201).json(nuevoCliente);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de cliente inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error al crear el cliente" });
    }
  });

  app.put("/api/clientes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const clienteData = insertClienteSchema.partial().parse(req.body);
      const clienteActualizado = await storage.updateCliente(id, clienteData);
      if (!clienteActualizado) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      res.status(200).json(clienteActualizado);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de cliente inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error al actualizar el cliente" });
    }
  });

  // ----- API para transacciones -----
  app.get("/api/transacciones", async (req: Request, res: Response) => {
    try {
      const transacciones = await storage.getAllTransacciones();
      res.status(200).json(transacciones);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener transacciones" });
    }
  });

  app.get("/api/transacciones/recientes", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const transacciones = await storage.getVentasRecientes(limit);
      
      // Enriquecer los datos con información de productos y clientes
      const transaccionesEnriquecidas = await Promise.all(
        transacciones.map(async (transaccion) => {
          const producto = await storage.getProducto(transaccion.id_producto);
          const cliente = await storage.getCliente(transaccion.id_cliente);
          return {
            ...transaccion,
            producto: producto,
            cliente: cliente
          };
        })
      );
      
      res.status(200).json(transaccionesEnriquecidas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener transacciones recientes" });
    }
  });

  app.get("/api/transacciones/devoluciones", async (req: Request, res: Response) => {
    try {
      const dias = req.query.dias ? parseInt(req.query.dias as string) : 7;
      const devoluciones = await storage.getProximasDevoluciones(dias);
      
      // Enriquecer los datos con información de productos y clientes
      const devolucionesEnriquecidas = await Promise.all(
        devoluciones.map(async (devolucion) => {
          const producto = await storage.getProducto(devolucion.id_producto);
          const cliente = await storage.getCliente(devolucion.id_cliente);
          return {
            ...devolucion,
            producto: producto,
            cliente: cliente
          };
        })
      );
      
      res.status(200).json(devolucionesEnriquecidas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener próximas devoluciones" });
    }
  });

  app.get("/api/transacciones/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const transaccion = await storage.getTransaccion(id);
      if (!transaccion) {
        return res.status(404).json({ message: "Transacción no encontrada" });
      }
      
      // Enriquecer con datos de producto y cliente
      const producto = await storage.getProducto(transaccion.id_producto);
      const cliente = await storage.getCliente(transaccion.id_cliente);
      
      res.status(200).json({
        ...transaccion,
        producto: producto,
        cliente: cliente
      });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener la transacción" });
    }
  });

  app.post("/api/transacciones", async (req: Request, res: Response) => {
    try {
      // Validar datos de transacción usando el esquema extendido
      const transaccionFormData = transaccionFormSchema.parse(req.body);
      
      // Buscar o crear cliente
      let clienteId: number;
      const clienteExistente = await storage.getClienteByNombreTelefono(
        transaccionFormData.cliente_nombre,
        transaccionFormData.cliente_telefono
      );
      
      if (clienteExistente) {
        clienteId = clienteExistente.id;
      } else {
        // Crear nuevo cliente
        const nuevoCliente = await storage.createCliente({
          nombre: transaccionFormData.cliente_nombre,
          domicilio: transaccionFormData.cliente_domicilio,
          telefono: transaccionFormData.cliente_telefono
        });
        clienteId = nuevoCliente.id;
      }
      
      // Generar folio único
      const folio = `VIO-${randomBytes(4).toString('hex').toUpperCase()}`;
      
      // Crear transacción
      const nuevaTransaccion = await storage.createTransaccion({
        ...transaccionFormData,
        id_cliente: clienteId,
        folio: folio
      });
      
      res.status(201).json(nuevaTransaccion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de transacción inválidos", errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Error al crear la transacción" });
    }
  });

  app.put("/api/transacciones/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const transaccionData = insertTransaccionSchema.partial().parse(req.body);
      const transaccionActualizada = await storage.updateTransaccion(id, transaccionData);
      if (!transaccionActualizada) {
        return res.status(404).json({ message: "Transacción no encontrada" });
      }
      res.status(200).json(transaccionActualizada);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de transacción inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error al actualizar la transacción" });
    }
  });

  // ----- API para estadísticas dashboard -----
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const productos = await storage.getAllProductos();
      const transacciones = await storage.getAllTransacciones();
      const bajosStock = await storage.getProductosBajoStock();
      
      // Calcular estadísticas
      const totalProductos = productos.length;
      
      // Ventas del mes
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const ventasMes = transacciones
        .filter(t => new Date(t.fecha_creacion) >= firstDayOfMonth)
        .reduce((sum, t) => sum + Number(t.total), 0);
      
      // Rentas activas
      const rentasActivas = transacciones.filter(t => 
        t.tipo === "renta" && 
        t.estado !== "devuelto" && 
        t.estado !== "completado"
      ).length;
      
      // Productos con bajo stock
      const cantidadBajoStock = bajosStock.length;
      
      res.status(200).json({
        totalProductos,
        ventasMes,
        rentasActivas,
        cantidadBajoStock
      });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener estadísticas del dashboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
