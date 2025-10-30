/**
 * Copyright (c) [2024] [Pilar Bonnault Mancilla, Nicolás González Espinoza y Christofer Ruiz Almonacid]
 * Licensed under the MIT License.
 * See LICENSE file in the root directory.
 */


const express = require('express');
const router = express.Router();
const conexion = require('../config/db');

router.get('/pecheras', (req, res) => {
    const { Talla } = req.query;  // Mantén 'Talla' en mayúsculas
     

    
    let sqlQuery = `SELECT p.id_pechera_registro, p.fecha_registro, p.Talla, l.Fecha_lavado AS "ultimolavado", COALESCE(lavado_count.NumeroLavados, 0) AS Cantidad_Lavados, c.nombre_planta, p.Parametros, p.Observaciones, p.Índice_Microbiológico FROM pechera p LEFT JOIN planta c ON p.id_planta = c.id_planta LEFT JOIN (SELECT id_pechera_registro, MAX(Fecha_lavado) AS Fecha_lavado FROM lavado GROUP BY id_pechera_registro) l ON p.id_pechera_registro = l.id_pechera_registro LEFT JOIN (SELECT id_pechera_registro, COUNT(*) AS NumeroLavados FROM lavado GROUP BY id_pechera_registro) lavado_count ON p.id_pechera_registro = lavado_count.id_pechera_registro ORDER BY p.id_pechera_registro;`;

    // Si se especifica una talla, agregamos la cláusula WHERE
    if (Talla) {
        sqlQuery += ` WHERE p.Talla = ${conexion.escape(Talla)}`;  // Protegemos la consulta con escape
    }

    conexion.query(sqlQuery, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});


router.get('/pecherasexcel', (req, res) => {
    const { Talla } = req.query;  // Mantén 'Talla' en mayúsculas
    console.log('Talla recibida:', Talla);  // Verifica que se recibe correctamente

    
    let sqlQuery = `SELECT p.id_pechera_registro,n.Fecha_lavado, p.fecha_registro, p.Talla, l.Fecha_lavado AS "ultimolavado", COALESCE(lavado_count.NumeroLavados, 0) AS Cantidad_Lavados, c.nombre_planta, p.Parametros, p.Observaciones, p.Índice_Microbiológico FROM pechera p LEFT JOIN planta c ON p.id_planta = c.id_planta LEFT JOIN (SELECT id_pechera_registro, MAX(Fecha_lavado) AS Fecha_lavado FROM lavado GROUP BY id_pechera_registro) l ON p.id_pechera_registro = l.id_pechera_registro inner join lavado n on(n.id_pechera_registro=p.id_pechera_registro) LEFT JOIN (SELECT id_pechera_registro, COUNT(*) AS NumeroLavados FROM lavado GROUP BY id_pechera_registro) lavado_count ON p.id_pechera_registro = lavado_count.id_pechera_registro ORDER BY p.id_pechera_registro;`;

    // Si se especifica una talla, agregamos la cláusula WHERE
    if (Talla) {
        sqlQuery += ` WHERE p.Talla = ${conexion.escape(Talla)}`;  // Protegemos la consulta con escape
    }

    conexion.query(sqlQuery, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});


router.post('/login', (req, res) => {
    const { correo, contraseña } = req.body;
    
    // Compara el correo y la contraseña hasheada en la consulta SQL
    conexion.query(
        `SELECT * FROM login WHERE correo = ? AND contraseña = SHA2(?, 256)`, 
        [correo, contraseña], 
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results.length > 0) {
                res.json({ success: true, user: results[0] });
            } else {
                res.json({ success: false, message: 'Credenciales incorrectas' });
            }
        }
    );
});

router.get('/Usuarios', (req, res) => {
    conexion.query(`SELECT l.id_login, l.nombre_completo, l.correo, l.contraseña, c.nombre_planta,
                           CASE WHEN c.estado = true THEN 'Activa' ELSE 'Inactiva' END AS estado
                    FROM login l 
                    LEFT JOIN planta c ON (l.id_planta = c.id_planta)`, 
    (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});
 

router.get('/pecheraidlavado', (req, res) => {
    const { id_pechera_registro } = req.query;  

    if (!id_pechera_registro) {
        return res.status(400).json({ error: 'El id_pechera_registro es requerido' });
    }

    conexion.query(`select p.id_pechera_registro ,l.Fecha_lavado from pechera p inner join lavado l on(l.id_pechera_registro=p.id_pechera_registro) where p.id_pechera_registro= ?`, [id_pechera_registro], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);  // Cambié results[0] por results para devolver todos los lavados
    });
});



