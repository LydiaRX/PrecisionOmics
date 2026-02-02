(function () {
  function closeOnResize(btn, nav) {
    if (window.innerWidth > 860) {
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  document.querySelectorAll('.nav-toggle').forEach(function (btn) {
    var nav = btn.closest('.nav').querySelector('nav');
    if (!nav) return;

    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      nav.classList.toggle('is-open');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('resize', function () {
      closeOnResize(btn, nav);
    });
  });
})();
