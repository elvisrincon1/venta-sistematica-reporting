
import React, { useState } from 'react';
import { Proveedor } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';

const Proveedores = () => {
  const { 
    data: proveedores, 
    addItem: addProveedor, 
    updateItem: updateProveedor, 
    deleteItem: deleteProveedor 
  } = useSupabaseSync<Proveedor>('proveedores', []);
  
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [proveedorToDelete, setProveedorToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre || !contacto || !telefono) {
      toast.error('Por favor complete los campos requeridos');
      return;
    }
    
    const proveedorData: Proveedor = {
      id: editingId || Date.now().toString(),
      nombre,
      contacto,
      telefono,
      email
    };
    
    try {
      if (editingId) {
        await updateProveedor(proveedorData);
        toast.success('Proveedor actualizado exitosamente');
      } else {
        await addProveedor(proveedorData);
        toast.success('Proveedor agregado exitosamente');
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      toast.error('Error al guardar. Intente nuevamente.');
    }
  };

  const resetForm = () => {
    setNombre('');
    setContacto('');
    setTelefono('');
    setEmail('');
    setEditingId(null);
  };

  const handleEdit = (proveedor: Proveedor) => {
    setEditingId(proveedor.id);
    setNombre(proveedor.nombre);
    setContacto(proveedor.contacto);
    setTelefono(proveedor.telefono);
    setEmail(proveedor.email);
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setProveedorToDelete(id);
    setDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (proveedorToDelete) {
      try {
        await deleteProveedor(proveedorToDelete);
        setDeleteAlertOpen(false);
        setProveedorToDelete(null);
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        toast.error('Error al eliminar. Intente nuevamente.');
      }
    }
  };

  // Filtrar proveedores según el término de búsqueda
  const filteredProveedores = searchTerm.trim() === ''
    ? proveedores
    : proveedores.filter(proveedor =>
        proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (proveedor.email && proveedor.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Agregar Proveedor</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contacto">Persona de Contacto</Label>
                <Input
                  id="contacto"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
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
          <CardTitle>Lista de Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center pb-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, contacto, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
          
          {filteredProveedores.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {searchTerm ? "No se encontraron proveedores que coincidan con la búsqueda." : "No hay proveedores registrados. Agrega uno para comenzar."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProveedores.map((proveedor) => (
                    <TableRow key={proveedor.id}>
                      <TableCell className="font-medium">{proveedor.nombre}</TableCell>
                      <TableCell>{proveedor.contacto}</TableCell>
                      <TableCell>{proveedor.telefono}</TableCell>
                      <TableCell>{proveedor.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(proveedor)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(proveedor.id)}>
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
              Esta acción eliminará el proveedor y no podrá ser recuperado.
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

export default Proveedores;