router.route('/centrodetrabajo')
    .get((req, res) => {
        const query = `
            SELECT id_planta, nombre_planta, cantidad, kilo, cantidad_asignada, 
                CASE WHEN estado = true THEN 'Activa' ELSE 'Inactiva' END AS estado 
            FROM planta 
            WHERE nombre_planta != 'DeLaCruz Lavandería'
        `;

        conexion.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.json(results);
        });
    });
    

 

router.get('/pecherasleer/:uid', (req, res) => {
    const uid = req.params.uid;
    conexion.query(
        'SELECT p.id_pechera_registro, p.Talla, COALESCE(lavado_count.NumeroLavados, 0) AS Cantidad_Lavados, c.nombre_planta, p.Observaciones FROM pechera p LEFT JOIN planta c ON p.id_planta = c.id_planta LEFT JOIN (SELECT id_pechera_registro, MAX(Fecha_lavado) AS Fecha_lavado FROM lavado GROUP BY id_pechera_registro) l ON p.id_pechera_registro = l.id_pechera_registro LEFT JOIN (SELECT id_pechera_registro, COUNT(*) AS NumeroLavados FROM lavado GROUP BY id_pechera_registro) lavado_count ON p.id_pechera_registro = lavado_count.id_pechera_registro where p.id_pechera_registro = ? ORDER BY p.id_pechera_registro ',
        [uid],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: `Pechera con UID ${uid} no encontrada` });
            }
            res.json(results[0]); // Debería devolver un solo objeto
        }
    );
});




 
router.get('/cantidadpecheras', (req, res) => {
    conexion.query('SELECT  (SELECT COUNT(*) FROM pechera) + (SELECT COUNT(*) FROM historial) AS cantidad;', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const cantidad = results[0].cantidad; // Extrae la cantidad
        res.json(cantidad); // Devuelve solo el valor numérico
    });
});

router.get('/cantidadlavados', (req, res) => {
    conexion.query('SELECT count(id_pechera_registro) AS cantidadlavados FROM lavado;', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const cantidadlavados = results[0].cantidadlavados; // Extrae la cantidad
        res.json(cantidadlavados); // Devuelve solo el valor numérico
    });
});

router.get('/cantidadpecherasxplanta', (req, res) => {
    const { nombre_planta } = req.query;
    conexion.query('SELECT  count(id_pechera_registro) as cantidadpecherasxplanta FROM pechera p left join planta t on(p.id_planta = t.id_planta) where t.nombre_planta = ? ;', 
    [nombre_planta], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const cantidadpecherasxplanta = results[0].cantidadpecherasxplanta  ; // Extrae la cantidad
        res.json({ cantidadpecherasxplanta }); // Devuelve un objeto JSON
    });
});
 


router.get('/cantidadlavadosxplanta', (req, res) => {
    const { nombre_planta } = req.query;
    conexion.query('SELECT COUNT(Fecha_lavado) AS cantidadlavadosxplanta FROM lavado l left join pechera p on(p.id_pechera_registro = l.id_pechera_registro) left join planta t on(p.id_planta = t.id_planta) where t.nombre_planta = ?;', 
    [nombre_planta], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const cantidadlavadosxplanta = results[0].cantidadlavadosxplanta  ;
        res.json({ cantidadlavadosxplanta });
    });
});

router.get('/fechapecheras', (req, res) => {
    conexion.query('SELECT COUNT(id_pechera_registro) AS cantidad,MONTHNAME(fecha_registro) AS mes FROM pechera GROUP BY MONTHNAME(fecha_registro) ORDER BY MONTHNAME(fecha_registro);', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
         
        res.json(results); // Devuelve solo el valor numérico
    });
});

