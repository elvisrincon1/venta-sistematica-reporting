
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export function useSupabaseSync<T>(
  tableName: string, 
  initialData: T[] = [], 
  idField: keyof T = 'id' as keyof T
) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const { data: fetchedData, error } = await supabase
          .from(tableName)
          .select('*');

        if (error) {
          throw error;
        }

        setData(fetchedData as T[]);
        console.log(`Datos cargados desde Supabase (${tableName}):`, fetchedData);
      } catch (err: any) {
        console.error(`Error cargando datos de ${tableName}:`, err);
        setError(err);
        toast.error(`Error al cargar datos: ${err.message || 'Desconocido'}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [tableName]);

  // Añadir un elemento
  const addItem = useCallback(async (item: T): Promise<void> => {
    try {
      const { data: insertedData, error } = await supabase
        .from(tableName)
        .insert(item)
        .select();

      if (error) {
        throw error;
      }

      setData(prevData => [...prevData, insertedData[0] as T]);
      toast.success('Elemento agregado exitosamente');
    } catch (err: any) {
      console.error(`Error añadiendo a ${tableName}:`, err);
      
      // Agregar localmente si falla la conexión
      setData(prevData => [...prevData, item]);
      
      toast.error(`Error al guardar en la base de datos: ${err.message || 'Desconocido'}`);
      throw err;
    }
  }, [tableName]);

  // Actualizar un elemento
  const updateItem = useCallback(async (item: T): Promise<void> => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update(item)
        .eq(idField as string, (item as any)[idField]);

      if (error) {
        throw error;
      }

      setData(prevData => 
        prevData.map(prevItem => 
          (prevItem as any)[idField] === (item as any)[idField] ? item : prevItem
        )
      );
      
      toast.success('Elemento actualizado exitosamente');
    } catch (err: any) {
      console.error(`Error actualizando en ${tableName}:`, err);
      
      // Actualizar localmente si falla la conexión
      setData(prevData => 
        prevData.map(prevItem => 
          (prevItem as any)[idField] === (item as any)[idField] ? item : prevItem
        )
      );
      
      toast.error(`Error al actualizar en la base de datos: ${err.message || 'Desconocido'}`);
      throw err;
    }
  }, [tableName, idField]);

  // Eliminar un elemento
  const deleteItem = useCallback(async (itemId: string | number): Promise<void> => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(idField as string, itemId);

      if (error) {
        throw error;
      }

      setData(prevData => prevData.filter(item => (item as any)[idField] !== itemId));
      toast.success('Elemento eliminado exitosamente');
    } catch (err: any) {
      console.error(`Error eliminando de ${tableName}:`, err);
      
      // Eliminar localmente si falla la conexión
      setData(prevData => prevData.filter(item => (item as any)[idField] !== itemId));
      
      toast.error(`Error al eliminar de la base de datos: ${err.message || 'Desconocido'}`);
      throw err;
    }
  }, [tableName, idField]);

  return {
    data,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem
  };
}
