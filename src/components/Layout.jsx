import { Outlet } from 'react-router-dom';
import SideBar from '../shared/components/sideBar/SideBar';
import { useAuth } from '../shared/context/AuthContext';
import '@material/web/progress/linear-progress.js';

const Layout = () => {
  const { isLoading } = useAuth();
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {isLoading && (
        <md-linear-progress
          indeterminate
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1000,
          }}
        ></md-linear-progress>
      )}
      <SideBar />
      <main className="flex-1 ml-[210px] p-4 overflow-y-auto scrollbar-hide">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
