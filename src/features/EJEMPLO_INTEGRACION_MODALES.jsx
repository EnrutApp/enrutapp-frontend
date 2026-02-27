/**
 * ============================================
 * EJEMPLO DE INTEGRACIÓN EN PÁGINA
 * ============================================
 * Muestra cómo integrar los formularios modales
 * en los componentes de páginas principales
 */

import React, { useState } from 'react';
import AddUserModalWithValidation from '../../usuarios/api/AddUserModalWithValidationReady';
import AddContratoModalWithValidation from '../../contratos/api/AddContratoModalWithValidation';
import AddVehiculoModalWithValidation from '../../vehiculos/api/AddVehiculoModalWithValidation';

/**
 * EJEMPLO: Componente de Página con Múltiples Formularios
 */
const ExamplePageWithModals = () => {
  // ==========================================
  // ESTADOS DE MODALES
  // ==========================================
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isContratoModalOpen, setIsContratoModalOpen] = useState(false);
  const [isVehiculoModalOpen, setIsVehiculoModalOpen] = useState(false);

  // Estados de datos (opcional, para demo)
  const [usuarios, setUsuarios] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);

  // ==========================================
  // MANEJADORES DE CONFIRMACIÓN
  // ==========================================

  const handleUserCreated = newUser => {
    console.log('✅ Usuario creado:', newUser);
    setUsuarios([...usuarios, newUser]);
    // Aquí puedes hacer más cosas: notificación, refresco de lista, etc.
  };

  const handleContratoCreated = newContrato => {
    console.log('✅ Contrato creado:', newContrato);
    setContratos([...contratos, newContrato]);
  };

  const handleVehiculoCreated = newVehiculo => {
    console.log('✅ Vehículo creado:', newVehiculo);
    setVehiculos([...vehiculos, newVehiculo]);
  };

  // ==========================================
  // RENDERIZACIÓN
  // ==========================================
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Gestión Integrada
        </h1>

        {/* Grid de secciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta Usuarios */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              👥 Usuarios
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Total: {usuarios.length}
            </p>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-medium"
            >
              + Crear Usuario
            </button>
          </div>

          {/* Tarjeta Contratos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              📄 Contratos
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Total: {contratos.length}
            </p>
            <button
              onClick={() => setIsContratoModalOpen(true)}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition font-medium"
            >
              + Crear Contrato
            </button>
          </div>

          {/* Tarjeta Vehículos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🚌 Vehículos
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Total: {vehiculos.length}
            </p>
            <button
              onClick={() => setIsVehiculoModalOpen(true)}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-medium"
            >
              + Crear Vehículo
            </button>
          </div>
        </div>

        {/* Sección de listados (ejemplo) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Usuarios */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Usuarios Recientes
            </h3>
            <div className="space-y-2">
              {usuarios.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay usuarios todavía</p>
              ) : (
                usuarios.map((user, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-blue-50 rounded border border-blue-200 text-sm"
                  >
                    <p className="font-medium text-gray-900">{user.nombre}</p>
                    <p className="text-gray-600">{user.correo}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lista de Contratos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contratos Recientes
            </h3>
            <div className="space-y-2">
              {contratos.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No hay contratos todavía
                </p>
              ) : (
                contratos.map((contrato, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-purple-50 rounded border border-purple-200 text-sm"
                  >
                    <p className="font-medium text-gray-900">
                      {contrato.linea}
                    </p>
                    <p className="text-gray-600">
                      {new Date(contrato.fechaOrigen).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lista de Vehículos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vehículos Recientes
            </h3>
            <div className="space-y-2">
              {vehiculos.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No hay vehículos todavía
                </p>
              ) : (
                vehiculos.map((vehiculo, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-green-50 rounded border border-green-200 text-sm"
                  >
                    <p className="font-medium text-gray-900">
                      {vehiculo.nombreVehiculo}
                    </p>
                    <p className="text-gray-600">
                      {vehiculo.placa} · {vehiculo.marcaVehiculo}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          MODALES
          ========================================== */}

      {/* Modal Usuario */}
      <AddUserModalWithValidation
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onConfirm={handleUserCreated}
      />

      {/* Modal Contrato */}
      <AddContratoModalWithValidation
        isOpen={isContratoModalOpen}
        onClose={() => setIsContratoModalOpen(false)}
        onConfirm={handleContratoCreated}
      />

      {/* Modal Vehículo */}
      <AddVehiculoModalWithValidation
        isOpen={isVehiculoModalOpen}
        onClose={() => setIsVehiculoModalOpen(false)}
        onConfirm={handleVehiculoCreated}
      />
    </div>
  );
};

export default ExamplePageWithModals;

/**
 * ============================================
 * NOTA: COPIAR Y ADAPTAR
 * ============================================
 *
 * Para usar en tus páginas actuales:
 *
 * 1. Reemplaza `ExamplePageWithModals` con tu componente actual
 * 2. Importa los modales necesarios
 * 3. Agrega los estados con useState()
 * 4. Agrega los botones de "Crear"
 * 5. Incluye los modales al final del JSX
 * 6. Implementa los handlers (handleXxxCreated)
 *
 * Ejemplo en UsuariosPage.jsx:
 *
 * ```jsx
 * import AddUserModalWithValidation from './api/AddUserModalWithValidationReady';
 *
 * function UsuariosPage() {
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>+ Usuario</button>
 *       <AddUserModalWithValidation
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         onConfirm={(data) => {
 *           console.log('Usuario creado:', data);
 *           // Refrescar lista
 *         }}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
