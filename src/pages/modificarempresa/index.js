import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/modificar-emp.css";
import Navbar from "../../components/NavBar";

const ModificarPlanta = () => { // Renombrar a ModificarPlanta
    const { id_planta } = useParams(); // Obtener el id de la URL
    const navigate = useNavigate();
    const [empresa, setEmpresa] = useState({
        id_planta: '',
        nombre_planta: '',
        cantidad_asignada: '',
        kilo: ''
    });

    useEffect(() => {
        console.log("ID de planta recibido:", id_planta); // Verifica que se recibe el ID correctamente
    
        const fetchEmpresa = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/centrodetrabajoid?id_planta=${id_planta}`);

                console.log("Respuesta del servidor:", response); // Verifica la respuesta
                if (!response.ok) {
                    throw new Error('Error al obtener los datos de la empresa');
                }
    
                const data = await response.json();
                console.log("Datos de la empresa recibidos:", data); // Verifica los datos recibidos
                
                setEmpresa(data); // Asegúrate de que el estado esté siendo actualizado con los datos correctos
            } catch (error) {
                console.error('Error al cargar los datos de la empresa:', error);
            }
        };
    
        if (id_planta) {
            fetchEmpresa();
        }
    }, [id_planta]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmpresa({
            ...empresa,
            [name]: value
        });
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Datos enviados:', empresa); // Imprime los datos enviados
        try {
            const response = await fetch(`http://localhost:3000/api/actualizarempresa`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(empresa),
            });
    
            if (response.ok) {
                alert('Empresa modificada con éxito');
                navigate('/empresa');
            } else {
                alert('Error al modificar la empresa');
            }
        } catch (error) {
            console.error('Error al modificar la empresa:', error);
            alert('Error al modificar la empresa');
        }
    };
    
    

    return (
        <div>
            <Navbar />
            <div className='tit-modificar-emp card-title'>
                    <h1>Centro de trabajo seleccionado</h1>
            </div>
            <div className='container' id="cont-modificar-emp">
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre empresa</label>
                        <input 
                            type="text" 
                            name="nombre_planta" 
                            value={empresa.nombre_planta} 
                            onChange={handleChange} 
                            className="form-control" 
                        />
                    </div>

                    <div className="form-group">
                        <label>Cantidad de pecheras asignadas</label>
                        <input 
                            type="number" 
                            name="cantidad_asignada" 
                            value={empresa.cantidad_asignada} 
                            onChange={handleChange} 
                            className="form-control" 
                        />
                    </div>

                    <div className="form-group">
                        <label>Kilos</label>
                        <input 
                            type="number" 
                            name="kilo" 
                            value={empresa.kilo} 
                            onChange={handleChange} 
                            className="form-control" 
                        />
                    </div>

                    <div className="form-group">
                        <label>estado:</label>
                        <select
                            className="form-select"
                            name="estado"
                            value={empresa.estado} // Valor seleccionado actual
                            onChange={handleChange} // Función que maneja el cambio
                        >
                            <option value="">Seleccionar estado</option> {/* Opción por defecto */}
                            <option value="Activa">Activa</option> {/* Opción Activa */}
                            <option value="Inactiva">Inactiva</option> {/* Opción Inactiva */}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary button-modi-emp">Guardar cambios</button>
                </form>
            </div>
        </div>
    );
};

export default ModificarPlanta;
