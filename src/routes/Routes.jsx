import { createBrowserRouter } from "react-router-dom"
import Layout from '../components/Layout'
import Home from "../features/home/Home"
import NotFound from "../features/notFound/NotFound"
import Clientes from "../features/clientes/Clientes"
import Usuarios from "../features/usuarios/Usuarios"
import Conductores from "../features/conductores/Conductores"
import Vehiculos from "../features/vehiculos/Vehiculos"
import RutasAdmin from "../features/rutas/pages/RutasAdmin"
import RutasConductor from "../features/rutas/pages/RutasConductor"
import RutasUsuario from "../features/rutas/pages/RutasUsuario"
import Turnos from "../features/turnos/Turnos"
import Reservas from "../features/reservas/Reservas"
import Encomiendas from "../features/encomiendas/Encomiendas"
import Roles from "../features/rol/Roles"
import Ubicacion from "../features/ubicaciones/Ubicacion"
import Finanzas from "../features/finanzas/Finanzas"
import Login from "../features/login/Login"
import RestablecerContraseña from "../features/restablecerContraseña/RestablecerContraseña"
import ProtectedRoute from "./ProtectedRoute"
import HomeAdmin from "../features/home/pages/HomeAdmin"
import HomeConductor from "../features/home/pages/HomeConductor"
import HomeUsuario from "../features/home/pages/HomeUsuario"
import RoleRedirect from "./RoleRedirect"

const Routes = createBrowserRouter([
    {
        path: "login",
        element: <Login />
    },
    {
        path: "reset-password",
        element: <RestablecerContraseña />
    },
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <RoleRedirect />
            },
            // ADMIN
            {
                path: "admin/",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <HomeAdmin />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/rutas",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <RutasAdmin />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/clientes",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Clientes />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/usuarios",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Usuarios />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/conductores",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Conductores />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/vehiculos",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Vehiculos />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/turnos",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Turnos />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/reservas",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Reservas />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/encomiendas",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Encomiendas />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/finanzas",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Finanzas />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/ubicaciones",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Ubicacion />
                    </ProtectedRoute>
                )
            },
            {
                path: "admin/rol",
                element: (
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                        <Roles />
                    </ProtectedRoute>
                )
            },

            // CONDUCTOR
            {
                path: "conductor/",
                element: (
                    <ProtectedRoute allowedRoles={["Conductor"]}>
                        <HomeConductor />
                    </ProtectedRoute>
                )
            },
            {
                path: "conductor/mis-viajes",
                element: (
                    <ProtectedRoute allowedRoles={["Conductor"]}>
                        <div>Mis viajes (Conductor)</div>
                    </ProtectedRoute>
                )
            },
            {
                path: "conductor/calendario",
                element: (
                    <ProtectedRoute allowedRoles={["Conductor"]}>
                        <div>Calendario (Conductor)</div>
                    </ProtectedRoute>
                )
            },
            {
                path: "conductor/turnos",
                element: (
                    <ProtectedRoute allowedRoles={["Conductor"]}>
                        <div>Calendario (Conductor)</div>
                    </ProtectedRoute>
                )
            },
            {
                path: "conductor/reservas",
                element: (
                    <ProtectedRoute allowedRoles={["Conductor"]}>
                        <div>Reservas (Conductor)</div>
                    </ProtectedRoute>
                )
            },
            {
                path: "conductor/historial",
                element: (
                    <ProtectedRoute allowedRoles={["Conductor"]}>
                        <div>Historial (Conductor)</div>
                    </ProtectedRoute>
                )
            },
            {
                path: "conductor/rutas",
                element: (
                    <ProtectedRoute allowedRoles={["Conductor"]}>
                        <RutasConductor />
                    </ProtectedRoute>
                )
            },

            // CLIENTE
            {
                path: "usuario/",
                element: (
                    <ProtectedRoute allowedRoles={["Cliente"]}>
                        <HomeUsuario />
                    </ProtectedRoute>
                )
            },
            {
                path: "usuario/mis-viajes",
                element: (
                    <ProtectedRoute allowedRoles={["Cliente"]}>
                        <div>Mis viajes (Cliente)</div>
                    </ProtectedRoute>
                )
            },
            {
                path: "usuario/reservas",
                element: (
                    <ProtectedRoute allowedRoles={["Cliente"]}>
                        <div>Reservas (Cliente)</div>
                    </ProtectedRoute>
                )
            },
            {
                path: "usuario/encomiendas",
                element: (
                    <ProtectedRoute allowedRoles={["Cliente"]}>
                        <div>Encomiendas (Cliente)</div>
                    </ProtectedRoute>
                )
            },
            {
                path: "usuario/historial",
                element: (
                    <ProtectedRoute allowedRoles={["Cliente"]}>
                        <div>Historial (Cliente)</div>
                    </ProtectedRoute>
                )
            },
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
])

export default Routes