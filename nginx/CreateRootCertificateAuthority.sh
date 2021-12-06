 #!/usr/bin/env bash
openssl genrsa -out ssl/rootCA.key 2048
openssl req -subj '/CN=Root Dev Authority/O=Local Dev Certificate Authority/C=BR/ST=Sao Paulo/L=Campinas/emailAddress=ca@ca.net.br' -x509 -new -nodes -key ssl/rootCA.key -sha256 -days 1024 -out ssl/rootCA.pem
openssl x509 -in ssl/rootCA.pem -noout -text

# export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/ssl/rootCA.pem"
