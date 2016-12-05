import * as sql from 'mssql';
import * as config from './config';
import {libString} from './libString'


export class servicioHPN {


    obtenerDatosHPN(inicio: number, fin: number) {

        var connection = {
            user: config.user,
            password: config.password,
            server: config.serverSql2,
            database: config.dbMigracion,
            //connectionTimeout: config.connectionTimeout,
            requestTimeout: config.requestTimeout
        };

        return new Promise((resolve, reject) => {

            sql.connect(connection).then(function() {
                // Es una consulta a una vista que tiene toda la información
                new sql.Request()
                    .input('inicio', sql.VarChar(20), inicio.toString())
                    .input('fin', sql.VarChar(20), fin.toString())
                    .query(config.consultaPacienteHC)
                    .then(function(recordset) {
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

    obtenerPacientesHPN() {

        var connection = {
            user: config.user,
            password: config.password,
            server: config.serverSql2,
            database: config.dbMigracion,
            //connectionTimeout: config.connectionTimeout,
            requestTimeout: config.requestTimeout
        };

        return new Promise((resolve, reject) => {

            var consulta = "SELECT * FROM PacientesHPN WHERE legacy_idHistoriaClinica is null ";

            //var consulta = "SELECT COUNT(id), idPaciente FROM Pacientes_Domicilios GROUP BY idPaciente HAVING COUNT(Id) > 1";

            sql.connect(connection).then(function() {
                // Es una consulta a una vista que tiene toda la información
                new sql.Request()
                    //.input('inicio', sql.VarChar(20), inicio.toString())
                    //.input('fin',sql.VarChar(20), fin.toString())
                    .query(consulta)
                    .then(function(recordset) {
                        resolve(recordset);

                    })
                    .catch(function(err) {
                        // ... query error checks
                        console.log("Error de conexión al server", config.serverSql);
                        reject(err);
                    });

            })
        })

    }

    formatearContacto(registro) {
        var contacto;
        contacto = {};
        var listaContactos = [];
        if (registro.id) {
            switch (registro.idTipoContacto) {
                case 10:
                    contacto["tipo"] = "Teléfono Celular";
                    break;
                case 20:
                    contacto["tipo"] = "Teléfono Fijo";
                    break;
                case 30:  //Email
                    contacto["tipo"] = "Email";
                    break;
                default:
                    contacto["tipo"] = "";
                    break;

            }
            if (registro.prefijo) {
                if (registro.prefijo.length >= 4) {
                    contacto["valor"] = registro.prefijo;

                }
                else {
                    if (registro.contacto) {
                        contacto["valor"] = registro.prefijo + registro.contacto;
                    }

                }
            }
            else {
                if (registro.contacto) {
                    contacto["valor"] = registro.contacto;
                }


            }

            contacto["ranking"] = 1;
            if (registro.audit_datetime){
              contacto["ultimaActualizacion"] = new Date(registro.audit_datetime);
            }

            if (registro.activo != null) {
                if (registro.activo == true) {
                    contacto["ultimaActualizacion"] = true;
                }
                else {
                    contacto["ultimaActualizacion"] = false;
                }
            }

            listaContactos.push(contacto);
        }
        else {

            //Se busca la información del contacto de la tabla de Historia Clínica
            contacto["valor"] = "";
            if (registro.HC_Telefono_Caracteristica) {
                contacto["valor"] = registro.HC_Telefono_Caracteristica;
            }
            if (registro.HC_Telefono_Numero) {
                contacto["tipo"] = "";
                contacto["valor"] = contacto["valor"] + registro.HC_Telefono_Numero;
                contacto["ranking"] = 1;
            }

            if (contacto["valor"]) {
                listaContactos.push(contacto);
            }
        }


        return listaContactos;

    }

    formatearDomicilio(registro) {
        //La dirección se toma de la Historia Clínica

        var listaDirecciones = [];
        var domicilio;
        domicilio = {};
        var ubicacion;
        ubicacion = {};
        domicilio["valor"] = "";
        domicilio["ubicacion"] = {};
        if (registro.Codigo) {
            if (registro.HC_Direccion_Calle) {
                domicilio["valor"] = registro.HC_Direccion_Calle + ' ';
            }

            if (registro.HC_Direccion_Numero) {
                domicilio["valor"] += registro.HC_Direccion_Numero + ' ';
            }

            if (registro.HC_Direccion_Piso) {
                domicilio["valor"] += 'PISO: ' + registro.HC_Direccion_Piso + ' ';
            }

            if (registro.HC_Direccion_Dpto) {
                domicilio["valor"] += 'DPTO: ' + registro.HC_Direccion_Dpto + ' ';
            }


            domicilio["ubicacion"].localidad = "";
            if (registro.Loc_Codigo) {
                domicilio["ubicacion"].localidad = libString.toTitleCase(registro.Loc_Nombre);
            }
            domicilio["ubicacion"].provincia = "";
            if (registro.Prov_Codigo) {
                domicilio["ubicacion"].provincia = libString.toTitleCase(registro.Prov_Nombre.trim());
            }


        }

        else {
            //No tiene historia Clínica asociada, por lo tanto no se puede obtener el domicilio
            // if (registro.legacy_observaciones) {
            //
            //     var datos = registro.legacy_observaciones.split("|");
            //     if (datos.length > 2) {
            //         let dom = datos[1];
            //         //JSON.parse(dom);
            //         console.log(dom );
            //     }
            // }

        }
        domicilio["valor"] = domicilio["valor"].trim();
        if (registro.CodigoPostal) {
            domicilio["codigoPostal"] = registro.CodigoPostal.trim();

        }
        else {
            if (registro.HC_Direccion_Codigo_Postal) {
                domicilio["codigoPostal"] = registro.HC_Direccion_Codigo_Postal.trim();
            }
        }

        if (domicilio["valor"] != "") {
            domicilio["ubicacion"].pais = "";
            // if (registro.idProvinciaDomicilio){
            //   domicilio.ubicacion.pais = libString.toTitleCase(registroSips.nombrePais.trim());
            // }

            //domicilio.ubicacion = ubicacion;
            domicilio["ranking"] = 1;
            domicilio["activo"] = true;

            if (registro.fechaDomicilio) {
                domicilio["ultimaActualizacion"] = new Date(registro.fechaDomicilio)
            }


        }

        listaDirecciones.push(domicilio);

        return listaDirecciones;

    }

    formatearDatosHPN(registro) {
        var paciente = {};
        var contacto;
        var domicilio;
        var ubicacion;


        if (registro.Codigo) {
            paciente["idPacienteHPN"] = registro.Codigo;  //Ver el nuevo esquema
            //Ver campos esDNI
            paciente["documento"] = registro.HC_Documento;
            paciente["nombre"] = registro.HC_Nombre;
            paciente["apellido"] = registro.HC_Apellido;
        }
        else {
            paciente["idPacienteHPN"] = registro.id;  //Ver el nuevo esquema
            //Ver campos esDNI
            paciente["documento"] = registro.documento;
            paciente["nombre"] = registro.nombre;
            paciente["apellido"] = registro.apellido;

        }

        if ((registro.HC_Nacionalidad) && (registro.HC_Nacionalidad != "Argentina")) {
            paciente["estado"] = "extranjero";
        }
        else {
            if (registro.recienNacido) {
                paciente["estado"] = "recienNacido";
            }
            else {
                paciente["estado"] = "temporal";
            }

        }

        paciente["activo"] = true;

        // estado : ["temporal", "identificado", "validado", "recienNacido", "extranjero"]
        // switch (registro.idEstado) {
        //     case 1:
        //         paciente["estado"] = "recienNacido";
        //         break;
        //     case 2:
        //         paciente["estado"] = "extranjero";
        //         break;.ubicacion
        //     default:
        //         paciente["estado"] = "temporal";
        //         break;
        //
        // }


        //Se arma la lista de contactos
        paciente["contacto"] = [];
        paciente["contacto"] = this.formatearContacto(registro);

        //Se arma la lista de direcciones
        paciente["direccion"] = [];
        paciente["direccion"] = this.formatearDomicilio(registro);

        //Se verifica el sexo

        switch (registro.HC_Sexo) {
            case 'Masculino':
                paciente["sexo"] = "masculino";
                paciente["genero"] = "masculino"; // identidad autopercibida
                break;
            case 'Femenino':
                paciente["sexo"] = "femenino";
                paciente["genero"] = "femenino"; // identidad autopercibida
                break;
            default:
                paciente["sexo"] = "otro";
                paciente["genero"] = "otro"; // identidad autopercibida
                break;
        }

        if (registro.HC_Nacimiento_Fecha) {
            paciente["fechaNacimiento"] = new Date(registro.HC_Nacimiento_Fecha);   //registro.nacimientoFecha
        }
        else {
            if (registro.nacimientoFecha) {
                paciente["fechaNacimiento"] = new Date(registro.nacimientoFecha);
            }
        }


        if (registro.HC_Fallecimiento_Fecha) {   //registro.fallecido
            paciente["fechaFallecimiento"] = new Date(registro.HC_Fallecimiento_Fecha); //registro.fallecidoFecha
        }
        else {
            if (registro.fallecido) {
                if (registro.fallecidoFecha) {
                    paciente["fechaFallecimiento"] = new Date(registro.fallecidoFecha);
                }
            }
        }

        //["casado", "separado", "divorciado", "viudo", "soltero", "otro", ""]

        if (registro.HC_Estado_Civil) {
            switch (registro.HC_Estado_Civil) {
                case "Casado/a":
                    paciente["estadoCivil"] = "casado";
                    break;
                case "Separado/a":
                    paciente["estadoCivil"] = "separado";
                    break;
                case "Soltero/a":
                    paciente["estadoCivil"] = "soltero";
                    break;
                case "Viudo/a":
                    paciente["estadoCivil"] = "viudo";
                    break;
                default:
                    paciente["estadoCivil"] = "otro";
                    break;
            }

        }
        else {
            switch (registro.idEstadoCivil) {
                case 1:
                    paciente["estadoCivil"] = "casado";
                    break;
                case 2:
                    paciente["estadoCivil"] = "separado";
                    break;
                case 3:
                    paciente["estadoCivil"] = "soltero";
                    break;
                case 4:
                    paciente["estadoCivil"] = "viudo";
                    break;
                default:
                    paciente["estadoCivil"] = "otro";
                    break;
            }

        }
        return paciente;


    }

    armarRelaciones() {
        //Se busca la relación de padres e hijos y se agrega el campo relaciones
    }
}
