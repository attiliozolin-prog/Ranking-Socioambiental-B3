// Aplica o tema salvo antes da primeira pintura (evita "flash" claro/escuro).
// Arquivo externo — e não <script> inline — para manter a CSP sem 'unsafe-inline'.
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  } catch (e) {}
})();
