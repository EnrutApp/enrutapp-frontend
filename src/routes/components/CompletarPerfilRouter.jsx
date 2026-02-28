import { useAuth } from '../../shared/context/AuthContext';

const CompletarPerfilRouter = () => {
  const { user } = useAuth();
  const role = user?.rol?.nombreRol;

  if (role === 'Conductor') {
    return <CompletarPerfilConductorPage />;
  }

  return <CompletarPerfilClientePage />;
};

export default CompletarPerfilRouter;
