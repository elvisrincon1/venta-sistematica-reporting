
import React, { useState, useEffect } from 'react';
import { useData, Afiliado, Producto, Venta } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';

const ReportarVenta = () => {
  const { afiliados, productos, addVenta } = useData();
  const [fecha, setFecha] = useState<Date>(new Date());
  const [afiliadoId, setAfiliadoId] = useState<string>('');
  const [productoId, setProductoId] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openAfiliado, setOpenAfiliado] = useState(false);
  const [openProducto, setOpenProducto] = useState(false);
  const [afiliadoSearch, setAfiliadoSearch] = useState('');
  const [productoSearch, setProductoSearch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!afiliadoId || !productoId || !fecha) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const productoSeleccionado = productos.find(p => p.id === productoId);
    
    if (!productoSeleccionado) {
      toast.error('Producto no encontrado');
      return;
    }

    const nuevaVenta: Venta = {
      id: Date.now().toString(),
      fecha: format(fecha, 'yyyy-MM-dd'),
      afiliadoId,
      productoId,
      cantidad,
      precioVenta: productoSeleccionado.precioVenta * cantidad,
      precioCompra: productoSeleccionado.precioCompra * cantidad
    };

    addVenta(nuevaVenta);
    
    // Limpiar formulario
    setAfiliadoId('');
    setProductoId('');
    setCantidad(1);
    setAfiliadoSearch('');
    setProductoSearch('');
    
    toast.success('Venta reportada exitosamente');
  };

  const filteredAfiliados = afiliados.filter(afiliado => 
    afiliado.nombre.toLowerCase().includes(afiliadoSearch.toLowerCase())
  );

  const filteredProductos = productos.filter(producto => 
    producto.nombre.toLowerCase().includes(productoSearch.toLowerCase())
  );

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reportar Venta</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Datos de la Venta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fecha ? format(fecha, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={fecha}
                      onSelect={(date) => {
                        setFecha(date || new Date());
                        setOpenCalendar(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="afiliado">Afiliado</Label>
                <Popover open={openAfiliado} onOpenChange={setOpenAfiliado}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAfiliado}
                      className="w-full justify-between"
                    >
                      {afiliadoId ? afiliados.find((afiliado) => afiliado.id === afiliadoId)?.nombre : "Seleccionar afiliado..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 z-50">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar afiliado..." 
                        value={afiliadoSearch}
                        onValueChange={setAfiliadoSearch}
                      />
                      <CommandEmpty>No se encontraron afiliados.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {filteredAfiliados.map((afiliado) => (
                            <CommandItem
                              key={afiliado.id}
                              value={afiliado.id}
                              onSelect={(currentValue) => {
                                setAfiliadoId(currentValue);
                                setOpenAfiliado(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  afiliadoId === afiliado.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {afiliado.nombre}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="producto">Producto</Label>
                <Popover open={openProducto} onOpenChange={setOpenProducto}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProducto}
                      className="w-full justify-between"
                    >
                      {productoId ? productos.find((producto) => producto.id === productoId)?.nombre : "Seleccionar producto..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 z-50">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar producto..." 
                        value={productoSearch}
                        onValueChange={setProductoSearch}
                      />
                      <CommandEmpty>No se encontraron productos.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {filteredProductos.map((producto) => (
                            <CommandItem
                              key={producto.id}
                              value={producto.id}
                              onSelect={(currentValue) => {
                                setProductoId(currentValue);
                                setOpenProducto(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  productoId === producto.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {producto.nombre} - Precio: ${producto.precioVenta}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {productoId && (
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Detalle del producto:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm text-muted-foreground">Nombre:</span>
                    <span className="font-medium">{productos.find(p => p.id === productoId)?.nombre}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-muted-foreground">Precio unitario:</span>
                    <span className="font-medium">${productos.find(p => p.id === productoId)?.precioVenta.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-muted-foreground">Cantidad:</span>
                    <span className="font-medium">{cantidad}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-muted-foreground">Total:</span>
                    <span className="font-medium">${((productos.find(p => p.id === productoId)?.precioVenta || 0) * cantidad).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">Reportar Venta</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportarVenta;
