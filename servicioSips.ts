import * as sql from 'mssql';
import * as config from './config';
import {libString} from './libString'
//import {IPaciente} from './interfaces/IPaciente';



export class servicioSips {

    obtenerDatosips(inicio: number, fin: number) {

        return new Promise((resolve, reject) => {

            var connection = {
                user: config.user,
                password: config.password,
                server: config.serverSql,
                database: config.databaseSql,
                //connectionTimeout: config.connectionTimeout,
                requestTimeout: config.requestTimeout

            };

            sql.connect(connection).then(function() {
                // Puede ser una consulta a una vista que tenga toda la información
                new sql.Request()
                    .input('inicio', sql.VarChar(20), inicio.toString())
                    .input('fin',sql.VarChar(20), fin.toString())
                    .query(config.consultaPaciente).then(function(recordset) {
                    //console.dir(recordset);
                    //console.log(recordset.length);
                    resolve([recordset]);

                }).catch(function(err) {
                    // ... query error checks
                    console.log("Error de conexión");
                    reject(err);
                });

            })
        })

    }

    obtenerFecha(fechaStr){
      var numbers = fechaStr.match(/\d+/g);
      var date = new Date(numbers[2], numbers[1]-1, numbers[0]);
      return date;

    }

    formatearDatosSips(registroSips) {
        var paciente = {};
        var contacto;
        var domicilio;
        var ubicacion;
        paciente["idPaciente"] = registroSips.idPaciente;
        paciente["documento"] = registroSips.numeroDocumento.toString();

        switch (registroSips.idMotivoNI) {
            case 1:
                paciente["estado"] = "recienNacido";
                break;
            case 2:
                paciente["estado"] = "extranjero";
                break;
            default:
                paciente["estado"] = "temporal";
                break;

        }

        paciente["nombre"] = registroSips.nombre;
        paciente["apellido"] = registroSips.apellido;
        paciente["contacto"] = [];
        var ranking = 0;
        if (registroSips.telefonofijo) {
            contacto = {};
            contacto.tipo = "Teléfono Fijo";
            contacto.valor = registroSips.telefonofijo;
            contacto.ranking = ranking + 1;
            contacto.activo = true;
            paciente["contacto"].push(contacto);
        }

        if (registroSips.telefonocelular) {
            contacto = {};
            contacto.tipo = "Teléfono Celular";
            contacto.valor = registroSips.telefonocelular;
            contacto.ranking = ranking + 1;
            contacto.activo = true;
            paciente["contacto"].push(contacto);
        }

        if (registroSips.email) {
            contacto = {};
            contacto.tipo = "Email";
            contacto.valor = registroSips.email;
            contacto.ranking = ranking + 1;
            contacto.activo = true;
            paciente["contacto"].push(contacto);
        }

        if (registroSips.informacionContacto) {
            contacto = {};
            contacto.tipo = "Teléfono Fijo";
            contacto.valor = registroSips.informacionContacto;
            contacto.ranking = ranking + 1;
            contacto.activo = true;
            paciente["contacto"].push(contacto);
        }

        paciente["direccion"] = [];
        domicilio = {};
        ubicacion = {};
        domicilio.valor ="";
        if (registroSips.calle){
          domicilio.valor = registroSips.calle + ' ';
          if (registroSips.numero){
            domicilio.valor +=  registroSips.numero + ' ' ;
          }

          if (registroSips.piso){
            domicilio.valor += 'PISO: '+registroSips.piso + ' ';
          }

          if (registroSips.dpto){
            domicilio.valor += 'DPTO: '+registroSips.dpto + ' ';
          }
        }


        if (registroSips.manzana){
          domicilio.valor += 'MZ: '+ registroSips.manzana + ' ';
        }

        if (registroSips.lote){
          domicilio.valor += 'LT: '+registroSips.lote + ' ';
        }

        if (registroSips.parcela){
          domicilio.valor += 'PARCELA: '+registroSips.parcela;
        }

        domicilio.valor = domicilio.valor.trim();
        if (registroSips.codigoPostal)
        domicilio.codigoPostal = registroSips.codigoPostal.trim();

        domicilio.ubicacion= {};
        domicilio.ubicacion.localidad ="";
        if (registroSips.idLocalidad >= 3){
          domicilio.ubicacion.localidad = libString.toTitleCase(registroSips.nombreLocalidad.trim());
        }
        domicilio.ubicacion.provincia = "";
        if (registroSips.idProvinciaDomicilio >= 1){
          domicilio.ubicacion.provincia = libString.toTitleCase(registroSips.nombreProvincia.trim());
        }
        domicilio.ubicacion.pais = "";
        if (registroSips.idProvinciaDomicilio >= 1){
          domicilio.ubicacion.pais = libString.toTitleCase(registroSips.nombrePais.trim());
        }

        //domicilio.ubicacion = ubicacion;
        domicilio.ranking = 1;
        domicilio.activo = true;
        paciente["direccion"].push(domicilio);

        switch (registroSips.idsexo) {
            case 2:
                paciente["sexo"] = "femenino";
                paciente["genero"] = "femenino";
                break;
            case 3:
                paciente["sexo"] = "masculino";
                paciente["genero"] = "masculino";
                break;
            default:
                paciente["sexo"] = "otro";
                paciente["genero"] = "otro";
                break;

        }

        if (registroSips.fechaNacimiento) {
            //var fechaNac = new Date(registroSips.fechaNacimiento);
            var fechaNac = this.obtenerFecha(registroSips.fechaNacimiento);
            paciente["fechaNacimiento"] = fechaNac.toJSON();

        }
        else {
            paciente["fechaNacimiento"] = "";
        }

        if (registroSips.fechaDefuncion && registroSips.fechaDefuncion!='01/01/1900') {
            //var fechaFac = new Date(registroSips.fechaDefuncion);
            var fechaFac = this.obtenerFecha(registroSips.fechaDefuncion);
                paciente["fechaFallecimiento"] = fechaFac.toJSON();
        }


        switch (registroSips.idEstadoCivil) {
            case 1:
                paciente["estadoCivil"] = "casado";
                break;
            case 2:
                paciente["estadoCivil"] = "soltero";
                break;
            case 3:
                paciente["estadoCivil"] = "viudo";
                break;
            case 4:
                paciente["estadoCivil"] = "viudo";
                break;
            default:
                paciente["estadoCivil"] = "";
                break;
        }
        return paciente;


    }

    crearClaveSN(paciente){

     var fecha;
     var anioNacimiento="1900";
     var doc ="";
     if (paciente["fechaNacimiento"]){
         fecha = paciente["fechaNacimiento"].split("-");
         anioNacimiento = fecha[0].toString();
     }

     if (paciente["documento"]){
         doc = paciente["documento"].substr(0,4);
     }


      var clave = libString.obtenerConsonante(paciente.apellido,3) + libString.obtenerConsonante(paciente.nombre,2) +
                  anioNacimiento + doc;

      return clave;


    }





}
