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

                //Se actualizan las ubicaciones de las direcciones de los pacientes
                let direcciones = paciente.direccion;
                let dirActualizadas = [];
                direcciones.forEach(dir => {
                    //Se actualiza el pais
                    if (!(dir.ubicacion.pais.id)) {
                        if (dir.ubicacion.pais.nombre) {
                            let pais = paises.find((p) => { return libString.makePattern(dir.ubicacion.pais.nombre).test(p.nombre) });
                            if (pais) {
                                dir.ubicacion.pais = { _id: pais._id, id: pais._id, nombre: pais.nombre };
                                actualizar = true;
                            }
                        }
                    }

                    //Se actualiza la provincia
                    if (!(dir.ubicacion.provincia.id)) {
                        if (dir.ubicacion.provincia.nombre) {
                            let provincia = provincias.find((p) => { return libString.makePattern(dir.ubicacion.provincia.nombre).test(p.nombre) });
                            if (provincia) {
                                dir.ubicacion.provincia = { _id: provincia._id, id: provincia._id, nombre: provincia.nombre };
                                actualizar = true;
                            }
                        }
                    }

                    //Se actualiza la localidad
                    if (!(dir.ubicacion.localidad.id)) {
                        if (dir.ubicacion.localidad.nombre) {
                            let localidad = localidades.find((p) => { return libString.getCleanedString(dir.ubicacion.localidad) == (libString.getCleanedString(p.nombre)) });
                            if (localidad) {
                                dir.ubicacion.localidad = { _id: localidad._id, id: localidad._id, nombre: localidad.nombre };
                                actualizar = true;
                            }
                        }
                    }
                    dirActualizadas.push(dir);
                })

                if (actualizar) {
                    paciente.direccion = dirActualizadas;
                    arrayPromise.push(paciente);
                }


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
