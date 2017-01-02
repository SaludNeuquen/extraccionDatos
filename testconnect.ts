import * as sql from 'mssql';
import * as config from './config';            
            
            
            var connection = {
                user: 'sa',
                password: '12345678',
                server: '127.0.0.1',
                database: 'MARA',
                // connectionTimeout: config.connectionTimeout,
                requestTimeout: config.requestTimeout

            };

            sql.connect(connection).then(function() {
            console.log('Conexion')
            })
             .catch(function(err) {
                        // ... query error checks
                        console.log("Error de conexión al server", err);
                        
                    });