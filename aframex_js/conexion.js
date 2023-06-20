//configurar con express el servidor de la app

const express = require('express');
const mysql = require('mysql');

const app = express();


app.set('port', 3000);
app.listen(app.get('port'), function() {
    console.log("Servidor Express escuchando en el puerto " + app.get('port'));
});

//Llamar al componente de mysql


//Establecer los parametros de la conexion
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'aframexdb'
});

//abrir conexion con la base de datos
//connection.connect();


//connection.end();

//Exportar
module.exports = {connection}

/*
//Agregar un nuevo registro
connection.query('INSERT INTO cliente VALUES (1, "Erna", 2, 1234567890, "10001 Main St.")',
function(error, resultados){
    if(error) throw error;
    console.log(resultados);
    
});

//Realizar la consulta a la tabla
connection.query('SELECT * FROM cliente',
function(error, resultados){
    if(error) throw error;
    console.log(resultados); 
});


//Realizar la modificacion de registro
connection.query('UPDATE cliente SET genero = 0, telefono = 89483723833 WHERE idCliente = 1',
function(error, resultados){
    if(error) throw error;
    console.log(resultados);  
});

//Realizar la consulta a la tabla
connection.query('SELECT * FROM cliente',
function(error, resultados){
    if(error) throw error;
    console.log(resultados); 
});


//Eliminar un registro
connection.query('DELETE  FROM cliente WHERE idCliente =1',
function(error, resultados){
    if(error) throw error;
    console.log(resultados);
});

//Realizar la consulta a la tabla
connection.query('SELECT * FROM cliente',
function(error, resultados){
    if(error) throw error;
    console.log(resultados); 
});





//cerrar la conexion
connection.end();

*/


