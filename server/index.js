/**
 * Copyright (c) [2024] [Pilar Bonnault Mancilla, Nicolás González Espinoza y Christofer Ruiz Almonacid]
 * Licensed under the MIT License.
 * See LICENSE file in the root directory.
 */


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de middleware
app.use(cors());
app.use(express.json());

// Configuración de las rutas
app.use('/api', apiRoutes);

// Configuración del puerto serial
const serialPortPath = process.env.SERIAL_PORT || 'COM6';
const baudRate = parseInt(process.env.BAUD_RATE, 10) || 9600;

const portSerial = new SerialPort({
    path: serialPortPath,
    baudRate: baudRate
});

const parser = portSerial.pipe(new ReadlineParser({ delimiter: '\n' }));

// Manejo de datos del puerto COM
let latestUID = null;
let lastReadTime = null; // Marca de tiempo de la última lectura

parser.on('data', (data) => {
    let uid = data.trim().replace(/\s+/g, ''); // Eliminar todos los espacios
    if (uid.startsWith('UID:')) {
        uid = uid.slice(4); // Eliminar el prefijo "UID:"
    }

    console.log(`UID procesado: ${uid}`);
    latestUID = uid;
    lastReadTime = Date.now(); // Actualizar la marca de tiempo con el tiempo actual
});

// Endpoint para obtener el último UID
app.get('/api/latest-uid', (req, res) => {
    const currentTime = Date.now();
    const timeSinceLastRead = currentTime - (lastReadTime || 0);

    // Si no se ha leído un UID en los últimos 5 segundos, retornar null
    if (!latestUID || timeSinceLastRead > 1000) {
        return res.json({ uid: null });
    }

    // Devolver el último UID si fue leído recientemente
    res.json({ uid: latestUID });
});
// Verificar que el puerto se abre
portSerial.on('open', () => {
    console.log('Puerto serial abierto.');
});

// Manejo de errores del puerto serial
portSerial.on('error', (err) => {
    console.log('Error en puerto serial: ', err.message);
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});