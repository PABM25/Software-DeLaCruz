import React, { useState, useMemo, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import '../../styles/eco-vista.css';
import Navbar from '../../components/NavBar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

const Ecologia = () => {
  const [tipoPechera, setTipoPechera] = useState("Desechable");
  const [kgPlastico, setKgPlastico] = useState();
  const [añosProyeccion, setAñosProyeccion] = useState();

  // Parámetros de tasas de cambio anual y variación
  const [plasticGrowthRate, setPlasticGrowthRate] = useState(0.05);
  const [co2GrowthRate, setCo2GrowthRate] = useState(0.02);
  const [electricityGrowthRate, setElectricityGrowthRate] = useState(0.03);
  const [randomVariation, setRandomVariation] = useState(0.1); // 10% de variación aleatoria

  const desechable = { pesoPorUso: 30, tiempoDegradacion: 500, emisionesCO2: 0.18, consumoElectrico: 0.2 };
  const reutilizable = { pesoPorUso: 150, tiempoDegradacion: 50, emisionesCO2: 0.3, consumoElectrico: 0.5 };

  const selectedData = tipoPechera === "Desechable" ? desechable : reutilizable;
  const numUsos = kgPlastico / (selectedData.pesoPorUso / 1000);
  const emisionesCO2Total = selectedData.emisionesCO2 * numUsos;
  const consumoElectricoTotal = selectedData.consumoElectrico * numUsos;

  // Función para calcular variación aleatoria
  const applyRandomVariation = (value) => {
    const factor = 1 + (Math.random() * randomVariation * 2 - randomVariation);
    return value * factor;
  };

  // Proyección de beneficios con variación anual
  const beneficiosAnuales = useMemo(() => {
    const startYear = 2024;
    const beneficios = [];

    let plasticoActual = kgPlastico;
    let co2Actual = emisionesCO2Total;
    let electricidadActual = consumoElectricoTotal;

    for (let i = 0; i < añosProyeccion; i++) {
      const year = startYear + i;
      beneficios.push({
        year,
        plasticoAhorrado: plasticoActual,
        co2Reducido: co2Actual,
        electricidadReducida: electricidadActual,
      });

      // Actualización para el próximo año aplicando las tasas de cambio y la variación aleatoria
      plasticoActual = applyRandomVariation(plasticoActual * (1 + plasticGrowthRate));
      co2Actual = applyRandomVariation(co2Actual * (1 + co2GrowthRate));
      electricidadActual = applyRandomVariation(electricidadActual * (1 + electricityGrowthRate));
    }

    return beneficios;
  }, [kgPlastico, emisionesCO2Total, consumoElectricoTotal, añosProyeccion, plasticGrowthRate, co2GrowthRate, electricityGrowthRate, randomVariation]);

  // Datos para el gráfico de línea
  const lineData = useMemo(() => {
    const etiquetas = beneficiosAnuales.map(({ year }) => year);
    const plasticoConsumido = beneficiosAnuales.map(({ plasticoAhorrado }) => plasticoAhorrado);
    const emisionesCO2 = beneficiosAnuales.map(({ co2Reducido }) => co2Reducido);
    const consumoElectrico = beneficiosAnuales.map(({ electricidadReducida }) => electricidadReducida);

    return {
      labels: etiquetas,
      datasets: [
        {
          label: 'Plástico Ahorrado (kg)',
          data: plasticoConsumido,
          fill: false,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
        },
        {
          label: 'Reducción de CO₂ (kg)',
          data: emisionesCO2,
          fill: false,
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1,
        },
        {
          label: 'Reducción de Consumo Eléctrico (kWh)',
          data: consumoElectrico,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  }, [beneficiosAnuales]);

  useEffect(() => {
    console.log("Datos del gráfico actualizados", lineData);
  }, [lineData]);

  const handleTipoPecheraChange = (e) => setTipoPechera(e.target.value);
  const handleKgPlasticoChange = (e) => setKgPlastico(Number(e.target.value));
  const handleAñosProyeccionChange = (e) => setAñosProyeccion(Number(e.target.value));
  const handlePlasticGrowthChange = (e) => setPlasticGrowthRate(Number(e.target.value) / 100);
  const handleCo2GrowthChange = (e) => setCo2GrowthRate(Number(e.target.value) / 100);
  const handleElectricityGrowthChange = (e) => setElectricityGrowthRate(Number(e.target.value) / 100);
  const handleRandomVariationChange = (e) => setRandomVariation(Number(e.target.value) / 100);

  return (
    <div>
      <Navbar />
      <div className='container'>
        <h1 className='title'>Impacto Ecológico en Pecheras</h1>

        <div className="select-container">
          <label>Tipo de Pechera:</label>
          <select value={tipoPechera} onChange={handleTipoPecheraChange}>
            <option value="Desechable">Pechera Desechable</option>
            <option value="Reutilizable">Pechera Reutilizable</option>
          </select>
        </div>

        <div className="input-container">
          <label className='kg'>Kilogramos de Plástico:</label>
          <input className='inputs-kg-anos'
            type="number"
            value={kgPlastico}
            onChange={handleKgPlasticoChange}
            min=""
            step="1"
          />
        </div>

        <div className="input-container">
          <label  className='kg'>Años de Proyección:</label>
          <input className='inputs-kg-anos'
            type="number"
            value={añosProyeccion}
            onChange={handleAñosProyeccionChange}
            min="1"
          />
        </div>
          <div className='container' id='variables'>
            <div className="growth-rate-container">
              <h3 id='h3-tasas'>Tasas de Crecimiento Anual y Variación</h3>
              <label className='labels'>Tasa de Crecimiento de Plástico (%):</label>
              <input className='inputs' type="number" value={plasticGrowthRate * 100} onChange={handlePlasticGrowthChange} step="0.1" />
              <label className='labels'>Tasa de Crecimiento de CO₂ (%):</label>
              <input className='inputs' type="number" value={co2GrowthRate * 100} onChange={handleCo2GrowthChange} step="0.1" />
              <label className='labels'>Tasa de Crecimiento de Consumo Eléctrico (%):</label>
              <input className='inputs' type="number" value={electricityGrowthRate * 100} onChange={handleElectricityGrowthChange} step="0.1" />

            </div>
          </div>
        <div className="summary-cards">
          <SummaryCard title="Total Plástico Consumido" value={`${kgPlastico} kg`} />
          <SummaryCard title="Emisiones de CO₂" value={`${emisionesCO2Total} kg`} />
          <SummaryCard title="Consumo Eléctrico Total" value={`${consumoElectricoTotal} kWh`} />
        </div>

        <div className="chart-container">
          <Line data={lineData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div className="summary-card">
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

export default Ecologia;
