import Avvvatars from 'avvvatars-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext';
import '@material/web/icon/icon.js'
import '@material/web/menu/menu.js'
import '@material/web/menu/menu-item.js'
import '@material/web/iconbutton/icon-button.js'
import './styles/style.css'

const SideBar = () => {
  const { user } = useAuth();
  const location = useLocation()
  const [isConfigDropdownOpen, setIsConfigDropdownOpen] = useState(false)

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
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleMenuToggle = (event) => {
    const button = event.currentTarget;
    const menu = button.parentElement.querySelector('md-menu');
    menu.open = !menu.open;
  }

  const handleConfigClick = () => {
    setIsConfigDropdownOpen(!isConfigDropdownOpen)
    const menu = document.querySelector('md-menu');
    if (menu) menu.open = false;
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
          { path: 'admin/rol', label: 'Roles', icon: 'admin_panel_settings' },
          { path: 'admin/usuarios', label: 'Usuarios', icon: 'person' }
        ]
      },
      {
        title: 'Transporte',
        items: [
          { path: 'admin/vehiculos', label: 'Vehículos', icon: 'drive_eta' },
          { path: 'admin/rutas', label: 'Rutas', icon: 'route' },
          { path: 'admin/ubicaciones', label: 'Ubicaciones', icon: 'location_on' },
          { path: 'admin/conductores', label: 'Conductores', icon: 'search_hands_free' },
          { path: 'admin/encomiendas', label: 'Encomiendas', icon: 'inventory_2' },
          { path: 'admin/turnos', label: 'Turnos', icon: 'schedule' }
        ]
      },
      {
        title: 'Ventas',
        items: [
          { path: '/clientes', label: 'Clientes', icon: 'people' },
          { path: '/reservas', label: 'Reservas', icon: 'event_seat' }
        ]
      },
      {
        title: 'Reportes',
        items: [
          { path: '/finanzas', label: 'Finanzas', icon: 'account_balance' }
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
          { path: '/conductor/historial', label: 'Turnos', icon: 'history' }
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
  const menuSections = roleMenus[user?.role] || [];

  return (
    <nav className="h-full flex flex-col sidebar">
      <div className='flex items-center p-4 border-b border-border mb-4'>
        <div className="relative">
          <div className="transform transition-transform duration-300 hover:scale-110 z-10" onClick={handleMenuToggle}>
            <md-icon-button id="config-button">
              <Avvvatars value='hader' style='character' size={38} />
            </md-icon-button>
          </div>
          <md-menu anchor="config-button" className="config-menu">
            <md-menu-item onClick={handleConfigClick}>
              <div slot="headline" className='text-base'>Configuración</div>
              <md-icon slot="start" className="text-base">settings</md-icon>
            </md-menu-item>
            <md-menu-item>
              <div slot="headline" className='text-base'>Perfil</div>
              <md-icon slot="start" className="text-base">person</md-icon>
            </md-menu-item>
          </md-menu>
        </div>
        <div className='ml-3 flex-1'>
          <h1 className='text-lg font-semibold text-white'>{user?.name || 'Usuario'}</h1>
          <p className='caption text-secondary'>{user?.role || ''}</p>
        </div>
      </div>

      <div className='flex-1 px-3 space-y-6 overflow-y-auto scrollbar-hide'>
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <div className='px-1'>
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className='flex items-center justify-between w-full hover:bg-fill hover:bg-opacity-10 rounded-lg px-1 transition-colors duration-200 group'
                >
                  <span className='caption uppercase tracking-wider text-secodary opacity-70 font-medium'>
                    {section.title}
                  </span>
                  <md-icon className="text-secondary text-lg transition-transform duration-200 group-hover:text-white" style={{
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

      <div className='border-t border-border p-3 mt-4'>
        <button
          className='sidebar-logout group w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red hover:bg-opacity-10 hover:scale-105'
          style={{ transformOrigin: 'left' }}
        >
          <md-icon className="sidebar-icon text-lg mr-3 transition-colors duration-200 text-secondary">logout</md-icon>
          <span className="sidebar-text text-base transition-colors duration-200 text-secondary">Cerrar sesión</span>
        </button>
      </div>
    </nav>
  )
}

export default SideBar