// =====================================================================
//  API DE TÉLÉCHARGEMENT : GET /download/:id
// =====================================================================
//  json-server ne sait renvoyer que du JSON. Ce petit "middleware"
//  ajoute une route qui renvoie le VRAI fichier (PDF, image...) :
//    1. on lit server/db.json ;
//    2. on cherche le fichier dans "files" ;
//    3. on transforme son contenu base64 en octets et on l'envoie.
//
//  Lancé avec : json-server ... --middlewares server/download.js

const fs = require('fs');
const path = require('path');

module.exports = function download(req, res, next) {
  const match = req.method === 'GET' && req.path.match(/^\/download\/([^/]+)$/);
  if (!match) {
    return next(); // pas notre route : json-server continue normalement
  }

  const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));
  const file = (db.files || []).find((f) => String(f.id) === match[1]);
  if (!file) {
    return res.status(404).json({ error: 'Fichier introuvable' });
  }

  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(file.name) + '"');
  res.send(Buffer.from(file.data, 'base64'));
};
