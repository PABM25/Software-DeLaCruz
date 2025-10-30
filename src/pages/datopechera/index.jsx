/**
 * Copyright (c) [2024] [Pilar Bonnault Mancilla, Nicolás González Espinoza y Christofer Ruiz Almonacid]
 * Licensed under the MIT License.
 * See LICENSE file in the root directory.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/dato-pecheras.css';
import Navbar from '../../components/NavBar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faEdit, faTrash, faTimes, faFileExcel, faFilePdf, faMagnifyingGlass, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';


/**
 * Componente principal para gestionar los datos de las pecheras.
 * Incluye funcionalidades para filtrar, paginar, exportar datos y realizar operaciones CRUD.
 */

const Pecheras = () => {
    // Estado para almacenar datos de pecheras
    const [pecheras, setPecheras] = useState([]);
    // Estado para filtrar por empresa seleccionada
    const [selectedEmpresa, setSelectedEmpresa] = useState('');
    // Estado para filtrar por fecha de lavado
    const [selectedDate, setSelectedDate] = useState('');
    // Estado para gestionar la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Número de elementos por página
    const [error, setError] = useState(''); // Manejo de errores
    const [paginationGroupSize] = useState(5); // Tamaño del grupo de paginación
    const navigate = useNavigate(); // Hook para la navegación

       /**
     * Función para navegar a la página de modificación de una pechera seleccionada.
     * @param {string} id - Identificador de la pechera a modificar.
     */


    const modificarpecherasinleer = (id) => {
        const pecheraseleccionada = pecheras.find((pechera) => pechera.id_pechera_registro === id);
        if (pecheraseleccionada) {
            navigate(`/ModificarPecherasSinLeer/${id}`);
        }
    };

    // Carga inicial de datos al montar el componente
    useEffect(() => {
        fetch('http://localhost:3000/api/pecheras')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los datos de pecheras');
                }
                return response.json();
            })
            .then((data) => setPecheras(data))
            .catch((error) => setError(error.message));
    }, []);

     /**
     * Filtra las pecheras según la empresa y la fecha seleccionadas.
     */
     const filteredPecheras = pecheras.filter(pechera =>
        (selectedEmpresa === '' || pechera.nombre_planta === selectedEmpresa) &&
        (selectedDate === '' || (pechera.ultimolavado && new Date(pechera.ultimolavado).toISOString().split('T')[0] === selectedDate))
    );

    // Índices para la paginación
    const indexOfLastPechera = currentPage * itemsPerPage;
    const indexOfFirstPechera = indexOfLastPechera - itemsPerPage;
    const currentPecheras = filteredPecheras.slice(indexOfFirstPechera, indexOfLastPechera);

    /**
     * Actualiza el estado de empresa seleccionada y reinicia la paginación.
     * @param {Object} e - Evento de cambio.
     */
    const handleSelectChange = (e) => {
        setSelectedEmpresa(e.target.value);
        setCurrentPage(1);
    };

    /**
     * Actualiza el estado de fecha seleccionada y reinicia la paginación.
     * @param {Object} e - Evento de cambio.
     */
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        setCurrentPage(1);
    };

    /**
     * Cambia la página actual.
     * @param {number} pageNumber - Número de la página.
     */
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    /**
     * Limpia los filtros aplicados y reinicia la página actual.
     */
    const handleClearFilters = () => {
        setSelectedEmpresa('');
        setSelectedDate('');
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredPecheras.length / itemsPerPage);
    const startPage = Math.floor((currentPage - 1) / paginationGroupSize) * paginationGroupSize + 1;
    const endPage = Math.min(startPage + paginationGroupSize - 1, totalPages);

    /**
     * Elimina una pechera específica tras confirmación del usuario.
     * @param {string} id - Identificador de la pechera a eliminar.
     */
    const eliminarpechera = (id) => {
        const confirmacion = window.confirm(`¿Estás seguro de que deseas eliminar a la pechera con id ${id}?`);
        if (confirmacion) {
            fetch(`http://localhost:3000/api/eliminarpechera/${id}`, { method: 'DELETE' })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Error al eliminar la pechera');
                    }
                    return response.json();
                })
                .then(() => {
                    setPecheras(pecheras.filter((pechera) => pechera.id_pechera_registro !== id));
                })
                .catch((error) => console.error('Error:', error));
        }
    };

    /**
     * Exporta los datos filtrados a un archivo Excel.
     */
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredPecheras);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pecheras");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

        saveAs(blob, "pecheras.xlsx");
    };

    /**
     * Exporta los datos filtrados a un archivo PDF.
     */
    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["UID", "Fecha de Fabricación", "Talla", "Último Lavado", "Cantidad Lavados", "Empresa"];
        const tableRows = [];

        filteredPecheras.forEach(pechera => {
            const pecheraData = [
                pechera.id_pechera_registro,
                new Date(pechera.fecha_registro).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                pechera.Talla,
                pechera.ultimolavado ? new Date(pechera.ultimolavado).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sin lavar',
                pechera.Cantidad_Lavados,
                pechera.nombre_planta
            ];
            tableRows.push(pecheraData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.save("pecheras.pdf");
    };

    // Render de la vista

    return (
        <div>
            <Navbar />
            <div className="container" id="cont-dat-pe">
                <h2 className="tit-pech">Datos Registrados de Pecheras</h2>
                <button className='info' onClick={() => navigate('/InfoPecheras')}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} /> Información de pechera
                </button>
                <button className="distri" onClick={() => navigate('/distribucion')}>
                    <FontAwesomeIcon icon={faChartBar} /> Distribución Pecheras
                </button>
                <button className="modi-pech" onClick={() => navigate('/modificarpecheras')}>
                    <FontAwesomeIcon icon={faEdit} /> Modificar Pechera
                </button>
                <button className="btn btn-delete" id='btn-eliminar' onClick={() => navigate('/EliminarPechera')}>
                    <FontAwesomeIcon icon={faTrash} /> Eliminar pechera
                </button>


                <div className="search-bar">
                    <label htmlFor="filter">Filtrar por Empresa:</label>
                    <select
                        id="filter"
                        value={selectedEmpresa}
                        onChange={handleSelectChange}
                    >
                        <option value="">Todas las empresas</option>
                        {[...new Set(pecheras.map(pechera => pechera.nombre_planta))].map((empresa, index) => (
                            <option key={index} value={empresa}>
                                {empresa}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="date-filter">Filtrar por Fecha de Lavado:</label>
                    <input
                        type="date"
                        id="date-filter"
                        value={selectedDate}
                        onChange={handleDateChange}
                    />

                    <button className="btn-clear" id='btn-limpiar' onClick={handleClearFilters}>
                        <FontAwesomeIcon icon={faTimes} /> Limpiar filtro
                    </button>
                </div>

                {currentPecheras.length > 0 ? (
                    <div>
                        <table className="tabla-datos">
                            <thead>
                                <tr>
                                    <th>UID</th>
                                    <th>Fecha de Fabricación</th>
                                    <th>Talla</th>
                                    <th>Ultimo lavado</th>
                                    <th>Cantidad Lavados</th>
                                    <th>Observaciones</th>
                                    <th>Empresa</th>
                                    <th>Índice Microbiológico</th>
                                    <th>Modificar</th>
                                    <th>Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPecheras.map((pechera, index) => (
                                    <tr key={index}>
                                        <td>{pechera.id_pechera_registro}</td>
                                        <td>{new Date(pechera.fecha_registro).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                        <td>{pechera.Talla}</td>
                                        <td>
                                            {pechera.ultimolavado ?
                                                new Date(pechera.ultimolavado).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                : 'Sin lavar'}
                                        </td>
                                        <td>{pechera.Cantidad_Lavados}</td>
                                        <td>{pechera.Observaciones}</td>
                                        <td>{pechera.nombre_planta}</td>
                                        <td>
                                            {pechera.Índice_Microbiológico === 'SI' ? (
                                                <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} />
                                            ) : (
                                                <FontAwesomeIcon icon={faTimesCircle} style={{ color: 'red' }} />
                                            )}
                                        </td>

                                        <td><button className="btn btn-edit" onClick={() => modificarpecherasinleer(pechera.id_pechera_registro)}>Modificar</button></td>
                                        <td><button className="btn btn-delete" onClick={() => eliminarpechera(pechera.id_pechera_registro)}>Eliminar</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(startPage - 1)}
                                disabled={startPage === 1}>
                                &lt; Anterior
                            </button>
                            {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
                                <button key={index} onClick={() => handlePageChange(startPage + index)} className={startPage + index === currentPage ? 'active' : ''}> {startPage + index}</button>))}
                            <button
                                onClick={() => handlePageChange(endPage + 1)}
                                disabled={endPage === totalPages}>
                                Siguiente &gt;
                            </button>
                            <div>
                                <button className='btn btn-success' id='btn-excel' onClick={exportToExcel}><FontAwesomeIcon icon={faFileExcel} />Descargar Excel</button>
                                <button className='btn' id='btn-pdf' onClick={exportToPDF}><FontAwesomeIcon icon={faFilePdf} />Descargar PDF</button>
                            </div>

                        </div>
                    </div>
                ) : (
                    <p>No hay datos registrados.</p>
                )}
            </div>
        </div>
    );
};

export default Pecheras;
