
import React, { useState } from 'react';
import { Producto } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import ProductoForm from '@/components/inventario/ProductoForm';
import ProductosList from '@/components/inventario/ProductosList';
import DeleteAlertDialog from '@/components/inventario/DeleteAlertDialog';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';

const Inventario = () => {
  const { proveedores } = useSupabaseSync('proveedores', []);
  const { 
    data: productos, 
    addItem: addProducto, 
    updateItem: updateProducto, 
    deleteItem: deleteProducto
  } = useSupabaseSync<Producto>('productos', []);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleSubmit = async (productoData: Producto) => {
    try {
      const productoToSave = {
        ...productoData,
        id: productoData.id,
        nombre: productoData.nombre,
        preciocompra: productoData.precioCompra,
        precioventa: productoData.precioVenta,
        proveedor1id: productoData.proveedor1Id,
        proveedor2id: productoData.proveedor2Id || null
      };
      
      if (editingId) {
        // Eliminar campos que Supabase espera en otro formato
        delete (productoToSave as any).precioCompra;
        delete (productoToSave as any).precioVenta;
        delete (productoToSave as any).proveedor1Id;
        delete (productoToSave as any).proveedor2Id;
        
        await updateProducto(productoData);
        toast.success('Producto actualizado exitosamente');
      } else {
        // Eliminar campos que Supabase espera en otro formato
        delete (productoToSave as any).precioCompra;
        delete (productoToSave as any).precioVenta;
        delete (productoToSave as any).proveedor1Id;
        delete (productoToSave as any).proveedor2Id;
        
        await addProducto(productoData);
        toast.success('Producto agregado exitosamente');
      }
      
      setEditingId(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al guardar en Supabase:', error);
      toast.error('Error al guardar el producto. Intente nuevamente.');
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditingId(producto.id);
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProducto(productToDelete);
        setDeleteAlertOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error('Error al eliminar de Supabase:', error);
      }
    }
  };

  // Preparar datos para editar
  const productoEnEdicion = editingId 
    ? productos.find(p => p.id === editingId) || null
    : null;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingId(null)}>Agregar Producto</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <ProductoForm 
              proveedores={proveedores} 
              initialData={productoEnEdicion}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductosList 
            productos={productos} 
            proveedores={proveedores}
            onEdit={handleEdit}
            onDelete={confirmDelete}
          />
        </CardContent>
      </Card>

      <DeleteAlertDialog
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Inventario;
