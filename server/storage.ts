import { User, InsertUser, Producto, InsertProducto, Cliente, InsertCliente, Transaccion, InsertTransaccion } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Usuarios
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Productos
  getAllProductos(): Promise<Producto[]>;
  getProducto(id: number): Promise<Producto | undefined>;
  getProductoByCodigo(codigo: string): Promise<Producto | undefined>;
  createProducto(producto: InsertProducto): Promise<Producto>;
  updateProducto(id: number, producto: Partial<InsertProducto>): Promise<Producto | undefined>;
  deleteProducto(id: number): Promise<boolean>;
  getProductosBajoStock(limit: number): Promise<Producto[]>;
  
  // Clientes
  getAllClientes(): Promise<Cliente[]>;
  getCliente(id: number): Promise<Cliente | undefined>;
  createCliente(cliente: InsertCliente): Promise<Cliente>;
  updateCliente(id: number, cliente: Partial<InsertCliente>): Promise<Cliente | undefined>;
  getClienteByNombreTelefono(nombre: string, telefono: string): Promise<Cliente | undefined>;
  
  // Transacciones
  getAllTransacciones(): Promise<Transaccion[]>;
  getTransaccion(id: number): Promise<Transaccion | undefined>;
  getTransaccionByFolio(folio: string): Promise<Transaccion | undefined>;
  createTransaccion(transaccion: InsertTransaccion): Promise<Transaccion>;
  updateTransaccion(id: number, transaccion: Partial<InsertTransaccion>): Promise<Transaccion | undefined>;
  getProximasDevoluciones(dias: number): Promise<Transaccion[]>;
  getVentasRecientes(limit: number): Promise<Transaccion[]>;

  // Sesión
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private productos: Map<number, Producto>;
  private clientes: Map<number, Cliente>;
  private transacciones: Map<number, Transaccion>;
  private userCurrentId: number;
  private productoCurrentId: number;
  private clienteCurrentId: number;
  private transaccionCurrentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.productos = new Map();
    this.clientes = new Map();
    this.transacciones = new Map();
    this.userCurrentId = 1;
    this.productoCurrentId = 1;
    this.clienteCurrentId = 1;
    this.transaccionCurrentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Limpiar sesiones expiradas cada 24 horas
    });

    // Usuario administrador por defecto
    this.createUser({
      username: "admin",
      password: "$2b$10$9YAV0F.Yyt1C7oPJz6VW2OYJyD/4jHU25Ga2bpSXP6n8K9zHgWpmK", // contraseña: admin123
      nombre: "Administrador",
      role: "admin"
    });

    // Datos iniciales para desarrollo
    this.seedDevelopmentData();
  }

  // ---------- Métodos de usuarios ----------
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // ---------- Métodos de productos ----------
  async getAllProductos(): Promise<Producto[]> {
    return Array.from(this.productos.values());
  }

  async getProducto(id: number): Promise<Producto | undefined> {
    return this.productos.get(id);
  }

  async getProductoByCodigo(codigo: string): Promise<Producto | undefined> {
    return Array.from(this.productos.values()).find(
      (producto) => producto.codigo === codigo,
    );
  }

  async createProducto(insertProducto: InsertProducto): Promise<Producto> {
    const id = this.productoCurrentId++;
    const producto: Producto = { ...insertProducto, id };
    this.productos.set(id, producto);
    return producto;
  }

  async updateProducto(id: number, updateData: Partial<InsertProducto>): Promise<Producto | undefined> {
    const producto = this.productos.get(id);
    if (!producto) return undefined;
    
    const updatedProducto = { ...producto, ...updateData };
    this.productos.set(id, updatedProducto);
    return updatedProducto;
  }

  async deleteProducto(id: number): Promise<boolean> {
    return this.productos.delete(id);
  }

  async getProductosBajoStock(limit: number = 5): Promise<Producto[]> {
    return Array.from(this.productos.values())
      .filter(producto => producto.stock < 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, limit);
  }

  // ---------- Métodos de clientes ----------
  async getAllClientes(): Promise<Cliente[]> {
    return Array.from(this.clientes.values());
  }

  async getCliente(id: number): Promise<Cliente | undefined> {
    return this.clientes.get(id);
  }

  async createCliente(insertCliente: InsertCliente): Promise<Cliente> {
    const id = this.clienteCurrentId++;
    const cliente: Cliente = { ...insertCliente, id };
    this.clientes.set(id, cliente);
    return cliente;
  }

  async updateCliente(id: number, updateData: Partial<InsertCliente>): Promise<Cliente | undefined> {
    const cliente = this.clientes.get(id);
    if (!cliente) return undefined;
    
    const updatedCliente = { ...cliente, ...updateData };
    this.clientes.set(id, updatedCliente);
    return updatedCliente;
  }

  async getClienteByNombreTelefono(nombre: string, telefono: string): Promise<Cliente | undefined> {
    return Array.from(this.clientes.values()).find(
      (cliente) => cliente.nombre === nombre && cliente.telefono === telefono,
    );
  }

  // ---------- Métodos de transacciones ----------
  async getAllTransacciones(): Promise<Transaccion[]> {
    return Array.from(this.transacciones.values());
  }

  async getTransaccion(id: number): Promise<Transaccion | undefined> {
    return this.transacciones.get(id);
  }

  async getTransaccionByFolio(folio: string): Promise<Transaccion | undefined> {
    return Array.from(this.transacciones.values()).find(
      (transaccion) => transaccion.folio === folio,
    );
  }

  async createTransaccion(insertTransaccion: InsertTransaccion): Promise<Transaccion> {
    const id = this.transaccionCurrentId++;
    const transaccion: Transaccion = { ...insertTransaccion, id };
    this.transacciones.set(id, transaccion);
    
    // Actualizar stock del producto
    const producto = await this.getProducto(transaccion.id_producto);
    if (producto) {
      await this.updateProducto(producto.id, { 
        stock: producto.stock - 1 
      });
    }
    
    return transaccion;
  }

  async updateTransaccion(id: number, updateData: Partial<InsertTransaccion>): Promise<Transaccion | undefined> {
    const transaccion = this.transacciones.get(id);
    if (!transaccion) return undefined;
    
    const updatedTransaccion = { ...transaccion, ...updateData };
    this.transacciones.set(id, updatedTransaccion);
    return updatedTransaccion;
  }

  async getProximasDevoluciones(dias: number = 7): Promise<Transaccion[]> {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + dias);
    
    return Array.from(this.transacciones.values())
      .filter(transaccion => 
        transaccion.tipo === "renta" && 
        transaccion.estado !== "devuelto" &&
        transaccion.fecha_devolucion !== null &&
        new Date(transaccion.fecha_devolucion) <= endDate &&
        new Date(transaccion.fecha_devolucion) >= today
      )
      .sort((a, b) => 
        new Date(a.fecha_devolucion!).getTime() - new Date(b.fecha_devolucion!).getTime()
      );
  }

  async getVentasRecientes(limit: number = 5): Promise<Transaccion[]> {
    return Array.from(this.transacciones.values())
      .sort((a, b) => 
        new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
      )
      .slice(0, limit);
  }

  // Datos de desarrollo
  private seedDevelopmentData(): void {
    // Productos iniciales
    this.createProducto({
      codigo: "VD-101",
      nombre: "Vestido Noche Elegante",
      descripcion: "Vestido largo de noche con detalles en pedrería",
      tipo: "renta",
      precio: 1200,
      stock: 2
    });
    
    this.createProducto({
      codigo: "VD-245",
      nombre: "Vestido Cocktail Rosa",
      descripcion: "Vestido corto para cocktail color rosa pastel",
      tipo: "venta",
      precio: 3500,
      stock: 3
    });
    
    this.createProducto({
      codigo: "VD-189",
      nombre: "Vestido Largo Sirena",
      descripcion: "Vestido estilo sirena en color azul marino",
      tipo: "renta",
      precio: 950,
      stock: 4
    });
    
    this.createProducto({
      codigo: "VD-322",
      nombre: "Vestido Fiesta Brillante",
      descripcion: "Vestido con lentejuelas para fiestas especiales",
      tipo: "renta",
      precio: 1500,
      stock: 4
    });
    
    this.createProducto({
      codigo: "VD-456",
      nombre: "Vestido Gala Dorado",
      descripcion: "Vestido largo de gala con detalles dorados",
      tipo: "renta",
      precio: 2000,
      stock: 6
    });
    
    // Clientes iniciales
    this.createCliente({
      nombre: "María González",
      domicilio: "Calle Pinos 123, Col. Bellavista, Uruapan",
      telefono: "4521234567"
    });
    
    this.createCliente({
      nombre: "Laura Pérez",
      domicilio: "Av. Juárez 456, Col. Centro, Uruapan",
      telefono: "4529876543"
    });
    
    this.createCliente({
      nombre: "Claudia Hernández",
      domicilio: "Callejón de las Flores 78, Col. Jardines, Uruapan",
      telefono: "4523456789"
    });
    
    // Fechas para transacciones
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Transacciones iniciales
    this.createTransaccion({
      folio: "VIO-63F4AB12",
      id_producto: 2,
      id_cliente: 1,
      tipo: "venta",
      fecha_creacion: twoDaysAgo,
      fecha_entrega: yesterday,
      fecha_devolucion: null,
      abono: null,
      total: 3500,
      estado: "completado"
    });
    
    this.createTransaccion({
      folio: "VIO-63F4CD34",
      id_producto: 1,
      id_cliente: 2,
      tipo: "renta",
      fecha_creacion: yesterday,
      fecha_entrega: today,
      fecha_devolucion: tomorrow,
      abono: 400,
      total: 1200,
      estado: "entregado"
    });
    
    this.createTransaccion({
      folio: "VIO-63F4EF56",
      id_producto: 3,
      id_cliente: 3,
      tipo: "renta",
      fecha_creacion: twoDaysAgo,
      fecha_entrega: yesterday,
      fecha_devolucion: dayAfterTomorrow,
      abono: 300,
      total: 950,
      estado: "entregado"
    });
    
    this.createTransaccion({
      folio: "VIO-63F4GH78",
      id_producto: 5,
      id_cliente: 1,
      tipo: "renta",
      fecha_creacion: threeDaysAgo,
      fecha_entrega: twoDaysAgo,
      fecha_devolucion: nextWeek,
      abono: 600,
      total: 2000,
      estado: "entregado"
    });
  }
}

export const storage = new MemStorage();
