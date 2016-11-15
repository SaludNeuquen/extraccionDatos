/// <reference path="typings/index.d.ts" />
import * as sql from 'mssql';
import * as parser from 'xml2json';
import * as https from 'https';



export class servicioSisa {

    getSisaCiudadano(nroDocumento, usuario, clave) {
        /**
         * Capítulo 5.2.2 - Ficha del ciudadano
         * Se obtienen los datos desde Sisa
         * Ejemplo de llamada https://sisa.msal.gov.ar/sisa/services/rest/cmdb/obtener?nrodoc=26334344&usuario=user&clave=pass
         * Información de Campos https://sisa.msal.gov.ar/sisa/sisadoc/index.jsp?id=cmdb_ws_042
         */
        // options for GET
        //Agregar a la consulta el sexo para evitar el problema de dni repetidos

        var datosParseados;
        var jsonData = '';
        var organizacion = new Object();
        var optionsgetmsg = {
            host: 'sisa.msal.gov.ar', // nombre del dominio // (no http/https !)
            port: 443,
            path: '/sisa/services/rest/cmdb/obtener?nrodoc=' + nroDocumento + '&usuario=' + usuario + '&clave=' + clave, //'/sisa/services/rest/puco/' + nroDocumento,
            //'/sisa/services/rest/puco/' + nroDocumento,
            method: 'GET' // do GET
        };
        // Realizar GET request
        return new Promise((resolve, reject) => {
            var reqGet = https.request(optionsgetmsg, function(res) {
                console.log("statusCode: ", res.statusCode);
                res.on('data', function(d) {
                    //console.info('GET de Sisa ' + nroDocumento + ':\n');
                    if (d.toString())
                        jsonData = jsonData + d.toString();
                });
                res.on('end', function() {
                    if (jsonData) {
                        datosParseados = parser.toJson(jsonData);
                        resolve([res.statusCode, JSON.parse(datosParseados)])
                    } //Se parsea el xml obtenido a JSON  JSON.parse(parser.toJson(jsonData))
                    else
                        resolve([res.statusCode, jsonData]); //JSON.parse(parser.toJson(jsonData))
                });

            });
            reqGet.end();
            reqGet.on('error', function(e) {
                reject(e);
            });

        })
    }

    formatearDatosSisa(datosSisa) {
        var ciudadano;
        var fecha;
        ciudadano = new Object();
        if (datosSisa.nroDocumento) {
            ciudadano.documento = datosSisa.nroDocumento;
        }
        if (datosSisa.nombre) {
            ciudadano.nombre = datosSisa.nombre;
        }
        if (datosSisa.apellido) {
            ciudadano.apellido = datosSisa.apellido;
        }
        /*
        {
          localidad:lugarSchema,
          provincia:lugarSchema,
          pais: lugarSchema
        }
        */
        //Se arma un objeto de dirección
        ciudadano.direccion = [];
        var domicilio;
        domicilio = new Object();
        if (datosSisa.domicilio) {
            if (datosSisa.pisoDpto && datosSisa.pisoDpto != "0 0") {
                domicilio.valor = datosSisa.domicilio + " " + datosSisa.pisoDpto;
            }
            domicilio.valor = datosSisa.domicilio;
        }

        if (datosSisa.codigoPostal) {
            domicilio.codigoPostal = datosSisa.codigoPostal;
        }
        var ubicacion;
        ubicacion = new Object();
        if (datosSisa.localidad) {
            ubicacion.localidad = datosSisa.localidad;
        }

        if (datosSisa.provincia) {
            ubicacion.provincia = datosSisa.provincia;
        }

        //Ver el pais de la ubicación

        domicilio.ranking = 1;
        domicilio.activo = true;
        domicilio.ubicacion = ubicacion;
        ciudadano.direccion.push(domicilio);

        if (datosSisa.sexo) {
            if (datosSisa.sexo == "F") {
                ciudadano.sexo = "femenino";
                ciudadano.genero = "femenino";
            } else {
                ciudadano.sexo = "masculino";
                ciudadano.genero = "masculino";

            }

        }
        if (datosSisa.fechaNacimiento) {
            fecha = datosSisa.fechaNacimiento.split("-");
            var fechaNac = new Date(fecha[2].substr(0, 4), fecha[1], fecha[0]);
            ciudadano.fechaNacimiento = fechaNac.toJSON();

        }

        if (datosSisa.estadoCivil) {
            // estadoCivil: {
            //     type: String,
            //     enum: ["casado", "separado", "divorciado", "viudo", "soltero", "otro", ""]
            // }

        }

        if (datosSisa.fallecido != "NO") {
            if (datosSisa.fechaFallecimiento) {
                fecha = datosSisa.fechaFallecimiento.split("-");
                var fechaFac = new Date(fecha[2].substr(0, 4), fecha[1], fecha[0]);
                ciudadano.fechaFallecimiento = fechaFac.toJSON();

            }
        }

        return ciudadano;

    }
}
