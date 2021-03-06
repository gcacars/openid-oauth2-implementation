import fs from 'fs';
import https from 'https';
import { nanoid } from 'nanoid';

// Pegar o certificado para criar o https
if (!fs.existsSync('./key.pem')) {
  console.error('Crie uma nova chave e certificado conforme descrito no README.md');
}

const key = fs.readFileSync('./key.pem');
const cert = fs.readFileSync('./cert.pem');

// Iniciar servidor com HTTPS
https.createServer({
  key,
  cert,
}, (req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  const qs = new URLSearchParams(req.url.split('?')[1]);

  if (qs.get('error')) {
    res.write(`<h1>Erro: ${qs.get('error')}</h1><p>${qs.get('error_description')}</p>`);
  } else {
    res.write('O aplicativo está funcionando! :)');
  }

  const state = nanoid();

  res.end(`<br><br>
    <a href="http://api.provider.dev.br/auth?response_type=code&scope=openid%20email&client_id=app&login_hint=manoel@exemplo.com.br&redirect_uri=https://apprp.dev.br/cb&state=${state}">
      Fazer login
    </a><br>
    <a href="http://api.provider.dev.br/session/end">Fazer logout</a>
  `);
}).listen(7000);
