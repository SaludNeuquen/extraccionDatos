import * as mongodb from 'mongodb';
import * as config from './config';


var url = config.urlMongoAndes;
let coleccion = "paciente";
let estadoCivil = null;

mongodb.MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log("Error al conectarse a Base de Datos", err);
    }
    console.log("Conectado a la base, actualizando contactos");
    let cursorStream = db.collection(coleccion).find({}).stream();
    cursorStream.on("end", function () {
        console.log("Close Stream");
        db.close();
    });

    cursorStream.on("data", function (elem) {
        let paciente = elem;
        let listaDirecciones = [];
        let cant = 0;
        if (paciente.direccion) {
            paciente.direccion.forEach((dir) => {
                cant = cant + 1;
                if (dir.ubicacion) {
                    if (dir.ubicacion.pais && dir.ubicacion.pais._id && (!dir.ubicacion.pais.nombre)) {
                        dir.ubicacion.pais = null;
                    }

                    if (dir.ubicacion.provincia && dir.ubicacion.provincia._id && (!dir.ubicacion.provincia.nombre)) {
                        dir.ubicacion.provincia = null;
                    }


                    if (dir.ubicacion.localidad && dir.ubicacion.localidad._id && (!dir.ubicacion.localidad.nombre)) {
                        dir.ubicacion.localidad = null;
                    }

                    listaDirecciones.push(dir);
                }
                if (cant >= paciente.direccion.length) {
                    paciente.direccion = listaDirecciones;
                }
            });
            //console.log("Paciente", paciente);
            //console.log("listaDirecciones", listaDirecciones);

        }

        db.collection(coleccion).updateOne({ _id: paciente._id }, { $set: { direccion: listaDirecciones } },
            function (err, item) {
                if (err) {
                    console.log(err);
                }
                console.log("paciente actualizado", paciente.documento);
            });
    });
})
