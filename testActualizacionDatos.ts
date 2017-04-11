import {actualizarDatos} from './actualizarDatos';
import {libString} from './libString';
import { servicioMongo } from './servicioMongo';
import {servicioMssql} from './servicioMssql'
import {servicioSips} from './servicioSips';
import * as config from './config';

var servMongo = new servicioMongo();
var actualizarDir = new actualizarDatos();

//Paso2: Se actualizan las ubicaciones
let coleccion = "pacienteHeller"
servMongo.obtenerPacientes({}, coleccion)
    .then((resultado) => {
        if (resultado == null) {
            console.log('No encontrado');
        } else {
            console.log('Total', resultado.length);
            var lista = resultado;
            actualizarDir.actualizarUbicaciones(lista, "pacienteHeller");
            actualizarRelacionesSips();
        }
    })
    .catch((err) => {
        console.error('Error**:' + err)
    });


// Paso 3: Se actualizan las relaciones
function actualizarRelacionesSips() {
    var servicioSql = new servicioMssql();
    var usuario = config.user;
    var pass = config.password;
    var server = config.serverSql;
    var db = config.databaseSql;
    var consulta = config.consultaRelaciones;
    console.log(server, db, usuario, pass);
    servicioSql.obtenerDatosSql2(usuario, pass, server, db, consulta)
        .then((resultado) => {
            if (resultado == null) {
                console.log('No encontrado');
            } else {
                let listaRelaciones = resultado;
                let servSips = new servicioSips();
                let lista = servSips.actualizarRelaciones(listaRelaciones);
                servMongo.actualizarDatos("pacienteSips", lista)
                    .then((res) => {
                        console.log('Datos Actualizados');
                    })
                    .catch((err) => {
                        console.error('Error*:' + err);
                    });
            }
        })
        .catch((err) => {
            console.error('Error**:' + err);
        });
}
