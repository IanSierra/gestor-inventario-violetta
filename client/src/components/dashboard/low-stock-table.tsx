import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Producto } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export function LowStockTable() {
  const {
    data: productos,
    isLoading,
    error,
  } = useQuery<Producto[]>({
    queryKey: ["/api/productos/bajo-stock"],
  });

  // Determinar la clase de color para el tipo de producto
  const getTypeClasses = (tipo: string) => {
    return tipo === "venta"
      ? "bg-green-100 text-green-800"
      : "bg-purple-100 text-purple-800";
  };

  // Determinar la clase de color para el stock
  const getStockClasses = (stock: number) => {
    if (stock <= 2) return "bg-red-100 text-red-800";
    if (stock <= 4) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">Productos con stock bajo</h2>
        </div>
        <div className="p-8 text-center text-red-500">
          Error al cargar los productos con stock bajo
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-800">Productos con stock bajo</h2>
        <Link href="/productos?filter=bajo-stock">
          <Button variant="link" className="text-primary text-sm font-medium">
            Ordenar stock
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
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
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-10 rounded-full" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-16" />
                    </td>
                  </tr>
                ))
            ) : (
              // Datos reales
              productos?.map((producto) => (
                <tr key={producto.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {producto.codigo}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {producto.nombre}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeClasses(
                        producto.tipo
                      )}`}
                    >
                      {producto.tipo === "venta" ? "Venta" : "Renta"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(Number(producto.precio))}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockClasses(
                        producto.stock
                      )}`}
                    >
                      {producto.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <Link href={`/productos/${producto.id}`}>
                      <Button
                        variant="link"
                        className="text-primary hover:text-primary-dark"
                      >
                        Ordenar
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}

            {!isLoading && (!productos || productos.length === 0) && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No hay productos con stock bajo
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
