import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboardempresa.css';
import Navbar from '../../components/NavBar';

const DashboardEmpresas = () => {
    const [empresas, setEmpresas] = useState([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [error, setError] = useState('');
    const [pecheras, setPecheras] = useState([]);
    const [cantidadpecherasxempresa, setcantidadpecherasxempresa] = useState(0);
    const [pecherashistorialxplanta, setpecherashistorialxplanta] = useState(0);   
    const [cantidadlavadosxplanta, setcantidadlavadosxplanta] = useState(0);
    const [cantidadpecherasmesxplanta, setcantidadpecherasmesxplanta] = useState(0);
    const [estadoEmpresa, setEstadoEmpresa] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (selectedEmpresa) {
                try {
                    const cantidadPecherasResponse = await fetch(`http://localhost:3000/api/cantidadpecherasxplanta?nombre_planta=${selectedEmpresa}`);
                    if (!cantidadPecherasResponse.ok) throw new Error('Error al obtener la cantidad de pecheras');
                    const cantidadpecherasxempresaData = await cantidadPecherasResponse.json();
                    setcantidadpecherasxempresa(cantidadpecherasxempresaData.cantidadpecherasxplanta || 0);


                    const pecherasHistorialResponse = await fetch(`http://localhost:3000/api/pecherashistorialxplanta?nombre_planta=${selectedEmpresa}`);
                    if (!pecherasHistorialResponse.ok) throw new Error('Error al obtener el historial de pecheras');
                    const pecherashistorialxplantaData = await pecherasHistorialResponse.json();
                    setpecherashistorialxplanta(pecherashistorialxplantaData.pecherashistorialxplanta || 0);


                    const lavadosResponse = await fetch(`http://localhost:3000/api/cantidadlavadosxplanta?nombre_planta=${selectedEmpresa}`);
                    if (!lavadosResponse.ok) throw new Error('Error al obtener los datos de pecheras');
                    const cantidadlavadosxplantaData = await lavadosResponse.json();
                    setcantidadlavadosxplanta(cantidadlavadosxplantaData.cantidadlavadosxplanta || 0);

                    const pecherasMesResponse = await fetch(`http://localhost:3000/api/cantidadpecherasmesxplanta?nombre_planta=${selectedEmpresa}`);
                    if (!pecherasMesResponse.ok) throw new Error('Error al obtener la cantidad de pecheras del mes');
                    const cantidadpecherasmesxplantaData = await pecherasMesResponse.json();
                    setcantidadpecherasmesxplanta(cantidadpecherasmesxplantaData.cantidadpecherasmesxplanta || 0);

                } catch (error) {
                    console.error('Error al cargar los datos:', error);
                    setError(error.message);
                }
            }
        };

        fetchData();
    }, [selectedEmpresa]);

    

 
useEffect(() => {
    const fetchEmpresas = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/centrodetrabajo');
            const data = await response.json();
            setEmpresas(data);

            // Si hay una empresa seleccionada, actualiza su estado
            if (selectedEmpresa) {
                const empresaSeleccionada = data.find(empresa => empresa.nombre_planta === selectedEmpresa);
                if (empresaSeleccionada) {
                    setEstadoEmpresa(empresaSeleccionada.estado);
                }
            }
        } catch (error) {
            console.error('Error al cargar los datos de empresas:', error);
        }
    };

    fetchEmpresas();
}, [selectedEmpresa]); 

    useEffect(() => {
        const fetchPecheras = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/pecheras');
                if (!response.ok) throw new Error('Error al obtener los datos de pecheras');
                const data = await response.json();
                setPecheras(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchPecheras();
    }, []);

    const handleSelectChange = (e) => {
        setSelectedEmpresa(e.target.value);
        setCurrentPage(1);
    };

    const filteredPecheras = pecheras.filter(pechera =>
        selectedEmpresa === '' || pechera.Planta === selectedEmpresa
    );     
    const indexOfLastPechera = currentPage * itemsPerPage;
    const indexOfFirstPechera = indexOfLastPechera - itemsPerPage;
    const currentPecheras = filteredPecheras.slice(indexOfFirstPechera, indexOfLastPechera);

    return (
        <div className="dash">
            <Navbar />
            <h2 className="empresa-title">Datos de Empresas</h2>
            <div className="filter-container">
                <label htmlFor="company-select">Filtrar por empresa:</label>
                <select
                    id="filter"
                    value={selectedEmpresa}
                    onChange={handleSelectChange}
                >
                    <option value="">Todas las empresas</option>
                    {empresas.map((empresa, index) => (
                        <option key={index} value={empresa.nombre_planta}>
                            {empresa.nombre_planta} / {empresa.estado}
                        </option>
                    ))}
                </select>
            </div>
            <h1>Panel principal de "{selectedEmpresa}" {estadoEmpresa ? `(${estadoEmpresa})` : ''}</h1>
            <div className="contenedor">
                <div className="row">
                    <div className="col-sm-3 mb-3">
                        <div className="card">
                            <div id="header-azul" className="card-header">Total de pecheras fabricadas</div>
                            <div id='body-azul' className="card-body">
                                <h2 id="text-azul" className="card-title">{cantidadpecherasxempresa}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3 mb-3">
                        <div className="card">
                            <div id="header-naranja" className="card-header">Pecheras fabricadas último mes</div>
                            <div id='body-naranja' className="card-body">
                                <h2 className="card-title">{cantidadpecherasmesxplanta}</h2>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3 mb-3">
                        <div className="card">
                            <div id="header-azul" className="card-header">Total de pecheras lavadas</div>
                            <div id='body-azul' className="card-body">
                                <h2 id="text-azul" className="card-title">{cantidadlavadosxplanta}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3 mb-3">
                        <div className="card">
                            <div id="header-naranja" className="card-header">Total de pecheras dañadas</div>
                            <div id='body-naranja' className="card-body">
                                <h2 className="card-title">{pecherashistorialxplanta} </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {error && <p className="error-message">{error}</p>} {/* Muestra el mensaje de error si existe */}
        </div>
    );
};

export default DashboardEmpresas;
