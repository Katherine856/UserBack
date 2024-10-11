const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// Ruta para obtener datos de la tabla usuarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');

    // Manejo si no se encuentran usuarios
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'No se encontraron usuarios' });
    }

    res.json(result.rows);
  } catch (err) {
    // Manejo de errores generales
    console.error(err);

    // Manejo de 400 en caso de que el error sea por una consulta mal formulada
    if (err.code === '42P01') { // Código de error para tabla no encontrada
      return res.status(400).json({ error: 'Consulta mal formulada' });
    }

    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Ruta para obtener un usuario específico por id
router.get('/:id', async (req, res) => {
  const userId = req.params.id; // Obtiene el id del usuario desde los parámetros de la ruta

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);

    // Manejo si no se encuentra el usuario
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]); // Devuelve el usuario encontrado
  } catch (err) {
    console.error(err);

    // Manejo de 400 en caso de que el error sea por una consulta mal formulada
    if (err.code === '42P01') { // Código de error para tabla no encontrada
      return res.status(400).json({ error: 'Consulta mal formulada' });
    }

    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Ruta para agregar un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, correo, edad } = req.body; // Obtiene los datos del usuario desde el cuerpo de la solicitud

  if (!nombre || !correo || !edad) {
    return res.status(400).json({ error: 'Nombre, correo y edad son requeridos.' });
  }

  try {
    const result = await pool.query('INSERT INTO usuarios (nombre, correo, edad) VALUES ($1, $2, $3)', [nombre, correo, edad]);
    res.status(201).json(result.rows[0]); // Devuelve el usuario agregado
  } catch (err) {
    console.error(err);

    // Manejo de 400 en caso de que el error sea por una consulta mal formulada
    if (err.code === '42P01') {
      return res.status(400).json({ error: 'Consulta mal formulada' });
    }

    // Manejo de violaciones de restricciones, como duplicados
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    res.status(500).json({ error: 'Error al agregar el usuario' });
  }
});

// Ruta para actualizar un usuario por ID
router.put('/:id', async (req, res) => {
  const userId = req.params.id; // Obtiene el ID del usuario desde los parámetros de la ruta
  const { nombre, correo, edad } = req.body; // Obtiene los nuevos valores desde el cuerpo de la solicitud

  // Validación básica de entrada
  if (!nombre || !correo || !edad) {
    return res.status(400).json({ error: 'Nombre, correo y edad son requeridos.' });
  }

  try {
    const result = await pool.query(
      'UPDATE usuarios SET nombre = $1, correo = $2, edad = $3 WHERE id = $4',
      [nombre, correo, edad, userId]
    );

    // Manejo si no se encuentra el usuario
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]); // Devuelve el usuario actualizado
  } catch (err) {
    console.error(err);

    // Manejo de errores específicos
    if (err.code === '42P01') {
      return res.status(400).json({ error: 'Consulta mal formulada' });
    }

    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

// Ruta para eliminar un usuario por ID
router.delete('/:id', async (req, res) => {
  const userId = req.params.id; // Obtiene el ID del usuario desde los parámetros de la ruta

  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [userId]);

    // Manejo si no se encuentra el usuario
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(204).send(); // Devuelve un estado 204 sin contenido
  } catch (err) {
    console.error(err);

    // Manejo de errores específicos
    if (err.code === '42P01') {
      return res.status(400).json({ error: 'Consulta mal formulada' });
    }

    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});


module.exports = router;
