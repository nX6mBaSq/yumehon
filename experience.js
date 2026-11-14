
(() => {
  'use strict';
  let cleanup = () => {};
  window.nightExperience = {
    dispose() { cleanup(); },
    mount(main, dreams) {
      const hero = main.querySelector('.night-hero');
      const book = hero.querySelector('.relic-trigger');
      const dialog = main.querySelector('.story');
      const title = dialog.querySelector('h2');
      const body = dialog.querySelector('.story-body');
      const folio = dialog.querySelector('[data-folio]');
      const choices = dialog.querySelector('.story-choices');
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      const controller = new AbortController();
      const {signal} = controller;
      const on = (node, type, run) => node.addEventListener(type, run, {signal});
      let opener, timer, frame, visible = true, last = 0;
      const lines = ['閉店の時刻を過ぎた町に、一軒だけ灯りがともっていた。','扉を押すと、どこからか紙の匂いがした。','「今夜は、どんな夢をお探しですか？」'];
      const control = (text, href) => {
        const el = document.createElement(href ? 'a' : 'button');
        el.className = 'gilt';
        el.textContent = text;
        if (href) el.href = href;
        else { el.type = 'button'; el.dataset.next = ''; }
        return el;
      };
      const page = next => {
        folio.textContent = next ? '02 / 02' : '01 / 02';
        title.textContent = next ? '棚の奥から' : '夜のとびら';
        body.replaceChildren();
        const copy = next ? ['店主が棚の奥から、そっと本を取り出した。','背表紙の向こうで、誰かの夢があなたを待っている。'] : lines;
        copy.forEach((line, i) => { if (i) body.append(document.createElement('br')); body.append(line); });
        choices.replaceChildren(...(next
          ? [...dreams.slice(0, 3).map(d => control(d.title, '#/dreams/' + encodeURIComponent(d.id))), control('本棚へ ↓', '#shelf')]
          : [control('頁をめくる →')]));
      };
      const open = e => {
        if (dialog.open || timer) return;
        opener = e.currentTarget;
        hero.classList.add('is-opening');
        const show = () => {
          timer = 0;
          page(false);
          dialog.showModal();
          title.focus({preventScroll:true});
        };
        if (motion.matches) show();
        else timer = setTimeout(show, 510);
      };
      main.querySelectorAll('[data-enter]').forEach(el => on(el, 'click', open));
      on(dialog, 'click', e => {
        if (e.target.closest('[data-close]') || e.target.closest('a')) dialog.close();
        if (e.target.closest('[data-next]')) {
          page(true);
          title.focus({preventScroll:true});
          if (!motion.matches) [title, body, choices].forEach((el, i) => el.animate(
            [{opacity:0, transform:'perspective(720px) rotateY(-16deg) translateX(-9px)'}, {opacity:1, transform:'none'}],
            {duration:370, delay:i*32, fill:'backwards', easing:'cubic-bezier(.2,.75,.25,1)'}
          ));
        }
        if (e.target === dialog) {
          const p = dialog.getBoundingClientRect();
          if (e.clientX < p.left || e.clientX > p.right || e.clientY < p.top || e.clientY > p.bottom) dialog.close();
        }
      });
      on(dialog, 'close', () => {
        hero.classList.remove('is-opening');
        const hash = location.hash;
        if (hash === '' || hash === '#/') opener?.focus({preventScroll:true});
      });
      function resetTilt() {
        ['--scene-x','--scene-y'].forEach(p => hero.style.removeProperty(p));
        ['--rx','--ry'].forEach(p => book.style.removeProperty(p));
      }
      on(hero, 'pointermove', e => {
        if (motion.matches || e.pointerType === 'touch' || dialog.open) return;
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        hero.style.setProperty('--scene-x', -x * 15 + 'px');
        hero.style.setProperty('--scene-y', -y * 13 + 'px');
        book.style.setProperty('--rx', -7 - y * 23 + 'deg');
        book.style.setProperty('--ry', -20 + x * 37 + 'deg');
      });
      on(hero, 'pointerleave', resetTilt);

      const canvas = hero.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      let w = 0, h = 0;
      const motes = Array.from({length: 57}, () => ({
        x: Math.random(), y: Math.random(), r: .45 + Math.random()*1.45,
        speed: .03 + Math.random()*.14, phase: Math.random()*6.28
      }));
      function resize() {
        if (!ctx) return;
        w = canvas.clientWidth; h = canvas.clientHeight;
        const ratio = Math.min(devicePixelRatio, 1.5);
        canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      function draw(t) {
        frame = 0;
        if (!visible || document.hidden || motion.matches || !ctx) return;
        if (t - last > 30) {
          last = t;
          ctx.clearRect(0, 0, w, h);
          for (const p of motes) {
            const x = p.x*w + Math.sin(t*.0004 + p.phase)*24;
            const y = ((p.y - t*p.speed*.00013)%1 + 1)%1*h;
            const a = .18 + .36*(.5 + .5*Math.sin(t*.0018+p.phase));
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255,204,126,' + a + ')';
            ctx.arc(x, y, p.r, 0, 2*Math.PI);
            ctx.fill();
          }
        }
        frame = requestAnimationFrame(draw);
      }
      const sync = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        if (motion.matches) { resetTilt(); ctx?.clearRect(0, 0, w, h); }
        else if (visible && !document.hidden && ctx) frame = requestAnimationFrame(draw);
      };
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
      observer.observe(hero);
      on(window, 'resize', resize);
      on(document, 'visibilitychange', sync);
      on(motion, 'change', sync);
      resize();
      sync();
      cleanup = () => {
        controller.abort();
        observer.disconnect();
        clearTimeout(timer);
        if (frame) cancelAnimationFrame(frame);
        if (dialog.open) dialog.close();
        cleanup = () => {};
      };
    }
  };
})();