router.get('/pecherasxmes', (req, res) => {
    const { ano } = req.query;
    const sql = `
        SELECT 
    mes_num,
    mes,
    ano,
    SUM(cantidad) AS cantidad
FROM (
    SELECT 
        MONTH(fecha_registro) AS mes_num, 
        MONTHNAME(fecha_registro) AS mes, 
        YEAR(fecha_registro) AS ano, 
        COUNT(id_pechera_registro) AS cantidad
    FROM historial
      
    GROUP BY ano, mes_num, mes

    UNION ALL

    SELECT 
        MONTH(fecha_registro) AS mes_num, 
        MONTHNAME(fecha_registro) AS mes, 
        YEAR(fecha_registro) AS ano, 
        COUNT(id_pechera_registro) AS cantidad
    FROM pechera
     
    GROUP BY ano, mes_num, mes
) AS union_consultas
WHERE ano = ?
GROUP BY ano, mes_num, mes
ORDER BY ano, mes_num;`

    conexion.query(sql, [ano], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
        
    });
     
});


router.get('/cantidadpecherasmes', (req, res) => {
     
    conexion.query('SELECT (SELECT COUNT(*) FROM pechera where EXTRACT(MONTH FROM fecha_registro) = EXTRACT(MONTH FROM sysdate()) and YEAR(fecha_registro) = EXTRACT(Year FROM sysdate())) + (SELECT COUNT(*) FROM historial where EXTRACT(MONTH FROM fecha_registro)  = EXTRACT(MONTH FROM sysdate())and YEAR(fecha_registro) = EXTRACT(Year FROM sysdate())) AS mes', 
      (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const mes = results[0].mes; // Extrae la cantidad
        res.json(mes); // Devuelve solo el valor numérico
         
    });
});


router.get('/cantidadpecherasmesxplanta', (req, res) => {
    const { nombre_planta } = req.query;
    conexion.query('SELECT  count(id_pechera_registro) as cantidadpecherasmesxplanta FROM pechera p left join planta t on(p.id_planta = t.id_planta) where t.nombre_planta = ?;', 
    [nombre_planta], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const cantidadpecherasmesxplanta = results[0].cantidadpecherasmesxplanta  ;
        res.json({ cantidadpecherasmesxplanta });
    });
});


router.get('/pecherasdisponibles', (req, res) => {
    conexion.query('SELECT count(fecha_registro) as pecherasdisponibles FROM  pechera where id_planta  is NULL;', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const pecherasdisponibles = results[0].pecherasdisponibles; // Extrae la cantidad
        res.json(pecherasdisponibles); // Devuelve solo el valor numérico
    });
});


router.get('/pecherashistorial', (req, res) => {
    conexion.query('SELECT count(h.fecha_registro) as pecherashistorial FROM  historial h left join pechera p on(h.id_pechera_registro = p.id_pechera_registro);', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const pecherashistorial = results[0].pecherashistorial; // Extrae la cantidad
        res.json(pecherashistorial); // Devuelve solo el valor numérico
    });
});


router.get('/pecherashistorialxplanta', (req, res) => {
    const { nombre_planta } = req.query;
    conexion.query(`SELECT count(p.fecha_registro) as pecherashistorialxplanta FROM historial h left join pechera p on(h.id_pechera_registro = p.id_pechera_registro) left join planta t on(h.id_planta = t.id_planta) where t.nombre_planta = ?;`, 
    [nombre_planta], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const pecherashistorialxplanta = results[0].pecherashistorialxplanta ;
        res.json({ pecherashistorialxplanta });
    });
});

router.get('/pecheraenuso', (req, res) => {
    conexion.query('SELECT count(fecha_registro) AS pecheraenuso FROM  pechera p inner join planta c on (p.id_planta = c.id_planta) where nombre_planta  is  NOT NULL ;', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const pecheraenuso = results[0].pecheraenuso; // Extrae la cantidad
        res.json(pecheraenuso); // Devuelve solo el valor numérico
    });
});


