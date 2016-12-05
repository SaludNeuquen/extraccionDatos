import { servicioMongo } from './servicioMongo';
import {servicioSips} from './servicioSips'
import {libString} from './libString'


var servicio = new servicioSips();
var servMongo = new servicioMongo();
//console.log(libString.obtenerConsonante('Roa', 3));

servicio.obtenerDatosips(600001,800000)
    .then((resultado) => {
        if (resultado == null) {
            console.log('No encontrado');
        } else {
            var listaPacientes;
            var PromPais = servMongo.obtenerPaises();
            var PromProvincia = servMongo.obtenerProvincias();
            var PromLocalidad = servMongo.obtenerLocalidades();
            listaPacientes = resultado[0];
            console.log("Total Pacientes", listaPacientes.length);
            Promise.all([PromPais,PromProvincia,PromLocalidad]).then(values => {
                let paises;
                paises = values[0]; //[{id:1, nombre:"Argentina" },{id:2, nombre:"Chile"},{id:3, nombre:"Brasil"}];
                let provincias;
                provincias = values[1];
                let localidades ;
                localidades = values[2];

                var obtenerPacientes = new Promise((resolve, reject) => {
                    var pacientesJSON = [];
                    listaPacientes.forEach(elem => {
                        var pacientesSips = elem;
                        //console.log('Paciente SIPS: ', elem);
                        var paciente;
                        paciente = servicio.formatearDatosSips(pacientesSips);
                        //Se genera la clave de bloking para el matching
                        paciente["claveSN"] = servicio.crearClaveSN(paciente);
                        var pais = paises.find((p) => {return libString.makePattern(paciente.direccion[0].ubicacion.pais).test(p.nombre)});
                        var provincia = provincias.find((p) => {return libString.makePattern(paciente.direccion[0].ubicacion.provincia).test(p.nombre)});
                        var localidad = localidades.find((p) => {return libString.getCleanedString(paciente.direccion[0].ubicacion.localidad)==(libString.getCleanedString(p.nombre))});

                        if (pais) {
                             paciente.direccion[0].ubicacion.pais = { _id: pais._id, id: pais._id, nombre: pais.nombre };
                         }
                         else {
                             paciente.direccion[0].ubicacion.pais = {};
                         }
                         if (provincia) {
                             paciente.direccion[0].ubicacion.provincia = { _id: provincia._id, id: provincia._id, nombre: provincia.nombre };
                         }
                         else {
                             paciente.direccion[0].ubicacion.provincia = {};
                         }

                         if (localidad) {
                             paciente.direccion[0].ubicacion.localidad = { _id: localidad._id, id: localidad._id, nombre: localidad.nombre };

                         }
                         else {
                             paciente.direccion[0].ubicacion.localidad = {};
                         }

                        console.log('Paciente formateado', paciente["idPaciente"]);

                        pacientesJSON.push(paciente);
                        if (listaPacientes.length == pacientesJSON.length) {
                            console.log('Se resuelve la promesa');
                            resolve(pacientesJSON);
                        }
                    })
                })

                obtenerPacientes
                    .then((lista => {
                        servMongo.guardarPacientes(lista,"pacienteSips")
                       .then((res => {
                           //console.log('Guardar Paciente', paciente["idPaciente"]);
                           console.log('Guardar Pacientes');
                       }))
                       .catch((err => {

                           console.log('Error al guardar Pacientes', err)

                           // servMongo.guardarLog({ "idPacienteSips": pacientesSips['idPaciente'], "Error": err.toString(), "Fecha": Date.now() })
                           //     .then((respuesta => {
                           //         console.log('Guardar Log', 'Error al guardar paciente');
                           //     }))
                           //     .catch((err => {
                           //         console.log('Error Paciente', pacientesSips['idPaciente'], err);
                           //     }))

                       }))

                    }))
                    .catch((err => {
                        console.log('Error al generar lista de Pacientes', err);
                    }))

            })
        }
    })
    .catch((err) => {
        console.error('Error**:' + err)
    });
