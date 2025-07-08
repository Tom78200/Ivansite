import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";

const Admin = lazy(() => import("@/pages/admin"));
const AdminExpos = lazy(() => import("@/pages/admin-expos"));
const AdminExpoImages = lazy(() => import("@/pages/admin-expo-images"));
const GalleryFeatured = lazy(() => import("@/pages/GalleryFeatured"));
const ExpositionDetail = lazy(() => import("@/pages/ExpositionDetail"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Expositions = lazy(() => import("@/pages/Expositions"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Layout>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white text-xl">Chargement...</div>}>
        <Switch>
          <Route path="/" component={Gallery} />
          <Route path="/expositions" component={Expositions} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/expositions/:id" component={ExpositionDetail} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/expos" component={AdminExpos} />
          <Route path="/admin/expos/:id/images" component={AdminExpoImages} />
          <Route path="/galerie/phares" component={GalleryFeatured} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
