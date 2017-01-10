import * as sql from 'mssql';
import {libString} from './libString'


export class servicioMssql {

    obtenerConexion(usuario, password, server, db) {
        let connection = {
            user: usuario,
            password: password,
            server: server,
            database: db,
            stream: true,
        };
        return connection;

    }

    obtenerDatosSql(inicio: number, fin: number, usuario, password, server, db, consulta) {
        var connection = {
            user: usuario,
            password: password,
            server: server,
            database: db,
            //connectionTimeout: config.connectionTimeout,
            requestTimeout: 190000,
            stream: true,
        };
        var listaRegistros = [];
        console.log("Conexion", connection);

        return new Promise((resolve, reject) => {
            sql.connect(connection, function(err) {
                if (err) {
                    console.log("Error de Conexión", err);
                    reject(err);
                }

                var request = new sql.Request();
                request.stream = true;
                request.input('inicio', sql.VarChar(20), inicio.toString());
                request.input('fin', sql.VarChar(20), fin.toString());
                request.query(consulta);
                // Puede ser una consulta a una vista que tenga toda la información

                request.on('row', function(row) {
                    // Emitted for each row in a recordset
                    listaRegistros.push(row);
                });

                request.on('error', function(err) {
                    // May be emitted multiple times
                });

                request.on('done', function(affected) {
                    // Always emitted as the last one
                    console.log(listaRegistros.length);
                    sql.close();
                    resolve(listaRegistros);
                });

            })
            sql.on('error', function(err) {
                console.log("Error de conexión", err);
                reject(err);
            })
        })  //Fin Promise

    }

    obtenerFecha(fechaStr) {
        let numbers = fechaStr.match(/\d+/g);
        let date = new Date(numbers[2], numbers[1] - 1, numbers[0]);
        return date;

    }
}
