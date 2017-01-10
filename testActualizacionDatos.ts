import {actualizarDatos} from './actualizarDatos';
import {libString} from './libString';
import { servicioMongo } from './servicioMongo';


var servMongo = new servicioMongo();
var actualizarDir = new actualizarDatos();

servMongo.obtenerPacientes({},"pacienteHeller")
    .then((resultado) => {
        if (resultado == null) {
            console.log('No encontrado');
        } else {
            console.log('Total',resultado.length);
            var lista = resultado;
            actualizarDir.actualizarUbicaciones(lista,"pacienteHeller");
        }
    })
    .catch((err) => {
        console.error('Error**:' + err)
    }
    );
