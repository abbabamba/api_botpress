const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  // Ajoutez ces lignes pour les en-têtes CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Gestion de la requête OPTIONS pour CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { prenom, nom, date_rendezvous, heure_rendezvous, raison, mail } = JSON.parse(event.body);
    const query = `
      INSERT INTO Rendezvous (prenom, nom, date_rendez_vous, heure_rendezvous, raison, email)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const values = [prenom, nom, date_rendezvous, heure_rendezvous, raison, mail];
    const result = await pool.query(query, values);
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ id: result.rows[0].id, message: 'Rendez-vous créé avec succès' }),
    };
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur lors de la création du rendez-vous' }),
    };
  }
};
