// Importaciones de librerías principales de React y utilidades necesarias
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard.css';
import '../../styles/base.css';


// Componentes personalizados
import Navbar from '../../components/NavBar';
import Sidebar from '../../components/SideBar';

// Importaciones para gráficos (Chart.js)
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Utilidades para descarga de archivos
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Recursos de imágenes y componentes
import logo from '../../resources/logo.png';
import Rotas from '../../resources/defectuosas.png';
import Lavadas from '../../resources/lavadas-removebg-preview.png';
import Plus from '../../resources/plusw.png';
import Fabs from '../../resources/fabricadas-removebg-preview.png';
import Dispo from '../../resources/disponibles-removebg-preview.png';

// Iconos (FontAwesome)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faFileDownload, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

// Modal personalizado
import CustomModal from '../../components/CustomModal';

// Configuración y registro de componentes de gráficos en Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    // Estado local para gestionar modales, datos y año seleccionado
    const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal
    const navigate = useNavigate(); // Navegación entre rutas
    const [pecheras, setPecheras] = useState([]); // Lista de pecheras
    const [cantidadpecherasmes, setPecherasmes] = useState([]); // Pecheras registradas en el último mes
    const [cantidadlavados, setcantidadlavados] = useState([]); // Lavados totales
    const [cantidadpecheras, setCantidadPecheras] = useState([]); // Total de pecheras fabricadas
    const [pecherasdisponibles, setpecherasdisponibles] = useState([]); // Pecheras disponibles en stock
    const [pecherashistorial, setpecherashistorial] = useState([]); // Historial de pecheras eliminadas
    const [pecheraenuso, setpecheraenuso] = useState([]); // Pecheras actualmente en uso
    const [fechapecheras, setFechapecheras] = useState([]); // Fechas de fabricación de pecheras
    const [pecherasxmes, setPecherasxmes] = useState([]); // Datos mensuales para el gráfico
    const [anoSeleccionado, setAnoSeleccionado] = useState(new Date().getFullYear()); // Año seleccionado para filtrar datos
     

    // Funciones para abrir y cerrar el modal de confirmación
    const handleOpenModal = () => setShowModal(true); // Muestra el modal
    const handleCloseModal = () => setShowModal(false); // Oculta el modal
    const handleConfirmModal = () => {
        setShowModal(false);
        console.log("Confirmed!"); // Acción al confirmar en el modal
    };


    // Hook useEffect para cargar datos de la API al montar el componente o cambiar el año seleccionado
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Realiza múltiples solicitudes a la API y espera sus resultados
                const responses = await Promise.all([
                    fetch('http://localhost:3000/api/cantidadpecheras'),
                    fetch('http://localhost:3000/api/pecherashistorial'),
                    fetch('http://localhost:3000/api/pecheras'),
                    fetch('http://localhost:3000/api/cantidadpecherasmes'),
                    fetch('http://localhost:3000/api/pecheraenuso'),
                    fetch('http://localhost:3000/api/pecherasdisponibles'),
                    fetch('http://localhost:3000/api/fechapecheras'),
                    fetch(`http://localhost:3000/api/pecherasxmes?ano=${anoSeleccionado}`),
                    fetch('http://localhost:3000/api/cantidadlavados')
                ]);

                // Procesa las respuestas y actualiza el estado correspondiente
                const [
                    cantidadPecherasData,
                    pecherasHistorialData,
                    pecherasData,
                    pecherasMesData,
                    pecheraEnUsoData,
                    pecherasDisponiblesData,
                    fechasPecherasData,
                    pecherasXMesData,
                    cantidadlavadosData
                ] = await Promise.all(responses.map(res => res.json()));

                setCantidadPecheras(cantidadPecherasData);
                setpecherashistorial(pecherasHistorialData);
                setPecheras(pecherasData);
                setPecherasmes(pecherasMesData);
                setpecheraenuso(pecheraEnUsoData);
                setpecherasdisponibles(pecherasDisponiblesData);
                setFechapecheras(fechasPecherasData);
                setPecherasxmes(pecherasXMesData);
                setcantidadlavados(cantidadlavadosData);
            } catch (error) {
                console.error(error); // Manejo de errores en caso de fallo
            }
        };

        fetchData(); // Llama a la función fetchData
    }, [anoSeleccionado]); // Solo se ejecuta cuando el año seleccionado cambia

    // Controlador para actualizar el año seleccionado a partir del selector
    const handleCambioAno = (e) => {
        setAnoSeleccionado(e.target.value);
    };

     // Datos estáticos de los meses para el gráfico
    const resultados = [
        { mes_num: 1, mes: 'Enero' },
        { mes_num: 2, mes: 'Febrero' },
        { mes_num: 3, mes: 'Marzo' },
        { mes_num: 4, mes: 'Abril' },
        { mes_num: 5, mes: 'Mayo' },
        { mes_num: 6, mes: 'Junio' },
        { mes_num: 7, mes: 'Julio' },
        { mes_num: 8, mes: 'Agosto' },
        { mes_num: 9, mes: 'Septiembre' },
        { mes_num: 10, mes: 'Octubre' },
        { mes_num: 11, mes: 'Noviembre' },
        { mes_num: 12, mes: 'Diciembre' },
    ];

    // Ordenar los resultados por mes_num
    resultados.sort((a, b) => a.mes_num - b.mes_num);

    // Datos configurados para el gráfico
    const datosGrafico = {
        labels: resultados.map(d => d.mes),
        datasets: [
            {
                label: 'Cantidad de Pecheras',
                data: pecherasxmes.map(d => d.cantidad),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Configuración de opciones del gráfico
    const opcionesGrafico = {
        responsive: true,
        maintainAspectRatio: false, // Permite especificar una altura fija
        scales: {
            y: { beginAtZero: true }, // Escala Y comienza en 0
        },
    };

    
    return (
        <div>
            <Navbar />
            <Sidebar />
            <div className="container">

      {/* Usa el componente CustomModal */}
      <CustomModal
        show={showModal}
        title="Selecciona las fechas"
        onClose={handleCloseModal}
        onConfirm={handleConfirmModal}
      >
      </CustomModal>
                <div>
                    <div className="row">
                        <div className="col-sm-12 d-flex align-items-center justify-content-between">
                            <h1 className="mb-0">Panel Principal</h1>
                            <button id='btn-reg' className="btn btn-primary btn-lg" onClick={() => navigate('/registropecheras')}>
                                <img src={Plus} className="plus"></img>   REGISTRAR PECHERAS NUEVAS
                            </button>
                        </div>
                    </div>

                    <span className="centro">Centro de control e información principal</span><br /><br />
                </div>


                <div className="row">
                    <div className="col-sm-3 mb-3">
                        <div className="card">
                            <div id="header-azul" className="card-header">Total de pecheras fabricadas</div>
                            <div id="body-azul" className="card-body">
                                <h2 id="text-azul" className="tit-dash">{cantidadpecheras} <img src={Dispo} className="Dispo" /> </h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3 mb-3">
                        <div id="card2" className="card">
                            <div id="header-azul" className="card-header">Pecheras fabricadas último mes</div>
                            <div id='body-azul' className="card-body">
                                <h2 id="text-azul" className="tit-dash">{cantidadpecherasmes} <img src={Fabs} className="Fabs" /></h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3 mb-3">
                        <div id="card" className="card">
                            <div id="header-azul" className="card-header">Pecheras lavadas</div>
                            <div id='body-azul' className="card-body">
                                <h2 id="text-azul" className="tit-dash">{cantidadlavados} <img src={Lavadas} className="img-lavadas"></img></h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-3 mb-3">
                        <div id="card2" className="card">
                            <div id="header-azul" className="card-header">Total de pecheras eliminadas</div>
                            <div id='body-azul' className="card-body">
                                <h2 className="tit-dash">{pecherashistorial}  <img src={Rotas} className="img-danadas" /></h2>
                            </div>
                        </div>
                    </div>
                    {/* Más cards... */}
                </div>

                <div className="row" >
                    <div className="col-sm-3 mb-3">
                        <div id="card2" className="tarjeta card">
                            <div id="header-naranja" className="card-header">Total de pecheras en stock</div>
                            <div id='body-naranja' className="card-body">
                                <h2 className="tit-dash">{pecherasdisponibles}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="card-grafico col-sm-3 mb-3">
                        <div id="card-grafico" className="card">
                            <div id="card-3" className="card-header">Gráfico de  pecheras registradas por mes</div>
                            <div className="card-body" style={{ height: '30px' }}>
                        
                                <select onChange={handleCambioAno} value={anoSeleccionado}>
                                    {[2023, 2024, 2025].map(ano => (
                                        <option key={ano} value={ano}>{ano}</option>
                                    ))}
                                </select>
                                <Bar data={datosGrafico} options={opcionesGrafico} />
                            </div>
                        </div>
                    </div>
                </div>
                

                <div className="row">
                    <div className="col-sm-3 mb-3">
                        <div id="card2" className="tarjeta card">
                            <div id="header-naranja" className="card-header">Pecheras en uso</div>
                            <div id='body-naranja' className="card-body">
                                <h2 className="tit-dash">{pecheraenuso}</h2>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="card mb-4">
                    <div className="card-header">
                        <div className="row d-flex justify-content-center align-items-center">
                            <div className="col-sm-8">
                                Listado de las últimas 10 pecheras agregadas al sistema
                            </div>
                            <div className="col-sm-4 d-flex justify-content-end">
                                <button
                                    className="btn btn-success mr-2"
                                    onClick={handleOpenModal}
                                    id="hide-mobile"
                                >
                                    <FontAwesomeIcon icon={faFileDownload} /> Descargar informes
                                </button>
                            </div>
                        </div>
                    </div>



                    <div className="card-body">
                        <table className="table table-responsive-sm table-fluid">
                            <thead>
                                <tr>
                                    <th>UID</th>
                                    <th>Fecha de Fabricación</th>
                                    <th>Talla</th>
                                    <th>Cantidad de Lavados</th>
                                    <th>Observaciones</th>
                                    <th>Empresa</th>
                                    <th>Parámetros</th>
                                    <th>Índice Microbiológico</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pecheras
                                    .sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro)) // Ordenar por fecha de registro
                                    .slice(0, 10) // Obtener las 10 más recientes
                                    .map((pechera) => (
                                        <tr key={pechera.id_pechera_registro}>
                                            <td>{pechera.id_pechera_registro}</td>
                                            <td>{new Date(pechera.fecha_registro).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                            <td>{pechera.Talla}</td>
                                            <td>{pechera.Cantidad_Lavados}</td>
                                            <td>{pechera.Observaciones}</td>
                                            <td>{pechera.nombre_planta}</td>
                                            <td>{pechera.Parametros}</td>
                                            <td>
                                            {pechera.Índice_Microbiológico === 'SI' ? (
                                                <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} />
                                            ) : (
                                                <FontAwesomeIcon icon={faTimesCircle} style={{ color: 'red' }} />
                                            )}
                                        </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>


                </div>

            </div>
        </div>
    );
};

export default Dashboard;
