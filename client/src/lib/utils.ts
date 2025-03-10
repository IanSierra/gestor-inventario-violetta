import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function generateFolio(): string {
  const prefix = 'VIO-';
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomString}`;
}

export function calcularDiasRestantes(fechaDevolucion: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const fechaDev = new Date(fechaDevolucion);
  fechaDev.setHours(0, 0, 0, 0);
  
  const diferencia = fechaDev.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

export function getEstadoTransaccion(estado: string, tipo: string, fechaDevolucion?: string | null): {
  texto: string;
  clase: string;
} {
  // Para ventas
  if (tipo === 'venta') {
    switch (estado) {
      case 'pendiente':
        return { texto: 'Pendiente', clase: 'bg-yellow-100 text-yellow-800' };
      case 'entregado':
        return { texto: 'Entregado', clase: 'bg-blue-100 text-blue-800' };
      case 'completado':
        return { texto: 'Completado', clase: 'bg-green-100 text-green-800' };
      default:
        return { texto: estado, clase: 'bg-gray-100 text-gray-800' };
    }
  }
  
  // Para rentas
  switch (estado) {
    case 'pendiente':
      return { texto: 'Pendiente', clase: 'bg-yellow-100 text-yellow-800' };
    case 'entregado':
      if (fechaDevolucion) {
        const diasRestantes = calcularDiasRestantes(fechaDevolucion);
        if (diasRestantes < 0) {
          return { texto: 'Atrasado', clase: 'bg-red-100 text-red-800' };
        } else if (diasRestantes <= 1) {
          return { texto: 'Por devolver', clase: 'bg-orange-100 text-orange-800' };
        } else {
          return { texto: 'Entregado', clase: 'bg-blue-100 text-blue-800' };
        }
      }
      return { texto: 'Entregado', clase: 'bg-blue-100 text-blue-800' };
    case 'devuelto':
      return { texto: 'Devuelto', clase: 'bg-purple-100 text-purple-800' };
    case 'completado':
      return { texto: 'Completado', clase: 'bg-green-100 text-green-800' };
    default:
      return { texto: estado, clase: 'bg-gray-100 text-gray-800' };
  }
}
