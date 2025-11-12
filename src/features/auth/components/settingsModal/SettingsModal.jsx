import Modal from '../../../../shared/components/modal/Modal';
import { useTheme } from '../../../../shared/context/ThemeContext';
import '@material/web/icon/icon.js';
import '@material/web/switch/switch.js';
import { useState, useEffect } from 'react';

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, setTheme, isDark } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  const themeOptions = [
    {
      value: 'light',
      label: 'Claro',
      icon: 'light_mode',
      description: 'Tema claro siempre activo',
    },
    {
      value: 'dark',
      label: 'Oscuro',
      icon: 'dark_mode',
      description: 'Tema oscuro siempre activo',
    },
    {
      value: 'auto',
      label: 'Automático',
      icon: 'brightness_auto',
      description: 'Se ajusta según el sistema',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <main className="relative">
        <div className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-1 mb-4">
            <button
              onClick={onClose}
              className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
            >
              <md-icon className="text-xl flex items-center justify-center">
                close
              </md-icon>
            </button>
          </div>

          <div className="px-4">
            <div className="leading-tight mb-6">
              <h2 className="h2 font-medium text-primary">Configuración</h2>
              <p className="h5 text-secondary font-medium">
                Personaliza tu experiencia
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="subtitle1 font-semibold text-primary mb-4 flex items-center gap-2">
                  Apariencia
                </h3>

                <div className="space-y-3">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={`content-box-outline-8-small w-full flex items-center justify-between p-4 transition-all duration-200 cursor-pointer ${selectedTheme === option.value
                        ? 'border-border bg-blue bg-opacity-10 shadow-sm'
                        : 'border-border bg-fill hover:border-blue hover:bg-blue hover:bg-opacity-5'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg bg-background flex  ${selectedTheme === option.value
                          ? 'bg-blue bg-opacity-20'
                          : 'bg-background'
                          }`}>
                          <md-icon className={`text-xl ${selectedTheme === option.value
                            ? 'text-blue'
                            : 'text-secondary'
                            }`}>
                            {option.icon}
                          </md-icon>
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <span className={`font-semibold text-base ${selectedTheme === option.value
                            ? 'text-blue'
                            : 'text-primary'
                            }`}>
                            {option.label}
                          </span>
                          <span className="text-sm text-secondary">
                            {option.description}
                          </span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-1 ${selectedTheme === option.value
                        ? 'border-border bg-blue'
                        : 'border-border'
                        }`}>
                        {selectedTheme === option.value && (
                          <md-icon className="text-secondary text-sm">check</md-icon>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedTheme === 'auto' && (
                  <div className="mt-4 content-box-outline-8-small rounded-lg flex gap-2">
                    <div>
                      <md-icon className={`text-xl ${isDark
                        ? 'text-yellow-2'
                        : 'text-yellow'
                        }`}>
                        info
                      </md-icon>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">
                        El tema automático cambiará entre claro y oscuro según la configuración de tu sistema operativo.
                      </p>
                    </div>
                  </div>
                )}

                {selectedTheme === 'light' && (
                  <div className="mt-4 content-box-outline-8-small rounded-lg flex gap-2">
                    <div>
                      <md-icon className="text-yellow text-xl">info</md-icon>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">
                        El tema claro mantendrá siempre los colores claros, sin importar la configuración del sistema.
                      </p>
                    </div>
                  </div>
                )}

                {selectedTheme === 'dark' && (
                  <div className="mt-4 content-box-outline-8-small rounded-lg flex gap-2">
                    <div>
                      <md-icon className="text-yellow-2 text-xl">info</md-icon>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">
                        El tema oscuro mantendrá siempre los colores oscuros, sin importar la configuración del sistema.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="btn btn-primary px-6"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </main>
    </Modal>
  );
};

export default SettingsModal;
