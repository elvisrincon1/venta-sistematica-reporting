
import React, { useState, useEffect } from 'react';
import { Producto } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductoFormProps {
  proveedores: any[];
  initialData?: Producto | null;
  onSubmit: (producto: Producto) => Promise<void>;
  onCancel: () => void;
}

const ProductoForm: React.FC<ProductoFormProps> = ({ 
  proveedores, 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const [nombre, setNombre] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [proveedor1Id, setProveedor1Id] = useState('');
  const [proveedor2Id, setProveedor2Id] = useState('');
  const [openProveedor1, setOpenProveedor1] = useState(false);
  const [openProveedor2, setOpenProveedor2] = useState(false);
  const [proveedor1Search, setProveedor1Search] = useState('');
  const [proveedor2Search, setProveedor2Search] = useState('');
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    nombre?: boolean;
    precioCompra?: boolean;
    precioVenta?: boolean;
    proveedor1?: boolean;
  }>({});

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setPrecioCompra(initialData.precioCompra.toString());
      setPrecioVenta(initialData.precioVenta.toString());
      setProveedor1Id(initialData.proveedor1Id);
      setProveedor2Id(initialData.proveedor2Id || '');
    }
  }, [initialData]);

  // Mejorada la función de filtrado para proveedores
  const filteredProveedor1 = proveedor1Search.trim() === '' 
    ? proveedores 
    : proveedores.filter(proveedor => 
        proveedor.nombre.toLowerCase().includes(proveedor1Search.toLowerCase().trim())
      );

  const filteredProveedor2 = proveedor2Search.trim() === '' 
    ? proveedores.filter(proveedor => proveedor.id !== proveedor1Id)
    : proveedores.filter(proveedor => 
        proveedor.nombre.toLowerCase().includes(proveedor2Search.toLowerCase().trim()) &&
        proveedor.id !== proveedor1Id
      );

  const handleSelectProveedor1 = (value: string) => {
    setProveedor1Id(value);
    setOpenProveedor1(false);
    // Clear validation error when selected
    if (validationErrors.proveedor1) {
      setValidationErrors({...validationErrors, proveedor1: false});
    }
    // Reset secondary provider if it's the same as the primary
    if (proveedor2Id === value) {
      setProveedor2Id('');
    }
  };

  const handleSelectProveedor2 = (value: string) => {
    setProveedor2Id(value === proveedor2Id ? '' : value);
    setOpenProveedor2(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation errors
    const errors: {
      nombre?: boolean;
      precioCompra?: boolean;
      precioVenta?: boolean;
      proveedor1?: boolean;
    } = {};
    
    if (!nombre) errors.nombre = true;
    if (!precioCompra) errors.precioCompra = true;
    if (!precioVenta) errors.precioVenta = true;
    if (!proveedor1Id) errors.proveedor1 = true;
    
    // If there are errors, show them and prevent submission
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }
    
    const precioCompraNum = parseFloat(precioCompra);
    const precioVentaNum = parseFloat(precioVenta);
    
    if (isNaN(precioCompraNum) || isNaN(precioVentaNum)) {
      toast.error('Los precios deben ser valores numéricos');
      return;
    }
    
    if (precioVentaNum <= precioCompraNum) {
      toast.error('El precio de venta debe ser mayor al precio de compra');
      return;
    }
    
    const productoData: Producto = {
      id: initialData?.id || Date.now().toString(),
      nombre,
      precioCompra: precioCompraNum,
      precioVenta: precioVentaNum,
      proveedor1Id,
      proveedor2Id: proveedor2Id || undefined
    };
    
    try {
      await onSubmit(productoData);
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      toast.error('Error al guardar el producto. Intente nuevamente.');
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{initialData ? 'Editar Producto' : 'Agregar Nuevo Producto'}</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="nombre" className="flex">
            Nombre <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={cn(validationErrors.nombre && "border-red-500")}
          />
          {validationErrors.nombre && (
            <p className="text-sm text-red-500">Este campo es requerido</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="precioCompra" className="flex">
              Precio de Compra <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="precioCompra"
              type="number"
              step="0.01"
              min="0"
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
              className={cn(validationErrors.precioCompra && "border-red-500")}
            />
            {validationErrors.precioCompra && (
              <p className="text-sm text-red-500">Este campo es requerido</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="precioVenta" className="flex">
              Precio de Venta <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="precioVenta"
              type="number"
              step="0.01"
              min="0"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              className={cn(validationErrors.precioVenta && "border-red-500")}
            />
            {validationErrors.precioVenta && (
              <p className="text-sm text-red-500">Este campo es requerido</p>
            )}
          </div>
        </div>
        
        {parseFloat(precioVenta) <= parseFloat(precioCompra) && precioVenta && precioCompra && (
          <div className="text-sm text-red-500">
            El precio de venta debe ser mayor al precio de compra
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="proveedor1" className="flex">
            Proveedor Principal <span className="text-red-500 ml-1">*</span>
          </Label>
          <Popover open={openProveedor1} onOpenChange={setOpenProveedor1}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openProveedor1}
                className={cn(
                  "w-full justify-between",
                  validationErrors.proveedor1 && "border-red-500"
                )}
                onClick={() => setOpenProveedor1(true)}
              >
                {proveedor1Id ? proveedores.find((p) => p.id === proveedor1Id)?.nombre || "Seleccionar..." : "Seleccionar proveedor..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 z-50">
              <Command>
                <CommandInput 
                  placeholder="Buscar proveedor..." 
                  value={proveedor1Search}
                  onValueChange={setProveedor1Search}
                />
                <CommandList>
                  {filteredProveedor1.length === 0 ? (
                    <CommandEmpty>No se encontraron proveedores.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredProveedor1.map((proveedor) => (
                        <CommandItem
                          key={proveedor.id}
                          value={proveedor.id}
                          onSelect={() => handleSelectProveedor1(proveedor.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              proveedor1Id === proveedor.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {proveedor.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {validationErrors.proveedor1 && (
            <p className="text-sm text-red-500">Este campo es requerido</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="proveedor2">
            Proveedor Secundario <span className="text-muted-foreground text-sm">(opcional)</span>
          </Label>
          <Popover open={openProveedor2} onOpenChange={setOpenProveedor2}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openProveedor2}
                className="w-full justify-between"
                disabled={!proveedor1Id} // Disabled if primary provider is not selected
                onClick={() => proveedor1Id && setOpenProveedor2(true)}
              >
                {proveedor2Id ? proveedores.find((p) => p.id === proveedor2Id)?.nombre || "Seleccionar..." : "Seleccionar proveedor..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 z-50">
              <Command>
                <CommandInput 
                  placeholder="Buscar proveedor..." 
                  value={proveedor2Search}
                  onValueChange={setProveedor2Search}
                />
                <CommandList>
                  {filteredProveedor2.length === 0 ? (
                    <CommandEmpty>No se encontraron proveedores.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredProveedor2.map((proveedor) => (
                        <CommandItem
                          key={proveedor.id}
                          value={proveedor.id}
                          onSelect={() => handleSelectProveedor2(proveedor.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              proveedor2Id === proveedor.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {proveedor.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {!proveedor1Id && (
            <p className="text-sm text-amber-500">Seleccione primero un proveedor principal</p>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default ProductoForm;
