@"
const express = require('express');
const path = require('path');
const app = express();

// Serve os arquivos estáticos do build do React (pasta dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Para qualquer rota que não seja um arquivo, devolve o index.html (essencial para React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// O Cloud Run injeta a porta na variável de ambiente PORT. Se não tiver, usa 8080.
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});
"@ | Set-Content -Path "server.js" -Encoding UTF8