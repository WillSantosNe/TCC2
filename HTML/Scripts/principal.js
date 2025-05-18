// principal.js
document.addEventListener('DOMContentLoaded', () => {
  const btnNext = document.getElementById('nextCoursesBtn');
  const btnPrev = document.getElementById('prevCoursesBtn');
  const carousel = document.querySelector('.courses-carousel');
  const totalCards = carousel.children.length;
  const cardsPerPage = 4;
  let page = 0;
  const maxPage = Math.ceil(totalCards / cardsPerPage) - 1;

  function update() {
    carousel.style.transform = `translateX(${-page * 100}%)`;
    btnPrev.disabled = page === 0;
    btnNext.disabled = page === maxPage;
  }

  btnNext.addEventListener('click', () => {
    if (page < maxPage) { page++; update(); }
  });

  btnPrev.addEventListener('click', () => {
    if (page > 0) { page--; update(); }
  });

  // inicializa
  carousel.style.transition = 'transform 0.3s';
  update();
});
