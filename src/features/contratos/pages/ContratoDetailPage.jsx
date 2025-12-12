import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ROUTES } from '../../../routes';
import contratosService from '../api/contratosService';

const ContratoDetailPage = () => {
    const navigate = useNavigate();
    const { idContrato } = useParams();

    const [loading, setLoading] = useState(true);
    const [contrato, setContrato] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(true);
    const [pdfObjectUrl, setPdfObjectUrl] = useState('');
    const [pdfError, setPdfError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const resp = await contratosService.getById(idContrato);
            setContrato(resp?.data || resp);
        } catch (e) {
            console.error('Error cargando contrato:', e);
            setContrato(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!idContrato) return;

        let active = true;
        let localUrl = '';

        const run = async () => {
            await load();

            setPdfLoading(true);
            setPdfError('');
            try {
                const blob = await contratosService.downloadPdf(idContrato);
                localUrl = URL.createObjectURL(blob);
                if (!active) return;
                setPdfObjectUrl(localUrl);
            } catch (e) {
                console.error('Error cargando PDF:', e);
                if (!active) return;
                setPdfError('No se pudo cargar la vista previa del PDF');
                setPdfObjectUrl('');
            } finally {
                if (active) setPdfLoading(false);
            }
        };

        run();

        return () => {
            active = false;
            if (localUrl) URL.revokeObjectURL(localUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idContrato]);

    const handleDownload = async () => {
        try {
            const blob = await contratosService.downloadPdf(idContrato);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contrato-${idContrato}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Error descargando PDF:', e);
            alert('No se pudo descargar el PDF');
        }
    };

    return (
        <section className="list-enter">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="h4 font-medium">Contrato</h1>
                    <p className="subtitle2 text-secondary mt-1">
                        {idContrato ? `ID: ${idContrato}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    <md-filled-button
                        className="btn-search-minimal px-5"
                        onClick={() => navigate(ROUTES.ADMIN.CONTRATOS)}
                    >
                        Volver
                    </md-filled-button>

                    <md-filled-button className="btn-add px-5" onClick={handleDownload}>
                        <md-icon
                            slot="icon"
                            className="text-base text-on-primary leading-none"
                            style={{ display: 'inline-flex', alignItems: 'center' }}
                        >
                            download
                        </md-icon>
                        <span className="leading-none">Descargar PDF</span>
                    </md-filled-button>
                </div>
            </div>

            {loading ? (
                <div
                    className="flex items-center justify-center w-full content-box-outline-2-small"
                    style={{ height: 'calc(78vh - 0px)' }}
                >
                    <div className="flex flex-col items-center gap-3" style={{ width: 220 }}>
                        <md-icon className="text-secondary mb-2">description</md-icon>
                        <span className="text-secondary">Cargando contrato...</span>
                        <md-linear-progress indeterminate></md-linear-progress>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                    <div className="content-box-outline-2-small p-4 lg:col-span-2">
                        {!contrato ? (
                            <p className="text-secondary">No se encontró el contrato.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                <div className="content-box-outline-3-small">
                                    <span className="subtitle1 text-primary font-light">Titular</span>
                                    <span className="subtitle1 text-secondary mt-1">
                                        {contrato.titularNombre || '-'}
                                    </span>
                                    <span className="subtitle2 text-secondary mt-1">
                                        {contrato.titularDocumento || '-'}
                                    </span>
                                </div>

                                <div className="content-box-outline-3-small">
                                    <span className="subtitle1 text-primary font-light">Vehículo</span>
                                    <span className="subtitle1 text-secondary mt-1">
                                        {contrato.placa || contrato?.turno?.vehiculo?.placa || '-'}
                                    </span>
                                    <span className="subtitle2 text-secondary mt-1">
                                        {contrato.tipoVehiculo || '-'}
                                    </span>
                                </div>

                                <div className="content-box-outline-3-small">
                                    <span className="subtitle1 text-primary font-light">Ruta</span>
                                    <div className="flex items-center gap-1">
                                        <span className="subtitle1 text-secondary leading-none">
                                            {contrato.origen || '-'}
                                        </span>
                                        <md-icon
                                            className="text-xl text-secondary shrink-0 leading-none"
                                            aria-hidden="true"
                                        >
                                            arrow_right
                                        </md-icon>
                                        <span className="subtitle1 text-secondary leading-none">
                                            {contrato.destino || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="content-box-outline-3-small">
                                    <span className="subtitle1 text-primary font-light">Fecha</span>
                                    <span className="subtitle1 text-secondary mt-1">
                                        {contrato.fechaContrato
                                            ? new Date(contrato.fechaContrato).toLocaleString('es-ES')
                                            : '-'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="content-box-outline-2-small p-3 lg:col-span-3"
                        style={{ height: 'calc(78vh - 0px)' }}
                    >
                        {pdfLoading ? (
                            <div className="flex items-center justify-center w-full h-full">
                                <div className="flex flex-col items-center gap-3" style={{ width: 240 }}>
                                    <md-icon className="text-secondary mb-2">picture_as_pdf</md-icon>
                                    <span className="text-secondary">Cargando PDF...</span>
                                    <md-linear-progress indeterminate></md-linear-progress>
                                </div>
                            </div>
                        ) : pdfError ? (
                            <div className="flex items-center justify-center w-full h-full text-center">
                                <div className="flex flex-col items-center gap-2" style={{ width: 340 }}>
                                    <md-icon className="text-secondary mb-1">error</md-icon>
                                    <p className="text-secondary">{pdfError}</p>
                                    <md-filled-button className="btn-search-minimal" onClick={handleDownload}>
                                        Descargar PDF
                                    </md-filled-button>
                                </div>
                            </div>
                        ) : pdfObjectUrl ? (
                            <iframe
                                title="Contrato PDF"
                                src={pdfObjectUrl}
                                className="w-full h-full rounded-lg"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <span className="text-secondary">No hay vista previa disponible.</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default ContratoDetailPage;
