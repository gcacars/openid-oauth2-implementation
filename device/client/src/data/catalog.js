const catalog = [
  {
    category: 'oauth',
    specs: [
      {
        id: 'rfc6749',
        type: 'rfc',
        code: '6749',
        link: 'https://tools.ietf.org/html/6749',
        related: ['rfc8707'],
      },
      {
        id: 'rfc6750',
        type: 'rfc',
        code: '6750',
        link: 'https://tools.ietf.org/html/6750',
        related: [],
      },
      {
        id: 'rfc7009',
        type: 'rfc',
        code: '7009',
        link: 'https://tools.ietf.org/html/7009',
        related: [],
      },
      {
        id: 'rfc7591',
        type: 'rfc',
        code: '7591',
        link: 'https://tools.ietf.org/html/7591',
        related: ['rfc6749', 'rfc6750', 'rfc7515', 'rfc7517', 'rfc7519', 'rfc7522', 'rfc7523'],
      },
      {
        id: 'rfc8414',
        type: 'rfc',
        code: '8414',
        link: 'https://tools.ietf.org/html/8414',
        related: [],
      },
      {
        id: 'rfc8707',
        type: 'rfc',
        code: '8707',
        link: 'https://tools.ietf.org/html/8707',
        related: [],
      },
    ],
  },
  {
    category: 'oauth-flows',
    specs: [
      {
        id: 'rfc7636',
        type: 'rfc',
        code: '7636',
        link: 'https://tools.ietf.org/html/7636',
        related: [],
      },
      {
        id: 'rfc8252',
        type: 'rfc',
        code: '8252',
        link: 'https://tools.ietf.org/html/8252',
        related: [],
      },
      {
        id: 'rfc8628',
        type: 'rfc',
        code: '8628',
        link: 'https://tools.ietf.org/html/8628',
        related: [],
      },
    ],
  },
  {
    category: 'token',
    specs: [
      {
        id: 'rfc7515',
        type: 'rfc',
        code: '7515',
        link: 'https://tools.ietf.org/html/rfc7515',
        related: [],
      },
      {
        id: 'rfc7517',
        type: 'rfc',
        code: '7517',
        link: 'https://tools.ietf.org/html/rfc7517',
        related: [],
      },
      {
        id: 'rfc7662',
        type: 'rfc',
        code: '7662',
        link: 'https://tools.ietf.org/html/7662',
        related: [],
      },
      {
        id: 'rfc8693',
        type: 'rfc',
        code: '8693',
        link: 'https://tools.ietf.org/html/8693',
        related: [],
      },
    ],
  },
  {
    category: 'security',
    specs: [
      {
        id: 'rfc6819',
        type: 'rfc',
        code: '6819',
        link: 'https://tools.ietf.org/html/6819',
        related: [],
      },
      {
        id: 'rfc7521',
        type: 'rfc',
        code: '7521',
        link: 'https://tools.ietf.org/html/7521',
        related: ['rfc7522', 'rfc7523', 'rfc7591'],
      },
      {
        id: 'rfc7522',
        type: 'rfc',
        code: '7522',
        link: 'https://tools.ietf.org/html/7522',
        related: [],
      },
      {
        id: 'rfc7523',
        type: 'rfc',
        code: '7523',
        link: 'https://tools.ietf.org/html/7523',
        related: [],
      },
      {
        id: 'rfc7628',
        type: 'rfc',
        code: '7628',
        link: 'https://tools.ietf.org/html/7628',
        related: [],
      },
      {
        id: 'rfc8705',
        type: 'rfc',
        code: '8705',
        link: 'https://tools.ietf.org/html/8705',
        related: [],
      },
    ],
  },
];

export default catalog;