router.post('/registrousuarios', (req, res) => {
    const { nombre_completo, correo, contraseña, id_planta } = req.body;
    const sql = 'insert into login (nombre_completo, correo, contraseña, id_planta) values (?, ?, SHA2(?, 256), ?);';
    conexion.query(sql, [nombre_completo, correo, contraseña, id_planta], (err, result) => {
        if (err) {
            console.error('Error al insertar los datos:', err);
            res.status(500).send('Error al registrar el usuario');
            return;
        }
        res.status(200).send('Registro exitoso');
    });
});

router.post('/registroempresa', (req, res) => {
    const { nombre_planta,cantidad_asignada, kilos } = req.body;
    const sql = 'INSERT INTO planta (nombre_planta,cantidad_asignada, kilo) VALUES (?, ?, ?)';
    conexion.query(sql, [nombre_planta, cantidad_asignada, kilos], (err, result) => {
        if (err) {
            console.error('Error al insertar los datos:', err);
            res.status(500).send('Error al registrar la planta');
            return;
        }
        res.status(200).send('Registro exitoso');
    });
});

router.post('/registrolavado', (req, res) => {
    const { ids } = req.body;

    // Actualizar observaciones en la tabla `pechera`
    const updateObservationsPromises = ids.map(({ id_pechera_registro, Observaciones }) => {
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE pechera SET Observaciones = ? WHERE id_pechera_registro = ?';
            conexion.query(sqlUpdate, [Observaciones, id_pechera_registro], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });

    // Luego de actualizar las observaciones, registrar el lavado y actualizar la cantidad de lavados
    Promise.all(updateObservationsPromises)
        .then(() => {
            const insertLavadoPromises = ids.map(({ id_pechera_registro }) => {
                return new Promise((resolve, reject) => {
                    // Insertar un nuevo registro en la tabla `lavado`
                    const sqlInsertLavado = 'INSERT INTO lavado (id_pechera_registro) VALUES (?)';
                    conexion.query(sqlInsertLavado, [id_pechera_registro], (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        // Incrementar la cantidad de lavados en la tabla `pechera`
                        const sqlIncrement = 'UPDATE pechera SET Cantidad_Lavados = Cantidad_Lavados + 1 WHERE id_pechera_registro = ?';
                        conexion.query(sqlIncrement, [id_pechera_registro], (err) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                });
            });

            return Promise.all(insertLavadoPromises);
        })
        .then(() => {
            res.status(200).send('Registro de lavado exitoso');
        })
        .catch(err => {
            console.error('Error al procesar el registro de lavado:', err);
            res.status(500).send('Error al procesar el registro de lavado');
        });
});

router.post('/registropecheras', async (req, res) => {
    const { uids, talla, id_planta } = req.body;

    if (!uids || uids.length === 0) {
        return res.status(400).send('No se recibieron UIDs.');
    }

    try {
        for (const uid of uids) {
            // Evitar guardar el mensaje "Escanea una tarjeta RFID"
            if (uid === 'Escanea una tarjeta RFID') {
                console.log('UID ignorado: "Escanea una tarjeta RFID"');
                continue; // Ignorar este UID y continuar con los demás
            }

           // Verificar si el UID ya existe
            const checkSql = 'SELECT COUNT(*) AS count FROM pechera WHERE id_pechera_registro = ?';
            const [result] = await new Promise((resolve, reject) => {
                conexion.query(checkSql, [uid], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });   

            const count = result.count;

            if (count > 0) {
                // Si el UID ya existe, devolver un error con el UID específico
                return res.status(400).send(`El UID ${uid} ya está registrado.`);
            } else {
                // Si no existe, insertar el nuevo UID, permitiendo que id_planta sea NULL
                const insertSql = 'INSERT INTO pechera (id_pechera_registro, talla, id_planta) VALUES (?, ?, ?)';
                await new Promise((resolve, reject) => {
                    conexion.query(insertSql, [uid, talla, id_planta || null], (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            }
        }

        res.status(200).send('Registro exitoso');
    } catch (error) {
        console.error('Error al procesar los UIDs:', error);
        res.status(500).send('Error al registrar las pecheras.');
    }
});

router.delete('/eliminarusuarios/:id', (req, res) => {
    const { id } = req.params;  // Captura el id desde la URL

    conexion.query('DELETE FROM login WHERE id_login = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.affectedRows > 0) {
            res.json({ message: 'Usuario eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    });
});


router.delete('/estadoempresa/:id', (req, res) => {
    const { id } = req.params;   

    conexion.query('update planta set estado = 0   where id_planta = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.affectedRows > 0) {
            res.json({ message: 'El centro de trabajo fue  eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'centro de trabajo no encontrado' });
        }
    });
});


router.delete('/eliminarpechera/:id', (req, res) => {
    const { id } = req.params;
    console.log('ID recibido para eliminación:', id);  // Verifica el valor del ID

    // Primero, obtenemos el id_planta asociado a la pechera que se va a eliminar
    const getPlantaSql = 'SELECT id_planta FROM pechera WHERE id_pechera_registro = ?';
    conexion.query(getPlantaSql, [id], (error, results) => {
        if (error) {
            console.error('Error al obtener la planta asociada a la pechera:', error);
            return res.status(500).json({ error: error.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Pechera no encontrada' });
        }

        const idPlanta = results[0].id_planta;

        // Procedemos a eliminar la pechera
        const deleteSql = 'DELETE FROM pechera WHERE id_pechera_registro = ?';
        conexion.query(deleteSql, [id], (error, results) => {
            if (error) {
                console.error('Error al eliminar pechera:', error);  // Muestra el error en el backend
                return res.status(500).json({ error: error.message });
            }

            else {
                res.status(404).json({ message: 'Pechera no encontrada' });
            }
        });
    });
});


router.delete('/eliminarpecherasmulti', (req, res) => {
    const { ids } = req.body;  // Recibe un array de IDs de las pecheras que se quieren eliminar

    if (!ids || ids.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron pecheras para eliminar' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const deleteSql = `DELETE FROM pechera WHERE id_pechera_registro IN (${placeholders})`;

    conexion.query(deleteSql, ids, (error, results) => {
        if (error) {
            console.error('Error al eliminar pecheras:', error);
            return res.status(500).json({ error: error.message });
        }

        if (results.affectedRows > 0) {
            res.json({ message: 'Pecheras eliminadas correctamente' });
        } else {
            res.status(404).json({ message: 'No se encontraron las pecheras' });
        }
    });
});

router.put('/actualizarempresa', (req, res) => {
    const { nombre_planta, cantidad_asignada, kilo, estado, id_planta } = req.body;
    const estadoBoolean = estado === 'Activa' ? 1 : 0;

    console.log('Datos recibidos:', { nombre_planta, cantidad_asignada, kilo, estado, estadoBoolean, id_planta }); // Imprime los datos recibidos

    const sql = 'UPDATE planta SET nombre_planta = ?,cantidad_asignada = ?, kilo = ?, estado = ? WHERE id_planta = ?';
    conexion.query(sql, [nombre_planta, cantidad_asignada, kilo, estadoBoolean, id_planta], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Planta no encontrada' });
        }

        res.json({ message: 'Planta actualizada correctamente' });
    });
});

router.get('/centrodetrabajoid', (req, res) => {
    const { id_planta } = req.query;  

    if (!id_planta) {
        return res.status(400).json({ error: 'El id_planta es requerido' });
    }

    conexion.query(`SELECT id_planta, nombre_planta, cantidad_asignada, kilo, 
        CASE WHEN estado = 1 THEN 'Activa' ELSE 'Inactiva' END AS estado 
        FROM planta  WHERE id_planta = ?`, [id_planta], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results[0]);  
    });
});

router.get('/usuarioid', (req, res) => {
    const { id_login } = req.query;  

    if (!id_login) {
        return res.status(400).json({ error: 'El id_login es requerido' });
    }

    conexion.query('SELECT * FROM login WHERE id_login = ?', [id_login], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results[0]);  
    });
});

router.put('/modificarusuario/:id_login', (req, res) => {
    const { id_login } = req.params;  
    const { nombre_completo, correo, contraseña,id_planta } = req.body;  

     
    if (!nombre_completo || !correo || !contraseña || !id_planta) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const sql = 'UPDATE login SET nombre_completo = ?, correo = ?, contraseña = ?, id_planta = ? WHERE id_login = ?';
    conexion.query(sql, [nombre_completo, correo, contraseña, id_planta,id_login], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado correctamente' });
    });
});

router.get('/pecheraid', (req, res) => {
    const { id_pechera_registro } = req.query;  

    if (!id_pechera_registro) {
        return res.status(400).json({ error: 'El id_pechera_registro es requerido' });
    }

    conexion.query(`SELECT p.id_pechera_registro, p.fecha_registro, p.Talla, l.Fecha_lavado AS "ultimolavado", COALESCE(lavado_count.NumeroLavados, 0) AS Cantidad_Lavados, c.nombre_planta, p.Parametros, p.Observaciones, p.Índice_Microbiológico FROM pechera p  LEFT JOIN planta c ON p.id_planta = c.id_planta LEFT JOIN (SELECT id_pechera_registro, MAX(Fecha_lavado) AS Fecha_lavado FROM lavado GROUP BY id_pechera_registro) l ON p.id_pechera_registro = l.id_pechera_registro LEFT JOIN (SELECT id_pechera_registro, COUNT(*) AS NumeroLavados FROM lavado GROUP BY id_pechera_registro) lavado_count ON p.id_pechera_registro = lavado_count.id_pechera_registro where p.id_pechera_registro= ? ORDER BY p.id_pechera_registro;`, [id_pechera_registro], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results[0] || {});  // Devuelve un objeto vacío si no se encuentra la pechera
    });
});

router.put('/modificarpecheras/:id_pechera_registro', (req, res) => {
    const { id_pechera_registro } = req.params;
    const { id_planta, Cantidad_Lavados, Talla, Parametros, Observaciones, Índice_Microbiológico } = req.body;

    let fieldsToUpdate = [];
    let values = [];

    if (id_planta !== undefined) {
        fieldsToUpdate.push("id_planta = ?");
        values.push(id_planta === null ? null : id_planta); // Permitir null para id_planta
    }
    if (Cantidad_Lavados !== undefined) {
        fieldsToUpdate.push("Cantidad_Lavados = ?");
        values.push(Cantidad_Lavados);
    }
    if (Talla !== undefined) {
        fieldsToUpdate.push("Talla = ?");
        values.push(Talla);
    }
    if (Parametros !== undefined) {
        fieldsToUpdate.push("Parametros = ?");
        values.push(Parametros);
    }
    if (Observaciones !== undefined) {
        fieldsToUpdate.push("Observaciones = ?");
        values.push(Observaciones);
    }
    if (Índice_Microbiológico !== undefined) {
        fieldsToUpdate.push("Índice_Microbiológico = ?");
        values.push(Índice_Microbiológico);
    }
    

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    // Obtener el id_planta actual antes de la actualización
    const selectSql = 'SELECT id_planta FROM pechera WHERE id_pechera_registro = ?';
    conexion.query(selectSql, [id_pechera_registro], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Pechera no encontrada' });
        }

        const idPlantaAnterior = results[0].id_planta;

        // Actualizar la pechera
        const sql = `UPDATE pechera SET ${fieldsToUpdate.join(", ")} WHERE id_pechera_registro = ?`;
        values.push(id_pechera_registro);

        conexion.query(sql, values, (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Pechera no encontrada' });
            }

             
            
            res.json({ message: 'Pechera actualizada correctamente y cantidades modificadas' });
        });
    });
});



router.get('/pecherasleer/:uid', (req, res) => {
    const uid = req.params.uid;
    conexion.query(
        'SELECT p.id_pechera_registro, p.fecha_registro, p.Talla, p.Cantidad_Lavados, c.nombre_planta, p.Parametros, p.Observaciones, p.Índice_Microbiológico FROM pechera p LEFT JOIN planta c ON p.id_planta = c.id_planta WHERE p.id_pechera_registro = ?',
        [uid],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: `Pechera con UID ${uid} no encontrada` });
            }
            res.json(results[0]); // Debería devolver un solo objeto
        }
    );
});

