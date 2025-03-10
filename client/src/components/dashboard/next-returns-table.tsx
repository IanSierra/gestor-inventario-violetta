import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface DevolucionExtendida {
  id: number;
  folio: string;
  fecha_devolucion: string;
  estado: string;
  cliente?: {
    id: number;
    nombre: string;
  };
  producto?: {
    id: number;
    nombre: string;
    codigo: string;
  };
}

export function NextReturnsTable() {
  const {
    data: devoluciones,
    isLoading,
    error,
  } = useQuery<DevolucionExtendida[]>({
    queryKey: ["/api/transacciones/devoluciones"],
  });

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Determinar el estado de la devolución
  const getStatusClass = (fechaDevolucion: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const devDate = new Date(fechaDevolucion);
    devDate.setHours(0, 0, 0, 0);
    
    const diffTime = devDate.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays <= 1) {
      return "bg-orange-100 text-orange-800";
    }
    return "bg-blue-100 text-blue-800";
  };

  // Determinar el texto del estado
  const getStatusText = (fechaDevolucion: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const devDate = new Date(fechaDevolucion);
    devDate.setHours(0, 0, 0, 0);
    
    const diffTime = devDate.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays <= 0) {
      return "Hoy";
    }
    if (diffDays <= 1) {
      return "Mañana";
    }
    return "Próxima";
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">Próximas devoluciones</h2>
        </div>
        <div className="p-8 text-center text-red-500">
          Error al cargar las próximas devoluciones
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-800">Próximas devoluciones</h2>
        <Link href="/transacciones?tipo=renta">
          <Button variant="link" className="text-primary text-sm font-medium">
            Ver todas
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Folio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha devolución
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Esqueleto de carga
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </td>
                  </tr>
                ))
            ) : (
              // Datos reales
              devoluciones?.map((devolucion) => (
                <tr key={devolucion.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {devolucion.folio}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {devolucion.cliente?.nombre || "Cliente no disponible"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {devolucion.producto?.nombre || "Producto no disponible"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(devolucion.fecha_devolucion)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                        devolucion.fecha_devolucion
                      )}`}
                    >
                      {getStatusText(devolucion.fecha_devolucion)}
                    </span>
                  </td>
                </tr>
              ))
            )}

            {!isLoading && devoluciones?.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No hay devoluciones próximas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
