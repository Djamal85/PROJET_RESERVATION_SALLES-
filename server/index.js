// ===============================
// Serveur Node.js pour la gestion des utilisateurs
// ===============================

const http = require('http');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'ma_clé_secrète';
const bcrypt = require('bcrypt');

// Chemin vers le fichier des utilisateurs
const usersFile = path.join(__dirname, 'data', 'users.json');

// Fonction pour lire les utilisateurs depuis le fichier JSON
function getUsers() {
  const data = fs.readFileSync(usersFile, 'utf-8');
  return JSON.parse(data);
}

// Fonction pour sauvegarder les utilisateurs dans le fichier JSON
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
}

// Fonction pour parser le corps de la requête HTTP
function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => callback(JSON.parse(body)));
}

// Fonction pour générer un identifiant numérique unique
function generateNumericId(users) {
    return users.length > 0 ? users[users.length - 1].id + 1 : 1;
}

// Création du serveur HTTP
const server = http.createServer((req, res) => {
  // Configuration des headers CORS pour autoriser les requêtes cross-origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gestion des requêtes préliminaires OPTIONS (pour les navigateurs)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // Route pour l'inscription d'un nouvel utilisateur
  if (req.url === '/register' && req.method === 'POST') {
    parseBody(req, async (userData) => {
      const users = getUsers();
      // Vérifier si l'email existe déjà
      const exists = users.find(u => u.email === userData.email);
      if (exists) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Email déjà utilisé' }));
      }

      // Générer un identifiant unique pour le nouvel utilisateur
      userData.id = generateNumericId(users);

      // Hasher le mot de passe avant de sauvegarder
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);

      // Ajouter l'utilisateur à la liste et sauvegarder
      users.push(userData);
      saveUsers(users);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Inscription réussie', userId: userData.id }));
    });
  }

  // Route pour la connexion d'un utilisateur
  else if (req.url === '/login' && req.method === 'POST') {
    parseBody(req, async (loginData) => {
      const users = getUsers();
      // Chercher l'utilisateur par email
      const found = users.find(u => u.email === loginData.email);
      if (found) {
        // Vérifier le mot de passe avec bcrypt
        const match = await bcrypt.compare(loginData.password, found.password);
        if (match) {
          // Générer un token JWT pour l'utilisateur connecté
          const token = jwt.sign({ email: found.email }, SECRET_KEY, { expiresIn: '1h' });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Connexion réussie', token }));
        } else {
          // Mot de passe incorrect
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'mot de passe incorrect' }));
        }
      } else {
        // Email incorrect
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email incorrect' }));
      }
    });
  }

  // Route pour obtenir la liste des utilisateurs (sans les mots de passe)
  else if (req.url === '/users' && req.method === 'GET') {
    const users = getUsers();

    // Supprimer les mots de passe avant d'envoyer la liste
    const sanitizedUsers = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sanitizedUsers));
  }

  // Route non trouvée
  else {
    res.writeHead(404);
    res.end();
  }
});

// Démarrage du serveur sur le port 3000
server.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});