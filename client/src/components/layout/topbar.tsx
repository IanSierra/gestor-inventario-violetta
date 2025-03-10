import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BellIcon, MenuIcon, SearchIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  onMobileMenuClick: () => void;
}

export function Topbar({ onMobileMenuClick }: TopbarProps) {
  const { user, logoutMutation } = useAuth();
  const [notificaciones] = useState([
    { id: 1, mensaje: "Producto 'Vestido Noche Elegante' con stock bajo (2)" },
    { id: 2, mensaje: "Producto 'Vestido Cocktail Rosa' con stock bajo (3)" },
    { id: 3, mensaje: "Próxima devolución: Vestido Fiesta Azul (mañana)" }
  ]);

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Botón del menú móvil */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuClick}
        >
          <MenuIcon className="h-6 w-6" />
        </Button>

        <h2 className="text-lg font-medium lg:hidden">Violett à</h2>

        {/* Búsqueda y notificaciones */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 w-48 lg:w-64"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5 text-gray-700" />
                {notificaciones.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificaciones.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notificaciones.length > 0 ? (
                notificaciones.map((notificacion) => (
                  <DropdownMenuItem key={notificacion.id} className="py-3 cursor-pointer">
                    <span className="text-sm">{notificacion.mensaje}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <span className="text-sm text-gray-500">No hay notificaciones nuevas</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center">
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todas
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
