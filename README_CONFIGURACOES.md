# Configurações do StudyFlow

Este documento explica as novas funcionalidades de configurações implementadas no sistema.

## Funcionalidades Implementadas

### 1. Troca de Senha com Confirmação por Email

**Como funciona:**
- O usuário preenche o formulário com senha atual e nova senha
- O sistema valida a senha atual
- Gera um token de confirmação único
- Em produção, enviaria um email com link de confirmação
- Por enquanto, mostra o token na tela para demonstração
- O usuário confirma a alteração usando o token

**Validações:**
- Senha atual deve estar correta
- Nova senha deve ter pelo menos 6 caracteres
- Confirmação de senha deve ser igual à nova senha

### 2. Troca de Foto de Perfil

**Como funciona:**
- O usuário seleciona uma imagem do computador
- O sistema valida o tipo e tamanho do arquivo
- Salva a imagem na pasta `static/uploads/`
- Atualiza automaticamente o avatar no header e no modal
- Remove a foto antiga para economizar espaço

**Formatos aceitos:**
- PNG, JPG, JPEG, GIF
- Tamanho máximo: 16MB

### 3. Configurações de Notificações

**Opções disponíveis:**
- **Notificações por Email**: Ativa/desativa notificações por email
- **Notificações no App**: Ativa/desativa notificações no aplicativo
- **Frequência**: Instantâneas, Diárias ou Semanais

**Persistência:**
- As configurações são salvas no banco de dados
- São carregadas automaticamente ao abrir o modal

## Como Usar

### 1. Acessar Configurações
- Clique no avatar no canto superior direito
- Selecione "Configurações" no menu dropdown

### 2. Trocar Senha
- Vá para a seção "Trocar senha"
- Preencha senha atual e nova senha
- Clique em "Solicitar Alteração"
- Use o token de confirmação para finalizar

### 3. Trocar Foto
- Vá para a seção "Trocar foto de perfil"
- Clique em "Escolher arquivo"
- Selecione uma imagem
- Clique em "Salvar Foto"

### 4. Configurar Notificações
- Vá para a seção "Notificações"
- Ajuste as opções conforme desejado
- Clique em "Salvar Configurações"

## Configuração do Banco de Dados

### 1. Executar Comando de Atualização
```bash
cd TCC2
flask update-db
```

Este comando adiciona as seguintes colunas à tabela `usuario`:
- `foto_perfil`: Caminho para a foto de perfil
- `email_notificacoes`: Boolean para notificações por email
- `app_notificacoes`: Boolean para notificações no app
- `frequencia_notificacoes`: Frequência das notificações
- `token_confirmacao`: Token para confirmar mudanças
- `token_expiracao`: Data de expiração do token

### 2. Verificar Estrutura
```bash
flask create-db
```

## Estrutura de Arquivos

### Backend (Python/Flask)
- `app.py`: Rotas da API para configurações
- `models.py`: Modelo de usuário com novos campos

### Frontend (HTML/JavaScript)
- `disciplinas.html`: Modal de configurações
- `modal-configuracoes.js`: Lógica das funcionalidades

### Uploads
- `static/uploads/`: Pasta onde as fotos são salvas
- Nome dos arquivos: `perfil_{user_id}_{token}.{extensao}`

## Segurança

### Tokens de Confirmação
- Tokens são únicos e aleatórios
- Expiração em 24 horas
- Limpeza automática após uso
- Em produção, devem ser enviados por email

### Upload de Arquivos
- Validação de tipo de arquivo
- Limite de tamanho (16MB)
- Nomes únicos para evitar conflitos
- Remoção de arquivos antigos

## Próximos Passos (Produção)

### 1. Implementar Envio de Email
- Usar biblioteca como `flask-mail` ou `sendgrid`
- Templates HTML para os emails
- Configuração de SMTP

### 2. Melhorar Notificações
- Implementar sistema de notificações push
- Agendamento de notificações baseado na frequência
- Histórico de notificações

### 3. Validações Adicionais
- Verificação de força da senha
- Rate limiting para troca de senha
- Logs de auditoria

## Troubleshooting

### Problema: Foto não aparece
- Verificar se a pasta `static/uploads/` existe
- Verificar permissões de escrita
- Verificar se o arquivo foi salvo corretamente

### Problema: Token expirado
- Tokens expiram em 24 horas
- Solicitar nova troca de senha
- Verificar se o banco está sincronizado

### Problema: Configurações não salvam
- Verificar se o banco foi atualizado
- Verificar logs do servidor
- Verificar se o usuário está logado

## Comandos Úteis

```bash
# Atualizar banco de dados
flask update-db

# Criar tabelas (se necessário)
flask create-db

# Criar usuário admin
flask seed-admin

# Executar aplicação
python app.py
```
