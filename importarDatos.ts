import {servicioMssql} from './servicioMssql'
import {servicioHeller} from './servicioHeller';
import { servicioMongo } from './servicioMongo';
import {servicioSips} from './servicioSips';
import {servicioHPN} from './servicioHPN';
import * as fs from 'fs';

var servMongo = new servicioMongo();
var servHeller = new servicioHeller();
var servSips = new servicioSips();
var servHPN = new servicioHPN();


export class importarDatos {

    //servicio.obtenerDatosSql(1, 1500000, config.user, config.password,
    //     config.serverSql, config.databaseSql, config.consultaPaciente)

    importarRegistros(efector, inicio, fin, usuario, password, server, db, consulta, archivo) {
        var servicio = new servicioMssql();
        var file = fs.createWriteStream(archivo);
        return new Promise((resolve, reject) => {

            servicio.obtenerDatosSql(inicio, fin, usuario, password, server, db, consulta)
                .then((resultado) => {
                    if (resultado == null) {
                        console.log('No encontrado');
                    } else {
                        var listaPacientes = resultado;
                        var paciente;
                        console.log("Total Pacientes", listaPacientes.length);
                        if (listaPacientes.length > 0) {
                            console.log(efector, server, db);
                            var file = fs.createWriteStream(archivo);
                            file.on('error', function(err) { console.log(err) });
                            switch (efector) {
                                case "SIPS": {
                                    listaPacientes.forEach(function(elem) {
                                        paciente = servSips.formatearDatosSips(elem);
                                        file.write(JSON.stringify(paciente) + '\n');
                                    });

                                    break;
                                }
                                case "HELLER": {
                                  listaPacientes.forEach(function(elem) {
                                      paciente = servHeller.formatearDatosHeller(elem);
                                      file.write(JSON.stringify(paciente) + '\n');
                                  });
                                    break;
                                }

                                case "HPN": {
                                    listaPacientes.forEach(function(elem) {
                                        paciente = servHPN.formatearDatosHPN(elem);
                                        file.write(JSON.stringify(paciente) + '\n');
                                    });
                                    break;
                                }
                            }

                            file.end(); //Se cierra el archivo

                        }

                    }

                })

                .catch((err) => {
                    console.error('Error**:' + err)
                    reject(err);
                });


        })

    }


}
