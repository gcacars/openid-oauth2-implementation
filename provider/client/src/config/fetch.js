const fetchConfig = {
  headers: {
    accept: 'application/json',
    'X-BuildID': process.env.VUE_APP_BUILD_HASH,
  },
  credentials: 'include',
  cache: 'default',
  mode: 'cors',
  redirect: 'manual',
  referrerPolicy: 'same-origin',
};

export default fetchConfig;
