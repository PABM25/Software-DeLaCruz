// Importaciones necesarias
import React, { useState, useEffect } from 'react';
import '../../src/styles/custom-modal.css'; // Estilos del modal
import * as XLSX from 'xlsx'; // Librería para exportar a Excel
import logo from '../resources/logo.png'; // Logo de la aplicación

/**
 * Componente CustomModal
 * Modal para seleccionar rangos de fechas y generar un informe en Excel.
 * 
 * Props:
 * - show: Booleano que controla si el modal se muestra.
 * - title: Título del modal.
 * - onClose: Función para cerrar el modal.
 * - onConfirm: Función para confirmar las fechas seleccionadas.
 */

const CustomModal = ({ show, title, onClose, onConfirm }) => {
  // Estados del componente
  const [startDate, setStartDate] = useState(''); // Fecha inicial
  const [endDate, setEndDate] = useState(''); // Fecha final
  const [pecheras, setPecheras] = useState([]); // Lista de pecheras
  const [pecherasHistorial, setPecherasHistorial] = useState([]); // Historial de pecheras
  const [isLoading, setIsLoading] = useState(false); // Controla si se está mostrando la animación de carga

  // Efecto para cargar los datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          fetch('http://localhost:3000/api/pecherashistorial'),
          fetch('http://localhost:3000/api/pecheras'),
        ]);

        const [pecherasHistorialData, pecherasData] = await Promise.all(
          responses.map((res) => res.json())
        );

        setPecherasHistorial(pecherasHistorialData);
        setPecheras(pecherasData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
  }, []);

  // Si el modal no está activo, no renderiza nada
  if (!show) return null;

  // Confirma las fechas seleccionadas y cierra el modal
  const handleConfirm = () => {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999); // Ajusta el final del día
    onConfirm(startDate, adjustedEndDate.toISOString());
    onClose();
  };

  // Muestra alerta si no hay datos para generar el informe
  const showNoDataAlert = () => {
    alert('No hay pecheras registradas para generar el informe.');
  };

  // Obtiene las fechas de lavado para una pechera específica
  const getFechasLavados = async (idPechera, adjustedEndDate) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/Lavados?startDate=${startDate}&endDate=${adjustedEndDate.toISOString()}`
      );
      if (!response.ok) throw new Error('Error al obtener fechas de lavados');

      const data = await response.json();
      return data
        .filter((lavado) => lavado.id_pechera_registro === idPechera)
        .map((lavado) =>
          new Date(lavado.Fecha_lavado).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        );
    } catch (error) {
      console.error('Error al obtener lavados:', error);
      return [];
    }
  };

  // Valida que la fecha final no exceda el rango permitido
const validateEndDate = () => {
  const selectedEndDate = new Date(endDate);
  const maxEndDate = new Date(startDate);
  maxEndDate.setDate(maxEndDate.getDate() + 14);

  if (selectedEndDate > maxEndDate) {
    alert('El rango de fecha seleccionado no puede superar los 14 días.');
    setEndDate(maxEndDate.toISOString().split('T')[0]); // Ajusta la fecha final si excede el límite
  }
};

// Genera y descarga el informe en Excel
const handleDownloadExcel = async () => {
  if (!pecheras || pecheras.length === 0) {
    showNoDataAlert();
    return;
  }

  setIsLoading(true); // Activa la animación de carga

  const adjustedEndDate = new Date(endDate);
  adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); // Agrega un día
  adjustedEndDate.setHours(0, 0, 0, 0); // Comienza desde las 00:00 del día siguiente

  const pecherasData = [];

  await Promise.all(
    pecheras.map(async (pechera) => {
      const fechasLavados = await getFechasLavados(
        pechera.id_pechera_registro,
        adjustedEndDate
      );

      if (fechasLavados.length > 0) {
        fechasLavados.forEach((fecha) => {
          pecherasData.push({
            UID: pechera.id_pechera_registro,
            Fecha_Lavado: fecha,
            Talla: pechera.Talla || 'Sin asignar',
            Cantidad_Lavados: pechera.Cantidad_Lavados || 'Sin asignar',
            Observaciones: pechera.Observaciones || 'Sin asignar',
            Empresa: pechera.nombre_planta || 'Sin asignar',
            Parametros: pechera.Parametros || 'Sin asignar',
            Indice_Microbiologico:
              pechera.indice_microbiologico || 'Sin asignar',
          });
        });
      }
    })
  );

  if (pecherasData.length === 0) {
    showNoDataAlert();
    setIsLoading(false); // Oculta la animación de carga
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(pecherasData);

  // Agregar filtros a las columnas
  const columnLetters = Object.keys(pecherasData[0]).map((_, index) =>
    String.fromCharCode(65 + index)
  );
  const range = `${columnLetters[0]}1:${columnLetters[columnLetters.length - 1]}${pecherasData.length + 1}`;
  ws['!autofilter'] = { ref: range };

  // Ajustar ancho de columnas
  const columnWidths = Object.keys(pecherasData[0]).map((key) => ({
    wch: Math.max(
      key.length, // Ancho del encabezado
      ...pecherasData.map((row) => (row[key] ? row[key].toString().length : 0))
    ),
  }));
  ws['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Pecheras');
  XLSX.writeFile(wb, 'InformePecheras.xlsx');
  setIsLoading(false); // Oculta la animación de carga
};




  // Renderizado del modal
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{title || 'Selecciona las fechas'}</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <label htmlFor="desde">Fecha Desde:</label>
          <input
            id="desde"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label htmlFor="hasta">Fecha Hasta:</label>
          <input
            id="hasta"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onBlur={validateEndDate}
          />
        </div>
        <div className="modal-footer">
          <button className="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="button button-confirm" onClick={handleDownloadExcel}>
            Descargar Reporte
          </button>
        </div>
      </div>

      {/* Pantalla de carga */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="hourglass-popup">
            <div className="hourglass-icon">⏳</div>
            <p className="loading-text">Generando informe...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomModal;
