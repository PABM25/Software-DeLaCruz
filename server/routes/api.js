/**
 * Copyright (c) [2024] [Pilar Bonnault Mancilla, Nicolás González Espinoza y Christofer Ruiz Almonacid]
 * Licensed under the MIT License.
 * See LICENSE file in the root directory.
 */

const express = require('express');
const router = express.Router();
// const conexion = require('../config/db'); // CONEXIÓN A BD DESHABILITADA

// --- DATOS DE PRUEBA GLOBALES ---
const mockPecheras = [
    { id_pechera_registro: 'UID-111', fecha_registro: '2024-01-01', Talla: 'M', ultimolavado: '2024-05-10', Cantidad_Lavados: 5, nombre_planta: 'Planta A', Parametros: '', Observaciones: 'En buen estado', Índice_Microbiológico: '' },
    { id_pechera_registro: 'UID-222', fecha_registro: '2024-02-15', Talla: 'L', ultimolavado: '2024-05-11', Cantidad_Lavados: 2, nombre_planta: 'Planta B', Parametros: 'P-123', Observaciones: '', Índice_Microbiológico: '0.5' },
    { id_pechera_registro: 'UID-333', fecha_registro: '2024-03-20', Talla: 'M', ultimolavado: null, Cantidad_Lavados: 0, nombre_planta: null, Parametros: '', Observaciones: 'Nueva', Índice_Microbiológico: '' },
    { id_pechera_registro: 'UID-444', fecha_registro: '2024-04-05', Talla: 'S', ultimolavado: '2024-05-01', Cantidad_Lavados: 10, nombre_planta: 'Planta A', Parametros: 'P-456', Observaciones: 'Desgaste visible', Índice_Microbiológico: '1.2' }
];

const mockUsuarios = [
    { id_login: 1, nombre_completo: 'Admin de Prueba', correo: 'admin@test.com', contraseña: 'HASH-SIMULADO', nombre_planta: 'Planta A', estado: 'Activa' },
    { id_login: 2, nombre_completo: 'Usuario de Prueba', correo: 'user@test.com', contraseña: 'HASH-SIMULADO', nombre_planta: 'Planta B', estado: 'Activa' }
];

const mockPlantas = [
    { id_planta: 1, nombre_planta: 'Planta A', cantidad: 100, kilo: 50, cantidad_asignada: 2, estado: 'Activa' },
    { id_planta: 2, nombre_planta: 'Planta B', cantidad: 80, kilo: 40, cantidad_asignada: 1, estado: 'Activa' },
    { id_planta: 3, nombre_planta: 'Planta C (Inactiva)', cantidad: 0, kilo: 0, cantidad_asignada: 0, estado: 'Inactiva' }
];
// --- FIN DE DATOS DE PRUEBA ---


router.get('/pecheras', (req, res) => {
    console.log('API SIMULADA: GET /pecheras');
    res.json(mockPecheras);
});


router.get('/pecherasexcel', (req, res) => {
    console.log('API SIMULADA: GET /pecherasexcel');
    res.json(mockPecheras);
});


router.post('/login', (req, res) => {
    const { correo } = req.body;
    console.log(`API SIMULADA: POST /login para ${correo}`);

    // Simula un usuario que coincide
    const user = mockUsuarios.find(u => u.correo === correo);

    if (user) {
        res.json({
            success: true,
            user: {
                correo: user.correo,
                nombre_completo: user.nombre_completo
            }
        });
    } else {
        // Simula credenciales incorrectas
        res.json({ success: false, message: 'Credenciales incorrectas (simulado)' });
    }
});

router.get('/Usuarios', (req, res) => {
    console.log('API SIMULADA: GET /Usuarios');
    res.json(mockUsuarios);
});


router.get('/pecheraidlavado', (req, res) => {
    const { id_pechera_registro } = req.query;
    console.log(`API SIMULADA: GET /pecheraidlavado para ${id_pechera_registro}`);
    res.json([
        { id_pechera_registro: id_pechera_registro, Fecha_lavado: '2024-05-01T10:00:00Z' },
        { id_pechera_registro: id_pechera_registro, Fecha_lavado: '2024-05-10T11:00:00Z' }
    ]);
});



