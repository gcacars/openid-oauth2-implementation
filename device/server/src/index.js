import { Server } from 'socket.io';
import { Issuer } from 'openid-client';
import QRCode from 'qrcode';
import CONFIG from '../../../globalConfig';

const io = new Server({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

/**
 * @type {import('openid-client').DeviceFlowHandle}
 */
let handle;
/**
 * @type {import('openid-client').Client}
 */
let oidcClient;
/**
 * @type {import('openid-client').TokenSet}
 */
let tokenSet;

io.on('connection', /** @param {import('socket.io').Socket} socket */(socket) => {
  // eslint-disable-next-line no-console
  console.info('Screen connected!');

  socket.on('get-codes', async () => {
    try {
      // Check if already authenticated
      if (tokenSet && !tokenSet.expired()) {
        socket.emit('authorized', {
          id_token: tokenSet.id_token,
          expires_at: tokenSet.expires_at,
        });
        return;
      }

      // Get new codes
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
      const issuer = await Issuer.discover(CONFIG.provider.server.dns);
      oidcClient = new issuer.Client({
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
      // eslint-disable-next-line no-console
      console.error(error);
      socket.emit('authorization-error', error);
    }
  });

  socket.on('wait-authorization', async () => {
    try {
      tokenSet = await handle.poll();
      const userInfo = await oidcClient.userinfo(tokenSet);
      socket.emit('authorized', {
        id_token: tokenSet.id_token,
        expires_at: tokenSet.expires_at,
        userInfo,
      });
    } catch (error) {
      socket.emit('authorization-error', error);
    }
  });

  socket.on('flush-keys', () => {
    tokenSet = null;
    socket.emit('flushed');
  });
});

io.listen(CONFIG.device.server.port);
// eslint-disable-next-line no-console
console.log(CONFIG.device.server.dns);
