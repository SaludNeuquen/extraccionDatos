# Extracción de Datos


# Resumen
Extrae datos de diferentes fuentes (respositorios, servicios), para obtener
un estructura común

# Cómo usarlo y probarlo
- Desde la consola ejecutar git clone https://github.com/andes/extraccionDatos.git
- Luego en el directorio donde hemos bajado los archivos, ejecutamos npm install, typings install
- Con tsc compilamos (sino se generan los .js)
- Ejecutamos los tests con node test*.js
- Para ejecutar los procesos que tienen manejo de gran cantidad de registros  node --max_old_space_size=4096 testMssql.js
