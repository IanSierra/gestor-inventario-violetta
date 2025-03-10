import { pgTable, text, serial, integer, decimal, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Usuarios (admin, vendedor)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nombre: text("nombre").notNull(),
  role: text("role").notNull().default("vendedor"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  nombre: true,
  role: true,
});

// Productos (vestidos)
export const productos = pgTable("productos", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  tipo: text("tipo").notNull(), // "renta" o "venta"
  precio: decimal("precio", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull(),
});

export const insertProductoSchema = createInsertSchema(productos).omit({
  id: true,
});

// Clientes
export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  domicilio: text("domicilio").notNull(),
  telefono: text("telefono").notNull(),
});

export const insertClienteSchema = createInsertSchema(clientes).omit({
  id: true,
});

// Transacciones (ventas y rentas)
export const transacciones = pgTable("transacciones", {
  id: serial("id").primaryKey(),
  folio: text("folio").notNull().unique(),
  id_producto: integer("id_producto").notNull(),
  id_cliente: integer("id_cliente").notNull(),
  tipo: text("tipo").notNull(), // "renta" o "venta"
  fecha_creacion: date("fecha_creacion").notNull(),
  fecha_entrega: date("fecha_entrega").notNull(),
  fecha_devolucion: date("fecha_devolucion"),
  abono: decimal("abono", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  estado: text("estado").notNull(), // "pendiente", "entregado", "devuelto", "completado"
});

export const insertTransaccionSchema = createInsertSchema(transacciones).omit({
  id: true,
});

// Tipos exportados
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Producto = typeof productos.$inferSelect;
export type InsertProducto = z.infer<typeof insertProductoSchema>;

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = z.infer<typeof insertClienteSchema>;

export type Transaccion = typeof transacciones.$inferSelect;
export type InsertTransaccion = z.infer<typeof insertTransaccionSchema>;

// Esquemas de validación extendidos
export const transaccionFormSchema = insertTransaccionSchema.extend({
  cliente_nombre: z.string().min(1, "El nombre del cliente es requerido"),
  cliente_domicilio: z.string().min(1, "El domicilio es requerido"),
  cliente_telefono: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
});

export type TransaccionFormData = z.infer<typeof transaccionFormSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginData = z.infer<typeof loginSchema>;
