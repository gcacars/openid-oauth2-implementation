# certmgr.exe -add "app-rp.crt" -s -trustedpublisher
# certutil.exe -addstore -user root path\to\file.crt
# https://mcilis.medium.com/how-to-create-a-self-signed-client-certificate-with-openssl-c4af9ac03e99
# Gerar o certificado raíz (da certificadora)
openssl genrsa -aes256 -passout pass:openid -out ca.pass.key 4096
openssl rsa -passin pass:openid -in ca.pass.key -out ca.key
openssl req -subj '/CN=Root/O=OpenID Example Root Cert/C=BR' -new -x509 -days 365 -key ca.key -out ca.crt

# Servidor
openssl genrsa -aes256 -passout pass:server -out server.pass.key 4096
openssl rsa -passin pass:server -in server.pass.key -out server.key
openssl req -subj '/CN=app-rp.dev.br/O=App Exemplo Front-end/C=BR' -new -key server.key -out server.csr

# Auto assinar o certificado (só para DEV)
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt

# Cria o certificado cliente
openssl genrsa -aes256 -passout pass:client -out client.pass.key 4096
openssl rsa -passin pass:client -in client.pass.key -out client.key
openssl req -subj '/CN=app-rp.dev.br/O=App Exemplo Front-end/C=BR' -new -key client.key -out client.csr

# Criar os certificados para autorização do cliente associando a raíz
openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt
#cat client.key client.crt ca.crt > client.full.pem
Get-Content ca.crt,client.crt,client.key | out-file client.full.pem
openssl pkcs12 -export -out client.full.pfx -inkey client.key -in client.full.pem -certfile ca.crt
