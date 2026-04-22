// Google Apps Script para RSVP Wedding
// Deploy como Web App e copie a URL para o frontend

function createJsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doOptions(e) {
  return HtmlService.createHtmlOutput()
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function doGet(e) {
  const action = e.parameter.action;
  const termo = e.parameter.termo;

  if (action === 'buscar') {
    return buscarConvidados(termo);
  }

  return createJsonResponse({ success: false, message: 'Ação inválida' });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.type === 'confirmar') {
    return confirmarPresenca(data);
  }

  if (data.type === 'gift') {
    return registrarPresente(data);
  }

  return createJsonResponse({ success: false, message: 'Tipo inválido' });
}

function buscarConvidados(termo) {
  try {
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName('convidados');
    const data = sheet.getDataRange().getValues();

    // Remover cabeçalho
    data.shift();

    let convidados = [];

    // Buscar por código primeiro
    if (termo.startsWith('FAM')) {
      convidados = data.filter((row) => row[0] === termo); // coluna 0: codfamilia
    } else {
      // Buscar por nome
      const encontrado = data.find((row) =>
        row[1].toUpperCase().includes(termo.toUpperCase())
      ); // coluna 1: nome
      if (encontrado) {
        const codigoFamilia = encontrado[0];
        convidados = data.filter((row) => row[0] === codigoFamilia);
      }
    }

    if (convidados.length === 0) {
      return createJsonResponse({
        success: false,
        message: 'Nenhum convidado encontrado',
      });
    }

    // Formatar resposta
    const resposta = convidados.map((row) => ({
      codfamilia: row[0],
      nome: row[1],
      telefone: row[2] || '',
      principal: row[3] || false,
    }));

    return createJsonResponse({ success: true, convidados: resposta });
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Erro interno: ' + error.toString(),
    });
  }
}

function confirmarPresenca(data) {
  try {
    const { codigo, attending, notAttending } = data;

    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName('confirmacoes');

    // Verificar se código existe
    const convidadosSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName('convidados');
    const convidadosData = convidadosSheet.getDataRange().getValues();
    convidadosData.shift(); // remover cabeçalho

    const familia = convidadosData.filter((row) => row[0] === codigo);
    if (familia.length === 0) {
      return createJsonResponse({
        success: false,
        message: 'Código da família inválido',
      });
    }

    // Verificar se nomes pertencem à família
    const nomesFamilia = familia.map((row) => row[1]);
    const todosNomes = [...attending, ...notAttending];
    const invalidos = todosNomes.filter((nome) => !nomesFamilia.includes(nome));

    if (invalidos.length > 0) {
      return createJsonResponse({
        success: false,
        message: 'Nomes não pertencem à família: ' + invalidos.join(', '),
      });
    }

    // Salvar confirmações
    const now = new Date();
    attending.forEach((nome) => {
      sheet.appendRow([codigo, nome, true, now]);
    });
    notAttending.forEach((nome) => {
      sheet.appendRow([codigo, nome, false, now]);
    });

    return createJsonResponse({
      success: true,
      message: 'Presença confirmada com sucesso!',
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Erro interno: ' + error.toString(),
    });
  }
}

function registrarPresente(data) {
  try {
    const nome = (data.nome || '').toString().trim();
    const telefone = (data.telefone || '').toString().trim();
    const valor = Number(data.valor || 0);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('gifts');

    if (!sheet) {
      sheet = ss.insertSheet('gifts');
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['nome', 'telefone', 'valor', 'data_envio']);
    }

    sheet.appendRow([nome, telefone, valor, new Date()]);

    return createJsonResponse({
      success: true,
      message: 'Presente registrado com sucesso!',
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Erro interno: ' + error.toString(),
    });
  }
}
