
import React, { useState } from 'react';
import { Producto } from '@/context/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash, Search } from 'lucide-react';

interface ProductosListProps {
  productos: Producto[];
  proveedores: any[];
  onEdit: (producto: Producto) => void;
  onDelete: (id: string) => void;
}

const ProductosList: React.FC<ProductosListProps> = ({ 
  productos, 
  proveedores, 
  onEdit, 
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrar productos según el término de búsqueda
  const filteredProductos = searchTerm.trim() === '' 
    ? productos 
    : productos.filter(producto => 
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        proveedores.find(p => p.id === producto.proveedor1Id)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (producto.proveedor2Id && proveedores.find(p => p.id === producto.proveedor2Id)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  return (
    <>
      <div className="flex items-center pb-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
      </div>

      {filteredProductos.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          {searchTerm ? "No se encontraron productos que coincidan con la búsqueda." : "No hay productos registrados. Agrega uno para comenzar."}
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
              {filteredProductos.map((producto) => (
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
                      <Button variant="ghost" size="icon" onClick={() => onEdit(producto)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(producto.id)}>
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
    </>
  );
};

export default ProductosList;
