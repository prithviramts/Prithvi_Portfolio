(() => {
  'use strict';

  /* -----------------------------------------------------------
     Footer year
  ----------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -----------------------------------------------------------
     Nav: background/border once the page is scrolled
  ----------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* -----------------------------------------------------------
     Mobile menu toggle
  ----------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    mobileMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* -----------------------------------------------------------
     Live local time — Dubai
  ----------------------------------------------------------- */
  const clockEl = document.getElementById('clock');

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
  });

  const updateClock = () => {
    if (clockEl) clockEl.textContent = formatter.format(new Date());
  };

  updateClock();
  setInterval(updateClock, 30000);

  /* -----------------------------------------------------------
     Scroll reveal
     (exposed as observeReveal so content added later — e.g. Medium
     posts fetched after page load — can fade in the same way)
  ----------------------------------------------------------- */
  const supportsObserver = 'IntersectionObserver' in window;

  const revealObserver = supportsObserver
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      )
    : null;

  const observeReveal = (el) => {
    if (revealObserver) {
      revealObserver.observe(el);
    } else {
      // Fallback: no IntersectionObserver support — just show everything
      el.classList.add('is-visible');
    }
  };

  document.querySelectorAll('.reveal').forEach(observeReveal);

  /* -----------------------------------------------------------
     Blog — latest posts, pulled live from Medium's RSS feed
     Update your Medium posts and they'll show up here automatically
     next time this page loads — nothing to edit by hand.
  ----------------------------------------------------------- */
  const MEDIUM_USERNAME = 'prithviram19';
  const BLOG_POST_LIMIT = 5;

  const blogList = document.getElementById('blogList');
  const blogStatus = document.getElementById('blogStatus');

  if (blogList) {
    const rssUrl = `https://medium.com/feed/@${MEDIUM_USERNAME}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status !== 'ok' || !Array.isArray(data.items) || !data.items.length) {
          throw new Error('No posts returned');
        }

        if (blogStatus) blogStatus.remove();

        data.items.slice(0, BLOG_POST_LIMIT).forEach((item) => {
          const row = document.createElement('div');
          row.className = 'blog__row reveal';

          const link = document.createElement('a');
          link.href = item.link;
          link.target = '_blank';
          link.rel = 'noopener';

          const titleEl = document.createElement('span');
          titleEl.className = 'blog__title';
          titleEl.textContent = item.title;

          const metaEl = document.createElement('span');
          metaEl.className = 'blog__meta';
          const pubDate = new Date(item.pubDate);
          metaEl.textContent = Number.isNaN(pubDate.getTime())
            ? ''
            : pubDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          link.append(titleEl, metaEl);
          row.appendChild(link);
          blogList.appendChild(row);

          observeReveal(row);
        });
      })
      .catch(() => {
        if (blogStatus) {
          blogStatus.textContent = "Couldn't load recent posts right now — read them directly on Medium.";
        }
      });
  }
})();
