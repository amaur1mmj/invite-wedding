document.addEventListener('DOMContentLoaded', function () {
  const AUTO_SLIDE_MS = 2500;
  const slides = document.querySelectorAll('.galery .slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (!slides.length) return;

  let current = Array.from(slides).findIndex((s) =>
    s.classList.contains('active')
  );
  if (current === -1) current = 0;

  function update() {
    slides.forEach((slide) => {
      slide.classList.remove('prev1', 'prev', 'active', 'next', 'next1');
    });

    const total = slides.length;

    slides[(current - 2 + total) % total].classList.add('prev1');
    slides[(current - 1 + total) % total].classList.add('prev');
    slides[current].classList.add('active');
    slides[(current + 1) % total].classList.add('next');
    slides[(current + 2) % total].classList.add('next1');
  }

  function go(n) {
    current = (n + slides.length) % slides.length;
    update();
  }

  function next() {
    go(current + 1);
  }

  function prev() {
    go(current - 1);
  }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  let interval = setInterval(next, AUTO_SLIDE_MS);

  const container = document.querySelector('.galery');
  if (container) {
    container.addEventListener('mouseenter', () => clearInterval(interval));
    container.addEventListener('mouseleave', () => {
      interval = setInterval(next, AUTO_SLIDE_MS);
    });
  }

  update();
});
