import { TOTP, Secret } from 'otpauth';

// Uma forma de criar variáveis privadas na classe
const dbClient = new WeakMap();

class Otp {
  constructor(dbInstance) {
    dbClient.set(this, dbInstance);
  }

  static getSecret(tenantId, accountId) {
    return Secret.fromRaw(`${tenantId}-${accountId}`);
  }

  validateToken(tenantId, accountId, token) {
    const secret = Otp.getSecret(tenantId, accountId);
    const totp = this.getTotp(secret);
    return totp.validate({ token, window: 2 });
  }

  generateNewToken(tenantId, accountId) {
    const secret = Otp.getSecret(tenantId, accountId);
    const totp = this.getTotp(secret);
    return totp.generate();
  }

  getAuthenticationUri(tenantId, accountId) {
    const secret = Otp.getSecret(tenantId, accountId);
    const totp = this.getTotp(secret);
    return totp.toString();
  }

  /**
   * Indica se o OTP foi configurado para um usuário ou não (remove)
   * @param {string} accountId O ID da conta
   * @param {boolean} value Se o OTP foi configurado (`true`) ou não (`false`)
   */
  setEnrollment(accountId, value) {
    /**
     * @type {import('lowdb').LowdbSync}
     */
    const db = dbClient.get(this);
    const val = db.get('users').find({ _id: accountId }).value();
    const amr = {
      ...val.authenticationMethods,
      otp: value,
    };
    return db.get('users').find({ _id: accountId }).assign({
      authenticationMethods: amr,
    }).write();
  }

  getConfig() {
    /**
     * @type {import('lowdb').LowdbSync}
     */
    const db = dbClient.get(this);
    return db.get('config').find({ _id: 'otp' }).value();
  }

  getTotp(secret) {
    const {
      issuer, label, algorithm, digits, period,
    } = this.getConfig();
    return new TOTP({
      issuer,
      label,
      algorithm,
      digits,
      period,
      secret,
    });
  }
}

export default Otp;
