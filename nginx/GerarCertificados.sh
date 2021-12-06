#!/usr/bin/env bash
# Gerar o certificado da Certificadora Autorizada
# sh ./CreateRootCertificateAuthority.sh

# Gerar o certificado mútuo para API de exemplo
sh ./GerarCertificadoMutuo.sh api.app-rp.dev.br

# Gerar certificados confiáveis pelo navegador
sh ./GerarCertificado.sh provider.dev.br
sh ./GerarCertificado.sh op.provider.dev.br
sh ./GerarCertificado.sh app-rp.dev.br
sh ./GerarCertificado.sh admin-op.dev.br
sh ./GerarCertificado.sh api.admin-op.dev.br
sh ./GerarCertificado.sh account-admin.dev.br
sh ./GerarCertificado.sh api.account-admin.dev.br
sh ./GerarCertificado.sh device.dev.br
sh ./GerarCertificado.sh be.device.dev.br
