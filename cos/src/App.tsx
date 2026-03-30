import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdDetailPage from "@/pages/app/AdDetailPage";
import AppLayout from "./components/layout/app-view/AppLayout";
import AppHome from "./pages/app/AppHome";
import BuyerHome from "./pages/buyer/BuyerHome";
import BuyerLayout from "./components/layout/buyer-view/BuyerLayout";
import SalerLayout from "./components/layout/saler-view/SalerLayout";
import SalerHome from "./pages/saler/SalerHome";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { useAuthStore } from "./store/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
    mutations: { retry: 0 },
  },
});
const basename = import.meta.env.VITE_APP_ENV === 'production' ? '/cos_app' : '/';

/** If already logged in, skip the landing page and go straight home */
function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return (
      <Navigate
        to={user.role === "Sales User" ? "/saler-home" : "/buyer-home"}
        replace
      />
    );
  }
  return <AppHome />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
       <BrowserRouter basename={basename}>
        <Routes>
          {/* ── Guest routes — wrapped in AppLayout (header + outlet) ── */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/cars/:name" element={<AdDetailPage />} />
          </Route>

          {/* ── Buyer (role-guarded) ── */}
          <Route
            element={
              <ProtectedRoute allowedRole="Buyer">
                <BuyerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/buyer-home" element={<BuyerHome />} />
          </Route>

          {/* ── Seller (role-guarded) ── */}
          <Route
            element={
              <ProtectedRoute allowedRole="Sales User">
                <SalerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/saler-home" element={<SalerHome />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
