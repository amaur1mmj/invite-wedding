const giftImageFiles = [
  'abaju.jpg',
  'armario.jpg',
  'cadeira.jpg',
  'cafeteira.jpg',
  'conjunto.jpg',
  'copo-sobremesa.jpg',
  'depurador.jpg',
  'edredon-branco.jpg',
  'edredon.jpg',
  'espelho.jpg',
  'fruteira-mesa.jpg',
  'fruteira.jpg',
  'geladeira.jpg',
  'guarda-roupa.jpg',
  'jarra.jpg',
  'kit-colheres-silicone.jpg',
  'kit-limpeza-azul.jpg',
  'kit-limpeza.jpg',
  'kit-pratos.jpg',
  'kit-talher.jpg',
  'luva-forno.jpg',
  'manta-sofar.jpg',
  'mesa-centro.jpg',
  'mesa-jantar.jpg',
  'mesacocktop.jpg',
  'mixer.jpg',
  'rack-secagem.jpg',
  'recipiente-azeite.jpg',
  'relogio.jpg',
  'sapateira.jpg',
  'suplar-croxer.jpg',
  'suplar.jpg',
  'tabua-corta-carne.jpg',
  'toalhas.jpg',
  'traveseiro.jpg',
  'travesseiro-bege.jpg',
  'vasilhas-sobremesas.jpg',
  'xaleira-eletrica.jpg',
];

const GIFTS_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyYXpqsjtKof8wRNPsroWC-g1bPZKl5fL_cEgl_VelzUqeEbNdZrxpfRFM7zKnbdq7k/exec';

const PIX_CHAVE = 'aff74633-9ec5-4391-abd1-4f34a2872377';
const PIX_BENEFICIARIO_NOME = 'L A PRESENTES';
const PIX_CIDADE = 'SAO PAULO';
const PIX_MERCHANT_CATEGORY_CODE = '0000';
const PIX_CURRENCY_BRL = '986';

function normalizePixText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s.-]/g, '')
    .trim()
    .toUpperCase()
    .slice(0, 25);
}

function tlv(id, value) {
  const valueAsString = String(value);
  const length = valueAsString.length.toString().padStart(2, '0');
  return `${id}${length}${valueAsString}`;
}

