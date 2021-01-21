import Http from 'http';
import Koa from 'koa';
import KoaCors from '@koa/cors';
import { Server } from 'socket.io';
import { Issuer } from 'openid-client';
import QRCode from 'qrcode';
// import './listen-as';

const app = new Koa();
app.use(KoaCors({
  origin: true,
}));

const server = Http.createServer(app.callback());
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

let handle;

io.on('connection', (socket) => {
  console.log('Cliente conectado!');

  socket.on('get-codes', async (ua) => {
    try {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
      const issuer = await Issuer.discover('https://api.provider.dev.br');
      const oidcClient = new issuer.Client({
        client_id: 'device',
        client_secret: 'dispositivo',
      });
      handle = await oidcClient.deviceAuthorization();

      // Generate the QR Code that appoints to `verification_uri_complete`
      const qrCode = await QRCode.toDataURL(handle.verification_uri_complete);

      socket.emit('codes', {
        user_code: handle.user_code,
        verification_uri: handle.verification_uri,
        verification_uri_complete: handle.verification_uri_complete,
        qrCode,
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('wait-authorization', async () => {
    try {
      const tokenSet = await handle.poll();
      return true;
    } catch (error) {
      return false;
    }
  });
});

server.listen(9000);
console.log('Ouvindo em https://api.device.dev.br');

setTimeout(() => {
  io.emit('test', 'Oláaaaa');
}, 8000);
