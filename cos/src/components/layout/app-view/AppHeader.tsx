import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/ui/AuthDialog";
import { useAuthStore } from "@/store/auth";
import { useLogout } from "@/hooks/useAuth";

// ─── Nav link definitions per role ───────────────────────────

const guestLinks = [
  { label: "Home", href: "/app" },
  { label: "About", href: "/app/about" },
  { label: "How to Buy", href: "/app/how-to-buy" },
  { label: "Update", href: "/app/update" },
  { label: "Catalog", href: "/app/catalog" },
  { label: "Contact Us", href: "/app/contact" },
];

const buyerLinks = [
  { label: "Home", href: "/buyer-home" },
  { label: "Catalog", href: "/buyer-home/catalog" },
  { label: "My Orders", href: "/buyer-home/orders" },
  { label: "How to Buy", href: "/buyer-home/how-to-buy" },
  { label: "Contact Us", href: "/buyer-home/contact" },
];

const salerLinks = [
  { label: "Dashboard", href: "/saler-home" },
  { label: "Listings", href: "/saler-home/listings" },
  { label: "Add Vehicle", href: "/saler-home/add" },
  { label: "Inquiries", href: "/saler-home/inquiries" },
  { label: "Reports", href: "/saler-home/reports" },
];

// ─── Logo ─────────────────────────────────────────────────────

