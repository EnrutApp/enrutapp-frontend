import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/progress/linear-progress.js';

const ContratosPage = () => {
  const loading = false;
  const searchTerm = '';
  const statusFilter = 'Todos';

  return (
    <section>
      <div className="list-enter">
        <div className="flex justify-between items-center">
          <h1 className="h4 font-medium">Contratos</h1>
          <div className="flex gap-2">
            <div className="relative">
              <md-filled-button className="btn-search-minimal px-10 py-2">
                <md-icon slot="icon" className="text-sm text-secondary">
                  search
                </md-icon>
                Buscar
              </md-filled-button>
            </div>
            <div>
              <md-filled-button className="btn-add px-5" onClick={() => {}}>
                <md-icon slot="icon" className="text-sm text-on-primary">
                  assignment_add
                </md-icon>
                Agregar un contrato
              </md-filled-button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div
              className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
              style={{ height: 'calc(60vh - 0px)' }}
            >
              <div
                className="flex flex-col items-center gap-3"
                style={{ width: '200px' }}
              >
                <md-icon className="text-secondary mb-4">description</md-icon>
                <span className="text-secondary">Cargando contratos...</span>
                <md-linear-progress indeterminate></md-linear-progress>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
              style={{ height: 'calc(60vh - 0px)' }}
            >
              <div
                className="flex flex-col items-center justify-center"
                style={{ width: '340px' }}
              >
                <md-icon className="text-secondary mb-4">route</md-icon>
                <p className="text-secondary">
                  {searchTerm || statusFilter !== 'Todos'
                    ? 'No se encontraron rutas que coincidan con los filtros'
                    : 'No hay rutas registradas'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContratosPage;
