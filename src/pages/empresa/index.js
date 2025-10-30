import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/empresa.css"; // Importar estilo
import Navbar from "../../components/NavBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faPlus } from '@fortawesome/free-solid-svg-icons';

const Empresa = () => {
    const navigate = useNavigate();
    const [empresas, setEmpresas] = useState([]);
     
    const [selectedCompany, setSelectedCompany] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [error, setError] = useState('');
    
    const modificarempresa = (id) => {
        console.log("ID seleccionado:", id);
        const CentroSeleccionado = empresas.find((empresa) => empresa.id_planta === id);
    
        if (CentroSeleccionado) {
            console.log("Centro seleccionado:", CentroSeleccionado);
            navigate(`/modificarempresa/${id}`, { state: { empresa: CentroSeleccionado } });
        } else {
            console.error("No se encontró la empresa");
        }
    };
    
    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/centrodetrabajo');
                const data = await response.json();
                setEmpresas(data);

                
                 
            } catch (error) {
                console.error('Error al cargar los datos:', error);
            }
        };

        fetchEmpresas();
    }, []);
    
    const filteredEmpresas = empresas.filter(empresa =>
        selectedCompany === '' || empresa.nombre_planta === selectedCompany
    );

    const handleSelectChange = (e) => {
        setSelectedCompany(e.target.value);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmpresas.slice(indexOfFirstItem, indexOfLastItem);

    const estadoempresa = (id) => {
        const CentroSeleccionado = empresas.find((empresas) => empresas.id_planta === id);
        const confirmacion = window.confirm(`¿Estás seguro de que deseas inhabilitar al centro con nombre ${CentroSeleccionado?.nombre_planta}?`);

        if (confirmacion) {
            fetch(`http://localhost:3000/api/estadoempresa/${id}`, {  
                method: 'DELETE',
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Error al inhabilitar el centro');
                    }
                    return response.json();
                })
                .then(() => {
                    setEmpresas(empresas.filter((empresas) => empresas.id_planta !== id));  
                })
                .catch((error) => console.error('Error:', error));
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div>
            <Navbar />
            <div className="container">
                <h2 className="empresa-title">Datos de Empresas</h2>
                <button className="dir-reg" onClick={() => navigate('/registroempresa')}>
                    <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>Registrar empresa
                </button>
                
                <div className="filter-container">
                    <label htmlFor="company-select">Filtrar por empresa:</label>
                    <select
                        id="company-select"
                        value={selectedCompany}
                        onChange={handleSelectChange}
                    >
                        <option value="">Seleccione una empresa</option>
                        {empresas.map((empresa) => (
                            <option key={empresa.id_planta} value={empresa.nombre_planta}>
                                {empresa.nombre_planta}
                            </option>
                        ))}
                    </select>
                </div>
                {empresas.length > 0 ? (
                    <>
                        <table className="empresa-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Cantidad de pecheras asociadas</th>
                                    <th>Cantidad solicitadas</th>
                                    <th>Kilos</th>
                                    <th>Estado</th>
                                    <th>Modificar</th> 
                                    <th>Inhabilitar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((empresa) => (
                                    <tr key={empresa.id_planta}>
                                        <td>{empresa.nombre_planta}</td>
                                        <td>{empresa.cantidad}</td>
                                        <td>{empresa.cantidad_asignada}</td>
                                        <td>{empresa.kilo}</td>
                                        <td>{empresa.estado}</td>
                                        
                                        <td>
                                            <button
                                                onClick={() => modificarempresa(empresa.id_planta)}
                                                className="btn-edit"
                                            >
                                                Modificar
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => estadoempresa(empresa.id_planta)}
                                                className="btn-delete"
                                            >
                                                Inhabilitar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            {Array.from({ length: Math.ceil(filteredEmpresas.length / itemsPerPage) }, (_, index) => (
                                <button id='count'
                                    key={index + 1}
                                    onClick={() => paginate(index + 1)}
                                    className={currentPage === index + 1 ? 'active' : ''}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>No hay datos registrados.</p>
                )}
            </div>
        </div>
    );
};

export default Empresa;
