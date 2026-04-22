/**
 * RSVP Module - Gerencia confirmação de presença da família
 *
 * ===== COMO USAR =====
 *
 * 1. BUSCA MANUAL:
 *    - Usuário digita o código (ex: FAM001) ou nome (ex: João Silva)
 *    - Clica em "Pesquisar"
 *
 * 2. BUSCA AUTOMÁTICA VIA URL:
 *    - Enviar convite com link contendo o código da família
 *    - Exemplos:
 *      https://seusite.com.br/?rsvp=FAM001
 *      https://seusite.com.br/?rsvp=FAM002
 *      https://seusite.com.br/convite.html?rsvp=FAM003
 *    - Se o código vier na URL, a busca é feita automaticamente
 *    - O campo de inputs é preenchido automaticamente
 *
 * ===== DADOS =====
 *
 * Estrutura esperada do Google Sheets:
 * - codfamilia: identificador único da família (ex: FAM001)
 * - nome: nome completo do convidado
 * - telefone: contato opcional
 * - principal: se é o principal da família (true/false)
 *
 * Ao buscar por código: retorna TODOS os membros da família
 * Ao buscar por nome: encontra o primeiro resultado e retorna todos da mesma família
 */

// URL do Google Apps Script - ALTERE PARA SUA URL REAL
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyYXpqsjtKof8wRNPsroWC-g1bPZKl5fL_cEgl_VelzUqeEbNdZrxpfRFM7zKnbdq7k/exec';

// Estado da aplicação
let estadoRSVP = {
  familiaAtual: null,
  convidadosSelecionados: {},
};

// ============ FUNÇÕES PRINCIPAIS ============

/**
 * Busca convidados por código ou nome
 * @param {string} termoBusca - Código da família ou nome do convidado
 * @returns {Promise} - Família encontrada ou null
 */
