import { servicioMongo } from './servicioMongo';
import {libString} from './libString';



export class actualizarDatos {

    actualizarUbicaciones(listaPacientes, coleccion) {
        var servMongo = new servicioMongo();
        var paciente;
        var arrayPromise = [];
        var PromPais = servMongo.obtenerPaises();
        var PromProvincia = servMongo.obtenerProvincias();
        var PromLocalidad = servMongo.obtenerLocalidades();

        Promise.all([PromPais, PromProvincia, PromLocalidad]).then(values => {
            let paises;
            paises = values[0]; //[{id:1, nombre:"Argentina" },{id:2, nombre:"Chile"},{id:3, nombre:"Brasil"}];
            let provincias;
            provincias = values[1];
            let localidades;
            localidades = values[2];

            //Se abre la conexión a mongo para realizar las actualizaciones de los registros

            listaPacientes.forEach(function(elem) {
                paciente = elem;
                let actualizar = false;
                console.log(paciente.direccion[0].ubicacion.pais);
                console.log(paciente.direccion[0].ubicacion.provincia);

                //Se actualiza las ubicaciones de las direcciones de los pacientes
                if (typeof (paciente.direccion[0].ubicacion.pais) == "string") {
                    let pais = paises.find((p) => { return libString.makePattern(paciente.direccion[0].ubicacion.pais).test(p.nombre) });
                    if (pais) {
                        paciente.direccion[0].ubicacion.pais = { _id: pais._id, id: pais._id, nombre: pais.nombre };
                        actualizar = true;
                    }

                }
                else {
                    paciente.direccion[0].ubicacion.pais = {};
                }
                if (typeof (paciente.direccion[0].ubicacion.provincia) == "string") {
                    let provincia = provincias.find((p) => { return libString.makePattern(paciente.direccion[0].ubicacion.provincia).test(p.nombre) });
                    if (provincia) {

                        paciente.direccion[0].ubicacion.provincia = { _id: provincia._id, id: provincia._id, nombre: provincia.nombre };
                        actualizar = true;
                    }

                }
                else {
                    paciente.direccion[0].ubicacion.provincia = {};
                }

                if (typeof (paciente.direccion[0].ubicacion.localidad) == "string") {
                    let localidad = localidades.find((p) => { return libString.getCleanedString(paciente.direccion[0].ubicacion.localidad) == (libString.getCleanedString(p.nombre)) });
                    if (localidad) {
                        paciente.direccion[0].ubicacion.localidad = { _id: localidad._id, id: localidad._id, nombre: localidad.nombre };
                        actualizar = true;
                    }

                }
                else {
                    paciente.direccion[0].ubicacion.localidad = {};
                }
                if (actualizar)
                    arrayPromise.push(paciente);

            })   //Fin ForEach

            Promise.all(arrayPromise).then(values => {
                servMongo.actualizarDirecciones(coleccion, values)
                    .then((resultado) => {
                        if (resultado == null) {
                            console.log('No encontrado');
                        }
                        else {
                            console.log('Pacientes Actualizados');

                        }
                    })
                    .catch((err) => {
                        console.error('Error**:' + err);
                    });
            })


        })


    }




}
