(() => {
  const root = document.documentElement;
  const palettes = [
    ['mono', 'Gece', 'Siyah / beyaz', '#d9dfe8'],
    ['iris', 'Neon', 'Mor / menekşe', '#c4a5ff'],
    ['coffee', 'Kahve', 'Sıcak / toprak', '#e6bb8a'],
    ['tide', 'Su', 'Turkuaz / ferah', '#77decf'],
    ['ember', 'Kızıl', 'Kırmızı / mercan', '#ff8794'],
    ['undertow', 'Derin', 'Lacivert / mavi', '#79a9ff']
  ];
  const persist = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const slots = [...document.querySelectorAll('[data-theme-slot]')];
  slots.forEach((slot, index) => {
    const controls = document.createElement('div');
    controls.className = 'theme-controls';
    controls.innerHTML = `<button class="theme-btn palette-toggle" type="button" aria-label="Renk temalarını aç" aria-haspopup="true" aria-expanded="false" aria-controls="palette-menu-${index}"><span class="swatch" aria-hidden="true"></span><span class="theme-label">Tema</span><span aria-hidden="true">⌄</span></button><button class="theme-btn mode-toggle" type="button" aria-label="Açık temaya geç" title="Açık / koyu görünüm">☼</button><div class="palette-menu" id="palette-menu-${index}" hidden><span class="palette-heading">Görünüm</span>${palettes.map(([id, title, description, color]) => `<button type="button" class="palette-option" role="checkbox" aria-checked="false" data-palette-option="${id}"><span class="swatch" style="--swatch:${color}" aria-hidden="true"></span><span><strong>${title}</strong><br><small>${description}</small></span></button>`).join('')}</div>`;
    slot.replaceWith(controls);
  });
  const sync = () => {
    document.querySelectorAll('.mode-toggle').forEach(button => {
      const light = root.dataset.theme === 'light';
      button.textContent = light ? '☾' : '☼';
      button.setAttribute('aria-label', light ? 'Koyu temaya geç' : 'Açık temaya geç');
    });
    document.querySelectorAll('[data-palette-option]').forEach(button => button.setAttribute('aria-checked', String(button.dataset.paletteOption === root.dataset.palette)));
  };
  const closeMenus = () => document.querySelectorAll('.palette-menu').forEach(menu => {
    menu.hidden = true;
    menu.parentElement.querySelector('.palette-toggle').setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', event => {
    const mode = event.target.closest('.mode-toggle');
    const toggle = event.target.closest('.palette-toggle');
    const option = event.target.closest('[data-palette-option]');
    if (mode) {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      persist('wiojelt-theme', root.dataset.theme);
      sync();
    } else if (toggle) {
      const menu = toggle.parentElement.querySelector('.palette-menu');
      const open = menu.hidden;
      closeMenus();
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    } else if (option) {
      root.dataset.palette = option.dataset.paletteOption;
      persist('wiojelt-palette', root.dataset.palette);
      sync();
      closeMenus();
      option.closest('.theme-controls').querySelector('.palette-toggle').focus();
    } else if (!event.target.closest('.theme-controls')) closeMenus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenus();
  });
  sync();

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.getElementById('field');
  const context = canvas.getContext('2d');
  let points = [], width = 0, height = 0, raf = 0;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    width = innerWidth; height = innerHeight;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    points = Array.from({ length: Math.min(62, Math.floor(width * height / 14000)) }, () => ({ x: Math.random() * width, y: Math.random() * height, r: .7 + Math.random() * 1.5, drift: .07 + Math.random() * .2, phase: Math.random() * 6.28 }));
  };
  const frame = time => {
    context.clearRect(0, 0, width, height);
    const color = getComputedStyle(root).getPropertyValue('--accent-rgb').trim();
    for (const point of points) {
      point.y -= point.drift;
      if (point.y < -5) point.y = height + 5;
      const alpha = .16 + .17 * (1 + Math.sin(time / 900 + point.phase)) / 2;
      context.fillStyle = `rgba(${color},${alpha})`;
      context.beginPath(); context.arc(point.x, point.y, point.r, 0, Math.PI * 2); context.fill();
    }
    if (!reduceMotion.matches) raf = requestAnimationFrame(frame);
  };
  if (context) {
    resize();
    if (!reduceMotion.matches) raf = requestAnimationFrame(frame);
    else frame(0);
    addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduceMotion.matches) raf = requestAnimationFrame(frame);
    });
  }
  if (!reduceMotion.matches && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', event => {
      root.style.setProperty('--px', `${event.clientX}px`);
      root.style.setProperty('--py', `${event.clientY}px`);
      root.classList.add('has-pointer');
    }, { passive: true });
  }
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.coming-hero,.coming-project,.coming-contact,.hero,.section-heading,.step,.claude-item,.timeline div,.contact .wrap');
    targets.forEach(element => element.dataset.reveal = '');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    targets.forEach(element => observer.observe(element));
    root.classList.add('is-reveal-ready');
  }
})();
