import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/ui/AuthDialog";
import { useAuthStore } from "@/store/auth";
import { useLogout } from "@/hooks/useAuth";

// ─── Nav link definitions per role ───────────────────────────

const guestLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "How to Buy", href: "/how-to-buy" },
  { label: "Update", href: "/update" },
  { label: "Catalog", href: "/catalog" },
  { label: "Contact Us", href: "/contact" },
];

const buyerLinks = [
  { label: "Home", href: "/buyer" }, // Matches the 'index' route
  { label: "Catalog", href: "/buyer/catalog" },
  { label: "My Orders", href: "/buyer/orders" },
  { label: "How to Buy", href: "/buyer/how-to-buy" },
  { label: "Contact Us", href: "/buyer/contact" },
];

const salerLinks = [
  { label: "Dashboard", href: "/seller" }, // Matches the 'index' route
  { label: "Listings", href: "/seller/listings" },
  { label: "Add Vehicle", href: "/seller/add" },
  { label: "Inquiries", href: "/seller/inquiries" },
  { label: "Reports", href: "/seller/reports" },
  { label: "Wallet", href: "/seller/wallet" }, // Now /seller/wallet works!
];

// ─── Logo ─────────────────────────────────────────────────────

function Logo() {
  const { user } = useAuthStore();
  const href =
    user?.role === "Sales User"
      ? "/seller"
      : user?.role === "Buyer"
      ? "/buyer"
      : "/app";

  return (
    <Link to={href} className="flex items-center gap-2 shrink-0">
      <div className="bg-[#FC7844] rounded px-2 py-1 flex items-center gap-1">
        <svg width="18" height="12" viewBox="0 0 24 16" fill="none">
          <path
            d="M3 10L5 4H19L21 10"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect x="1" y="10" width="22" height="4" rx="1" fill="white" />
          <circle cx="6" cy="14" r="2" fill="#FC7844" />
          <circle cx="18" cy="14" r="2" fill="#FC7844" />
        </svg>
        <span className="text-xs font-bold leading-none tracking-tight text-white">
          Cars on Ship
        </span>
      </div>
    </Link>
  );
}

// ─── User badge (shown when logged in) ───────────────────────
function UserBadge({ username }: { username: string }) {
  // Safe check: if username is null/undefined, it won't crash
  const initial = username?.charAt(0).toUpperCase() || "U"; 

  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-[#FC7844] flex items-center justify-center text-white text-xs font-bold shrink-0">
        {initial}
      </div>
      <div className="hidden text-right lg:block">
        <p className="text-xs font-semibold leading-none text-white">
          {username || "User"}
        </p>
      </div>
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────

export default function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();

  // Pick the right nav links based on auth state
  const navLinks = !isAuthenticated
    ? guestLinks
    : user?.role === "Sales User"
    ? salerLinks
    : buyerLinks;

  return (
    <header className="w-full bg-[#212123] sticky top-0 z-50 shadow-md">
      <div className="flex items-center justify-between px-4 mx-auto max-w-7xl h-14">
        {/* Logo */}
        <Logo />

        {/* Desktop Nav */}
        <nav className="items-center hidden gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === location.pathname ||
              (link.href !== "/app" &&
                link.href !== "/buyer-home" &&
                link.href !== "/saler-home" &&
                location.pathname.startsWith(link.href));

            return (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  "px-3 py-1 text-sm font-medium transition-colors rounded",
                  isActive
                    ? "text-[#FC7844]"
                    : "text-gray-300 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: auth controls */}
        <div className="items-center hidden gap-3 md:flex">
          {isAuthenticated && user ? (
            <>
              <UserBadge username={user.username} />
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-[#FC7844] text-[#FC7844] hover:bg-[#FC7844] hover:text-white bg-transparent text-xs h-8 px-4"
              >
                Logout
              </Button>
            </>
          ) : (
            <AuthDialog />
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="p-1 text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#212123] border-t border-white/10 px-4 pb-4">
          {/* User info strip (mobile) */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-2 py-3 mb-2 border-b border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#FC7844] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {/* Fix: use username and add the ? */}
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-xs font-semibold leading-none text-white">
                  {user?.username || "User"}
                </p>
              </div>
            </div>
          )}

          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block py-2 text-sm font-medium",
                  isActive ? "text-[#FC7844]" : "text-gray-300 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Mobile auth controls */}
          <div className="flex gap-2 mt-3">
            {isAuthenticated ? (
              <Button
                size="sm"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="bg-[#FC7844] text-white text-xs"
              >
                Logout
              </Button>
            ) : (
              <AuthDialog />
            )}
          </div>
        </div>
      )}
    </header>
  );
}