function Logo() {
  const { user } = useAuthStore();
  const href =
    user?.role === "Sales User"
      ? "/saler-home"
      : user?.role === "Buyer"
      ? "/buyer-home"
      : "/app";

  return (
    <Link to={href} className="flex items-center gap-2 shrink-0">
      <div className="bg-[#FC7844] rounded-md px-2.5 py-1 flex items-center gap-1.5">
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

function UserBadge({ fullName, role }: { fullName: string; role: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-[#FC7844] flex items-center justify-center text-white text-xs font-bold shrink-0">
        {fullName.charAt(0).toUpperCase()}
      </div>
      <div className="hidden text-right lg:block">
        <p className="text-xs font-semibold leading-none text-white">{fullName}</p>
        <p className="text-[10px] text-gray-400 leading-none mt-0.5">{role}</p>
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

  // return (

  //   <header className="w-full fixed top-0 left-0 z-[999] flex justify-center pointer-events-none"> 
  //     <div className="flex items-center justify-between px-6 w-full h-14 bg-[#212123]/90 backdrop-blur-md shadow-lg pointer-events-auto">
  //       {/* Logo */}
  //       <Logo />

  //       {/* Desktop Nav */}
  //       <nav className="items-center hidden gap-7 md:flex">
  //         {navLinks.map((link) => {
  //           const isActive =
  //             link.href === location.pathname ||
  //             (link.href !== "/app" &&
  //               link.href !== "/buyer-home" &&
  //               link.href !== "/saler-home" &&
  //               location.pathname.startsWith(link.href));

  //           return (
  //             <Link
  //               key={link.label}
  //               to={link.href}
  //               className={cn(
  //                 "px-3 py-1 text-sm font-medium transition-all duration-200 rounded-md",
  //                 isActive
  //                   ? "text-[#FC7844] bg-white/5"
  //                   : "text-gray-300 hover:text-white hover:bg-white/5"
  //               )}
  //             >
  //               {link.label}
  //             </Link>
  //           );
  //         })}
  //       </nav>

  //       {/* Right side: auth controls */}
  //       <div className="items-center hidden gap-3 md:flex ml-6">
  //         {isAuthenticated && user ? (
  //           <>
  //             <UserBadge fullName={user.full_name} role={user.role} />
  //             <Button
  //               variant="outline"
  //               size="sm"
  //               onClick={logout}
  //               className="border-[#FC7844] text-[#FC7844] hover:bg-[#FC7844] hover:text-white bg-transparent text-xs h-8 px-4"
  //             >
  //               Logout
  //             </Button>
  //           </>
  //         ) : (
  //           <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-lg">
  //             <AuthDialog />
  //           </div>
  //         )}
  //       </div>

  //       {/* Mobile hamburger */}
  //       <button
  //         className="p-1 text-white md:hidden"
  //         onClick={() => setMobileOpen(!mobileOpen)}
  //         aria-label="Toggle menu"
  //       >
  //         <svg
  //           width="22"
  //           height="22"
  //           viewBox="0 0 24 24"
  //           fill="none"
  //           stroke="currentColor"
  //           strokeWidth="2"
  //         >
  //           {mobileOpen ? (
  //             <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
  //           ) : (
  //             <>
  //               <line x1="3" y1="6" x2="21" y2="6" />
  //               <line x1="3" y1="12" x2="21" y2="12" />
  //               <line x1="3" y1="18" x2="21" y2="18" />
  //             </>
  //           )}
  //         </svg>
  //       </button>
  //     </div>

  //     {/* Mobile Menu */}
  //     {mobileOpen && (
  //       <div className="md:hidden bg-[#212123] border-t border-white/10 px-4 pb-4">
  //         {/* User info strip (mobile) */}
  //         {isAuthenticated && user && (
  //           <div className="flex items-center gap-2 py-3 mb-2 border-b border-white/10">
  //             <div className="w-8 h-8 rounded-full bg-[#FC7844] flex items-center justify-center text-white text-sm font-bold shrink-0">
  //               {user.full_name.charAt(0).toUpperCase()}
  //             </div>
  //             <div>
  //               <p className="text-xs font-semibold leading-none text-white">
  //                 {user.full_name}
  //               </p>
  //               <p className="text-[10px] text-gray-400 leading-none mt-0.5">
  //                 {user.role}
  //               </p>
  //             </div>
  //           </div>
  //         )}

  //         {navLinks.map((link) => {
  //           const isActive = location.pathname === link.href;
  //           return (
  //             <Link
  //               key={link.label}
  //               to={link.href}
  //               onClick={() => setMobileOpen(false)}
  //               className={cn(
  //                 "block py-2 text-sm font-medium",
  //                 isActive ? "text-[#FC7844]" : "text-gray-300 hover:text-white"
  //               )}
  //             >
  //               {link.label}
  //             </Link>
  //           );
  //         })}

  //         {/* Mobile auth controls */}
  //         <div className="flex gap-2 mt-3">
  //           {isAuthenticated ? (
  //             <Button
  //               size="sm"
  //               onClick={() => {
  //                 setMobileOpen(false);
  //                 logout();
  //               }}
  //               className="bg-[#FC7844] text-white text-xs"
  //             >
  //               Logout
  //             </Button>
  //           ) : (
  //             <AuthDialog />
  //           )}
  //         </div>
  //       </div>
  //     )}
  //   </header>
  // );

  return (
    <header className="w-full absolute top-5 left-0 z-[999] flex justify-center pointer-events-none px-4">
      <div className="flex items-center justify-center gap-3 w-full max-w-6xl pointer-events-auto">
        
        {/* 💊 Left Capsule: Logo & Navigation Links */}
        <div className="flex items-center justify-between md:justify-start px-6 h-11 bg-[#1c1c1c] rounded-xl shadow-lg w-full md:w-auto md:gap-11">
          <Logo />

          {/* Desktop Nav */}
          <nav className="items-center hidden gap-7 md:flex">
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
                    "px-1 py-1 text-sm font-medium transition-all duration-200 rounded-md",
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

          {/* Mobile hamburger (Kept inside the left capsule for mobile responsiveness) */}
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

        {/* 💊 Right Capsule: Login / Register Auth Controls */}
        <div className="items-center hidden h-11 px-6 bg-[#1c1c1c] rounded-xl shadow-lg md:flex">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <UserBadge fullName={user.full_name} role={user.role} />
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-[#FC7844] text-[#FC7844] hover:bg-[#FC7844] hover:text-white bg-transparent text-xs h-7 px-4"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="text-sm">
              <AuthDialog />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu (Pops out from bottom on mobile) */}
      {mobileOpen && (
        <div className="absolute top-14 left-4 right-4 md:hidden bg-[#212123] rounded-xl border border-white/10 px-4 pb-4 pointer-events-auto">
          {/* User info strip (mobile) */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-2 py-3 mb-2 border-b border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#FC7844] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold leading-none text-white">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                  {user.role}
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