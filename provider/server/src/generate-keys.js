import fs from 'fs';
import path from 'path';
import { JWKS } from 'jose';

const keystore = new JWKS.KeyStore();

Promise.all([
  keystore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' }),
  keystore.generate('RSA', 2048, { use: 'sig' }),
  keystore.generate('RSA', 2048, { use: 'enc' }),
  keystore.generate('EC', 'P-256', { use: 'sig' }),
  keystore.generate('EC', 'P-256', { use: 'enc' }),
  keystore.generate('OKP', 'Ed25519', { use: 'sig' }),
]).then(() => {
  fs.writeFileSync(
    path.resolve('./jwks.json'),
    JSON.stringify(keystore.toJWKS(true), null, 2),
  );
});
