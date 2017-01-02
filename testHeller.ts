import {servicioHeller} from './servicioHeller';
import {libString} from './libString';
import { servicioMongo } from './servicioMongo';


var servMongo = new servicioMongo();
var servicio = new servicioHeller();
/*
servicio.obtenerDatosHeller(1, 1)
   .then((resultado) => {
       console.log(resultado);
   })
   .catch((err) => {
       console.error('Error**:' + err)
});

*/
/*hasta 35000 ok */
servicio.obtenerDatosHeller(/*1*/1,/*224202-166017*/35000)
    .then((resultado) => {
        if (resultado == null) {
            console.log('No encontrado');
        } else {
            var lista;
            lista = resultado;
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

                var listaPacientesHeller = [];
                console.log('Total de Pacientes en Heller', lista.length);
                lista.forEach(registro => {
                    let pacienteHeller;
                    if (registro.NumeroDocumento.replace(/\"/g, "")) {
                        pacienteHeller = servicio.formatearDatosHeller(registro);
                       // console.log('Direccion',pacienteHeller.direccion[0]);
                        //Se buscan las localidades y las provincias
                        var provincia = provincias.find((p) => { return libString.makePattern(pacienteHeller.direccion[0].ubicacion.provincia).test(p.nombre) });
                        var localidad = localidades.find((p) => { return (libString.getCleanedString(pacienteHeller.direccion[0].ubicacion.localidad) == (libString.getCleanedString(p.nombre)) && (p.provincia.nombre == provincia.nombre)) });                        
                        if (provincia) {
                            pacienteHeller.direccion[0].ubicacion.provincia = { _id: provincia._id, id: provincia._id, nombre: provincia.nombre };
                        }
                        else {
                            pacienteHeller.direccion[0].ubicacion.provincia = {};
                        }

                        if (localidad) {
                            pacienteHeller.direccion[0].ubicacion.localidad = { _id: localidad._id, id: localidad._id, nombre: localidad.nombre };
                        }
                        else {
                            pacienteHeller.direccion[0].ubicacion.localidad = {};
                        }

                        listaPacientesHeller.push(pacienteHeller);
                        console.log("Paciente Heller",pacienteHeller);
                  //       console.log("Paciente Heller",pacienteHeller.direccion[0].ubicacion.provincia);
                    }
                })
                console.log(listaPacientesHeller.length);
           
                if (listaPacientesHeller) {
                    console.log('Se guardan los pacientes de Heller');
                    servMongo.guardarPacientes(listaPacientesHeller, "pacienteHeller")
                        .then((res => {
                            //console.log('Guardar Paciente', paciente["idPaciente"]);
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
                
            })



        }
    })
    .catch((err) => {
        console.error('Error**:' + err)
    }
    );
