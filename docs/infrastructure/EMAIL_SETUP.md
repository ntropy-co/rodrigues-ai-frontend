# Configuração de Email para Produção (SMTP)

Para que o sistema envie emails reais de "Redefinição de Senha", você precisa configurar o envio via SMTP. O método mais simples e gratuito para volumes baixos é usar o Gmail.

## Opção Recomendada (Mais Fácil e Gratuita)

Se você não tem ou não quer usar seu email pessoal:

1.  Crie uma nova conta gratuita no Gmail (ex: `notificacoes.rodrigues.ai@gmail.com`).
2.  Use essa conta exclusivamente para o sistema.
3.  Siga os passos abaixo para gerar a "Senha de App".

## 1. Obter Credenciais do Gmail

Como o Google bloqueia login com senha normal por segurança, você precisa criar uma "Senha de App".

1.  Acesse sua conta Google: [https://myaccount.google.com/](https://myaccount.google.com/)
2.  Vá em **Segurança**.
3.  Certifique-se que a **Verificação em duas etapas** (2FA) está ATIVADA.
4.  Procure por **Senhas de app** (ou pesquise na barra de busca no topo).
5.  Dê um nome para o app (ex: `Rodrigues AI Production`).
6.  O Google vai gerar uma senha de 16 caracteres (ex: `abcd efgh ijkl mnop`). **Copie essa senha.**

## 2. Configurar Variáveis de Ambiente

No painel da sua hospedagem (Railway para o Backend), adicione as seguintes variáveis de ambiente:

| Variável          | Valor Exemplo                | Descrição                                                             |
| :---------------- | :--------------------------- | :-------------------------------------------------------------------- |
| `SMTP_HOST`       | `smtp.gmail.com`             | Servidor do Gmail.                                                    |
| `SMTP_PORT`       | `587`                        | Porta para TLS.                                                       |
| `SMTP_USER`       | `seu.email@gmail.com`        | Seu endereço de email completo.                                       |
| `SMTP_PASSWORD`   | `abcd efgh ijkl mnop`        | A senha de 16 letras gerada no passo 1 (sem espaços).                 |
| `EMAIL_FROM`      | `no-reply@rodriguesagro.com` | O email que aparecerá como remetente (geralmente igual ao SMTP_USER). |
| `EMAIL_FROM_NAME` | `Rodrigues AI`               | O nome que aparecerá como remetente.                                  |

## 3. Testar

Após adicionar as variáveis e fazer o _Redeploy_ do backend:

1.  Acesse o site em produção.
2.  Vá em "Esqueceu a senha?".
3.  Solicite o reset.
4.  O email deverá chegar na sua caixa de entrada em alguns segundos.

> **Nota:** Se o email não chegar, verifique a pasta de Spam.
