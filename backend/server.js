// Importation des modules nécessaires
const express = require('express'); // Framework web pour Node.js
const fs = require('fs'); // Module pour manipuler les fichiers
const bcrypt = require('bcrypt'); // Module pour le hachage des mots de passe
const cors = require('cors'); // Middleware pour autoriser les requêtes cross-origin
const app = express(); // Création de l'application Express

app.use(cors()); // Autorise les requêtes provenant d'autres origines (ex: frontend local)
app.use(express.json()); // Permet de parser automatiquement le JSON dans les requêtes

const USERS_FILE = './data/users.json'; // Chemin du fichier où sont stockés les utilisateurs

// Si le fichier d'utilisateurs n'existe pas, on le crée vide
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]', 'utf-8');
}

// Route pour l'inscription d'un nouvel utilisateur
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body; // Récupère les données envoyées par le client
    const id = Date.now().toString(); // Génère un identifiant unique basé sur la date

    // Vérifie que tous les champs sont présents
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Champs requis manquants' });
    }

    // Lecture des utilisateurs existants
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    // Vérifie si l'email existe déjà
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ message: 'Utilisateur déjà existant' });
    }

    // Hachage du mot de passe avant stockage
    const hashedPassword = await bcrypt.hash(password, 10);
    // Ajoute le nouvel utilisateur au tableau
    users.push({ id, name, email, password: hashedPassword });

    // Sauvegarde la liste mise à jour dans le fichier
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.status(201).json({ message: 'Inscription réussie' });
});

// Route pour la connexion d'un utilisateur
app.post('/login', async (req, res) => {
    const { email, password } = req.body; // Récupère l'email et le mot de passe du client
    const users = JSON.parse(fs.readFileSync(USERS_FILE)); // Charge les utilisateurs existants
    const user = users.find(u => u.email === email); // Recherche l'utilisateur par email
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    // Vérifie si le mot de passe fourni correspond au mot de passe haché stocké
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    // Si tout est correct, renvoie les infos de l'utilisateur (sauf le mot de passe)
    res.status(200).json({ message: 'Connexion réussie', user: { id: user.id, name: user.name, email: user.email } });
});

// Route pour récupérer la liste des utilisateurs (sans les mots de passe)
app.get('/users', (req, res) => {
    const users = JSON.parse(fs.readFileSync(USERS_FILE)); // Charge les utilisateurs
    // Retourne tous les utilisateurs sans le champ 'password'
    res.json(users.map(({ password, ...u }) => u));
});

// Démarre le serveur sur le port 3000
app.listen(3000, () => {
    console.log('Serveur backend lancé sur http://localhost:3000');
});
