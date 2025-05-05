
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ReportarVenta from "./pages/ReportarVenta";
import Inventario from "./pages/Inventario";
import Proveedores from "./pages/Proveedores";
import Afiliados from "./pages/Afiliados";
import Informes from "./pages/Informes";
import NotFound from "./pages/NotFound";
import { DataProvider } from "./context/DataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<ReportarVenta />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/proveedores" element={<Proveedores />} />
              <Route path="/afiliados" element={<Afiliados />} />
              <Route path="/informes" element={<Informes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
