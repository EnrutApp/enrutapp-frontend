import { useAuth } from '../../shared/context/AuthContext';
import CompletarPerfilConductorPage from '../../features/conductores/pages/CompletarPerfilPage';
import CompletarPerfilClientePage from '../../features/clientes/pages/CompletarPerfilClientePage';

const CompletarPerfilRouter = () => {
    const { user } = useAuth();
    const role = user?.rol?.nombreRol;

    if (role === 'Conductor') {
        return <CompletarPerfilConductorPage />;
    }

    return <CompletarPerfilClientePage />;
};

export default CompletarPerfilRouter;
