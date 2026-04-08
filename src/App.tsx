import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";

import NotFound from "./pages/NotFound.tsx";
import ApiDataPage from "./pages/ApiData.tsx";
import Login from "./pages/Login.tsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.tsx";

// Lazy load Dashboard for instant Suspense fallback
const Index = lazy(() => import("./pages/Index.tsx"));

const queryClient = new QueryClient();

// Wrap routes to allow AnimatePresence across router
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Suspense fallback={null}>
              <Index />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/api/data" element={
          <ProtectedRoute>
            <Suspense fallback={null}>
              <ApiDataPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
