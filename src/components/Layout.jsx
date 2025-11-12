import { Outlet } from 'react-router-dom';
import SideBar from '../shared/components/sideBar/SideBar';
import { useAuth } from '../shared/context/AuthContext';
import '@material/web/progress/linear-progress.js';

const Layout = () => {
  const { isLoading, isAuthenticated } = useAuth();

  // No renderizar el layout hasta que se verifique la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-secondary font-medium animate-pulse">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SideBar />
      <main className="flex-1 ml-[210px] p-4 overflow-y-auto scrollbar-hide">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
