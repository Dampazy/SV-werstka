

const button = document.querySelector('.burger');
const menu = document.querySelector('.labs-menu');
const mainMenu = document.querySelector('.main-menu');
const labs = document.querySelector('.labs');
const siteLinks = [...document.querySelectorAll('.site-menu-item')];
const narrowScreen = window.matchMedia('(max-width: 760px)');

function setMenuOpen(open) {
  menu.hidden = !open;
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}

function moveSiteLinks() {
  if (narrowScreen.matches) {

    menu.prepend(...siteLinks);
  } else {
    siteLinks.forEach(link => mainMenu.insertBefore(link, labs));
  }
  setMenuOpen(false);
}

button.addEventListener('click', () => setMenuOpen(menu.hidden));
document.addEventListener('click', event => {
  if (!event.target.closest('.labs')) setMenuOpen(false);
});
menu.addEventListener('click', event => {
  if (event.target.closest('a')) setMenuOpen(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) {
    setMenuOpen(false);
    button.focus();
  }
});
narrowScreen.addEventListener('change', moveSiteLinks);
moveSiteLinks();
