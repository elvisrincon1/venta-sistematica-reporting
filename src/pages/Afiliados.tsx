
import React, { useState } from 'react';
import { Afiliado } from '@/context/DataContext';
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

const Afiliados = () => {
  const {
    data: afiliados,
    addItem: addAfiliado,
    updateItem: updateAfiliado,
    deleteItem: deleteAfiliado
  } = useSupabaseSync<Afiliado>('afiliados', []);
  
  const [nombre, setNombre] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [contacto, setContacto] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [afiliadoToDelete, setAfiliadoToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre || !identificacion) {
      toast.error('Por favor complete los campos requeridos');
      return;
    }
    
    const afiliadoData: Afiliado = {
      id: editingId || Date.now().toString(),
      nombre,
      identificacion,
      contacto
    };
    
    try {
      if (editingId) {
        await updateAfiliado(afiliadoData);
        toast.success('Afiliado actualizado exitosamente');
      } else {
        await addAfiliado(afiliadoData);
        toast.success('Afiliado agregado exitosamente');
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al guardar afiliado:', error);
      toast.error('Error al guardar. Intente nuevamente.');
    }
  };

  const resetForm = () => {
    setNombre('');
    setIdentificacion('');
    setContacto('');
    setEditingId(null);
  };

  const handleEdit = (afiliado: Afiliado) => {
    setEditingId(afiliado.id);
    setNombre(afiliado.nombre);
    setIdentificacion(afiliado.identificacion);
    setContacto(afiliado.contacto);
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setAfiliadoToDelete(id);
    setDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (afiliadoToDelete) {
      try {
        await deleteAfiliado(afiliadoToDelete);
        setDeleteAlertOpen(false);
        setAfiliadoToDelete(null);
      } catch (error) {
        console.error('Error al eliminar afiliado:', error);
        toast.error('Error al eliminar. Intente nuevamente.');
      }
    }
  };

  // Filtrar afiliados según el término de búsqueda
  const filteredAfiliados = searchTerm.trim() === ''
    ? afiliados
    : afiliados.filter(afiliado =>
        afiliado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        afiliado.identificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (afiliado.contacto && afiliado.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Afiliados</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Agregar Afiliado</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Afiliado' : 'Agregar Nuevo Afiliado'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="identificacion">Identificación</Label>
                <Input
                  id="identificacion"
                  value={identificacion}
                  onChange={(e) => setIdentificacion(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contacto">Contacto (teléfono o email)</Label>
                <Input
                  id="contacto"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
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
          <CardTitle>Lista de Afiliados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center pb-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, identificación o contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>
          
          {filteredAfiliados.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {searchTerm ? "No se encontraron afiliados que coincidan con la búsqueda." : "No hay afiliados registrados. Agrega uno para comenzar."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Identificación</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAfiliados.map((afiliado) => (
                    <TableRow key={afiliado.id}>
                      <TableCell className="font-medium">{afiliado.nombre}</TableCell>
                      <TableCell>{afiliado.identificacion}</TableCell>
                      <TableCell>{afiliado.contacto}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(afiliado)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(afiliado.id)}>
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
              Esta acción eliminará el afiliado y no podrá ser recuperado.
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

export default Afiliados;
