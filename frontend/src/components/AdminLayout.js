import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tag, 
  Users, 
  Boxes, 
  Settings, 
  ChevronLeft,
  LogOut
} from "lucide-react";
import { useAuth } from "../../App";

const LOGO_URL = "https://019c6f48-94c7-7a6c-843e-4138d52fc944.mochausercontent.com/ifslogop.png";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Inventory", href: "/admin/inventory", icon: Boxes },
  { name: "Coupons", href: "/admin/coupons", icon: Tag },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children, title }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 fixed h-full z-10">
        <div className="p-4 border-b border-stone-200">
          <Link to="/" className="flex items-center gap-2">
            <img src={LOGO_URL} alt="IFS Seeds" className="h-10" />
            <span className="font-bold text-green-700">Admin</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-green-100 text-green-700 font-medium"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
                data-testid={`admin-nav-${item.name.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-200">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Store
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-1"
            data-testid="admin-logout"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-stone-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {title}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500">Welcome,</span>
              <span className="font-medium text-stone-900">{user?.name}</span>
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
