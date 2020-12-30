import { createApp } from 'vue';
import '@popperjs/core';
import 'bootstrap';
import './styles/custom.scss';
import './styles/style.scss';

import router from './router';
import App from './App.vue';
/*import mainAuth from './auth';

mainAuth.$on('accessTokenExpiring', function() {
  // eslint-disable-next-line no-console
  console.log('access token expiring');
});

mainAuth.$on('accessTokenExpired', function() {
  // eslint-disable-next-line no-console
  console.log('access token expired');
});

mainAuth.$on('silentRenewError', function(err) {
  // eslint-disable-next-line no-console
  console.error('silent renew error', err);
});

mainAuth.$on('userLoaded', function(user) {
  // eslint-disable-next-line no-console
  console.log('user loaded', user);
});

mainAuth.$on('userUnloaded', function() {
  // eslint-disable-next-line no-console
  console.log('user unloaded');
});

mainAuth.$on('userSignedOut', function() {
  // eslint-disable-next-line no-console
  console.log('user signed out');
});

mainAuth.$on('userSessionChanged', function() {
  // eslint-disable-next-line no-console
  console.log('user session changed');
});

mainAuth.startup().then((ok) => {
  if (ok) {
    const app = createApp(App).use(router).mount('#app');
    app.prototype.$oidc = mainOidc;
  }
});
*/

createApp(App).use(router).mount('#app');