async function buscarConvidados(termoBusca) {
  if (!termoBusca || termoBusca.trim() === '') {
    exibirMensagem('Por favor, digite um código ou nome', 'erro');
    return null;
  }

  termoBusca = termoBusca.trim().toUpperCase();

  try {
    // Buscar dados do Google Sheets
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=buscar&termo=${encodeURIComponent(termoBusca)}`
    );
    const data = await response.json();

    if (!data.success) {
      exibirMensagem(data.message || 'Erro ao buscar dados', 'erro');
      return null;
    }

    const convidados = data.convidados;

    if (!convidados || convidados.length === 0) {
      exibirMensagem(
        'Nenhum convidado encontrado. Verifique o código ou nome e tente novamente.',
        'aviso'
      );
      return null;
    }

    estadoRSVP.familiaAtual = convidados;
    // Inicializar estado de seleção
    estadoRSVP.convidadosSelecionados = {};
    convidados.forEach((c) => {
      estadoRSVP.convidadosSelecionados[c.nome] = false;
    });

    abrirModal(convidados);
    return convidados;
  } catch (error) {
    console.error('Erro ao buscar convidados:', error);
    exibirMensagem('Erro de conexão. Tente novamente.', 'erro');
    return null;
  }
}

/**
 * Abre o modal com a lista de membros da família
 * @param {array} convidados - Array de convidados
 */
function abrirModal(convidados) {
  const modal = document.getElementById('rsvpModal');
  const membersList = document.getElementById('rsvpModalMembers');

  if (!convidados || convidados.length === 0) {
    exibirMensagem('Nenhum convidado para exibir', 'aviso');
    return;
  }

  let html = '';

  convidados.forEach((convidado, index) => {
    const nameRadio = `rsvp_${index}`;
    html += `
      <div class="rsvp-member-item">
        <span class="rsvp-member-name">${convidado.nome}</span>
        <label class="rsvp-option">
          <input 
            type="radio" 
            name="${nameRadio}" 
            value="yes"
            data-nome="${convidado.nome}"
            onchange="atualizarSelecao(this)"
          />
          Confirma
        </label>
        <label class="rsvp-option">
          <input 
            type="radio" 
            name="${nameRadio}" 
            value="no"
            data-nome="${convidado.nome}"
            onchange="atualizarSelecao(this)"
          />
          Não vou
        </label>
      </div>
    `;
  });

  membersList.innerHTML = html;
  modal.classList.remove('hidden');
}

/**
 * Fecha o modal
 */
function fecharModal() {
  const modal = document.getElementById('rsvpModal');
  const membersList = document.getElementById('rsvpModalMembers');
  const message = document.getElementById('rsvpModalMessage');

  modal.classList.add('hidden');
  membersList.innerHTML = '';
  message.style.display = 'none';
  message.textContent = '';
  message.className = 'rsvp-modal-message';

  // Limpar seleções
  estadoRSVP.familiaAtual = null;
  estadoRSVP.convidadosSelecionados = {};
}

/**
 * Atualiza o estado de seleção de um convidado
 * @param {element} radio - Elemento radio
 */
function atualizarSelecao(radio) {
  const nome = radio.getAttribute('data-nome');
  const value = radio.value; // 'yes' or 'no'
  estadoRSVP.convidadosSelecionados[nome] = value;
}

/**
 * Confirma a presença dos selecionados
 */
async function confirmarPresenca() {
  // Validar se todos os radio buttons foram selecionados
  const totalConvidados = Object.keys(estadoRSVP.convidadosSelecionados).length;
  const selecionados = Object.values(estadoRSVP.convidadosSelecionados).filter(
    (status) => status !== undefined && status !== null
  );

  if (selecionados.length < totalConvidados) {
    exibirMensagemModal(
      'Por favor, selecione uma opção para cada pessoa da família.',
      'erro'
    );
    return;
  }

  // Confirmação
  if (!confirm('Tem certeza da sua confirmação?')) {
    return;
  }

  // Preparar dados para envio
  const codigoFamilia = estadoRSVP.familiaAtual[0].codfamilia;
  const attending = Object.entries(estadoRSVP.convidadosSelecionados)
    .filter(([_, status]) => status === 'yes')
    .map(([nome]) => nome);
  const notAttending = Object.entries(estadoRSVP.convidadosSelecionados)
    .filter(([_, status]) => status === 'no')
    .map(([nome]) => nome);

  const payload = {
    type: 'confirmar',
    codigo: codigoFamilia,
    attending: attending,
    notAttending: notAttending,
  };

  try {
    exibirMensagemModal('Enviando confirmação...', 'aviso');

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      exibirMensagemModal(
        `✅ Presença confirmada com sucesso! Obrigado, família ${codigoFamilia}`,
        'sucesso'
      );
      setTimeout(() => {
        fecharModal();
      }, 2000);
    } else {
      exibirMensagemModal(
        data.message || 'Erro ao confirmar presença.',
        'erro'
      );
    }
  } catch (error) {
    console.error('Erro ao enviar dados:', error);
    exibirMensagemModal('Erro de conexão. Tente novamente.', 'erro');
  }
}

/**
 * Exibe mensagem no modal
 * @param {string} mensagem - Texto da mensagem
 * @param {string} tipo - 'sucesso', 'erro', 'aviso'
 */
function exibirMensagemModal(mensagem, tipo = 'aviso') {
  const containerMensagem = document.getElementById('rsvpModalMessage');
  containerMensagem.textContent = mensagem;
  containerMensagem.className = `rsvp-modal-message ${tipo}`;
  containerMensagem.style.display = 'block';
}

// ============ FUNÇÕES UTILITÁRIAS ============

/**
 * Exibe mensagem de feedback
 * @param {string} mensagem - Texto da mensagem
 * @param {string} tipo - 'sucesso', 'erro', 'aviso'
 */
function exibirMensagem(mensagem, tipo = 'aviso') {
  const containerMensagem = document.getElementById('rsvpMensagem');
  containerMensagem.textContent = mensagem;
  containerMensagem.className = `rsvp-mensagem rsvp-${tipo}`;
  containerMensagem.style.display = 'block';

  // Limpar mensagem após 5 segundos
  setTimeout(() => {
    containerMensagem.style.display = 'none';
  }, 5000);
}

/**
 * Limpa a busca e volta ao estado inicial
 */
function limparBusca() {
  document.getElementById('rsvpInputBusca').value = '';
  document.getElementById('rsvpMensagem').style.display = 'none';
  estadoRSVP.familiaAtual = null;
  estadoRSVP.convidadosSelecionados = {};
}

/**
 * Executa busca ao pressionar Enter
 */
function buscarAoPressionarEnter(event) {
  if (event.key === 'Enter') {
    executarBusca();
  }
}

/**
 * Wrapper para executar a busca
 */
async function executarBusca() {
  const termoBusca = document.getElementById('rsvpInputBusca').value;
  await buscarConvidados(termoBusca);
}

/**
 * Carrega parâmetros da URL (ex: ?rsvp=ABC123)
 */
async function carregarParametrosURL() {
  const params = new URLSearchParams(window.location.search);
  const codigoRSVP = params.get('rsvp');

  if (codigoRSVP) {
    document.getElementById('rsvpInputBusca').value = codigoRSVP;
    // Adicionar pequeno delay para garantir que o DOM está pronto
    setTimeout(async () => {
      await executarBusca();
    }, 100);
  }
}

// ============ INICIALIZAÇÃO ============

/**
 * Inicializa o módulo RSVP
 */
function inicializarRSVP() {
  const inputBusca = document.getElementById('rsvpInputBusca');
  const btnBuscar = document.getElementById('rsvpBtnBuscar');
  const btnCloseModal = document.getElementById('rsvpCloseModalBtn');
  const btnConfirm = document.getElementById('rsvpConfirmBtn');

  if (inputBusca && btnBuscar) {
    inputBusca.addEventListener('keypress', buscarAoPressionarEnter);
    btnBuscar.addEventListener('click', executarBusca);
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', fecharModal);
  }

  if (btnConfirm) {
    btnConfirm.addEventListener('click', confirmarPresenca);
  }

  // Fechar modal ao clicar no overlay
  const modal = document.getElementById('rsvpModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        fecharModal();
      }
    });
  }

  // Carregar código da URL se houver
  carregarParametrosURL();
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarRSVP);
} else {
  inicializarRSVP();
}
