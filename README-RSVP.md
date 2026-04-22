# RSVP Wedding Invitation - Implementação Completa

Este projeto implementa um sistema completo de confirmação de presença (RSVP) para convites de casamento, usando HTML, CSS e JavaScript puro, com integração ao Google Sheets via Google Apps Script.

## Funcionalidades

- ✅ Busca de famílias por código (ex: FAM001) ou nome
- ✅ Modal responsivo para seleção de presença
- ✅ Validação de dados e confirmação
- ✅ Integração com Google Sheets
- ✅ Suporte a parâmetros via URL (?rsvp=FAM001)
- ✅ Feedback visual e mensagens de erro/sucesso

## Estrutura dos Arquivos

```
wedding-invitation/
├── index.html              # Página principal com formulário RSVP
├── apps-script.js          # Código do Google Apps Script (backend)
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos incluindo modal RSVP
│   └── js/
│       └── rsvp.js         # Lógica do RSVP (frontend)
```

## Configuração do Google Sheets

### 1. Criar Planilha

Crie uma nova planilha no Google Sheets com duas abas:

#### Aba "convidados"

| codfamilia | nome        | telefone   | principal |
| ---------- | ----------- | ---------- | --------- |
| FAM001     | João Silva  | 6398765432 | true      |
| FAM001     | Maria Silva | 6398765433 | false     |
| FAM002     | Ana Santos  | 6387654321 | true      |

#### Aba "confirmacoes"

| codfamilia | nome       | confirmado | data       |
| ---------- | ---------- | ---------- | ---------- |
| FAM001     | João Silva | true       | 2024-01-01 |

### 2. Configurar Google Apps Script

1. Abra o Google Apps Script: https://script.google.com
2. Crie um novo projeto
3. Cole o conteúdo do arquivo `apps-script.js`
4. Salve e faça deploy como "Web App"
5. Copie a URL gerada

### 3. Configurar Frontend

No arquivo `assets/js/rsvp.js`, altere a linha:

```javascript
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbznsDxIiyMVp8wiO0ZaCB2FvwFA5zfLB5KQRGCRu9Q4uKYXubc2pI8dMCj-xZ2B3naK7g/exec';
```

Substitua `YOUR_SCRIPT_ID` pela ID real da sua URL do Apps Script.

## Como Usar

### Busca Manual

1. Usuário digita código da família ou nome
2. Clica em "Pesquisar"
3. Modal abre com lista de membros
4. Marca checkboxes dos presentes
5. Clica "Confirmar Presença"

### Busca via URL

Envie convites com links como:

```
https://seusite.com.br/?rsvp=FAM001
```

O sistema buscará automaticamente e abrirá o modal.

## API Endpoints

### GET - Buscar Convidados

```
GET /?action=buscar&termo=FAM001
```

**Resposta:**

```json
{
  "success": true,
  "convidados": [
    {
      "codfamilia": "FAM001",
      "nome": "João Silva",
      "telefone": "6398765432",
      "principal": true
    }
  ]
}
```

### POST - Confirmar Presença

```
POST /
Content-Type: application/json

{
  "type": "confirmar",
  "codigo": "FAM001",
  "confirmados": ["João Silva", "Maria Silva"]
}
```

**Resposta:**

```json
{
  "success": true,
  "message": "Presença confirmada com sucesso!"
}
```

## Regras de Validação

- Pelo menos um checkbox deve estar marcado
- Confirmação via `confirm()` antes do envio
- Nomes devem pertencer à família
- Código da família deve existir

## Responsividade

- Modal funciona bem no mobile
- Botões grandes e clicáveis
- Layout adaptável

## Personalização

- Cores podem ser ajustadas no CSS
- Textos podem ser modificados no HTML
- Validações podem ser extendidas

## Troubleshooting

### Erro "Nenhum convidado encontrado"

- Verifique se o código/nome está correto
- Confirme se a planilha tem os dados

### Erro de CORS

- Certifique-se que o Apps Script está deployado como Web App
- Verifique as permissões de execução

### Modal não abre

- Verifique se há erros no console
- Confirme que os IDs dos elementos estão corretos

## Desenvolvimento

Para testar localmente sem Google Sheets, você pode modificar temporariamente a função `buscarConvidados` para usar dados mockados.

## Suporte

Para dúvidas ou problemas, verifique:

1. Console do navegador (F12)
2. Logs do Google Apps Script
3. Estrutura da planilha
