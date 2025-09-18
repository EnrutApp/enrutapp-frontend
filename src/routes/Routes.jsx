import { createBrowserRouter } from "react-router-dom"
import Layout from '../components/Layout'
import Home from "../features/home/Home"
import NotFound from "../features/notFound/NotFound"
import Clientes from "../features/clientes/Clientes"
import Usuarios from "../features/usuarios/Usuarios"
import Conductores from "../features/conductores/Conductores"
import Vehiculos from "../features/vehiculos/Vehiculos"
import Rutas from "../features/rutas/Rutas"
import Turnos from "../features/turnos/Turnos"
import Reservas from "../features/reservas/Reservas"
import Encomiendas from "../features/encomiendas/Encomiendas"
import Roles from "../features/rol/Roles"
import Ubicacion from "../features/ubicaciones/Ubicacion"
import Finanzas from "../features/finanzas/Finanzas"
import Login from "../features/login/Login"
import RestablecerContraseña from "../features/restablecerContraseña/RestablecerContraseña"

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
                element: <Home/>
            },
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "clientes",
                element: <Clientes />
            },
            {
                path: "usuarios",
                element: <Usuarios />
            },
            {
                path: "conductores",
                element: <Conductores />
            },
            {
                path: "vehiculos",
                element: <Vehiculos />
            },
            {
                path: "rutas",
                element: <Rutas />
            },
            {
                path: "turnos",
                element: <Turnos />
            },
            {
                path: "reservas",
                element: <Reservas />
            },
            {
                path: "encomiendas",
                element: <Encomiendas />
            },
            {
                path: "finanzas",
                element: <Finanzas />
            },
            {
                path: "ubicaciones",
                element: <Ubicacion />
            },
            {
                path: "rol",
                element: <Roles />
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
])

export default Routes