router.put('/pecherasupdate', (req, res) => {
    const { talla, cantidad, id_planta } = req.body;

    // Verificar cuántas pecheras están disponibles para la talla especificada
    const queryCheckDisponibilidad = 
        `SELECT COUNT(*) AS disponible 
        FROM pechera 
        WHERE Talla = ? AND id_planta IS NULL;`;

    conexion.query(queryCheckDisponibilidad, [talla], (error, results) => {
        if (error) {
            console.error('Error verificando disponibilidad:', error);
            return res.status(500).json({ error: error.message });
        }

        const cantidadDisponible = results[0].disponible;

        if (cantidadDisponible < cantidad) {
            // No hay suficientes pecheras disponibles
            return res.status(400).json({ message: 'No hay suficientes pecheras disponibles.' });
        }

        // Si hay suficientes pecheras, procedemos con la distribución
        const queryUpdatePecheras = 
            `UPDATE pechera 
            SET id_planta = ? 
            WHERE Talla = ? 
            AND id_planta IS NULL
            LIMIT ?;`;

        conexion.query(queryUpdatePecheras, [id_planta, talla, cantidad], (error, updateResults) => {
            if (error) {
                console.error('Error en consulta de actualización de pecheras:', error);
                return res.status(500).json({ error: error.message });
            }

            if (updateResults.affectedRows === 0) {
                return res.status(404).json({ message: 'No se encontraron pecheras para actualizar.' });
            }

            console.log(`Actualizadas ${updateResults.affectedRows} pecheras de talla ${talla} a la planta ${id_planta}`);
            res.json({ message: 'Pecheras actualizadas correctamente', affectedRows: updateResults.affectedRows });
        });
    });
});


 

