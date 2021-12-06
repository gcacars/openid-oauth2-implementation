const loc = {
  continueBtnLabel: 'Continuar',
  abortBtnLabel: 'Cancelar',
  errors: {
    unknownError: 'Erro desconhecido',
    errorTitle: 'Erro',
    errorOcurredTryAgain: 'Ocorreu um erro, por favor tente novamente.',
  },
  client: {
    wannaAccess: 'quer ter acesso à sua conta',
  },
  accountLookup: {
    welcome: 'Bem vindo(a)',
    placeholder: 'E-mail ou usuário',
    noRememberAccount: 'Não lembra qual é sua conta?',
    notHaveAccount: 'Ainda não tem uma conta?',
    createAccountLabel: 'Criar conta',
  },
  password: {
    subtitle: 'informe sua senha',
    inputPlaceholder: 'Senha',
    forgotPassword: 'Esqueceu sua senha?',
    keepConnected: 'Mantenha-me conectado',
    loginBtn: 'Entrar',
  },
  mfa: {
    formTitle: 'Configurar fator de autenticação',
    info: `Para aumentar a segurança da sua conta é necessário adicionar um outro método de autenticação além da senha.
    Por favor, escolha uma das opções abaixo.`,
    requiredAction: 'Esta ação é obrigatória para continuar.',
    stepItOutLinkLabel: 'Pular por enquanto (você tem {} dias para configurar)',
    readMoreLinkLabel: 'Saiba mais',
  },
  otp: {
    inputFormTitle: 'Verificação em duas etapas',
    codeInputLabel: 'Digite o código gerado pelo aplicativo de autenticação no seu dispositivo móvel:',
    wrongCode: 'Este código parece inválido ou já expirou. Tente novamente.',
    error: 'Não foi possível validar o código, cheque sua conexão e tente novamente.',
    enrollment: {
      inputFormTitle: 'Cadastrar etapa de verificação',
      actionInfo: 'Use seu aplicativo autenticador preferido e escaneie o código QR para adicionar esta conta.',
      codeInputLabel: 'Digite o código de 6 números gerado pelo aplicativo no seu dispositivo',
      optionsShow: 'Veja',
      optionsHide: 'Ocultar',
      seeAppOptions: 'opções de aplicativos',
    },
  },
  device: {
    inputFormTitle: 'Conectar dispositivo',
    codeInputLabel: 'Digite o código informado pelo dispositivo',
    invalidCode: 'Código inválido',
    invalidCodeMessage: 'O código deve ser um código de 4 letras, um traço e mais 4 letras informado pelo seu dispositivo.',
    newDeviceInformative: 'Adicionar um novo dispositivo com acesso à sua conta',
    confirmFormTitle: 'Confirmar Dispositivo',
    checkCodeDisplay: 'Verifique se o código abaixo é exibido no dispositivo',
    attemptWarning: 'Se você não iniciou essa ação, o código acima não será igual ao exibido no dispositivo em sua posse, portanto feche esta janela ou clique em Cancelar.',
    conclusionFormTitle: 'Dispositivo conectado!',
    continueOnYourDevice: 'Continue no seu dispositivo.',
    closeWindowInformative: 'Seu dispositivo foi conectado com sucesso, e agora você já pode fechar essa janela.',
    closeWindowBtnLabel: 'Fechar',
  },
};

export default loc;
