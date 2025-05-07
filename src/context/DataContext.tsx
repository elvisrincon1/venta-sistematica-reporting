
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from "@/integrations/supabase/client";

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
  addProveedor: (proveedor: Proveedor) => Promise<void>;
  updateProveedor: (proveedor: Proveedor) => Promise<void>;
  deleteProveedor: (id: string) => Promise<void>;
  addAfiliado: (afiliado: Afiliado) => Promise<void>;
  updateAfiliado: (afiliado: Afiliado) => Promise<void>;
  deleteAfiliado: (id: string) => Promise<void>;
  addProducto: (producto: Producto) => void;
  updateProducto: (producto: Producto) => void;
  deleteProducto: (id: string) => void;
  addVenta: (venta: Venta) => Promise<void>;
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

  // Cargar datos desde Supabase al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar proveedores
        const { data: proveedoresData, error: proveedoresError } = await supabase
          .from('proveedores')
          .select('*');
        
        if (proveedoresError) {
          console.error('Error cargando proveedores:', proveedoresError);
        } else {
          const mappedProveedores = proveedoresData.map(p => ({
            id: p.id,
            nombre: p.nombre,
            contacto: p.contacto || '',
            telefono: p.telefono || '',
            email: p.email || ''
          }));
          console.log('Proveedores cargados:', mappedProveedores);
          setProveedores(mappedProveedores);
          localStorage.setItem('proveedores', JSON.stringify(mappedProveedores));
        }

        // Cargar afiliados
        const { data: afiliadosData, error: afiliadosError } = await supabase
          .from('afiliados')
          .select('*');
        
        if (afiliadosError) {
          console.error('Error cargando afiliados:', afiliadosError);
        } else {
          const mappedAfiliados = afiliadosData.map(a => ({
            id: a.id,
            nombre: a.nombre,
            identificacion: a.identificacion || '',
            contacto: a.contacto || ''
          }));
          console.log('Afiliados cargados:', mappedAfiliados);
          setAfiliados(mappedAfiliados);
          localStorage.setItem('afiliados', JSON.stringify(mappedAfiliados));
        }

        // Cargar productos
        const { data: productosData, error: productosError } = await supabase
          .from('productos')
          .select('*');
        
        if (productosError) {
          console.error('Error cargando productos:', productosError);
        } else {
          const mappedProductos = productosData.map(p => ({
            id: p.id,
            nombre: p.nombre,
            precioCompra: Number(p.preciocompra),
            precioVenta: Number(p.precioventa),
            proveedor1Id: p.proveedor1id,
            proveedor2Id: p.proveedor2id || undefined
          }));
          console.log('Productos cargados:', mappedProductos);
          setProductos(mappedProductos);
          localStorage.setItem('productos', JSON.stringify(mappedProductos));
        }

        // Cargar ventas
        const { data: ventasData, error: ventasError } = await supabase
          .from('ventas')
          .select('*');
        
        if (ventasError) {
          console.error('Error cargando ventas:', ventasError);
        } else {
          const mappedVentas = ventasData.map(v => ({
            id: v.id,
            fecha: v.fecha,
            afiliadoId: v.afiliadoid,
            productoId: v.productoid,
            cantidad: v.cantidad,
            precioVenta: Number(v.precioventa),
            precioCompra: Number(v.preciocompra)
          }));
          console.log('Ventas cargadas:', mappedVentas);
          setVentas(mappedVentas);
          localStorage.setItem('ventas', JSON.stringify(mappedVentas));
        }
      } catch (error) {
        console.error('Error al cargar datos desde Supabase:', error);
        
        // Intentar cargar desde localStorage como fallback
        loadFromLocalStorage();
      }
    };

    fetchData();
  }, []);

  // Función para cargar desde localStorage si falla Supabase
  const loadFromLocalStorage = () => {
    const storedProveedores = localStorage.getItem('proveedores');
    const storedAfiliados = localStorage.getItem('afiliados');
    const storedProductos = localStorage.getItem('productos');
    const storedVentas = localStorage.getItem('ventas');

    if (storedProveedores) setProveedores(JSON.parse(storedProveedores));
    if (storedAfiliados) setAfiliados(JSON.parse(storedAfiliados));
    if (storedProductos) setProductos(JSON.parse(storedProductos));
    if (storedVentas) setVentas(JSON.parse(storedVentas));
  };

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

  const addProveedor = async (proveedor: Proveedor) => {
    try {
      const { error } = await supabase
        .from('proveedores')
        .insert({
          id: proveedor.id,
          nombre: proveedor.nombre,
          contacto: proveedor.contacto,
          telefono: proveedor.telefono,
          email: proveedor.email
        });
      
      if (error) throw error;
      
      setProveedores([...proveedores, proveedor]);
    } catch (error) {
      console.error('Error al agregar proveedor a Supabase:', error);
      setProveedores([...proveedores, proveedor]); // Fallback a estado local
    }
  };

  const updateProveedor = async (proveedor: Proveedor) => {
    try {
      const { error } = await supabase
        .from('proveedores')
        .update({
          nombre: proveedor.nombre,
          contacto: proveedor.contacto,
          telefono: proveedor.telefono,
          email: proveedor.email
        })
        .eq('id', proveedor.id);
      
      if (error) throw error;
      
      setProveedores(proveedores.map(p => p.id === proveedor.id ? proveedor : p));
    } catch (error) {
      console.error('Error al actualizar proveedor en Supabase:', error);
      setProveedores(proveedores.map(p => p.id === proveedor.id ? proveedor : p)); // Fallback a estado local
    }
  };

  const deleteProveedor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProveedores(proveedores.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar proveedor de Supabase:', error);
      setProveedores(proveedores.filter(p => p.id !== id)); // Fallback a estado local
    }
  };

  const addAfiliado = async (afiliado: Afiliado) => {
    try {
      const { error } = await supabase
        .from('afiliados')
        .insert({
          id: afiliado.id,
          nombre: afiliado.nombre,
          identificacion: afiliado.identificacion,
          contacto: afiliado.contacto
        });
      
      if (error) throw error;
      
      setAfiliados([...afiliados, afiliado]);
    } catch (error) {
      console.error('Error al agregar afiliado a Supabase:', error);
      setAfiliados([...afiliados, afiliado]); // Fallback a estado local
    }
  };

  const updateAfiliado = async (afiliado: Afiliado) => {
    try {
      const { error } = await supabase
        .from('afiliados')
        .update({
          nombre: afiliado.nombre,
          identificacion: afiliado.identificacion,
          contacto: afiliado.contacto
        })
        .eq('id', afiliado.id);
      
      if (error) throw error;
      
      setAfiliados(afiliados.map(a => a.id === afiliado.id ? afiliado : a));
    } catch (error) {
      console.error('Error al actualizar afiliado en Supabase:', error);
      setAfiliados(afiliados.map(a => a.id === afiliado.id ? afiliado : a)); // Fallback a estado local
    }
  };

  const deleteAfiliado = async (id: string) => {
    try {
      const { error } = await supabase
        .from('afiliados')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAfiliados(afiliados.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error al eliminar afiliado de Supabase:', error);
      setAfiliados(afiliados.filter(a => a.id !== id)); // Fallback a estado local
    }
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

  const addVenta = async (venta: Venta) => {
    try {
      const { error } = await supabase
        .from('ventas')
        .insert({
          id: venta.id,
          fecha: venta.fecha,
          afiliadoid: venta.afiliadoId,
          productoid: venta.productoId,
          cantidad: venta.cantidad,
          precioventa: venta.precioVenta,
          preciocompra: venta.precioCompra
        });
      
      if (error) throw error;
      
      setVentas([...ventas, venta]);
    } catch (error) {
      console.error('Error al agregar venta a Supabase:', error);
      setVentas([...ventas, venta]); // Fallback a estado local
    }
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
