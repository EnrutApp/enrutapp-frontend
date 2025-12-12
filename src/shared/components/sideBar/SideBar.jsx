import Avvvatars from 'avvvatars-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LogoutModal from '../../../features/auth/components/logoutModal/LogoutModal';
import SettingsModal from '../../../features/auth/components/settingsModal/SettingsModal';
import ProfileModal from '../../../features/auth/components/profileModal/ProfileModal';
import '@material/web/icon/icon.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import '@material/web/iconbutton/icon-button.js';
import './styles/style.css';
import { resolveAssetUrl } from '../../utils/url';

const SideBar = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [collapsedSections, setCollapsedSections] = useState(() => {
    const saved = localStorage.getItem('sidebarSections');
    return saved
      ? JSON.parse(saved)
      : {
        0: false,
        1: true,
        2: true,
        3: true,
        4: true,
      };
  });

  const isActive = path => {
    if (path.endsWith('/')) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleMenuToggle = event => {
    const button = event.currentTarget;
    const menu = button.parentElement.querySelector('md-menu');
    if (menu) {
      menu.open = !menu.open;
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    document.querySelector('md-menu.config-menu')?.close();
  };

  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
    document.querySelector('md-menu.config-menu')?.close();
  };

  const handleProfileExit = () => {
    setIsProfileModalOpen(false);
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
    document.querySelector('md-menu.config-menu')?.close();
  };

  const handleSettingsExit = () => {
    setIsSettingsModalOpen(false);
  };

  const toggleSection = sectionIndex => {
    const newState = {};

    Object.keys(collapsedSections).forEach(key => {
      newState[key] = true;
    });

    newState[sectionIndex] = collapsedSections[sectionIndex] ? false : true;

    setCollapsedSections(newState);
    localStorage.setItem('sidebarSections', JSON.stringify(newState));
  };

  const getProfilePhotoUrl = foto => {
    if (!foto) return null;
    return resolveAssetUrl(foto);
  };

  const buildDynamicMenu = user => {
    if (!user?.rol?.rolesPermisos) return [];

    const permissions = user.rol.rolesPermisos.map(rp => rp.permiso.codigo);
    const sections = [];

    if (permissions.includes('VER_DASHBOARD')) {
      sections.push({
        title: 'Dashboard',
        path: '/dashboard',
        items: [],
      });
    }

    const configItems = [];
    if (permissions.includes('VER_ROLES'))
      configItems.push({
        path: '/admin/rol',
        label: 'Roles',
        icon: 'admin_panel_settings',
      });
    if (permissions.includes('VER_USUARIOS'))
      configItems.push({
        path: '/admin/usuarios',
        label: 'Usuarios',
        icon: 'person',
      });

    if (configItems.length > 0) {
      sections.push({
        title: 'Configuración',
        items: configItems,
      });
    }

    const transporteItems = [];
    if (permissions.includes('VER_VEHICULOS'))
      transporteItems.push({
        path: '/admin/vehiculos',
        label: 'Vehículos',
        icon: 'drive_eta',
      });
    if (permissions.includes('VER_RUTAS'))
      transporteItems.push({
        path: '/admin/rutas',
        label: 'Rutas',
        icon: 'route',
      });
    if (permissions.includes('VER_UBICACIONES'))
      transporteItems.push({
        path: '/admin/ubicaciones',
        label: 'Ubicaciones',
        icon: 'location_on',
      });
    if (permissions.includes('VER_CONDUCTORES'))
      transporteItems.push({
        path: '/admin/conductores',
        label: 'Conductores',
        icon: 'search_hands_free',
      });

    if (
      permissions.includes('VER_TRACKING') ||
      permissions.includes('VER_VEHICULOS')
    )
      transporteItems.push({
        path: '/admin/tracking',
        label: 'Tracking GPS',
        icon: 'my_location',
      });
    if (permissions.includes('VER_ENCOMIENDAS'))
      transporteItems.push({
        path: '/admin/encomiendas',
        label: 'Encomiendas',
        icon: 'inventory_2',
      });
    if (permissions.includes('VER_TURNOS'))
      transporteItems.push({
        path: '/admin/turnos',
        label: 'Turnos',
        icon: 'schedule',
      });
    if (permissions.includes('VER_CONTRATOS'))
      transporteItems.push({
        path: '/admin/contratos',
        label: 'Contratos',
        icon: 'file_present',
      });

    if (transporteItems.length > 0) {
      sections.push({
        title: 'Transporte',
        items: transporteItems,
      });
    }

    const ventasItems = [];
    if (permissions.includes('VER_CLIENTES'))
      ventasItems.push({
        path: '/admin/clientes',
        label: 'Clientes',
        icon: 'people',
      });
    if (permissions.includes('VER_RESERVAS'))
      ventasItems.push({
        path: '/admin/reservas',
        label: 'Reservas',
        icon: 'event_seat',
      });

    if (ventasItems.length > 0) {
      sections.push({
        title: 'Ventas',
        items: ventasItems,
      });
    }

    const reportesItems = [];
    if (permissions.includes('VER_FINANZAS'))
      reportesItems.push({
        path: '/admin/finanzas',
        label: 'Finanzas',
        icon: 'payments',
      });

    if (reportesItems.length > 0) {
      sections.push({
        title: 'Reportes',
        items: reportesItems,
      });
    }

    return sections;
  };

  const roleMenus = {
    Administrador: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        items: [],
      },
      {
        title: 'Configuración',
        items: [
          { path: '/admin/rol', label: 'Roles', icon: 'admin_panel_settings' },
          { path: '/admin/usuarios', label: 'Usuarios', icon: 'person' },
        ],
      },
      {
        title: 'Transporte',
        items: [
          { path: '/admin/vehiculos', label: 'Vehículos', icon: 'drive_eta' },
          { path: '/admin/rutas', label: 'Rutas', icon: 'route' },
          {
            path: '/admin/ubicaciones',
            label: 'Ubicaciones',
            icon: 'location_on',
          },
          {
            path: '/admin/conductores',
            label: 'Conductores',
            icon: 'search_hands_free',
          },
          {
            path: '/admin/tracking',
            label: 'Tracking GPS',
            icon: 'my_location',
          },
          {
            path: '/admin/calendario',
            label: 'Calendario',
            icon: 'calendar_month',
          },
          {
            path: '/admin/encomiendas',
            label: 'Encomiendas',
            icon: 'inventory_2',
          },
          { path: '/admin/turnos', label: 'Turnos', icon: 'schedule' },
          {
            path: '/admin/contratos',
            label: 'Contratos',
            icon: 'file_present',
          },
        ],
      },
      {
        title: 'Ventas',
        items: [
          { path: '/admin/clientes', label: 'Clientes', icon: 'people' },
          { path: '/admin/reservas', label: 'Reservas', icon: 'event_seat' },
        ],
      },
      {
        title: 'Reportes',
        items: [
          {
            path: '/admin/finanzas',
            label: 'Finanzas',
            icon: 'payments',
          },
        ],
      },
    ],

    Conductor: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        items: [],
      },
      {
        title: 'Gestión',
        items: [
          {
            path: '/conductor/mis-viajes',
            label: 'Mis viajes',
            icon: 'commute',
          },
          {
            path: '/conductor/calendario',
            label: 'Calendario',
            icon: 'calendar_month',
          },
          { path: '/conductor/turnos', label: 'Turnos', icon: 'schedule' },
          {
            path: '/conductor/reservas',
            label: 'Reservas',
            icon: 'event_seat',
          },
          { path: '/conductor/historial', label: 'Historial', icon: 'history' },
        ],
      },
    ],

    Cliente: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        items: [],
      },
      {
        title: 'Mis viajes',
        items: [
          { path: '/usuario/mis-viajes', label: 'Mis viajes', icon: 'commute' },
          { path: '/usuario/reservas', label: 'Reservas', icon: 'event_seat' },
          {
            path: '/usuario/encomiendas',
            label: 'Encomiendas',
            icon: 'inventory_2',
          },
          { path: '/usuario/historial', label: 'Historial', icon: 'history' },
        ],
      },
    ],
  };

  const menuSections =
    roleMenus[user?.rol?.nombreRol] || buildDynamicMenu(user);

  return (
    <nav className="h-full flex flex-col sidebar">
      <div className="flex gap-3 items-center p-4 border-b border-border mb-6">
        <div className="bg-blue bg-opacity-10 p-2 rounded-xl">
          <a href="/dashboard">
            {isDark ? (
              <img src="/logoPositivo.png" alt="logo" width={32} />
            ) : (
              <img src="/logoNegativo.png" alt="logo" width={32} />
            )}
          </a>
        </div>
        <div className="flex flex-col leading-tight">
          <h1 className="h5 font-bold mb-0.5">Enrutapp</h1>
          <span className="caption text-secondary opacity-70">
            {user?.rol?.nombreRol || 'Sin rol'}
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-4 overflow-y-auto scrollbar-hide">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <div className="mb-2">
                {section.items.length === 0 && section.path ? (
                  <Link
                    to={section.path}
                    className="flex items-center justify-between w-full hover:bg-blue hover:bg-opacity-5 rounded-lg px-3 py-2 transition-all duration-200 group cursor-pointer"
                  >
                    <span className="caption uppercase tracking-wider text-secondary opacity-60 font-semibold group-hover:opacity-100 group-hover:text-blue transition-all duration-200">
                      {section.title}
                    </span>
                    <md-icon className="text-secondary opacity-50 text-base transition-all duration-200 group-hover:text-blue group-hover:opacity-100">
                      chevron_right
                    </md-icon>
                  </Link>
                ) : (
                  <button
                    onClick={() => toggleSection(sectionIndex)}
                    className="flex items-center justify-between w-full hover:bg-blue hover:bg-opacity-5 rounded-lg px-3 py-2 transition-all duration-200 group cursor-pointer"
                  >
                    <span className="caption uppercase tracking-wider text-secondary opacity-60 font-semibold group-hover:opacity-100 group-hover:text-blue transition-all duration-200">
                      {section.title}
                    </span>
                    <md-icon
                      className="text-secondary opacity-50 text-base transition-all duration-200 group-hover:text-blue group-hover:opacity-100"
                      style={{
                        transform: collapsedSections[sectionIndex]
                          ? 'rotate(-90deg)'
                          : 'rotate(0deg)',
                      }}
                    >
                      expand_more
                    </md-icon>
                  </button>
                )}
              </div>
            )}
            <ul
              className={`space-y-1 transition-all duration-500 ease-in-out overflow-hidden ${section.title && collapsedSections[sectionIndex]
                  ? 'max-h-0 blur-md opacity-0'
                  : 'max-h-[1000px] blur-0 opacity-100'
                }`}
            >
              {section.items.map(({ path, label, icon }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`
                      sidebar-link group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ml-2
                      ${isActive(path)
                        ? 'bg-blue bg-opacity-10 text-blue  scale-105'
                        : 'text-secondary hover:bg-blue hover:bg-opacity-5 hover:scale-[1.02] hover:text-primary'
                      }
                    `}
                    style={{ transformOrigin: 'left' }}
                  >
                    <md-icon
                      className={`sidebar-icon text-lg transition-all duration-200 ${isActive(path) ? 'text-blue scale-110' : 'text-secondary group-hover:text-blue'}`}
                    >
                      {icon}
                    </md-icon>
                    <span
                      className={`sidebar-text transition-all duration-200 ${isActive(path) ? 'font-semibold' : 'font-medium'}`}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 pb-2">
        <div className="flex items-center px-2">
          <div className="relative w-full">
            <button
              className="flex gap-3 items-center cursor-pointer p-3 w-full focus:outline-none hover:bg-blue hover:bg-opacity-5 rounded-xl transition-all duration-200 group"
              onClick={handleMenuToggle}
              id="config-button"
              aria-label="Abrir menú de usuario"
              tabIndex={0}
              role="button"
            >
              <div className="relative">
                {user?.foto ? (
                  <img
                    src={getProfilePhotoUrl(user.foto)}
                    alt="Foto de perfil"
                    className="rounded-full w-10 h-10 object-cover shadow-md border-2 border-border group-hover:border-blue transition-all duration-200"
                  />
                ) : (
                  <Avvvatars value={user?.nombre || 'Usuario'} size={40} />
                )}
              </div>
              <div className="flex flex-col text-left flex-1 min-w-0">
                <span className="font-semibold text-sm leading-tight text-primary truncate group-hover:text-blue transition-colors duration-200">
                  {user?.nombre || 'Usuario'}
                </span>
                <span className="caption text-secondary opacity-70 truncate">
                  {user?.correo || 'Sin correo'}
                </span>
              </div>
              <md-icon className="text-secondary text-lg opacity-50 group-hover:opacity-100 group-hover:text-blue transition-all duration-200">
                more_vert
              </md-icon>
            </button>
            <md-menu anchor="config-button" className="config-menu">
              <div className="flex flex-col items-center py-6 px-6 gap-3 border-b border-border">
                <div className="relative">
                  {user?.foto ? (
                    <img
                      src={getProfilePhotoUrl(user.foto)}
                      alt="Foto de perfil"
                      className="rounded-full w-20 h-20 object-cover shadow-lg border-4 border-border"
                    />
                  ) : (
                    <Avvvatars value={user?.nombre || 'Usuario'} size={80} />
                  )}
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <span className="subtitle1 font-bold text-primary">
                    {user?.nombre || 'Usuario'}
                  </span>
                  <span className="caption text-secondary opacity-70 bg-fill bg-opacity-50 px-3 py-1 rounded-full">
                    {user?.rol?.nombreRol || 'Sin rol'}
                  </span>
                </div>
                <button
                  className="btn-secondary btn-lg cursor-pointer border border-border rounded-full w-full"
                  onClick={handleProfileClick}
                >
                  Editar perfil
                </button>
              </div>
              <div className="py-1">
                <md-menu-item
                  onClick={handleSettingsClick}
                  className="hover:bg-blue hover:bg-opacity-5"
                >
                  <md-icon slot="start" className="text-xl text-secondary">
                    settings
                  </md-icon>
                  <div
                    slot="headline"
                    className="text-sm font-medium text-primary"
                  >
                    Configuración
                  </div>
                </md-menu-item>
                <md-menu-item
                  onClick={handleLogoutClick}
                  className="hover:bg-red hover:bg-opacity-5"
                >
                  <md-icon slot="start" className="text-xl text-red">
                    logout
                  </md-icon>
                  <div slot="headline" className="text-sm font-medium text-red">
                    Salir
                  </div>
                </md-menu-item>
              </div>
            </md-menu>
          </div>
        </div>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />

      <ProfileModal isOpen={isProfileModalOpen} onClose={handleProfileExit} />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleSettingsExit}
      />
    </nav>
  );
};

export default SideBar;
