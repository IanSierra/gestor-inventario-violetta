import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  ShirtIcon, 
  BadgeDollarSign, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut
} from "lucide-react";

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onItemClick?: () => void;
}

export function Sidebar({ className, isMobile = false, onItemClick }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  // Lista de navegación
  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="w-5 h-5 mr-3" />,
    },
    {
      title: "Productos",
      href: "/productos",
      icon: <ShirtIcon className="w-5 h-5 mr-3" />,
    },
    {
      title: "Transacciones",
      href: "/transacciones",
      icon: <BadgeDollarSign className="w-5 h-5 mr-3" />,
    },
    {
      title: "Clientes",
      href: "/clientes",
      icon: <Users className="w-5 h-5 mr-3" />,
    },
    {
      title: "Reportes",
      href: "/reportes", 
      icon: <BarChart3 className="w-5 h-5 mr-3" />,
    },
    {
      title: "Configuración",
      href: "/configuracion",
      icon: <Settings className="w-5 h-5 mr-3" />,
    },
  ];

  // Manejar cierre de sesión
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Comprobar si un elemento está activo
  const isActive = (href: string) => {
    if (href === "/") {
      return location === href;
    }
    return location.startsWith(href);
  };

  return (
    <div className={cn("flex flex-col h-full bg-white shadow-lg", className)}>
      {/* Encabezado del sidebar */}
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-2xl font-bold text-primary">Violett à</h1>
      </div>

      {/* Perfil de usuario */}
      <div className="flex items-center px-4 py-3 border-b">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
          {user?.nombre?.slice(0, 1).toUpperCase() || "U"}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{user?.nombre || "Usuario"}</p>
          <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrador' : 'Vendedor'}</p>
        </div>
      </div>

      {/* Menú de navegación */}
      <ScrollArea className="flex-1">
        <nav className="py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a
                    onClick={() => onItemClick && onItemClick()}
                    className={cn(
                      "flex items-center py-3 px-4 rounded-md text-gray-700 hover:bg-gray-50",
                      isActive(item.href) && "bg-primary-light/10 border-l-4 border-primary text-primary font-medium"
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>

      {/* Footer con botón de cerrar sesión */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </div>
  );
}
