
import React, { createContext, useState, useEffect, useContext } from 'react';

export type Proveedor = {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
};

export type Afiliado = {
  id: string;
  nombre: string;
  identificacion: string;
  contacto: string;
};

export type Producto = {
  id: string;
  nombre: string;
  precioCompra: number;
  precioVenta: number;
  proveedor1Id: string;
  proveedor2Id?: string;
};

export type Venta = {
  id: string;
  fecha: string;
  afiliadoId: string;
  productoId: string;
  cantidad: number;
  precioVenta: number;
  precioCompra: number;
};

interface DataContextType {
  proveedores: Proveedor[];
  afiliados: Afiliado[];
  productos: Producto[];
  ventas: Venta[];
  addProveedor: (proveedor: Proveedor) => void;
  updateProveedor: (proveedor: Proveedor) => void;
  deleteProveedor: (id: string) => void;
  addAfiliado: (afiliado: Afiliado) => void;
  updateAfiliado: (afiliado: Afiliado) => void;
  deleteAfiliado: (id: string) => void;
  addProducto: (producto: Producto) => void;
  updateProducto: (producto: Producto) => void;
  deleteProducto: (id: string) => void;
  addVenta: (venta: Venta) => void;
  getProductoById: (id: string) => Producto | undefined;
  getAfiliadoById: (id: string) => Afiliado | undefined;
  getProveedorById: (id: string) => Proveedor | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const storedProveedores = localStorage.getItem('proveedores');
    const storedAfiliados = localStorage.getItem('afiliados');
    const storedProductos = localStorage.getItem('productos');
    const storedVentas = localStorage.getItem('ventas');

    if (storedProveedores) setProveedores(JSON.parse(storedProveedores));
    if (storedAfiliados) setAfiliados(JSON.parse(storedAfiliados));
    if (storedProductos) setProductos(JSON.parse(storedProductos));
    if (storedVentas) setVentas(JSON.parse(storedVentas));
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('proveedores', JSON.stringify(proveedores));
  }, [proveedores]);

  useEffect(() => {
    localStorage.setItem('afiliados', JSON.stringify(afiliados));
  }, [afiliados]);

  useEffect(() => {
    localStorage.setItem('productos', JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    localStorage.setItem('ventas', JSON.stringify(ventas));
  }, [ventas]);

  const addProveedor = (proveedor: Proveedor) => {
    setProveedores([...proveedores, proveedor]);
  };

  const updateProveedor = (proveedor: Proveedor) => {
    setProveedores(proveedores.map(p => p.id === proveedor.id ? proveedor : p));
  };

  const deleteProveedor = (id: string) => {
    setProveedores(proveedores.filter(p => p.id !== id));
  };

  const addAfiliado = (afiliado: Afiliado) => {
    setAfiliados([...afiliados, afiliado]);
  };

  const updateAfiliado = (afiliado: Afiliado) => {
    setAfiliados(afiliados.map(a => a.id === afiliado.id ? afiliado : a));
  };

  const deleteAfiliado = (id: string) => {
    setAfiliados(afiliados.filter(a => a.id !== id));
  };

  const addProducto = (producto: Producto) => {
    setProductos([...productos, producto]);
  };

  const updateProducto = (producto: Producto) => {
    setProductos(productos.map(p => p.id === producto.id ? producto : p));
  };

  const deleteProducto = (id: string) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  const addVenta = (venta: Venta) => {
    setVentas([...ventas, venta]);
  };

  const getProductoById = (id: string) => productos.find(p => p.id === id);
  
  const getAfiliadoById = (id: string) => afiliados.find(a => a.id === id);
  
  const getProveedorById = (id: string) => proveedores.find(p => p.id === id);

  return (
    <DataContext.Provider
      value={{
        proveedores,
        afiliados,
        productos,
        ventas,
        addProveedor,
        updateProveedor,
        deleteProveedor,
        addAfiliado,
        updateAfiliado,
        deleteAfiliado,
        addProducto,
        updateProducto,
        deleteProducto,
        addVenta,
        getProductoById,
        getAfiliadoById,
        getProveedorById
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
