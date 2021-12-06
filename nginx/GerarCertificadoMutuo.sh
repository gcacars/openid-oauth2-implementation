#!/usr/bin/env bash
# https://stackoverflow.com/a/43666288/827472
if [ -z "$1" ]
then
  echo "Por favor informe um domínio para criar o certificado:";
  echo "ex: www.exemplo.com.br"
  exit;
fi

if [ ! -f ssl/rootCA.pem ]; then
  echo 'Rode primeiro o "CreateRootCertificateAuthority.sh" para continuar!'
  exit;
fi
if [ ! -f v3.ext ]; then
  echo 'Não foi encontrado o arquivo "v3.ext"'
  exit;
fi
    
# Criar uma nova chave privada se não existir, ou usa uma existente
if [ -f server.key ]; then
  KEY_OPT="-key"
else
  KEY_OPT="-keyout"
fi
    
DOMAIN=$1
COMMON_NAME=$DOMAIN
#COMMON_NAME=${2:-*.$1}
SUBJECT="/C=BR/ST=Sao Paulo/L=Sao Paulo/O=None/CN=$COMMON_NAME"
NUM_OF_DAYS=356

# Remover arquivos se já existir
if [ -f "ssl/$DOMAIN.crt" ]; then
  rm -f "ssl/$DOMAIN.crt"
fi
if [ -f "ssl/$DOMAIN.key" ]; then
  rm -f "ssl/$DOMAIN.key"
fi

# Configurar parâmetros
cat v3.ext | sed s/%%DOMAIN%%/"$COMMON_NAME"/g > /tmp/__v3.ext

# Criar o certificado do servidor
openssl req -new -newkey rsa:2048 -sha256 -nodes $KEY_OPT server.key -subj "$SUBJECT" -out server.csr
openssl x509 -req -in server.csr -CA ssl/rootCA.pem -CAkey ssl/rootCA.key -CAcreateserial -out server.crt -days $NUM_OF_DAYS -sha256 -extfile /tmp/__v3.ext 

# Corrigir o nome dos arquivos
mv server.crt "ssl/$DOMAIN.crt"
mv server.csr "ssl/$DOMAIN.csr"
mv server.key "ssl/$DOMAIN.key"

# Remover arquivo temporário
# rm -f server.crt;

if [ ! -f "ssl/$DOMAIN.crt" ]; then
  echo 'Aconteceu algum erro!'
else
  echo 
  echo "###########################################################################"
  echo Feito! 
  echo "###########################################################################"
  echo "To use these files on your server, simply copy both $DOMAIN.crt and"
  echo " $DOMAIN.key to your webserver, and use like so (if Apache, for example)"
  echo 
  echo "    SSLCertificateFile    /ssl/$DOMAIN.crt"
  echo "    SSLCertificateKeyFile /ssl/$DOMAIN.key"
fi

openssl verify -verbose -CAfile ssl/rootCA.pem "ssl/$DOMAIN.crt"

# Criar uma nova chave privada se não existir, ou usa uma existente
if [ -f client.key ]; then
  KEY_OPT="-key"
else
  KEY_OPT="-keyout"
fi

# Configurar parâmetros
cat v3-client.ext | sed s/%%DOMAIN%%/"$COMMON_NAME"/g > /tmp/__v3c.ext

# Criar o certificado do cliente
openssl req -new -newkey rsa:2048 -sha256 -nodes $KEY_OPT client.key -subj "$SUBJECT" -out client.csr
openssl x509 -req -in client.csr -CA ssl/rootCA.pem -CAkey ssl/rootCA.key -CAcreateserial -out client.crt -days $NUM_OF_DAYS -sha256 -extfile /tmp/__v3c.ext 
cat client.crt rootCA.pem > client.pem
openssl pkcs12 -export -out "ssl/$DOMAIN.pfx" -inkey client.key -in client.pem -passout pass:

# Corrigir o nome dos arquivos
mv client.pem "ssl/$DOMAIN.client.pem"
mv client.crt "ssl/$DOMAIN.client.crt"
mv client.key "ssl/$DOMAIN.client.key"

# Remover arquivo temporário
rm -f client.csr;

# Teste
# openssl s_client -connect "$DOMAIN:443" -tls1_2 -key "$DOMAIN.client.key" -cert "$DOMAIN.client.pem" -CAfile rootCA.pem -state -debug
