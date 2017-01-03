import {servicioHeller} from './servicioHeller';
import {libString} from './libString';
import { servicioMongo } from './servicioMongo';


var servMongo = new servicioMongo();
var servicio = new servicioHeller();

servicio.obtenerDatosHeller(/*1*/1,/*224202-166017*/35000)
    .then((resultado) => {
        if (resultado == null) {
            console.log('No encontrado');
        } else {
            var lista;
            lista = resultado;
            var listaPacientesHeller = [];
            console.log('Total de Pacientes en Heller', lista.length);
            lista.forEach(registro => {
                let pacienteHeller;
                if (registro.NumeroDocumento.replace(/\"/g, "")) {
                    pacienteHeller = servicio.formatearDatosHeller(registro);
                    listaPacientesHeller.push(pacienteHeller);
                }
            })
            console.log(listaPacientesHeller.length);
            if (listaPacientesHeller) {
                console.log('Se guardan los pacientes de Heller');
                servMongo.guardarPacientes(listaPacientesHeller, "pacienteHeller")
                    .then((res => {
                        console.log('Guardar Pacientes');
                    }))
                    .catch((err => {
                        console.log('Error al guardar Pacientes', err)
                        servMongo.guardarLog("logMigracion", { "idPacienteHeller": lista['id'], "Error": err.toString(), "Fecha": Date.now(), "Heller": true })
                            .then((respuesta => {
                                console.log('Guardar Log', 'Error al guardar paciente');
                            }))
                            .catch((err => {
                                console.log('Error Paciente', lista['id'], err);
                            }))
                    }))

            }

        }
    })
    .catch((err) => {
        console.error('Error**:' + err)
    }
    );
