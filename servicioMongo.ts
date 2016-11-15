import * as config from './config';
import * as mongodb from 'mongodb';
import {libString} from './libString';
//import * as assert from './assert';

export class servicioMongo {

    getPacientes() {
        var url = config.urlMigraSips;
        //var url = 'mongodb://localhost:27017/andes';
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                var projection = {
                    _id: 0,
                    "documento": 1,
                    "estado": 1,
                    "nombre": 1,
                    "apellido": 1,
                    "contacto": 1,
                    "direccion": 1,
                    "sexo": 1,
                    "genero": 1,
                    "fechaNacimiento": 1,
                    "estadoCivil": 1,
                    "claveSN": 1
                }
                db.collection("paciente").find({
                    idPaciente: 1
                }, projection).toArray(function(err, items) {
                    if (err)
                        reject(err);
                    else {
                        resolve(items);
                        db.close();
                    }
                })


            });
        });

    }

    obtenerPaises() {
        var url = config.urlMongoAndes;
        //var url = 'mongodb://localhost:27017/andes';
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("pais").find({
                }).toArray(function(err, items) {
                    if (err)
                        reject(err);
                    else {
                        resolve(items);
                    }
                    db.close();
                })
            });
        });

    }

    obtenerClaveSN() {
        var url = config.urlMigraSips;
        //var url = 'mongodb://localhost:27017/andes';
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("blockPacienteClaveSN").find({
                    count: { $gt: 1 }
                }).toArray(function(err, items) {
                    if (err)
                        reject(err);
                    else {
                        resolve(items);
                    }
                    db.close();

                })


            });
        });

    }

    obtenerProvincias() {
        var url = config.urlMongoAndes;
        //var url = 'mongodb://localhost:27017/andes';
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("provincia").find({
                }).toArray(function(err, items) {
                    if (err)
                        reject(err);
                    else {

                        resolve(items);
                    }
                    db.close();
                })


            });
        });

    }

    obtenerLocalidades() {
        var url = config.urlMongoAndes;
        //var url = 'mongodb://localhost:27017/andes';
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("localidad").find({
                }).toArray(function(err, items) {
                    if (err)
                        reject(err);
                    else
                        resolve(items);
                    db.close();

                })


            });
        });

    }

    obtenerPacientes(condicion) {
        var url = config.urlMigraSips;
        console.log('URL', url, condicion);
        //var url = 'mongodb://localhost:27017/andes';
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("paciente").find({
                    "claveSN": condicion
                }).toArray(function(err, items) {
                    if (err) {
                        console.log('Error obtenerPacientes', err);
                        reject(err);
                    }

                    else {
                        resolve(items);
                        db.close();
                    }
                })


            });
        });

    }

    buscarPais(pais) {
        var url = config.urlMongoAndes;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("pais").findOne({
                    "nombre": pais
                }, function(err, item) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(item);
                    }

                });

                db.close();
            });

        });
    }

    buscarProvincia(provincia) {
        var url = config.urlMongoAndes;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("provincia").findOne({
                    "nombre": { $regex: libString.makePattern(provincia) }
                    //  "nombre": provincia
                }, function(err, item) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(item);
                    }

                });

                db.close();
            });

        });
    }

    buscarLocalidad(localidad) {
        var url = config.urlMongoAndes;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("localidad").findOne({
                    "nombre": { $regex: libString.makePattern(localidad) }
                    //"nombre": localidad
                }, function(err, item) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(item);
                    }

                });

                db.close();
            });

        });
    }


    abrirConexion() {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                if (err)
                    reject(err);
                else
                    resolve(db)
            })
        })
    }

    cerrarConexion(db) {
        db.close();
    }

    guardarPacientes(pacientes) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                console.log('Total Pacientes', pacientes.length);
                pacientes.forEach(paciente => {
                    db.collection("paciente").insertOne(paciente, function(err, item) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(item);
                        }

                    });
                });
                db.close();
            });

        });
    }


    cargaPaciente(paciente) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("paciente").insertOne(paciente, function(err, item) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(item);
                    }

                });

                db.close();
            });

        });
    }

    guardarMatch(match) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("matching").insertOne(match, function(err, item) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(item);
                    }
                    db.close();
                });


            });

        });
    }

    guardarLog(log) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("logMigraSips").insertOne(log, function(err, item) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(item);
                    }

                });

                db.close();
            });

        });
    }

    actualizarLocalidades() {

        var url = config.urlMongoAndes;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("localidadBak").find({
                }).toArray(function(err, localidades) {
                    if (err) {
                        reject(err);
                    } else {
                        localidades.forEach(function(loc) {
                            //loc.departamento = libString.toTitleCase(loc.departamento);
                            var ObjectID = mongodb.ObjectID;
                            var idLoc = new ObjectID(loc._id);
                            console.log('ID', idLoc);
                            loc.nombre = libString.toTitleCase(loc.nombre);
                            console.log(loc);
                            db.collection("localidadBak").findOneAndUpdate(
                                { "_id": idLoc },
                                { $set: { "nombre": loc.nombre } }, function(err, result) {
                                    if (err) {
                                        console.log('Error', err)
                                        reject(err);
                                    }
                                    else {
                                        console.log('UPDATE', result);
                                        resolve('OK1');
                                    }

                                }
                            )
                        });
                        resolve('OK2');
                    }
                    db.close();
                });

                //db.close();
            });

        });
    }



}
