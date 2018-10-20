import i18next from 'i18next';
import LngDetector from 'i18next-browser-languagedetector';

const lgSelect = document.getElementById('lgSelect');

const initTranslations = _ => {
  const nodes = document.querySelectorAll('[data-t]');
  nodes.forEach(n => {
    n.textContent = i18next.t(n.getAttribute('data-t'));
  });
};

i18next
  .use(LngDetector)
  .init({
  fallbackLng: 'en',
  debug: false,
  resources: require('./locales.json')
}, (err, t) => {
  initTranslations();
  document.getElementById('btnSelect').addEventListener('click', _ => {
    i18next.changeLanguage(lgSelect.value);
  });
});

i18next.on('languageChanged', _ => {
  initTranslations();
});