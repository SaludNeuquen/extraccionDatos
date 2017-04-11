import * as sql from 'mssql';
import * as config from './config';
import {libString} from './libString'
//import {IPaciente} from './interfaces/IPaciente';


export class servicioSips {

    obtenerFecha(fechaStr) {
        var numbers = fechaStr.match(/\d+/g);
        var date = new Date(numbers[2], numbers[1] - 1, numbers[0]);
        return date;

    }

    formatearDatosSips(registroSips) {
        var paciente = {};
        var contacto;
        var domicilio;
        var ubicacion;
        paciente["idPaciente"] = registroSips.idPaciente;
        paciente["identificadores"] = [{ "entidad": "SIPS", "valor": registroSips.idPaciente.toString() }];

        paciente["documento"] = registroSips.numeroDocumento.toString();
        if (registroSips.cluster_id) {
            paciente["clusterId"] = registroSips.cluster_id;
        } else {
            paciente["clusterId"] = "";
        }

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
        domicilio.valor = "";
        if (registroSips.calle) {
            if (registroSips.calle.trim() != "NO TIENE NOMBRE") {
                domicilio.valor = registroSips.calle + ' ';
            }

            if (registroSips.numero) {
                domicilio.valor += registroSips.numero + ' ';
            }

            if (registroSips.piso) {
                domicilio.valor += 'PISO: ' + registroSips.piso + ' ';
            }

            if (registroSips.dpto) {
                domicilio.valor += 'DPTO: ' + registroSips.dpto + ' ';
            }
        }


        if (registroSips.manzana) {
            domicilio.valor += 'MZ: ' + registroSips.manzana + ' ';
        }

        if (registroSips.lote) {
            domicilio.valor += 'LT: ' + registroSips.lote + ' ';
        }

        if (registroSips.parcela) {
            domicilio.valor += 'PARCELA: ' + registroSips.parcela;
        }

        domicilio.valor = domicilio.valor.trim();
        if (registroSips.codigoPostal)
            domicilio.codigoPostal = registroSips.codigoPostal.trim();

        domicilio.ubicacion = {};
        domicilio.ubicacion.localidad = {};
        if (registroSips.idLocalidad >= 3) {
            domicilio.ubicacion.localidad.nombre = libString.toTitleCase(registroSips.nombreLocalidad.trim());
        }
        domicilio.ubicacion.provincia = {};
        if (registroSips.idProvinciaDomicilio >= 1) {
            domicilio.ubicacion.provincia.nombre = libString.toTitleCase(registroSips.nombreProvincia.trim());
        }
        domicilio.ubicacion.pais = {};
        if (registroSips.idProvinciaDomicilio >= 1) {
            domicilio.ubicacion.pais.nombre = libString.toTitleCase(registroSips.nombrePais.trim());
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

        if (registroSips.fechaDefuncion && registroSips.fechaDefuncion != '01/01/1900') {
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

    actualizarRelaciones(listaRelaciones) {

        var relaciones = [];
        var lista = [];

        //Se recorre la listaPacientes y se actualiza la relación de parentesco
        listaRelaciones.forEach(rel => {
            let relaciones = [];
            let relacion = {
                "relacion": rel.TipoParentesco.toLowerCase(),
                "nombre": rel.NombreRel,
                "apellido": rel.ApellidoRel,
                "documento": rel.DocumentoRel
            }
            relaciones.push(relacion);
            lista.push([{ "idPaciente": rel.idPaciente }, { "relaciones": relaciones }]);
        })
        return lista;
    }

    crearClaveSN(paciente) {
        var fecha;
        var anioNacimiento = "1900";
        var doc = "";
        if (paciente["fechaNacimiento"]) {
            fecha = paciente["fechaNacimiento"].split("-");
            anioNacimiento = fecha[0].toString();
        }

        if (paciente["documento"]) {
            doc = paciente["documento"].substr(0, 4);
        }
        var clave = libString.obtenerConsonante(paciente.apellido, 3) + libString.obtenerConsonante(paciente.nombre, 2) +
            anioNacimiento + doc;

        return clave;


    }





}
