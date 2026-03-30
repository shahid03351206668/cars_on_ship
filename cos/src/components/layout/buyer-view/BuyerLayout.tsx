import { Outlet } from "react-router-dom";

export default function BuyerLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
