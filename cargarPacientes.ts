import {postPaciente} from './postPaciente';
import { servicioMongo } from './servicioMongo';
import * as mongodb from 'mongodb';
import * as config from './config';


var servicio = new postPaciente();
var servMongo = new servicioMongo();

let coleccion = "paciente";
var url = config.urlMongoAndes;;
var condicion = {};

try {

    mongodb.MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('Error al conectarse a Base de Datos', err)
        }
        var cursorStream = db.collection(coleccion).find(condicion).stream();
        cursorStream.on('end', function() {
            console.log('Close Stream');
            db.close();

        });


        // Execute find on all the documents
        cursorStream.on('close', function() {
            console.log('Close Stream');
            db.close();
        });
        cursorStream.on('data', function(data) {
            if (data != null) {
                let paciente = data;
                console.log(paciente.documento);
                servicio.cargarUnPacienteAndes(paciente)
                    .then((rta) => {
                        console.log('Paciente Guardado', rta);
                    })
                    .catch((err) => {
                        console.error('Error Post**:', err);
                        // servMongo.guardarLogSips({ "Paciente": paciente, "migrado": false, "Error": err.toString(), "Fecha": Date.now() })
                        //     .then((respuesta) => {
                        //         console.log('Guardar Log', 'Se guarda el paciente');
                        //     })
                        //     .catch((err) => {
                        //         console.log('Error al guardar log de error',err);
                        //     })


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
