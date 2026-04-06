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
import HelpSupport from "./pages/saler/help-support";
import Notifications from "./pages/saler/notifications";
import ProfileSettings from "./pages/saler/profile-settings";
import WalletPayments from "./pages/saler/wallet";
import ScrollToTop from "./lib/ScrollToTop";
import Addcar from "./pages/saler/Addcar";
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
        to={user.role === "Sales User" ? "/seller" : "/buyer"}
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
    <ScrollToTop />
    <Routes>
      {/* ── Guest routes ── */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="cars/:name" element={<AdDetailPage />} />
      </Route>

      {/* ── Buyer (role-guarded) ── */}
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allowedRole="Buyer">
            <BuyerLayout />
          </ProtectedRoute>
        }
      >
        {/* 'index' matches exactly "/buyer" */}
        <Route index element={<BuyerHome />} />
      </Route>

      {/* ── Seller (role-guarded) ── */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRole="Sales User">
            <SalerLayout />
          </ProtectedRoute>
        }
      >
        {/* 'index' matches exactly "/seller" */}
        <Route index element={<SalerHome />} />
        
        {/* Relative paths (no leading slash) */}
        <Route path="help-support" element={<HelpSupport />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile-settings" element={<ProfileSettings />} />
        <Route path="wallet" element={<WalletPayments />} />
        <Route path="addcar" element={<Addcar />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
</QueryClientProvider>
  );
}
