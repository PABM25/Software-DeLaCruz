/**
 * Copyright (c) [2024] [Pilar Bonnault Mancilla, Nicolás González Espinoza y Christofer Ruiz Almonacid]
 * Licensed under the MIT License.
 * See LICENSE file in the root directory.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
// const { SerialPort } = require('serialport'); // DESHABILITADO
// const { ReadlineParser } = require('@serialport/parser-readline'); // DESHABILITADO

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de middleware
app.use(cors());
app.use(express.json());

// Configuración de las rutas
app.use('/api', apiRoutes);

// --- SECCIÓN DEL PUERTO SERIAL DESHABILITADA ---
/*
const serialPortPath = process.env.SERIAL_PORT || 'COM6';
const baudRate = parseInt(process.env.BAUD_RATE, 10) || 9600;

const portSerial = new SerialPort({
    path: serialPortPath,
    baudRate: baudRate
});

const parser = portSerial.pipe(new ReadlineParser({ delimiter: '\n' }));

// Manejo de datos del puerto COM
let latestUID = null;
let lastReadTime = null; 

parser.on('data', (data) => {
    let uid = data.trim().replace(/\s+/g, ''); 
    if (uid.startsWith('UID:')) {
        uid = uid.slice(4); 
    }

    console.log(`UID procesado: ${uid}`);
    latestUID = uid;
    lastReadTime = Date.now(); 
});
*/

// Endpoint para obtener el último UID (SIMULADO)
app.get('/api/latest-uid', (req, res) => {
    console.log('Enviando UID simulado...');
    
    // Cambia este valor para probar diferentes UIDs
    const uidDePrueba = 'UID-PRUEBA-12345'; 
    
    // Para probar el caso "null" (sin lectura), descomenta la siguiente línea:
    // const uidDePrueba = null;

    res.json({ uid: uidDePrueba });
});

/*
// Verificar que el puerto se abre
portSerial.on('open', () => {
    console.log('Puerto serial abierto.');
});

// Manejo de errores del puerto serial
portSerial.on('error', (err) => {
    console.log('Error en puerto serial: ', err.message);
});
*/

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor de PRUEBA corriendo en http://localhost:${port}`);
    console.log('MODO SIMULACIÓN: Conexión a BD y Puerto Serial DESHABILITADOS.');
});