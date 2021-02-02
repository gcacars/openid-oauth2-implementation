import { io } from 'socket.io-client';
import CONFIG from '../../../../globalConfig';

const socket = io(CONFIG.device.server.dns, {
  rejectUnauthorized: false,
  transports: ['websocket'],
});

export default socket;