function crc16Ccitt(payload) {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function gerarPayloadPix(chave, valor, descricao = 'PRESENTE CASAMENTO') {
  const valorPix = Number(valor).toFixed(2);
  const nome = normalizePixText(PIX_BENEFICIARIO_NOME) || 'PRESENTES';
  const cidade = normalizePixText(PIX_CIDADE) || 'SAO PAULO';
  const txid = '***';
  const descricaoLimpa = normalizePixText(descricao).slice(0, 40);

  const gui = tlv('00', 'br.gov.bcb.pix');
  const chavePix = tlv('01', chave);
  const descricaoPix = descricaoLimpa ? tlv('02', descricaoLimpa) : '';
  const merchantAccountInfo = tlv('26', `${gui}${chavePix}${descricaoPix}`);

  const additionalDataField = tlv('62', tlv('05', txid));

  const semCrc = [
    tlv('00', '01'),
    tlv('01', '12'),
    merchantAccountInfo,
    tlv('52', PIX_MERCHANT_CATEGORY_CODE),
    tlv('53', PIX_CURRENCY_BRL),
    tlv('54', valorPix),
    tlv('58', 'BR'),
    tlv('59', nome),
    tlv('60', cidade),
    additionalDataField,
    '6304',
  ].join('');

  const crc = crc16Ccitt(semCrc);
  return `${semCrc}${crc}`;
}

function toGiftTitle(fileName) {
  return fileName
    .replace('.jpg', '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function inferGiftCategory(fileName) {
  const cozinhaKeywords = [
    'cafeteira',
    'copo',
    'fruteira',
    'jarra',
    'kit-colheres',
    'kit-pratos',
    'kit-talher',
    'luva-forno',
    'mixer',
    'rack-secagem',
    'recipiente-azeite',
    'suplar',
    'tabua-corta-carne',
    'vasilhas-sobremesas',
    'xaleira-eletrica',
    'mesacocktop',
    'depurador',
  ];

  return cozinhaKeywords.some((keyword) => fileName.includes(keyword))
    ? 'cozinha'
    : 'casa';
}

const presentes = [
  {
    id: 1,
    nome: 'Abaju',
    valor: 96.75,
    imagem: 'assets/img/img-gift-list/abaju.jpg',
    categoria: 'casa',
  },
  {
    id: 2,
    nome: 'Armário',
    valor: 250.65,
    imagem: 'assets/img/img-gift-list/armario.jpg',
    categoria: 'casa',
  },
  {
    id: 3,
    nome: 'Cadeira',
    valor: 115.45,
    imagem: 'assets/img/img-gift-list/cadeira.jpg',
    categoria: 'casa',
  },
  {
    id: 4,
    nome: 'Cafeteira',
    valor: 138.15,
    imagem: 'assets/img/img-gift-list/cafeteira.jpg',
    categoria: 'cozinha',
  },
  {
    id: 5,
    nome: 'Aparelho de jantar',
    valor: 140.90,
    imagem: 'assets/img/img-gift-list/conjunto.jpg',
    categoria: 'casa',
  },
  {
    id: 6,
    nome: 'Jogo de sobremesa',
    valor: 143.65,
    imagem: 'assets/img/img-gift-list/copo-sobremesa.jpg',
    categoria: 'cozinha',
  },
  {
    id: 7,
    nome: 'Depurador',
    valor: 123.4,
    imagem: 'assets/img/img-gift-list/depurador.jpg',
    categoria: 'cozinha',
  },
  {
    id: 8,
    nome: 'Edredon branco',
    valor: 124.15,
    imagem: 'assets/img/img-gift-list/edredon-branco.jpg',
    categoria: 'casa',
  },
  {
    id: 9,
    nome: 'Edredon',
    valor: 151.9,
    imagem: 'assets/img/img-gift-list/edredon.jpg',
    categoria: 'casa',
  },
  {
    id: 10,
    nome: 'Espelho',
    valor: 150.00,
    imagem: 'assets/img/img-gift-list/espelho.jpg',
    categoria: 'casa',
  },
  {
    id: 11,
    nome: 'Fruteira',
    valor: 89.40,
    imagem: 'assets/img/img-gift-list/fruteira-mesa.jpg',
    categoria: 'cozinha',
  },
  {
    id: 12,
    nome: 'Fruteira',
    valor: 100.15,
    imagem: 'assets/img/img-gift-list/fruteira.jpg',
    categoria: 'cozinha',
  },
  {
    id: 13,
    nome: 'Geladeira',
    valor: 180.90,
    imagem: 'assets/img/img-gift-list/geladeira.jpg',
    categoria: 'cozinha',
  },
  {
    id: 14,
    nome: 'Guarda Roupa',
    valor: 165.65,
    imagem: 'assets/img/img-gift-list/guarda-roupa.jpg',
    categoria: 'casa',
  },
  {
    id: 15,
    nome: 'Jarra',
    valor: 94.40,
    imagem: 'assets/img/img-gift-list/jarra.jpg',
    categoria: 'cozinha',
  },
  {
    id: 16,
    nome: 'Kit colheres silicone',
    valor: 130.15,
    imagem: 'assets/img/img-gift-list/kit-colheres-silicone.jpg',
    categoria: 'cozinha',
  },
  {
    id: 17,
    nome: 'Kit Limpeza',
    valor: 173.9,
    imagem: 'assets/img/img-gift-list/kit-limpeza-azul.jpg',
    categoria: 'cozinha',
  },
  {
    id: 18,
    nome: 'Kit Limpeza',
    valor: 156.65,
    imagem: 'assets/img/img-gift-list/kit-limpeza.jpg',
    categoria: 'cozinha',
  },
  {
    id: 19,
    nome: 'Kit Pratos',
    valor: 179.4,
    imagem: 'assets/img/img-gift-list/kit-pratos.jpg',
    categoria: 'cozinha',
  },
  {
    id: 20,
    nome: 'Kit Talher',
    valor: 112.15,
    imagem: 'assets/img/img-gift-list/kit-talher.jpg',
    categoria: 'cozinha',
  },
  {
    id: 21,
    nome: 'Luva',
    valor: 100.90,
    imagem: 'assets/img/img-gift-list/luva-forno.jpg',
    categoria: 'cozinha',
  },
  {
    id: 22,
    nome: 'Manta',
    valor: 85.65,
    imagem: 'assets/img/img-gift-list/manta-sofar.jpg',
    categoria: 'casa',
  },
  {
    id: 23,
    nome: 'Mesa Centro',
    valor: 127.45,
    imagem: 'assets/img/img-gift-list/mesa-centro.jpg',
    categoria: 'casa',
  },
  {
    id: 24,
    nome: 'Mesa Jantar',
    valor: 193.15,
    imagem: 'assets/img/img-gift-list/mesa-jantar.jpg',
    categoria: 'casa',
  },
  {
    id: 25,
    nome: 'Mesa cooktop',
    valor: 195.9,
    imagem: 'assets/img/img-gift-list/mesa-cooktop.jpg',
    categoria: 'cozinha',
  },
  {
    id: 26,
    nome: 'Mixer',
    valor: 100.95,
    imagem: 'assets/img/img-gift-list/mixer.jpg',
    categoria: 'cozinha',
  },
  {
    id: 27,
    nome: 'Rack Secagem',
    valor: 201.4,
    imagem: 'assets/img/img-gift-list/rack-secagem.jpg',
    categoria: 'cozinha',
  },
  {
    id: 28,
    nome: 'Recipiente Azeite',
    valor: 204.15,
    imagem: 'assets/img/img-gift-list/recipiente-azeite.jpg',
    categoria: 'cozinha',
  },
  {
    id: 29,
    nome: 'Relogio',
    valor: 206.9,
    imagem: 'assets/img/img-gift-list/relogio.jpg',
    categoria: 'casa',
  },
  {
    id: 30,
    nome: 'Sapateira',
    valor: 209.65,
    imagem: 'assets/img/img-gift-list/sapateira.jpg',
    categoria: 'casa',
  },
  {
    id: 31,
    nome: 'Suplar Croxer',
    valor: 212.4,
    imagem: 'assets/img/img-gift-list/suplar-croxer.jpg',
    categoria: 'cozinha',
  },
  {
    id: 32,
    nome: 'Suplar',
    valor: 215.15,
    imagem: 'assets/img/img-gift-list/suplar.jpg',
    categoria: 'cozinha',
  },
  {
    id: 33,
    nome: 'Tabua Corta Carne',
    valor: 217.9,
    imagem: 'assets/img/img-gift-list/tabua-corta-carne.jpg',
    categoria: 'cozinha',
  },
  {
    id: 34,
    nome: 'Toalhas',
    valor: 220.65,
    imagem: 'assets/img/img-gift-list/toalhas.jpg',
    categoria: 'casa',
  },
  {
    id: 35,
    nome: 'Traveseiro',
    valor: 223.4,
    imagem: 'assets/img/img-gift-list/traveseiro.jpg',
    categoria: 'casa',
  },
  {
    id: 36,
    nome: 'Travesseiro Bege',
    valor: 226.15,
    imagem: 'assets/img/img-gift-list/travesseiro-bege.jpg',
    categoria: 'casa',
  },
  {
    id: 37,
    nome: 'Vasilhas Sobremesas',
    valor: 228.9,
    imagem: 'assets/img/img-gift-list/vasilhas-sobremesas.jpg',
    categoria: 'cozinha',
  },
  {
    id: 38,
    nome: 'Xaleira Eletrica',
    valor: 231.65,
    imagem: 'assets/img/img-gift-list/xaleira-eletrica.jpg',
    categoria: 'cozinha',
  },
];

const state = {
  currentPage: 1,
  itemsPerPage: 8,
  selectedSort: 'name-asc',
};

const $giftsGrid = document.getElementById('giftsGrid');
const $paginationControls = document.getElementById('paginationControls');
const $sortFilter = document.getElementById('sortFilter');

function sortPresentes(presentes) {
  const sorted = [...presentes];
  switch (state.selectedSort) {
    case 'name-asc':
      sorted.sort((a, b) => a.nome.localeCompare(b.nome));
      break;
    case 'name-desc':
      sorted.sort((a, b) => b.nome.localeCompare(a.nome));
      break;
    case 'price-asc':
      sorted.sort((a, b) => a.valor - b.valor);
      break;
    default:
      break;
  }
  return sorted;
}

function renderGrid() {
  const sorted = sortPresentes(presentes);
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const end = start + state.itemsPerPage;
  const pageItems = sorted.slice(start, end);

  $giftsGrid.innerHTML = '';

  if (!pageItems.length) {
    $giftsGrid.innerHTML =
      '<p>Nenhum presente encontrado. Ajuste o filtro.</p>';
    renderPagination(0);
    return;
  }

  pageItems.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'gift-card';
    card.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}" loading="lazy" />
      <h3>${item.nome}</h3>
      <p>${item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}</p>
      <span class="price">R$ ${item.valor.toFixed(2).replace('.', ',')}</span>
      <button class="btn-primary" data-id="${item.id}">Presentear</button>
    `;
    $giftsGrid.appendChild(card);
  });

  renderPagination(sorted.length);
}

function renderPagination(totalItems) {
  const pages = Math.max(1, Math.ceil(totalItems / state.itemsPerPage));
  $paginationControls.innerHTML = '';

  if (pages <= 1) return;

  for (let page = 1; page <= pages; page += 1) {
    const button = document.createElement('button');
    button.textContent = page;
    button.className = page === state.currentPage ? 'active' : '';
    button.addEventListener('click', () => {
      state.currentPage = page;
      renderGrid();
    });
    $paginationControls.appendChild(button);
  }
}

function initFilters() {
  if ($sortFilter) {
    $sortFilter.addEventListener('change', (event) => {
      state.selectedSort = event.target.value;
      state.currentPage = 1;
      renderGrid();
    });
  }
}

const modalElements = {
  overlay: document.getElementById('presentModal'),
  name: document.getElementById('modalItemName'),
  value: document.getElementById('modalItemValue'),
  donorName: document.getElementById('donorName'),
  donorPhone: document.getElementById('donorPhone'),
  feedback: document.getElementById('paymentFeedback'),
  closeBtn: document.getElementById('closeModalBtn'),
  confirmBtn: document.getElementById('confirmPaymentBtn'),
};

let selectedPresent = null;
let isSubmittingGift = false;

function abrirModalPresente(presente) {
  selectedPresent = presente;
  isSubmittingGift = false;
  modalElements.name.textContent = presente.nome;
  modalElements.value.textContent = `R$ ${presente.valor.toFixed(2).replace('.', ',')}`;
  modalElements.donorName.value = '';
  modalElements.donorPhone.value = '';
  modalElements.feedback.textContent = '';
  modalElements.confirmBtn.disabled = true;

  gerarQRCodePix(presente);

  modalElements.overlay.classList.remove('hidden');
  modalElements.overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function fecharModalPresente() {
  selectedPresent = null;
  modalElements.overlay.classList.add('hidden');
  modalElements.overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  modalElements.donorName.value = '';
  modalElements.donorPhone.value = '';
  modalElements.feedback.textContent = '';
  modalElements.confirmBtn.disabled = true;

  // Limpar QR code anterior
  const qrPlaceholder = document.getElementById('qrPlaceholder');
  if (qrPlaceholder) {
    qrPlaceholder.innerHTML = '';
  }
}

function gerarQRCodePix(presente) {
  // Gerar payload PIX com função nativa
  const payload = gerarPayloadPix(
    PIX_CHAVE,
    presente.valor,
    `PRESENTE ${presente.nome}`
  );

  // Limpar QR code anterior
  const qrPlaceholder = document.getElementById('qrPlaceholder');
  qrPlaceholder.innerHTML = '';

  // Gerar QR code com biblioteca QRCode.js (tamanho reduzido)
  new QRCode(qrPlaceholder, {
    text: payload,
    width: 180,
    height: 180,
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Adicionar chave PIX abaixo do QR code
  const chavePix = document.createElement('div');
  chavePix.style.cssText = `
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  `;

  const chaveLabel = document.createElement('p');
  chaveLabel.style.cssText = `
    margin: 0;
    font-size: 0.85rem;
    color: #444;
    text-align: center;
    font-weight: 600;
  `;
  chaveLabel.textContent = 'Chave Pix';

  const chaveSpan = document.createElement('span');
  chaveSpan.style.cssText = `
    font-size: 0.8rem;
    color: #666;
    font-family: monospace;
    user-select: all;
    word-break: break-all;
    text-align: center;
    padding: 8px;
    background: #f5f5f5;
    border-radius: 8px;
  `;
  chaveSpan.textContent = PIX_CHAVE;

  const btnCopiar = document.createElement('button');
  btnCopiar.style.cssText = `
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.2s;
  `;
  btnCopiar.textContent = '📋';
  btnCopiar.title = 'Copiar chave PIX';

  btnCopiar.addEventListener('click', () => {
    navigator.clipboard.writeText(PIX_CHAVE).then(() => {
      btnCopiar.textContent = '✅';
      btnCopiar.title = 'Copiado!';
      setTimeout(() => {
        btnCopiar.textContent = '📋';
        btnCopiar.title = 'Copiar chave PIX';
      }, 2000);
    });
  });

  btnCopiar.addEventListener('mouseover', () => {
    btnCopiar.style.background = '#f0f0f0';
  });

  btnCopiar.addEventListener('mouseout', () => {
    btnCopiar.style.background = 'none';
  });

  qrPlaceholder.appendChild(chaveLabel);
  chavePix.appendChild(chaveSpan);
  chavePix.appendChild(btnCopiar);
  qrPlaceholder.appendChild(chavePix);
}

function updateSubmitState() {
  const hasName = modalElements.donorName.value.trim().length > 0;
  const phoneDigits = modalElements.donorPhone.value.replace(/\D/g, '');
  const hasPhone = phoneDigits.length > 0;
  modalElements.confirmBtn.disabled = !(hasName && hasPhone);
}

function isPhonePlausible(phoneValue) {
  const digits = phoneValue.replace(/\D/g, '');

  // DDD + número fixo/celular (10 ou 11 dígitos)
  if (digits.length < 10 || digits.length > 11) return false;

  // Evita números como 11111111111
  if (/^(\d)\1+$/.test(digits)) return false;

  // Evita sequências óbvias (123456..., 987654...)
  if ('01234567890'.includes(digits) || '9876543210'.includes(digits)) {
    return false;
  }

  // DDD não pode iniciar com 0
  if (digits[0] === '0') return false;

  return true;
}

function handleGiftGridClick(event) {
  const presentBtn = event.target.closest('button[data-id]');
  if (!presentBtn) return;

  const giftId = Number(presentBtn.dataset.id);
  const presente = presentes.find((item) => item.id === giftId);
  if (!presente) return;

  abrirModalPresente(presente);
}

async function confirmarPagamento() {
  if (!selectedPresent) return;

  if (isSubmittingGift) {
    return;
  }

  const name = modalElements.donorName.value.trim();
  const phone = modalElements.donorPhone.value.trim();

  if (!name) {
    modalElements.feedback.textContent = 'Por favor, informe seu nome.';
    modalElements.feedback.style.color = '#c00';
    return;
  }

  if (!phone) {
    modalElements.feedback.textContent = 'Por favor, informe seu telefone.';
    modalElements.feedback.style.color = '#c00';
    return;
  }

  if (!isPhonePlausible(phone)) {
    modalElements.feedback.textContent =
      'Telefone inválido. Digite um número com DDD válido.';
    modalElements.feedback.style.color = '#c00';
    return;
  }

  const payload = {
    type: 'gift',
    nome: name,
    telefone: phone,
    valor: selectedPresent.valor,
  };

  isSubmittingGift = true;
  modalElements.confirmBtn.disabled = true;
  fecharModalPresente();

  try {
    const response = await fetch(GIFTS_APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Falha ao registrar presente');
    }

    // Modal ja foi fechado para evitar envio duplo.
  } catch (error) {
    alert('Erro ao enviar. Tente novamente.');
    // fallback or record in console
    console.error('Falha na requisição', error);
  } finally {
    isSubmittingGift = false;
  }
}

if ($giftsGrid) {
  $giftsGrid.addEventListener('click', handleGiftGridClick);
}

if (modalElements.closeBtn) {
  modalElements.closeBtn.addEventListener('click', fecharModalPresente);
}

if (modalElements.overlay) {
  modalElements.overlay.addEventListener('click', (event) => {
    if (event.target === modalElements.overlay) fecharModalPresente();
  });
}

if (modalElements.confirmBtn) {
  modalElements.confirmBtn.addEventListener('click', confirmarPagamento);
}

if (modalElements.donorName) {
  modalElements.donorName.addEventListener('input', updateSubmitState);
}

if (modalElements.donorPhone) {
  modalElements.donorPhone.addEventListener('input', updateSubmitState);
}

function init() {
  initFilters();
  renderGrid();
}

init();
