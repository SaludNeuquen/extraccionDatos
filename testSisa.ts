import {servicioSisa} from './servicioSisa';
import * as config from './config';

var servicio = new servicioSisa();


servicio.getSisaCiudadano('32588311', config.usuarioSisa, config.passwordSisa)
    .then((resultado) => {
        if (resultado == null) {
            console.log('Persona no encontrada en Sisa');
        } else {
            console.log('Persona encontrada', resultado)
            var paciente = servicio.formatearDatosSisa(resultado[1].Ciudadano);
            console.log(paciente);
        }
    })
    .catch((err) => {
        console.error('Error consulta rest Sisa:' + err)
    });
