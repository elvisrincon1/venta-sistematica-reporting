
import React, { useState } from 'react';
import { useData, Producto } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Edit, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const Inventario = () => {
  const { productos, proveedores, addProducto, updateProducto, deleteProducto } = useData();
  const [nombre, setNombre] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [proveedor1Id, setProveedor1Id] = useState('');
  const [proveedor2Id, setProveedor2Id] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openProveedor1, setOpenProveedor1] = useState(false);
  const [openProveedor2, setOpenProveedor2] = useState(false);
  const [proveedor1Search, setProveedor1Search] = useState('');
  const [proveedor2Search, setProveedor2Search] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  // Validation state to show which fields are missing
  const [validationErrors, setValidationErrors] = useState<{
    nombre?: boolean;
    precioCompra?: boolean;
    precioVenta?: boolean;
    proveedor1?: boolean;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation errors
    setValidationErrors({});
    
    // Collect validation errors
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
      id: editingId || Date.now().toString(),
      nombre,
      precioCompra: precioCompraNum,
      precioVenta: precioVentaNum,
      proveedor1Id,
      proveedor2Id: proveedor2Id || undefined
    };
    
    if (editingId) {
      updateProducto(productoData);
      toast.success('Producto actualizado exitosamente');
    } else {
      addProducto(productoData);
      toast.success('Producto agregado exitosamente');
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setNombre('');
    setPrecioCompra('');
    setPrecioVenta('');
    setProveedor1Id('');
    setProveedor2Id('');
    setEditingId(null);
    setValidationErrors({});
  };

  const handleEdit = (producto: Producto) => {
    setEditingId(producto.id);
    setNombre(producto.nombre);
    setPrecioCompra(producto.precioCompra.toString());
    setPrecioVenta(producto.precioVenta.toString());
    setProveedor1Id(producto.proveedor1Id);
    setProveedor2Id(producto.proveedor2Id || '');
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteAlertOpen(true);
  };

  const handleDelete = () => {
    if (productToDelete) {
      deleteProducto(productToDelete);
      setDeleteAlertOpen(false);
      setProductToDelete(null);
      toast.success('Producto eliminado exitosamente');
    }
  };

  const filteredProveedor1 = proveedores.filter(proveedor => 
    proveedor.nombre.toLowerCase().includes(proveedor1Search.toLowerCase())
  );

  const filteredProveedor2 = proveedores.filter(proveedor => 
    proveedor.nombre.toLowerCase().includes(proveedor2Search.toLowerCase()) &&
    proveedor.id !== proveedor1Id
  );

  const handleSelectProveedor1 = (value: string) => {
    console.log("Selecting primary provider:", value);
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
    console.log("Selecting secondary provider:", value);
    setProveedor2Id(value === proveedor2Id ? '' : value);
    setOpenProveedor2(false);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Agregar Producto</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Producto' : 'Agregar Nuevo Producto'}</DialogTitle>
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
                    >
                      {proveedor1Id ? proveedores.find((p) => p.id === proveedor1Id)?.nombre : "Seleccionar proveedor..."}
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
                      <CommandEmpty>No se encontraron proveedores.</CommandEmpty>
                      <CommandList>
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
                    >
                      {proveedor2Id ? proveedores.find((p) => p.id === proveedor2Id)?.nombre : "Seleccionar proveedor..."}
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
                      <CommandEmpty>No se encontraron proveedores.</CommandEmpty>
                      <CommandList>
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
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {!proveedor1Id && (
                  <p className="text-sm text-amber-500">Seleccione primero un proveedor principal</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {productos.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No hay productos registrados. Agrega uno para comenzar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio Compra</TableHead>
                    <TableHead>Precio Venta</TableHead>
                    <TableHead>Proveedor Principal</TableHead>
                    <TableHead>Proveedor Secundario</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell>${producto.precioCompra.toFixed(2)}</TableCell>
                      <TableCell>${producto.precioVenta.toFixed(2)}</TableCell>
                      <TableCell>
                        {proveedores.find(p => p.id === producto.proveedor1Id)?.nombre || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {producto.proveedor2Id ? proveedores.find(p => p.id === producto.proveedor2Id)?.nombre : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(producto)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(producto.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el producto y no podrá ser recuperado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventario;
