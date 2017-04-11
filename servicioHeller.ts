import * as sql from 'mssql';
import * as config from './config';
import {libString} from './libString'


export class servicioHeller {


    obtenerDatosHeller(inicio: number, fin: number) {

        var connection = {
            user: config.user,
            password: config.password,
            server: config.serverSql2,
            database: config.dbMigracion,
            //connectionTimeout: config.connectionTimeout,
            requestTimeout: config.requestTimeout

        };
        var listaRegistros = [];

        return new Promise((resolve, reject) => {
            sql.connect(connection, function(err) {
                if (err) {
                    console.log("Error de Conexión", err);
                    reject(err);
                }

                var request = new sql.Request();
                request.input('inicio', sql.VarChar(20), inicio.toString());
                request.input('fin', sql.VarChar(20), fin.toString());
                request.query(config.consultaPacienteHeller);
                // Puede ser una consulta a una vista que tenga toda la información

                request.on('row', function(row) {
                    // Emitted for each row in a recordset
                    listaRegistros.push(row);
                });

                request.on('error', function(err) {
                    // May be emitted multiple times
                });

                request.on('done', function(affected) {
                    // Always emitted as the last one
                    console.log(listaRegistros.length);
                    sql.close();
                    resolve(listaRegistros);
                });

            })
            sql.on('error', function(err) {
                console.log("Error de conexión", err);
                reject(err);
            })
        })  //Fin Promise
    }

    obtenerFecha(fechaStr) {
        var numbers = fechaStr.match(/\d+/g);
        var date = new Date(numbers[2], numbers[1] - 1, numbers[0]);
        return date;
    }


    formatearDatosHeller(registro) {
        var paciente = {};
        var contacto;
        var domicilio;
        var ubicacion;
        //paciente["idPacienteHeller"] = registro.nroreg;  //Ver el nuevo esquema
        paciente["identificadores"] =[{"entidad": "Heller", "valor":registro.nroreg.toString()}];
        try {
            //Ver campos esDNI
            //if (registro.NumeroDocumento.replace(/\"/g, "")) throw "nroDocumento";
            paciente["documento"] = registro.NumeroDocumento.replace(/\"/g, "");

            /*Activo =1 activo en el sistema =0 baja Logica*/
            //if (paciente["activo"] == "1") {
            paciente["activo"] = true;
            /*}
            else {
                paciente["activo"] = false;
            }*/


            // estado : ["temporal", "identificado", "validado", "recienNacido", "extranjero"]
            if (registro.NumeroDocumento >= 88000000 && registro.NumeroDocumento < 89000000) {
                paciente["estado"] = "temporal";
            }
            else {
                if (registro.NumeroDocumento >= 90000000 && registro.NumeroDocumento < 94000000) {
                    paciente["estado"] = "extranjero";
                }
                else
                { paciente["estado"] = "temporal"; }
            }



            paciente["nombre"] = registro.NOMBRES.replace(/\"/g, "");
            paciente["apellido"] = registro.APELLIDOS.replace(/\"/g, "");

            paciente["contacto"] = [];
            var ranking = 0;
            if (registro.Telefono.replace(/\"/g, "")) {
                contacto = {};
                contacto.tipo = "";
                contacto.valor = registro.Telefono.replace(/\"/g, "");;
                contacto.ranking = ranking + 1;
                contacto.activo = true;
                paciente["contacto"].push(contacto);
            }

            if (registro.TelCel.replace(/\"/g, "")) {
                contacto = {};
                contacto.tipo = "Teléfono Celular";
                contacto.valor = registro.TelCel.replace(/\"/g, "");
                contacto.ranking = ranking + 1;
                contacto.activo = true;
                paciente["contacto"].push(contacto);
            }


            // contacto: [{
            //     tipo: {
            //         type: String,
            //         enum: ["Teléfono Fijo", "Teléfono Celular", "Email", ""]
            //     },
            //     valor: String,
            //     ranking: Number, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            //     ultimaActualizacion: Date,
            //     activo: Boolean
            // }],

            paciente["direccion"] = [];
            domicilio = {};
            ubicacion = {};
            domicilio.valor = "";

            if (registro.Domicilio) {
                domicilio.valor = registro.Domicilio.replace(/\"/g, "");

                if ((registro.Barrio) && (registro.Barrio != 'SIN DATOS'))
                    domicilio.valor = domicilio.valor.replace(/\"/g, "") + " Barrio: " + registro.Barrio.replace(/\"/g, "");

                if (registro.CodigoPostal)
                    domicilio.codigoPostal = registro.CodigoPostal.replace(/\"/g, "");

                domicilio.ubicacion = {};
                domicilio.ubicacion.localidad = {};
                if (registro.Localidad)
                    domicilio.ubicacion.localidad.nombre = libString.toTitleCase(registro.Localidad.replace(/\"/g, ""));
                domicilio.ubicacion.provincia = {};
                if (registro.Provincia) {
                    domicilio.ubicacion.provincia.nombre = libString.toTitleCase(registro.Provincia.replace(/\"/g, ""));
                }
                domicilio.ubicacion.pais = {};
                domicilio.ubicacion.pais.nombre = registro.Pais.replace(/\"/g, "");

                //domicilio.ubicacion = ubicacion;
                domicilio.ranking = 1;
                domicilio.activo = true;
                paciente["direccion"].push(domicilio);

                switch (registro.Sexo.replace(/\"/g, "")) {
                    case "M":
                        paciente["sexo"] = "masculino";
                        paciente["genero"] = "masculino"; // identidad autopercibida
                        break;
                    case "F":
                        paciente["sexo"] = "femenino";
                        paciente["genero"] = "femenino"; // identidad autopercibida
                        break;
                    default:
                        paciente["sexo"] = "otro";
                        paciente["genero"] = "otro"; // identidad autopercibida
                        break;

                }

                paciente["fechaNacimiento"] = this.obtenerFecha(registro.FechaNacimiento);

                if (registro.fallecidoFecha) {
                    paciente["fechaFallecimiento"] = this.obtenerFecha(registro.fallecidoFecha);
                }
                else {
                    paciente["fechaFallecimiento"] = '';
                };

                paciente["Nacionalidad"] = registro.Nacionalidad.replace(/\"/g, "");

                //["casado", "separado", "divorciado", "viudo", "soltero", "otro", ""]
                switch (registro.Ecivil.replace(/\"/g, "")) {
                    case "Casado":
                        paciente["estadoCivil"] = "casado";
                        break;
                    case "Soltero":
                        paciente["estadoCivil"] = "soltero";
                        break;
                    case "Concubino":
                        paciente["estadoCivil"] = "Concubino";
                        break;
                    case "Divorciado":
                        paciente["estadoCivil"] = "Divorciado";
                        break;
                    case "Viudo":
                        paciente["estadoCivil"] = "Viudo";
                        break;
                    default:
                        paciente["estadoCivil"] = "otro";
                        break;
                }

            }

            paciente["relaciones"] = [];
            var parentesco = {};
            if (registro.Relacion == 'Madre') {
                parentesco.relacion = 'madre';
                parentesco.nombre = registro.NombreMadre;
                parentesco.apellido = registro.ApellidoMadre;
                parentesco.documento = registro.DocMadre;
                parentesco.referencia = '';
                paciente["relaciones"].push(parentesco);
            }
        }
        catch (Error) {
            //Se almacena el idPacienteHeller y el mensaje de error en una colección de log
            //IdPacienteHeller
            console.log("Error en el paciente", Error);
        }

        return paciente;


    }

    armarRelaciones() {
        //Se busca la relación de padres e hijos y se agrega el campo relaciones
    }
}
