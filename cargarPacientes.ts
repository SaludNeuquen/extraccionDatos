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
    servicio.cargarUnPacienteAndes(resultado[0])
        .then((rta) => {
            console.log('Pacientes Guardados');
        })
        .catch((err) => {
            console.error('Error**:' + err)
        });
})
    .catch((err) => {
        console.error('Error**:' + err)
    });
