import { io } from 'socket.io-client';

// Listen to authorization server
const socket = io('https://api.provider.dev.br');

socket.on('connect', () => {
  console.log('Conectado ao servidor de autorização! :)');
});
