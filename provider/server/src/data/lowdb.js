import low from 'lowdb';
import Memory from 'lowdb/adapters/Memory';

const db = low(new Memory());

try {
  db.defaults({
    users: [
      {
        _id: '23121d3c-84df-44ac-b458-3d63a9a05497',
        firstName: 'Karina',
        email: 'karina@exemplo.com.br',
        email_verified: true,
        picture_url: 'https://randomuser.me/api/portraits/women/57.jpg',
        tenantId: 1,
        authenticationMethods: {
          password: false,
          otp: false,
          fido: false,
        },
        created: Date.now(),
      },
      {
        _id: 'c2ac2b4a-2262-4e2f-847a-a40dd3c4dcd5',
        firstName: 'Manoel',
        email: 'manoel@exemplo.com.br',
        email_verified: false,
        picture_url: 'https://randomuser.me/api/portraits/men/40.jpg',
        tenantId: 2,
        authenticationMethods: {
          password: true,
          otp: false,
          fido: false,
        },
        created: Date.now(),
      },
      {
        _id: 'e3fc2b4a-2262-4e2f-847a-a40dd3ca1s13',
        firstName: 'Admin',
        email: 'admin@exemplo.com.br',
        email_verified: false,
        picture_url: 'https://randomuser.me/api/portraits/men/15.jpg',
        tenantId: 0,
        authenticationMethods: {
          password: true,
          otp: false,
          fido: false,
        },
        created: Date.now(),
      },
    ],

    scopes: [
      {
        _id: 'email',
        title: 'Endereço de e-mail',
        desc: `A aplicação irá saber qual seu endereço de e-mail, e poderá 
        te enviar mensagens através dele.`,
        grantable: true,
      },
      {
        _id: 'openid',
        title: 'OpenID',
        grantable: false,
      },
      {
        _id: 'phone',
        title: 'Seu número de telefone',
        desc: `A aplicação terá acesso ao seu número de telefone e poderá
        te enviar SMS ou fazer ligações.`,
        grantable: true,
      },
      {
        _id: 'profile',
        title: 'Seu perfil',
        desc: `Sua data de nascimento, nome completo, gênero, foto, perfil e
        outras informações, estejam disponíveis para aplicação.`,
        grantable: true,
      },
    ],

    config: [
      {
        _id: 'otp',
        issuer: 'oidc-implementation.dev',
        label: 'OIDC Implementation Example',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
      },
    ],
  }).write();
} catch (error) {
  console.error(error);
}

export default db;
