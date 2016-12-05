import {servicioHPN} from './servicioHPN'
import {libString} from './libString'
import { servicioMongo } from './servicioMongo';

var servMongo = new servicioMongo();
var servicio = new servicioHPN();


//Se obtienen los datos de la base de datos de HPN.  Se completan los datos de ubicaciones y se guarda en la bd migracion
function migracionPacientes(indice) {
    return (new Promise((resolve, reject) => {

        servicio.obtenerDatosHPN(indice + 1, indice + 10000)
            .then((resultado) => {
                if (resultado == null) {
                    console.log('No encontrado');
                } else {
                    var listaPacientes;
                    listaPacientes = resultado;
                    var PromPais = servMongo.obtenerPaises();
                    var PromProvincia = servMongo.obtenerProvincias();
                    var PromLocalidad = servMongo.obtenerLocalidades();
                    //console.log(lista);
                    console.log("Total Pacientes", listaPacientes.length);
                    Promise.all([PromPais, PromProvincia, PromLocalidad]).then(values => {
                        let paises;
                        paises = values[0]; //[{id:1, nombre:"Argentina" },{id:2, nombre:"Chile"},{id:3, nombre:"Brasil"}];
                        let provincias;
                        provincias = values[1];
                        let localidades;
                        localidades = values[2];

                        var obtenerPacientes = new Promise((resolve, reject) => {
                            var pacientesJSON = [];
                            listaPacientes.forEach(elem => {
                                var pacientesHPN = elem;
                                //console.log('Paciente: ', elem);
                                var paciente;
                                paciente = servicio.formatearDatosHPN(pacientesHPN);
                                //Se genera la clave de bloking para el matching
                                //paciente["claveSN"] = servicio.crearClaveSN(paciente);
                                if (paciente.direccion[0].ubicacion.pais) {
                                    var pais = paises.find((p) => { return libString.makePattern(paciente.direccion[0].ubicacion.pais).test(p.nombre) });
                                    if (pais) {
                                        paciente.direccion[0].ubicacion.pais = { _id: pais._id, id: pais._id, nombre: pais.nombre };
                                    }
                                    else {
                                        paciente.direccion[0].ubicacion.pais = {};
                                    }
                                }

                                if (paciente.direccion[0].ubicacion.provincia) {
                                    var provincia = provincias.find((p) => { return libString.makePattern(paciente.direccion[0].ubicacion.provincia).test(p.nombre) });
                                    if (provincia) {
                                        paciente.direccion[0].ubicacion.provincia = { _id: provincia._id, id: provincia._id, nombre: provincia.nombre };
                                    }
                                    else {
                                        paciente.direccion[0].ubicacion.provincia = {};
                                    }
                                }

                                if (paciente.direccion[0].ubicacion.localidad) {
                                    var localidad = localidades.find((p) => { return libString.getCleanedString(paciente.direccion[0].ubicacion.localidad) == (libString.getCleanedString(p.nombre)) });
                                    if (localidad) {
                                        paciente.direccion[0].ubicacion.localidad = { _id: localidad._id, id: localidad._id, nombre: localidad.nombre };

                                    }
                                    else {
                                        paciente.direccion[0].ubicacion.localidad = {};
                                    }

                                }

                                //console.log('Paciente formateado', paciente["idPacienteHPN"]);

                                pacientesJSON.push(paciente);
                                if (listaPacientes.length == pacientesJSON.length) {
                                    console.log('Se resuelve la promesa');
                                    resolve(pacientesJSON);
                                }
                            })
                        })

                        obtenerPacientes
                            .then((lista => {
                                servMongo.guardarPacientes(lista, "pacienteHPN")
                                    .then((res => {
                                        //console.log('Guardar Paciente', paciente["idPaciente"]);
                                        console.log('Guardar Pacientes');
                                        resolve(lista.length);
                                    }))
                                    .catch((err => {

                                        console.log('Error al guardar Pacientes', err)

                                        servMongo.guardarLog("logMigracion", { "idPacienteHPN": lista["idPacienteHPN"], "Error": err.toString(), "Fecha": Date.now() })
                                            .then((respuesta => {
                                                console.log('Guardar Log', 'Error al guardar paciente');
                                            }))
                                            .catch((err => {
                                                console.log('Error Paciente', lista["idPacienteHPN"], err);
                                            }))

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
                reject(err);
            });
    }))



}

var contador = 219999;
while (contador < 220000) {
    console.log(contador);

    migracionPacientes(contador)
        .then((resultado => {
            console.log('Pacientes migrados', resultado);

        }))
        .catch((err => {
            console.log('Error al generar lista de Pacientes', err);
        }))

    contador = contador + 10000;

}


// servicio.obtenerPacientesHPN()
//     .then((resultado) => {
//         if (resultado == null) {
//             console.log('No encontrado');
//         } else {
//             //console.log('CONSULTA HPN', resultado);
//             for (let i = 0; i < resultado.length; i++) {
//                 console.log('CONSULTA HPN1', servicio.formatearDatosHPN(resultado[i]));
//             }
//
//
//         }
//     })
//     .catch((err) => {
//         console.error('Error**:' + err)
//     });

//  var date = new Date(numbers[2], numbers[1]-1, numbers[0]);
