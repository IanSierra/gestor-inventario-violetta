import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useReactToPrint } from "react-to-print";
import { Download, Printer } from "lucide-react";

interface TransaccionExtendida {
  id: number;
  folio: string;
  tipo: string;
  total: number;
  fecha_creacion: string;
  fecha_entrega: string;
  fecha_devolucion?: string | null;
  estado: string;
  abono?: number | null;
  cliente?: {
    id: number;
    nombre: string;
    domicilio: string;
    telefono: string;
  };
  producto?: {
    id: number;
    nombre: string;
    codigo: string;
    tipo: string;
    precio: number;
  };
}

interface GenerarFacturaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaccion: TransaccionExtendida;
}

export function GenerarFactura({ open, onOpenChange, transaccion }: GenerarFacturaProps) {
  const facturaRef = useRef<HTMLDivElement>(null);
  const [imprimiendo, setImprimiendo] = useState(false);

  // Configurar impresión de factura
  const handlePrint = useReactToPrint({
    content: () => facturaRef.current,
    onBeforeGetContent: () => {
      setImprimiendo(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setImprimiendo(false);
    },
  });

  // Descargar factura como PDF
  const handleDownloadPDF = async () => {
    // En un entorno real, esto enviaría los datos al servidor para generar un PDF
    // y luego descargaría el archivo. Por ahora, usamos la impresión como alternativa.
    handlePrint();
  };

  // Calcular pendiente por pagar
  const calcularPendiente = () => {
    const total = Number(transaccion.total) || 0;
    const abono = Number(transaccion.abono) || 0;
    return total - abono;
  };

  // Formatear fecha actual para la factura
  const fechaActual = formatDate(new Date().toISOString());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Factura</DialogTitle>
        </DialogHeader>
        
        {/* Contenido de la factura para imprimir */}
        <div ref={facturaRef} className="p-4 bg-white">
          {/* Encabezado de la factura */}
          <div className="border-b pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-primary">Violett à</h1>
                <p className="text-sm mt-1">RFC: GASP87112716A</p>
                <p className="text-sm mt-1">Calle Niños Héroes 89, Col. Bellavista</p>
                <p className="text-sm">CP 60050 Uruapan, Mich.</p>
                <p className="text-sm mt-1">Horario: Lunes-Viernes (11:00-14:00 / 16:00-20:00)</p>
                <p className="text-sm">Sábado (11:00-13:00)</p>
              </div>
              
              <div className="text-right">
                <div className="bg-primary/10 border border-primary/20 rounded p-2 inline-block">
                  <h2 className="text-lg font-semibold">FACTURA</h2>
                  <p className="text-sm font-bold">Folio: {transaccion.folio}</p>
                  <p className="text-sm">Fecha: {fechaActual}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Datos del cliente */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Cliente:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Nombre:</strong> {transaccion.cliente?.nombre || "N/A"}</p>
                <p className="mt-1"><strong>Teléfono:</strong> {transaccion.cliente?.telefono || "N/A"}</p>
              </div>
              <div>
                <p><strong>Domicilio:</strong> {transaccion.cliente?.domicilio || "N/A"}</p>
              </div>
            </div>
          </div>
          
          {/* Detalles de la transacción */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Detalles:</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Cantidad</th>
                  <th className="border p-2 text-left">Descripción</th>
                  <th className="border p-2 text-left">Código</th>
                  <th className="border p-2 text-right">Precio</th>
                  <th className="border p-2 text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">1</td>
                  <td className="border p-2">
                    {transaccion.producto?.nombre || "N/A"} 
                    <span className="text-sm text-gray-500 ml-2">
                      ({transaccion.tipo === "venta" ? "Venta" : "Renta"})
                    </span>
                  </td>
                  <td className="border p-2">{transaccion.producto?.codigo || "N/A"}</td>
                  <td className="border p-2 text-right">{formatCurrency(Number(transaccion.producto?.precio) || 0)}</td>
                  <td className="border p-2 text-right">{formatCurrency(Number(transaccion.total))}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="border p-2"></td>
                  <td className="border p-2 text-right font-semibold">Total:</td>
                  <td className="border p-2 text-right font-bold">{formatCurrency(Number(transaccion.total))}</td>
                </tr>
                {transaccion.abono !== null && transaccion.abono !== undefined && (
                  <>
                    <tr>
                      <td colSpan={3} className="border p-2"></td>
                      <td className="border p-2 text-right font-semibold">Abono:</td>
                      <td className="border p-2 text-right">{formatCurrency(Number(transaccion.abono))}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="border p-2"></td>
                      <td className="border p-2 text-right font-semibold">Pendiente:</td>
                      <td className="border p-2 text-right font-bold text-primary">{formatCurrency(calcularPendiente())}</td>
                    </tr>
                  </>
                )}
              </tfoot>
            </table>
          </div>
          
          {/* Información adicional */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Fechas:</h3>
              <p><strong>Fecha de Transacción:</strong> {formatDate(transaccion.fecha_creacion)}</p>
              <p className="mt-1"><strong>Fecha de Entrega:</strong> {formatDate(transaccion.fecha_entrega)}</p>
              {transaccion.tipo === "renta" && transaccion.fecha_devolucion && (
                <p className="mt-1"><strong>Fecha de Devolución:</strong> {formatDate(transaccion.fecha_devolucion)}</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Condiciones:</h3>
              {transaccion.tipo === "renta" ? (
                <div>
                  <p>El vestido debe ser devuelto en las mismas condiciones en que fue entregado.</p>
                  <p className="mt-1">En caso de daño o pérdida, se cobrará el valor total del producto.</p>
                </div>
              ) : (
                <p>Venta final. No se aceptan devoluciones ni cambios.</p>
              )}
            </div>
          </div>
          
          {/* Pie de factura */}
          <div className="text-center border-t pt-4 text-sm text-gray-500">
            <p>Este documento es una representación impresa de la factura</p>
            <p className="mt-1">¡Gracias por su preferencia!</p>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={imprimiendo}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir</span>
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={imprimiendo}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Descargar PDF</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
