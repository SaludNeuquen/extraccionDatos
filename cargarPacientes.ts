import {postPaciente} from './postPaciente';
import { servicioMongo } from './servicioMongo';


var servicio = new postPaciente();
var servMongo = new servicioMongo();

servMongo.getPacientes().then((resultado) => {
    var listaPacientes;
    listaPacientes = resultado;
    // listaPacientes.forEach(pac => {
    //     servicio.cargarUnPacienteAndes(pac)
    //     .then((rta) => {
    //         console.log(rta,"fiinnnnn");
    //     })
    //     .catch((err) => {
    //         console.error('Error**:' + err)
    //     });
    // });
    console.log(resultado[0]);
    var paciente;
    paciente = resultado[0];
    servicio.cargarUnPacienteAndes(paciente)
        .then((rta) => {
            console.log('Paciente Guardado');
            servMongo.guardarLogSips({ "idPacienteSips": paciente['idPaciente'], "migrado": true, "Fecha": Date.now() })
                .then((respuesta => {
                    console.log('Guardar Log', 'Se guarda log del paciente');
                }))
                .catch((err => {
                    console.log('Error al guardar log', paciente['idPaciente'], err);
                }))
        })
        .catch((err) => {
            console.error('Error**:' + err);
            servMongo.guardarLogSips({ "idPacienteSips": paciente['idPaciente'], "migrado": false,"Error": err.toString(), "Fecha": Date.now() })
                .then((respuesta => {
                    console.log('Guardar Log', 'Se guarda el paciente');
                }))
                .catch((err => {
                    console.log('Error al guardar log de error', paciente['idPaciente'], err);
                }))


        });
})
    .catch((err) => {
        console.error('Error**:' + err)
    });
