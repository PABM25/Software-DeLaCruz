// const mysql = require('mysql2');
// require('dotenv').config(); // Asegúrate de que dotenv está importado

/*
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

conexion.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos');
});
*/

// Exportamos un objeto vacío para que las importaciones no fallen
export default {};