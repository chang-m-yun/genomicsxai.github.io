(function () {
  var pills = document.querySelectorAll('.category-pills__pill');
  if (!pills.length) return;

  var articles = document.querySelectorAll('.article-list article[data-categories]');
  var emptyState = document.querySelector('.category-pills__empty-state');

  // Progressive enhancement: convert links/spans to buttons
  pills.forEach(function (pill) {
    var btn = document.createElement('button');
    btn.className = pill.className;
    btn.setAttribute('data-filter', pill.getAttribute('data-filter'));
    btn.textContent = pill.textContent;
    btn.type = 'button';

    var isActive = pill.classList.contains('category-pills__pill--active');
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');

    pill.parentNode.replaceChild(btn, pill);
  });

  // Re-query after replacement
  var buttons = document.querySelectorAll('.category-pills__pill');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');

      // Update active state on all buttons
      buttons.forEach(function (b) {
        b.classList.remove('category-pills__pill--active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('category-pills__pill--active');
      btn.setAttribute('aria-pressed', 'true');

      // Filter articles
      var visibleCount = 0;
      articles.forEach(function (article) {
        if (filter === 'all') {
          article.hidden = false;
          visibleCount++;
        } else {
          var cats = (article.getAttribute('data-categories') || '').split(' ');
          var matches = cats.indexOf(filter) !== -1;
          article.hidden = !matches;
          if (matches) visibleCount++;
        }
      });

      // Toggle empty state
      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }
    });
  });
})();
