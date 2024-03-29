# Windows
# Gerar o certificado raíz (da certificadora)
openssl genrsa -aes256 -passout pass:openid -out ca.pass.key 4096
openssl rsa -passin pass:openid -in ca.pass.key -out ca.key
openssl req -new -x509 -days 365 -key ca.key -out ca.crt

# Gerar os certificados de servidor
openssl req -subj '/CN=provider.dev.br/O=OpenID Provider Front-end/C=BR' -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -keyout provider.key -out provider.crt
openssl req -subj '/CN=op.provider.dev.br/O=OpenID Provider API/C=BR' -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -keyout provider-api.key -out provider-api.crt
openssl req -subj '/CN=app-rp.dev.br/O=App Exemplo Front-end/C=BR' -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -keyout app-rp.key -out app-rp.crt
openssl req -subj '/CN=api.app-rp.dev.br/O=App Exemplo API/C=BR' -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -keyout app-rp-api.key -out app-rp-api.crt
openssl req -subj '/CN=admin-op.dev.br/O=OpenID Admin Front-end/C=BR' -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -keyout admin-op.key -out admin-op.crt
openssl req -subj '/CN=api.admin-op.dev.br/O=OpenID Admin API/C=BR' -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -keyout admin-op-api.key -out admin-op-api.crt
openssl req -subj '/CN=account-admin.dev.br/O=Administrador de contas Front-end/C=BR' -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -keyout account-admin.key -out account-admin.crt
openssl req -subj '/CN=api.account-admin.dev.br/O=Administrador de contas API/C=BR' -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -keyout account-admin-api.key -out account-admin-api.crt
openssl req -subj '/CN=device.dev.br/O=OpenID device front-end/C=BR' -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -keyout device.key -out device.crt
openssl req -subj '/CN=be.device.dev.br/O=OpenID device back-end/C=BR' -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -keyout device-api.key -out device-api.crt

# Criar os certificados para autorização do cliente associando a raíz
# openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -out client.crt
# cat client.key client.crt ca.crt > client.pem
# openssl pkcs12 -export -out client.pfx -inkey client.key -in client.pem -certfile ca.crt
