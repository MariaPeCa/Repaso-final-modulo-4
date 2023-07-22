// Servidor Express

// Para probar los ficheros estáticos del fronend, entrar en <http://localhost:4500/>
// Para probar el API, entrar en <http://localhost:4500/api/items>

// Imports

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require('dotenv').config()

// Arracar el servidor

const server = express();

// Configuración del servidor

server.use(cors());
server.use(express.json({ limit: "25mb" }));

// Conexion a la base de datos

async function getConnection() {
  //console.log('Que contraseña')
  //console.log(process.env.DB_PASS);
  const connection = await mysql.createConnection(
    {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS,  // <-- Pon aquí tu contraseña o en el fichero /.env en la carpeta raíz
      database: process.env.DB_NAME || "Clase",
    }
  );

  connection.connect();

  return connection;
}

// Poner a escuchar el servidor

const port = process.env.PORT || 4500;
server.listen(port, () => {
  console.log(`Ya se ha arrancado nuestro servidor: http://localhost:${port}/`);
});



// Endpoints (es la ruta más la funcionalidad)

// GET /api/items (1º parám ruta, 2º parám función asyn (req,res)) es asíncrona xq tenemos q esperar a q la BD me devuelva la info y ya yo retornaré algo.

//consultar todos los gatos

server.get('/api/kittens/:user', async (req, res) => {
  // recojo en una var la parte después del : y hago req.params y esa parte variable 
  const user = req.params.user;
  console.log(user);
  //sentencia sql para buscar los datos de un propietario en específico
  const select = 'SELECT * FROM kitten WHERE owner = ?';
  //creo la constante q va a tener la info de la conexión, como es una funcion async hay q ejecutarla con await
  const conn = await getConnection();
  //para ejecutar la sentencia sql hay q hacer un método query, como la info que quiero está dentro de un array hago un destructuring y me quedo con lo primero y lo llamo resul [result]
  //result puede llamarse como yo quiera
  //la ejecución del select es asíncrono (hago un await)
  const [result] = await conn.query(select, user);
  console.log(result);
  conn.end();
  res.json({
    info: {
      //count: numOfkittens --- número de elementos del listado con .length
      count: result.length, //
    },
    //results: kittenData --- listado de gatitos
    results: result, //mi listado de gatitos está en result
  });
});
//añadir un nuevo gato
//vamos a recibir info por los dos parámetros
server.post('/api/kittens/:user', async (req, res) => {
  const user = req.params.user;
  const newKitten = req.body;


  try {
    //pongo tantas interrogaciones como culumnas tengo, xq serán valores que aún no conozco porque son del nuevo gatito q se v a introducir
    const insert = 'INSERT INTO kitten (`owner`, url, name, race, `desc`)VALUES (?,?,?,?,?)'
    const conn = await getConnection();
    //la query q hago ahora recibe varios parámetros, el primero es un insert y hago un destructuring de los otros dos parámetros de los que recibo info que son user y newKitten(las dos constantes que creé)
    const [result] = await conn.query(insert, [
      user,
      newKitten.url,
      newKitten.name,
      newKitten.race,
      newKitten.desc
      //los datos anteriores me llegan del front, no tienen xq ser iguales q los de mi tabla pero es aconsejable q lo sean
    ]);
    conn.end();
    res.json({
      success: true,//puede ser true o false
    });
  } catch (error) {
    res.json({
      success: false, //puede ser true o false
      //si me pidiesen devolver el error y así veo en postman q ha fallado
      message: error,
    });
  }
});

//modificar un gatito ---> update sql
//método PUT
server.post('/api/kittens/:user/:kitten_id', async (req, res) => {
  const user = req.params.user;
  const kittenId = req.params.kitten_id;
  const {urlFront, nameFront, raceFront, descFront } = req.body;
  try {
    const update = 'UPDATE kitten SET url= ?, name = ?, race= ?, `desc`= ? WHERE id = ?';
    const conn = await getConnection();
    const [result] = await conn.query(update, [
      urlFront, 
      nameFront, 
      raceFront, 
      descFront, 
      kittenId,
    ]);
    conn.end();
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error
    });
  }
});