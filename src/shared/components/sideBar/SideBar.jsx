import Avvvatars from 'avvvatars-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext';
import LogoutModal from '../modal/logoutModal/LogoutModal'
import SettingsModal from '../modal/settingsModal/SettingsModal';
import ProfileModal from '../modal/profileModal/ProfileModal';
import '@material/web/icon/icon.js'
import '@material/web/menu/menu.js'
import '@material/web/menu/menu-item.js'
import '@material/web/iconbutton/icon-button.js'
import './styles/style.css'

const SideBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const [collapsedSections, setCollapsedSections] = useState(() => {
    const saved = localStorage.getItem('sidebarSections')
    return saved ? JSON.parse(saved) : {
      0: false,
      1: true,
      2: true,
      3: true,
      4: true
    }
  })

  const isActive = (path) => {
    // Para rutas exactas como '/', '/admin/', '/conductor/', '/usuario/'
    if (path.endsWith('/')) {
      return location.pathname === path;
    }
    // Para otras rutas, usar startsWith
    return location.pathname.startsWith(path);
  }

  const handleMenuToggle = (event) => {
    const button = event.currentTarget;
    const menu = button.parentElement.querySelector('md-menu');
    if (menu) {
      menu.open = !menu.open;
    }
  }

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleLogoutConfirm = () => {
    logout()
    setIsLogoutModalOpen(false)
  }

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false)
  }

  const handleProfileClick = () => {
    setIsProfileModalOpen(true)
  }

  const handleProfileExit = () => {
    setIsProfileModalOpen(false)
  }

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true)
  }

  const handleSettingsExit = () => {
    setIsSettingsModalOpen(false)
  }

  const toggleSection = (sectionIndex) => {
    const newState = {
      ...collapsedSections,
      [sectionIndex]: !collapsedSections[sectionIndex]
    }
    setCollapsedSections(newState)
    localStorage.setItem('sidebarSections', JSON.stringify(newState))
  }

  const roleMenus = {
    Administrador: [
      {
        title: 'Dashboard',
        items: [{ path: '/admin/', label: 'Inicio', icon: 'home' }]
      },
      {
        title: 'Configuración',
        items: [
          { path: '/admin/rol', label: 'Roles', icon: 'admin_panel_settings' },
          { path: '/admin/usuarios', label: 'Usuarios', icon: 'person' }
        ]
      },
      {
        title: 'Transporte',
        items: [
          { path: '/admin/vehiculos', label: 'Vehículos', icon: 'drive_eta' },
          { path: '/admin/rutas', label: 'Rutas', icon: 'route' },
          { path: '/admin/ubicaciones', label: 'Ubicaciones', icon: 'location_on' },
          { path: '/admin/conductores', label: 'Conductores', icon: 'search_hands_free' },
          { path: '/admin/encomiendas', label: 'Encomiendas', icon: 'inventory_2' },
          { path: '/admin/turnos', label: 'Turnos', icon: 'schedule' }
        ]
      },
      {
        title: 'Ventas',
        items: [
          { path: '/admin/clientes', label: 'Clientes', icon: 'people' },
          { path: '/admin/reservas', label: 'Reservas', icon: 'event_seat' }
        ]
      },
      {
        title: 'Reportes',
        items: [
          { path: '/admin/finanzas', label: 'Finanzas', icon: 'account_balance' }
        ]
      }
    ],

    Conductor: [
      {
        title: 'Dashboard',
        items: [{ path: '/conductor/', label: 'Inicio', icon: 'home' }]
      },
      {
        title: 'Gestión',
        items: [
          { path: '/conductor/mis-viajes', label: 'Mis viajes', icon: 'commute' },
          { path: '/conductor/calendario', label: 'Calendario', icon: 'calendar_month' },
          { path: '/conductor/turnos', label: 'Turnos', icon: 'schedule' },
          { path: '/conductor/reservas', label: 'Reservas', icon: 'event_seat' },
          { path: '/conductor/historial', label: 'Historial', icon: 'history' }
        ]
      }
    ],

    Cliente: [
      {
        title: 'Dashboard',
        items: [{ path: '/usuario/', label: 'Inicio', icon: 'home' }]
      },
      {
        title: 'Mis viajes',
        items: [
          { path: '/usuario/mis-viajes', label: 'Mis viajes', icon: 'commute' },
          { path: '/usuario/reservas', label: 'Reservas', icon: 'event_seat' },
          { path: '/usuario/encomiendas', label: 'Encomiendas', icon: 'inventory_2' },
          { path: '/usuario/historial', label: 'Historial', icon: 'history' }
        ]
      },
    ]
  };
  const menuSections = roleMenus[user?.rol?.nombreRol] || [];

  return (
    <nav className="h-full flex flex-col sidebar">
      <div className='flex items-center p-4 border-b-2 border-border mb-4 rounded-b-2xl'>
        <div className="relative">
          <div className="transform transition-transform duration-300 hover:scale-110 z-10" onClick={handleMenuToggle}>
            <md-icon-button id="config-button">
              <Avvvatars value={user?.nombre || 'Usuario'} style='character' size={38} />
            </md-icon-button>
          </div>
          <md-menu anchor="config-button" className="config-menu">
            <div className='flex flex-col items-center pt-5 gap-2'>
              <div className='border-6 border-border rounded-full relative'>
                <Avvvatars value={user?.nombre || 'Usuario'} size={60} />
                <div className='absolute -bottom-2 -right-1 px-1 bg-black rounded-full border-background hover:opacity-80 transition-all cursor-pointer'>
                  <md-icon className='text-white text-sm'>photo_camera</md-icon>
                </div>
              </div>
              <div className='flex flex-col text-center'>
                <span className='subtitle1 font-bold'>{user?.nombre || 'Usuario'}</span>
                <span className='caption'>{user?.rol?.nombreRol || 'Sin rol'}</span>
                <button className='p-2 cursor-pointer hover:opacity-65'>
                  <div slot="headline" className='caption border-2 border-border rounded-2xl px-4 py-1' onClick={handleProfileClick}>Editar perfil</div>
                </button>
              </div>
            </div>
            <md-menu-item onClick={handleSettingsClick}>
              <div slot="headline" className='text-base'>Configuración</div>
              <md-icon slot="start" className="text-base">settings</md-icon>
            </md-menu-item>
          </md-menu>
        </div>
        <div className='ml-3 flex-1'>
          <h1 className='text-lg font-semibold text-primary'>{user?.name || 'Usuario'}</h1>
          <p className='caption text-secondary'>{user?.rol?.nombreRol || ''}</p>
        </div>
      </div>

      <div className='flex-1 px-3 space-y-6 overflow-y-auto scrollbar-hide'>
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <div className='px-1'>
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className='flex items-center justify-between w-full hover:bg-fill hover:bg-opacity-10 rounded-lg px-1 transition-colors duration-200 group cursor-pointer'
                >
                  <span className='caption uppercase tracking-wider text-secondary opacity-70 font-medium'>
                    {section.title}
                  </span>
                  <md-icon className="text-secondary text-lg transition-transform duration-200 group-hover:text-primary" style={{
                    transform: collapsedSections[sectionIndex] ? 'rotate(-90deg)' : 'rotate(0deg)'
                  }}>
                    expand_more
                  </md-icon>
                </button>
              </div>
            )}
            <ul className={`space-y-1 transition-all duration-300 overflow-hidden ${section.title && collapsedSections[sectionIndex]
              ? 'max-h-0 opacity-0'
              : 'max-h-[500px] opacity-100'
              }`}>
              {section.items.map(({ path, label, icon }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`
                      sidebar-link group flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200
                      ${isActive(path)
                        ? 'text-blue text-base hover:scale-110 scale-105 active'
                        : 'text-secondary hover:bg-fill hover:scale-105'
                      }
                    `}
                    style={{ transformOrigin: 'left' }}
                  >
                    <md-icon className={`sidebar-icon text-sm mr-3 transition-colors duration-200 ${isActive(path) ? 'text-blue' : 'text-secondary'}`}>
                      {icon}
                    </md-icon>
                    <span className={`sidebar-text transition-colors duration-200 ${isActive(path) ? 'text-blue' : 'text-secondary'}`}>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className='border-t-2 border-border p-3'>
        <button
          onClick={handleLogoutClick}
          className='sidebar-logout cursor-pointer group w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red hover:bg-opacity-10 hover:scale-105'
          style={{ transformOrigin: 'left' }}
        >
          <md-icon className="sidebar-icon text-lg mr-3 transition-colors duration-200 text-secondary">logout</md-icon>
          <span className="sidebar-text text-base transition-colors duration-200 text-secondary">Cerrar sesión</span>
        </button>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleProfileExit}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleSettingsExit}
      />
    </nav>
  )
}

export default SideBar