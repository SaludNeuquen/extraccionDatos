import * as sql from 'mssql';
import * as config from './config';
import {libString} from './libString'


export class servicioHeller {

    obtenerDatosHeller(inicio: number, fin: number) {

        return new Promise((resolve, reject) => {

            var connection = {
                user: config.user,
                password: config.password,
                server: config.serverSql2,
                database: config.dbMigracion,
                //connectionTimeout: config.connectionTimeout,
                requestTimeout: config.requestTimeout

            };

            sql.connect(connection).then(function() {
                // Es una consulta a una vista que tiene toda la información
                new sql.Request()
                    .input('inicio', sql.VarChar(20), inicio.toString())
                    .input('fin', sql.VarChar(20), fin.toString())
                    .query(config.consultaPacienteHeller)
                    .then(function(recordset) {
                        //console.dir(recordset);
                        //console.log(recordset.length);

                        resolve(recordset);

                    })
                    .catch(function(err) {
                        // ... query error checks
                        console.log("Error de conexión al server", config.serverSql2);
                        reject(err);
                    });

            })
        })

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
        //paciente["idPacienteHeller"] = registro.id;  //Ver el nuevo esquema

        //Ver campos esDNI
        if (registro.NumeroDocumento.replace(/\"/g, "")) {
            paciente["documento"] = registro.NumeroDocumento.replace(/\"/g, "");
        }

        if (paciente["activo"] == "1") {
            paciente["activo"] = true;
        }
        else {
            paciente["activo"] = false;
        }

        //Como no se encuentra un estado que identifique el estado del paciente no se
        //carga el estado


        // estado : ["temporal", "identificado", "validado", "recienNacido", "extranjero"]
        // switch (registro.idEstado) {
        //     case 1:
        //         paciente["estado"] = "recienNacido";
        //         break;
        //     case 2:
        //         paciente["estado"] = "extranjero";
        //         break;
        //     default:
        //         paciente["estado"] = "temporal";
        //         break;
        //
        // }
        paciente["nombre"] = registro.NOMBRES.replace(/\"/g, "");;
        paciente["apellido"] = registro.APELLIDOS.replace(/\"/g, "");;

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
            domicilio.valor = registro.Domicilio.replace(/\"/g, "");;
        }

        if (registro.Barrio) {
            domicilio.valor = domicilio.valor.replace(/\"/g, "") + " Barrio: " + registro.Barrio.replace(/\"/g, "");;
        }

        if (registro.CodigoPostal)
            domicilio.codigoPostal = registro.CodigoPostal.replace(/\"/g, "");;

        domicilio.ubicacion = {};
        domicilio.ubicacion.localidad = "";
        if (registro.Localidad) {
            domicilio.ubicacion.localidad = libString.toTitleCase(registro.Localidad.replace(/\"/g, ""));
        }
        domicilio.ubicacion.provincia = "";
        if (registro.Provincia) {
            domicilio.ubicacion.provincia = libString.toTitleCase(registro.Provincia.replace(/\"/g, ""));
        }
        domicilio.ubicacion.pais = "";

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

        //En las bases enviadas el 15/11/2016 los registros no poseen fecha de Fallecimiento
        // if (registro.fallecido) {
        //     if (registro.fallecidoFecha) {
        //         paciente["fechaFallecimiento"] = new Date(registro.fallecidoFecha);
        //     }
        //
        // }

        //["casado", "separado", "divorciado", "viudo", "soltero", "otro", ""]
        switch (registro.Ecivil.replace(/\"/g, "")) {
            case "CASADO":
                paciente["estadoCivil"] = "casado";
                break;
            case "SOLTERO":
                paciente["estadoCivil"] = "soltero";
                break;
            default:
                paciente["estadoCivil"] = "otro";
                break;
        }

        if (registro.verificadoISSN && registro.verificadoISSN.replace(/\"/g, "") != "0") {
            paciente["entidadesValidadoras"] = "verificadoISSN";
        }


        return paciente;


    }

    armarRelaciones() {
        //Se busca la relación de padres e hijos y se agrega el campo relaciones
    }
}
