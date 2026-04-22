// DATA DO CASAMENTO
// Ano, Mês (0-11), Dia, Hora, Minuto
const weddingDate = new Date(2026, 5, 5, 16, 0, 0).getTime();
// Junho é mês 5 porque começa do zero

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function updateCountdown() {
  const now = new Date().getTime();
  const difference = weddingDate - now;

  if (difference <= 0) {
    clearInterval(countdownInterval);
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  daysEl.textContent = formatTime(days);
  hoursEl.textContent = formatTime(hours);
  minutesEl.textContent = formatTime(minutes);
  secondsEl.textContent = formatTime(seconds);
}

function formatTime(time) {
  return time < 10 ? `0${time}` : time;
}

// Atualiza imediatamente
updateCountdown();

// Atualiza a cada 1 segundo
const countdownInterval = setInterval(updateCountdown, 1000);