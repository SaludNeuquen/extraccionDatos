import {importarDatos} from './importarDatos'
import * as config from './config';


var impDatos = new importarDatos();

var efector = "SIPS";
var inicio = 1;
var fin = 1500000;
var usuario = config.user;
var pass = config.password;
var server;
var db;
var consulta;


//Se definenen los parametros de conexión para cada tipo de base 
switch (efector) {
    case ("SIPS"):
        server = config.serverSql;
        db = config.databaseSql;
        consulta = config.consultaPaciente;
        break;

    case ("Heller"):
        server = config.serverSql2;
        db = config.dbMigracion;
        consulta = config.consultaPacienteHeller;
        break;

    case ("HPN"):
        server = config.serverSql2;
        db = config.dbMigracion;
        consulta = config.consultaPacienteHC;

        break;

}

//Se importan los datos desde SQL a un archivo json,
//Luego con mongoimport se pueden insertar los datos a la bd de Mongo
impDatos.importarRegistros(efector, inicio, fin, usuario, pass,
    server, db, consulta,  '/media/nhuenchuman/Datos/pacientes.json')
    .then((resultado) => {
        if (resultado == null) {
            console.log('No encontrado');
        } else {
            console.log('Se importaron los datos a la coleccion');
        }
    })

    .catch((err) => {
        console.error('Error**:' + err)
    });
