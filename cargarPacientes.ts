import {postPaciente} from './postPaciente';
import { servicioMongo } from './servicioMongo';
import * as mongodb from 'mongodb';
import * as config from './config';


var servicio = new postPaciente();
var servMongo = new servicioMongo();

let coleccion = "pacienteSips";
var url = config.urlMigracion;
var condicion = {};

try {

    mongodb.MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('Error al conectarse a Base de Datos', err)
        }
        var cursorStream = db.collection(coleccion).find(condicion).stream();
        // Execute find on all the documents
        cursorStream.on('close', function() {
            console.log('Close Stream');
            db.close();
        });
        cursorStream.on('data', function(data) {
            if (data != null) {
                let paciente = data;
                servicio.cargarUnPacienteAndes(paciente)
                    .then((rta) => {
                        console.log('Paciente Guardado');
                    })
                    .catch((err) => {
                        console.error('Error Post**:', err);
                        servMongo.guardarLogSips({ "idPaciente": paciente['idPaciente'], "migrado": false, "Error": err.toString(), "Fecha": Date.now() })
                            .then((respuesta => {
                                console.log('Guardar Log', 'Se guarda el paciente');
                            }))
                            .catch((err => {
                                console.log('Error al guardar log de error', paciente['idPaciente'], err);
                            }))


                    });
            }
            else {
                db.close();
            }
        })
    })
}
catch (err) {
    console.log('Error', err)
}
