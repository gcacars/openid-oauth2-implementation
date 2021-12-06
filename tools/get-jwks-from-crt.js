const fs = require('fs');
const util = require('util');

const mri = require('mri');
const jose = require('@panva/jose');

const args = mri(process.argv.slice(2));

const key = fs.readFileSync(args.key);
const cert = fs.readFileSync(args.cert);

const { e, kty, n } = jose.JWK.asKey(key).toJWK();

const normalize = (c) => c.replace(/(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g, '');

const jwks = {
  keys: [
    {
      kty,
      e,
      n,
      x5c: [
        normalize(cert.toString()),
      ],
    },
  ],
};

console.log(util.inspect(jwks, { depth: Infinity }));