router.get('/pecherassinplanta', (req, res) => {
    const { Talla } = req.query;  // Mantén 'Talla' en mayúsculas
    console.log('Talla recibida:', Talla);  // Verifica que se recibe correctamente

    // Creamos una consulta base
    let sqlQuery = `
        SELECT p.id_pechera_registro, p.fecha_registro, p.Talla, p.Cantidad_Lavados, 
               c.nombre_planta, p.Parametros, p.Observaciones, p.Índice_Microbiológico 
        FROM pechera p 
        LEFT JOIN planta c ON p.id_planta = c.id_planta 
        WHERE p.id_planta IS NULL`;  // Aquí filtramos por id_planta NULL

    // Si se especifica una talla, agregamos la cláusula AND
    if (Talla) {
        sqlQuery += ` AND p.Talla = ${conexion.escape(Talla)}`;  // Asegúrate de usar AND
    }

    console.log('Consulta SQL:', sqlQuery);  // Log de consulta

    // Ejecutamos la consulta
    conexion.query(sqlQuery, (error, results) => {
        if (error) {
            console.error('Error al obtener pecheras:', error);  // Log de error
            return res.status(500).json({ error: error.message });
        }
        res.json(results);  // Enviamos los resultados como respuesta
    });
});

router.get('/Lavados', (req, res) => {
    let { startDate, endDate } = req.query;

    // Ajusta endDate para incluir el final del día
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);
    endDate = adjustedEndDate.toISOString().slice(0, 19).replace('T', ' ');

    const query = `
      SELECT * FROM lavado 
      WHERE Fecha_lavado BETWEEN ? AND ?`;

    conexion.query(query, [startDate, endDate], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});


router.put('/modificarplantapechera', (req, res) => {
    const { id_pechera_registro, id_planta } = req.body;

    // Verifica que id_pechera_registro sea un array válido
    if (!Array.isArray(id_pechera_registro) || id_pechera_registro.length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar un array de id_pechera_registro' });
    }

    // Crear placeholders para la consulta SQL
    const placeholders = id_pechera_registro.map(() => '?').join(', ');

    // Actualizar el id_planta en la tabla pechera
    const updateSql = `UPDATE pechera SET id_planta = ? WHERE id_pechera_registro IN (${placeholders})`;
    const updateValues = [id_planta, ...id_pechera_registro];

    // Ejecutar la consulta de actualización
    conexion.query(updateSql, updateValues, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Comprobar si se actualizó algún registro
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Pechera no encontrada' });
        }

        // Enviar respuesta exitosa
        res.status(200).json({ message: 'id_planta actualizado correctamente' });
    });
});



module.exports = router;