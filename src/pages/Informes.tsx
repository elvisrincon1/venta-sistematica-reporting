
import React, { useState, useRef } from 'react';
import { useData, Venta } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { CalendarIcon, FileDown, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

type VentaInforme = {
  id: string;
  fecha: string;
  afiliado: string;
  producto: string;
  cantidad: number;
  precioVenta: number;
  precioCompra: number;
  utilidad: number;
};

type VentasPorAfiliado = {
  nombre: string;
  ventas: VentaInforme[];
  totalVentas: number;
  totalUtilidad: number;
};

const Informes = () => {
  const { ventas, getAfiliadoById, getProductoById } = useData();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [ventasFiltradas, setVentasFiltradas] = useState<VentasPorAfiliado[]>([]);
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalUtilidad, setTotalUtilidad] = useState(0);
  const [informeGenerado, setInformeGenerado] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const generarInforme = () => {
    if (!startDate || !endDate) {
      toast.error('Debes seleccionar fechas de inicio y fin');
      return;
    }

    if (isAfter(startDate, endDate)) {
      toast.error('La fecha de inicio no puede ser posterior a la fecha fin');
      return;
    }

    // Filtrar ventas por rango de fechas
    const ventasEnRango = ventas.filter(venta => {
      const fechaVenta = parseISO(venta.fecha);
      return !isBefore(fechaVenta, startDate) && !isAfter(fechaVenta, endDate);
    });

    if (ventasEnRango.length === 0) {
      toast.warning('No se encontraron ventas en el rango de fechas seleccionado');
      setVentasFiltradas([]);
      setInformeGenerado(false);
      return;
    }

    // Transformar para el informe
    const ventasFormateadas: VentaInforme[] = ventasEnRango.map(venta => {
      const afiliado = getAfiliadoById(venta.afiliadoId);
      const producto = getProductoById(venta.productoId);
      const utilidad = venta.precioVenta - venta.precioCompra;
      
      return {
        id: venta.id,
        fecha: venta.fecha,
        afiliado: afiliado ? afiliado.nombre : 'Desconocido',
        producto: producto ? producto.nombre : 'Desconocido',
        cantidad: venta.cantidad,
        precioVenta: venta.precioVenta,
        precioCompra: venta.precioCompra,
        utilidad: utilidad
      };
    });

    // Agrupar por afiliado
    const ventasPorAfiliado: { [key: string]: VentaInforme[] } = {};
    ventasFormateadas.forEach(venta => {
      if (!ventasPorAfiliado[venta.afiliado]) {
        ventasPorAfiliado[venta.afiliado] = [];
      }
      ventasPorAfiliado[venta.afiliado].push(venta);
    });

    // Calcular totales por afiliado
    const resultado: VentasPorAfiliado[] = Object.keys(ventasPorAfiliado).map(afiliado => {
      const ventasAfiliado = ventasPorAfiliado[afiliado];
      const totalVentas = ventasAfiliado.reduce((sum, venta) => sum + venta.precioVenta, 0);
      const totalUtilidad = ventasAfiliado.reduce((sum, venta) => sum + venta.utilidad, 0);
      
      return {
        nombre: afiliado,
        ventas: ventasAfiliado,
        totalVentas,
        totalUtilidad
      };
    });

    // Calcular totales generales
    const nuevoTotalVentas = resultado.reduce((sum, item) => sum + item.totalVentas, 0);
    const nuevoTotalUtilidad = resultado.reduce((sum, item) => sum + item.totalUtilidad, 0);

    setVentasFiltradas(resultado);
    setTotalVentas(nuevoTotalVentas);
    setTotalUtilidad(nuevoTotalUtilidad);
    setInformeGenerado(true);
    toast.success('Informe generado exitosamente');
  };

  const exportarExcel = () => {
    if (!informeGenerado || ventasFiltradas.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    // Preparar datos para Excel
    const datosExcel: any[] = [];
    
    // Título del informe
    datosExcel.push([`Informe de Ventas: ${format(startDate!, 'dd/MM/yyyy')} al ${format(endDate!, 'dd/MM/yyyy')}`]);
    datosExcel.push([]);  // Línea vacía
    
    // Por cada afiliado
    ventasFiltradas.forEach(afiliado => {
      // Encabezado de afiliado
      datosExcel.push([`Afiliado: ${afiliado.nombre}`]);
      
      // Encabezados de tabla
      datosExcel.push(['Fecha', 'Producto', 'Cantidad', 'Precio Compra', 'Precio Venta', 'Utilidad']);
      
      // Filas de ventas
      afiliado.ventas.forEach(venta => {
        datosExcel.push([
          format(parseISO(venta.fecha), 'dd/MM/yyyy'),
          venta.producto,
          venta.cantidad,
          venta.precioCompra.toFixed(2),
          venta.precioVenta.toFixed(2),
          venta.utilidad.toFixed(2)
        ]);
      });
      
      // Totales del afiliado
      datosExcel.push([
        '', '', '', 'Total:', 
        afiliado.totalVentas.toFixed(2), 
        afiliado.totalUtilidad.toFixed(2)
      ]);
      
      datosExcel.push([]);  // Línea vacía
    });
    
    // Totales generales
    datosExcel.push(['', '', '', 'TOTAL GENERAL:', totalVentas.toFixed(2), totalUtilidad.toFixed(2)]);
    
    // Crear libro Excel
    const ws = XLSX.utils.aoa_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Informe de Ventas");
    
    // Configuración para ancho de columnas
    const wscols = [
      {wch: 12},  // Fecha
      {wch: 30},  // Producto
      {wch: 10},  // Cantidad
      {wch: 15},  // Precio Compra
      {wch: 15},  // Precio Venta
      {wch: 15},  // Utilidad
    ];
    ws['!cols'] = wscols;
    
    // Descargar
    XLSX.writeFile(wb, `Informe_Ventas_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
  };

  const imprimirInforme = () => {
    if (!informeGenerado || ventasFiltradas.length === 0) {
      toast.error('No hay datos para imprimir');
      return;
    }

    window.print();
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Generar Informes</h1>
      
      <Card className="mb-6 no-print">
        <CardHeader>
          <CardTitle>Filtros del Informe</CardTitle>
          <CardDescription>Selecciona el rango de fechas para generar el informe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="fechaInicio">Fecha Inicio</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="fechaInicio"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="fechaFin">Fecha Fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="fechaFin"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button onClick={generarInforme} className="w-full">
                Generar Informe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {informeGenerado && (
        <div>
          <div className="flex justify-between items-center mb-4 no-print">
            <h2 className="text-xl font-semibold">Resultados del Informe</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={imprimirInforme}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" onClick={exportarExcel}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
            </div>
          </div>
          
          <div ref={printRef} className="print-container">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Informe de Ventas</h2>
              <p>Período: {startDate ? format(startDate, 'dd/MM/yyyy') : ''} al {endDate ? format(endDate, 'dd/MM/yyyy') : ''}</p>
            </div>
            
            {ventasFiltradas.length > 0 ? (
              ventasFiltradas.map((afiliadoData, index) => (
                <Card key={index} className="mb-6 border-none shadow-none print-card">
                  <CardHeader className="pb-2">
                    <CardTitle>Afiliado: {afiliadoData.nombre}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="print-table w-full">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Compra</th>
                          <th>Precio Venta</th>
                          <th>Utilidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {afiliadoData.ventas.map((venta) => (
                          <tr key={venta.id}>
                            <td>{format(parseISO(venta.fecha), 'dd/MM/yyyy')}</td>
                            <td>{venta.producto}</td>
                            <td>{venta.cantidad}</td>
                            <td>${venta.precioCompra.toFixed(2)}</td>
                            <td>${venta.precioVenta.toFixed(2)}</td>
                            <td>${venta.utilidad.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="font-bold">
                          <td colSpan={4} className="text-right">Total:</td>
                          <td>${afiliadoData.totalVentas.toFixed(2)}</td>
                          <td>${afiliadoData.totalUtilidad.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron datos para el rango de fechas seleccionado
              </div>
            )}
            
            {ventasFiltradas.length > 0 && (
              <div className="mt-8 border-t-2 pt-4">
                <table className="print-table w-full">
                  <thead>
                    <tr>
                      <th colSpan={4}>TOTALES GENERALES</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-bold text-lg">
                      <td colSpan={2}>Total Ventas:</td>
                      <td>${totalVentas.toFixed(2)}</td>
                      <td>Total Utilidad: ${totalUtilidad.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Informes;