router.route('/centrodetrabajo')
    .get((req, res) => {
        console.log('API SIMULADA: GET /centrodetrabajo');
        res.json(mockPlantas.filter(p => p.nombre_planta !== 'DeLaCruz Lavandería'));
    });


router.get('/pecherasleer/:uid', (req, res) => {
    const uid = req.params.uid;
    console.log(`API SIMULADA: GET /pecherasleer/${uid}`);
    const pechera = mockPecheras.find(p => p.id_pechera_registro === uid);
    
    if (pechera) {
        res.json(pechera);
    } else {
        res.status(404).json({ error: `Pechera con UID ${uid} no encontrada (simulado)` });
    }
});


router.get('/cantidadpecheras', (req, res) => {
    console.log('API SIMULADA: GET /cantidadpecheras');
    res.json(150); // Devuelve un número
});

router.get('/cantidadlavados', (req, res) => {
    console.log('API SIMULADA: GET /cantidadlavados');
    res.json(320); // Devuelve un número
});

router.get('/cantidadpecherasxplanta', (req, res) => {
    console.log('API SIMULADA: GET /cantidadpecherasxplanta');
    res.json({ cantidadpecherasxplanta: 50 }); // Devuelve un objeto
});


router.get('/cantidadlavadosxplanta', (req, res) => {
    console.log('API SIMULADA: GET /cantidadlavadosxplanta');
    res.json({ cantidadlavadosxplanta: 120 }); // Devuelve un objeto
});

router.get('/fechapecheras', (req, res) => {
    console.log('API SIMULADA: GET /fechapecheras');
    res.json([
        { cantidad: 10, mes: 'January' },
        { cantidad: 20, mes: 'February' },
        { cantidad: 15, mes: 'March' }
    ]);
});

router.get('/pecherasxmes', (req, res) => {
    console.log('API SIMULADA: GET /pecherasxmes');
    res.json([
        { mes_num: 1, mes: 'January', ano: 2024, cantidad: 30 },
        { mes_num: 2, mes: 'February', ano: 2024, cantidad: 45 },
        { mes_num: 3, mes: 'March', ano: 2024, cantidad: 50 }
    ]);
});


router.get('/cantidadpecherasmes', (req, res) => {
    console.log('API SIMULADA: GET /cantidadpecherasmes');
    res.json(25); // Devuelve un número
});


router.get('/cantidadpecherasmesxplanta', (req, res) => {
    console.log('API SIMULADA: GET /cantidadpecherasmesxplanta');
    res.json({ cantidadpecherasmesxplanta: 10 });
});


router.get('/pecherasdisponibles', (req, res) => {
    console.log('API SIMULADA: GET /pecherasdisponibles');
    res.json(30); // Devuelve un número
});


router.get('/pecherashistorial', (req, res) => {
    console.log('API SIMULADA: GET /pecherashistorial');
    res.json(5); // Devuelve un número
});


router.get('/pecherashistorialxplanta', (req, res) => {
    console.log('API SIMULADA: GET /pecherashistorialxplanta');
    res.json({ pecherashistorialxplanta: 2 });
});

router.get('/pecheraenuso', (req, res) => {
    console.log('API SIMULADA: GET /pecheraenuso');
    res.json(120); // Devuelve un número
});


router.post('/registrousuarios', (req, res) => {
    console.log('API SIMULADA: POST /registrousuarios', req.body);
    res.status(200).send('Registro exitoso (simulado)');
});

router.post('/registroempresa', (req, res) => {
    console.log('API SIMULADA: POST /registroempresa', req.body);
    res.status(200).send('Registro exitoso (simulado)');
});

router.post('/registrolavado', (req, res) => {
    console.log('API SIMULADA: POST /registrolavado', req.body);
    res.status(200).send('Registro de lavado exitoso (simulado)');
});

router.post('/registropecheras', async (req, res) => {
    const { uids } = req.body;
    console.log('API SIMULADA: POST /registropecheras', uids);

    // Simula que un UID ya existe
    if (uids && uids.includes('UID-111')) {
        return res.status(400).send(`El UID UID-111 ya está registrado (simulado).`);
    }

    res.status(200).send('Registro exitoso (simulado)');
});

