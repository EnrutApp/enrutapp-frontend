# 🚌 EnrutApp Frontend

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="80" alt="React Logo" />
</p>

<p align="center">
  Sistema de gestión de transporte y rutas construido con <strong>React</strong>, <strong>Vite</strong> y <strong>Tailwind CSS</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7.2.2-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.1.17-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React_Router-7.9.5-CA4245?logo=react-router&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Mapbox_GL-3.16.0-000000?logo=mapbox&logoColor=white" alt="Mapbox" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/github/license/EnrutApp/enrutapp-frontend" alt="License" />
</p>

---

## 📋 Descripción

**EnrutApp Frontend** es una aplicación web moderna y responsiva para la gestión integral de servicios de transporte. Proporciona una interfaz intuitiva y profesional para:

- 🔐 **Autenticación de Usuarios** con JWT
- 👥 **Gestión de Usuarios** y roles
- 🚍 **Administración de Vehículos** con carga de imágenes
- 🗺️ **Visualización de Rutas** con Mapbox
- 📦 **Control de Encomiendas** y reservas
- 💰 **Panel Financiero**
- ⏰ **Gestión de Turnos**
- 📍 **Gestión de Ubicaciones**

La aplicación sigue un **diseño modular basado en features** con componentes reutilizables y estado centralizado.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.x
- npm >= 9.x
- Backend de EnrutApp ejecutándose

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/EnrutApp/enrutapp-frontend.git
cd enrutapp-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de tu backend

# Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en **http://localhost:5173**

## 🛠️ Stack Tecnológico

### Core

- **React** v19.2.0 - Biblioteca UI moderna
- **Vite** v7.2.2 - Build tool ultra rápido
- **React Router DOM** v7.9.5 - Enrutamiento

### UI y Estilos

- **Tailwind CSS** v4.1.17 - Framework CSS utility-first
- **Material Web** v2.4.1 - Componentes Material Design
- **Avvvatars React** v0.4.2 - Avatares generados

### Formularios y Validación

- **React Hook Form** v7.66.0 - Gestión de formularios
- **Yup** v1.7.1 - Validación de esquemas
- **@hookform/resolvers** v5.2.2 - Resolvers de validación

### Mapas

- **Mapbox GL** v3.16.0 - Visualización de mapas interactivos

### HTTP y Estado

- **Axios** v1.13.2 - Cliente HTTP
- Context API - Gestión de estado global

### Drag & Drop

- **@dnd-kit/core** v6.3.1 - Sistema de drag and drop
- **@dnd-kit/sortable** v10.0.0 - Listas ordenables
- **@dnd-kit/utilities** v3.2.2 - Utilidades DnD

### Herramientas de Desarrollo

- **ESLint** v9.39.1 - Linter de código
- **Prettier** - Formateador de código

## 🌐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# API Backend
VITE_API_URL=http://localhost:3000/api

# Mapbox (opcional)
VITE_MAPBOX_TOKEN=tu_token_de_mapbox_aqui
```

## 📦 Scripts Disponibles

| Script             | Descripción                             |
| ------------------ | --------------------------------------- |
| `npm run dev`      | Inicia el servidor de desarrollo        |
| `npm run build`    | Compila el proyecto para producción     |
| `npm run preview`  | Vista previa de la build de producción  |
| `npm run lint`     | Ejecuta ESLint                          |
| `npm run lint:fix` | Corrige automáticamente errores de lint |
| `npm run format`   | Formatea el código con Prettier         |
| `npm run clean`    | Limpia node_modules y dist              |

## 📁 Estructura del Proyecto

```
src/
├── main.jsx                     # Punto de entrada
│
├── components/                  # 🧩 Componentes globales
│   └── Layout.jsx              # Layout principal
│
├── features/                    # 📦 Módulos por funcionalidad
│   ├── auth/                   # Autenticación
│   │   ├── LoginPage.jsx
│   │   ├── api/
│   │   └── components/
│   │
│   ├── usuarios/               # Gestión de usuarios
│   │   ├── UsuariosPage.jsx
│   │   ├── api/
│   │   ├── components/
│   │   └── pages/
│   │
│   ├── vehiculos/              # Gestión de vehículos
│   ├── rutas/                  # Gestión de rutas
│   ├── encomiendas/            # Encomiendas
│   ├── reservas/               # Reservas
│   ├── conductores/            # Conductores
│   ├── clientes/               # Clientes
│   ├── ubicaciones/            # Ubicaciones
│   ├── turnos/                 # Turnos
│   ├── finanzas/               # Finanzas
│   ├── roles/                  # Roles
│   └── home/                   # Dashboard
│
├── routes/                      # 🛣️ Configuración de rutas
│   ├── Routes.jsx
│   ├── index.js
│   ├── components/             # Guards y protección
│   ├── constants/              # Constantes de rutas
│   ├── hooks/                  # Hooks de navegación
│   └── utils/                  # Utilidades de rutas
│
└── shared/                      # 🔧 Código compartido
    ├── components/             # Componentes reutilizables
    ├── context/                # Contextos globales
    ├── hooks/                  # Custom hooks
    ├── services/               # Servicios API
    ├── styles/                 # Estilos globales
    └── utils/                  # Funciones utilitarias
```

## 🎨 Características Principales

### ✨ Interfaz Moderna

- Diseño responsivo mobile-first
- Dark mode ready
- Animaciones fluidas
- Componentes Material Design

### 🔒 Seguridad

- Autenticación JWT
- Rutas protegidas
- Gestión de sesiones
- Refresh token automático

### 🗺️ Integración con Mapbox

- Visualización de rutas en tiempo real
- Marcadores interactivos
- Geolocalización
- Optimización de rutas

### 📱 Responsive Design

- Optimizado para móviles
- Tablets y desktop
- Touch-friendly
- Gestos intuitivos

## 🤝 Desarrollo

Esta es una guía rápida. Para más detalles, consulta [CONTRIBUTING.md](CONTRIBUTING.md).

### Flujo de trabajo

```bash
# 1. Crear branch
git checkout -b feature/nombre

# 2. Desarrollar y verificar
npm run lint
npm run format

# 3. Commit y push
git commit -m "feat: descripción"
git push origin feature/nombre

# 4. Crear PR en GitHub
```

### Convenciones de Commits

```
feat: Nueva característica
fix: Corrección de bug
style: Cambios de estilos/UI
refactor: Refactorización
chore: Mantenimiento
docs: Documentación
perf: Mejoras de rendimiento
```

## 🔗 Enlaces Relacionados

- [Backend Repository](https://github.com/EnrutApp/enrutapp-backend)
- [API Documentation](https://github.com/EnrutApp/enrutapp-backend#readme)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Hader Renteria** - [GitHub](https://github.com/haderrenteria13)
- **Andres Conde** - [GitHub](https://github.com/Andrescon0212)
- **Camilo Bravo** - [GitHub](https://github.com/CamiloBravo07)

## 🙏 Agradecimientos

- [React](https://react.dev/) - Biblioteca principal
- [Vite](https://vite.dev/) - Build tool increíble
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Mapbox](https://www.mapbox.com/) - Mapas interactivos
- Todos los contribuidores del proyecto

---

<p align="center">
  Hecho con ❤️ por el equipo de EnrutApp
</p>
