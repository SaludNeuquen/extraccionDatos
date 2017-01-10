import { servicioMongo } from './servicioMongo';


var servMongo = new servicioMongo();
console.log("Actualizar Pacientes")
servMongo.actualizarPacientes("paciente","Sips")
    .then((resultado) => {
        console.log('Resultado', resultado);
    })
    .catch((err) => {
        console.error('Error**:' + err)
    });