router.delete('/eliminarusuarios/:id', (req, res) => {
    const { id } = req.params;
    console.log(`API SIMULADA: DELETE /eliminarusuarios/${id}`);
    res.json({ message: 'Usuario eliminado correctamente (simulado)' });
});


router.delete('/estadoempresa/:id', (req, res) => {
    const { id } = req.params;
    console.log(`API SIMULADA: DELETE /estadoempresa/${id}`);
    res.json({ message: 'El centro de trabajo fue eliminado correctamente (simulado)' });
});


router.delete('/eliminarpechera/:id', (req, res) => {
    const { id } = req.params;
    console.log(`API SIMULADA: DELETE /eliminarpechera/${id}`);
    res.json({ message: 'Pechera eliminada correctamente (simulado)' });
});


router.delete('/eliminarpecherasmulti', (req, res) => {
    console.log('API SIMULADA: DELETE /eliminarpecherasmulti', req.body);
    res.json({ message: 'Pecheras eliminadas correctamente (simulado)' });
});

router.put('/actualizarempresa', (req, res) => {
    console.log('API SIMULADA: PUT /actualizarempresa', req.body);
    res.json({ message: 'Planta actualizada correctamente (simulado)' });
});

router.get('/centrodetrabajoid', (req, res) => {
    const { id_planta } = req.query;
    console.log(`API SIMULADA: GET /centrodetrabajoid?id_planta=${id_planta}`);
    const planta = mockPlantas.find(p => p.id_planta == id_planta);
    res.json(planta || mockPlantas[0]);
});

router.get('/usuarioid', (req, res) => {
    const { id_login } = req.query;
    console.log(`API SIMULADA: GET /usuarioid?id_login=${id_login}`);
    const user = mockUsuarios.find(u => u.id_login == id_login);
    res.json(user || mockUsuarios[0]);
});

router.put('/modificarusuario/:id_login', (req, res) => {
    const { id_login } = req.params;
    console.log(`API SIMULADA: PUT /modificarusuario/${id_login}`, req.body);
    res.json({ message: 'Usuario actualizado correctamente (simulado)' });
});

router.get('/pecheraid', (req, res) => {
    const { id_pechera_registro } = req.query;
    console.log(`API SIMULADA: GET /pecheraid?id_pechera_registro=${id_pechera_registro}`);
    const pechera = mockPecheras.find(p => p.id_pechera_registro === id_pechera_registro);
    res.json(pechera || mockPecheras[0]);
});

router.put('/modificarpecheras/:id_pechera_registro', (req, res) => {
    const { id_pechera_registro } = req.params;
    console.log(`API SIMULADA: PUT /modificarpecheras/${id_pechera_registro}`, req.body);
    res.json({ message: 'Pechera actualizada correctamente (simulado)' });
});


// Ruta duplicada /pecherasleer/:uid ya está definida arriba, no es necesario repetirla.


router.put('/pecherasupdate', (req, res) => {
    console.log('API SIMULADA: PUT /pecherasupdate', req.body);
    const { cantidad } = req.body;
    res.json({ message: 'Pecheras actualizadas correctamente (simulado)', affectedRows: cantidad });
});


router.get('/pecherassinplanta', (req, res) => {
    console.log('API SIMULADA: GET /pecherassinplanta');
    res.json(mockPecheras.filter(p => p.nombre_planta === null));
});

router.get('/Lavados', (req, res) => {
    console.log('API SIMULADA: GET /Lavados', req.query);
    res.json([
        { id_lavado: 1, id_pechera_registro: 'UID-111', Fecha_lavado: '2024-05-10T11:00:00Z' },
        { id_lavado: 2, id_pechera_registro: 'UID-222', Fecha_lavado: '2024-05-11T12:00:00Z' }
    ]);
});


router.put('/modificarplantapechera', (req, res) => {
    console.log('API SIMULADA: PUT /modificarplantapechera', req.body);
    res.status(200).json({ message: 'id_planta actualizado correctamente (simulado)' });
});



module.exports = router;