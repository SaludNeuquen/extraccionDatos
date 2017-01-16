import * as config from './config';
import * as mongodb from 'mongodb';
import {libString} from './libString';
//import * as assert from './assert';

export class servicioMongo {

    getPacientes(url, coleccion) {

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
                db.collection(coleccion).find({
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

    obtenerPacientes(condicion, coleccion) {
        var url = config.urlMigracion;
        console.log('URL', url, condicion);
        //var url = 'mongodb://localhost:27017/andes';
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection(coleccion).find(
                    condicion
                ).toArray(function(err, items) {
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

    guardarPacientes(pacientes, coleccion: string) {
        var url = config.urlMigracion;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                console.log('Total Pacientes', pacientes.length);
                pacientes.forEach(paciente => {
                    db.collection(coleccion).insertOne(paciente, function(err, item) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(item);
                        }
                        db.close();

                    });
                });

            });

        });
    }


    cargaPaciente(paciente, coleccion) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection(coleccion).insertOne(paciente, function(err, item) {
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

    guardarLog(coleccion: string, log) {
        var url = config.urlMigracion;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection(coleccion).insertOne(log, function(err, item) {
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

    guardarLogSips(log) {
        var url = config.urlMigraSips;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("logSips").insertOne(log, function(err, item) {
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

    actualizarDatos(coleccion, lista) {
        var url = config.urlMigracion;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                lista.forEach(function(elem) {
                    db.collection(coleccion).findOneAndUpdate(
                        elem[0],
                        { $set: elem[1] }, function(err, result) {
                            if (err) {
                                console.log('Error', err)
                                reject(err);
                            }
                            else {
                                resolve('OK');
                                db.close();
                            }
                        }
                    )
                });

            })

        });
    }

    actualizarDirecciones(coleccion, listaPacientes) {

        var url = config.urlMigracion;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {

                listaPacientes.forEach(function(pac) {

                    let ObjectID = mongodb.ObjectID;
                    let id = new ObjectID(pac._id);

                    db.collection(coleccion).findOneAndUpdate(
                        { "_id": id },
                        { $set: { "direccion": pac.direccion } }, function(err, result) {
                            if (err) {
                                console.log('Error', err)
                                reject(err);
                            }
                            else {
                                resolve('OK');
                                db.close();
                            }
                        }
                    )
                });

            })

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


    actualizarOrganizacion() {

        var url = config.urlMongoAndes;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection("organizacion").find({
                }).toArray(function(err, organizaciones) {
                    if (err) {
                        reject(err);
                    } else {
                        organizaciones.forEach(function(org) {
                            //loc.departamento = libString.toTitleCase(loc.departamento);
                            var ObjectID = mongodb.ObjectID;
                            var idOrg = new ObjectID(org._id);
                            if (org.tipoEstablecimiento) {
                                if (org.tipoEstablecimiento.id) {

                                    let tipo = new ObjectID(org.tipoEstablecimiento.id);

                                    console.log(org);
                                    db.collection("organizacion").findOneAndUpdate(
                                        { "_id": idOrg },
                                        { $set: { "tipoEstablecimiento": tipo } }, function(err, result) {
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
                                    resolve('OK2');
                                }
                            }

                        });

                    }
                    db.close();
                });

                //db.close();
            });

        });
    }

    actualizarPacientes(coleccion, entidad) {

        var url = config.urlMigracion;
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(url, function(err, db) {
                db.collection(coleccion).find({
                }).toArray(function(err, lista) {
                    if (err) {
                        reject(err);
                    } else {
                        lista.forEach(function(elem) {
                            //loc.departamento = libString.toTitleCase(loc.departamento);
                            var ObjectID = mongodb.ObjectID;
                            var idElem = new ObjectID(elem._id);
                            console.log('ID', idElem);
                            db.collection(coleccion).findOneAndUpdate(
                                { "_id": idElem },
                                { $set: { "identificadores": [{ "entidad": entidad, "valor": elem.idPaciente }] } }, function(err, result) {
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
