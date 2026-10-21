(() => {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const page = document.querySelector('.portfolio');
  const sticker = document.querySelector('.portfolio__sticker-motion');
  const stickerTrigger = document.querySelector('.portfolio__layer--72');
  const note = [6, 8, 9].map((number) =>
    document.querySelector(`.portfolio__layer--${number}`)
  );

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    // The whole sticker moves together, so the face and both arm poses stay aligned.
    const stickerFloat = gsap.to(sticker, {
      y: -8,
      rotation: 3,
      duration: 1.45,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      paused: true
    });

    ScrollTrigger.create({
      trigger: stickerTrigger,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => self.isActive ? stickerFloat.play() : stickerFloat.pause()
    });

    // Move the paper and its lettering by the same amount so the text never stretches.
    const noteDrift = note.map((element) => ({
      x: gsap.quickTo(element, 'x', { duration: 0.55, ease: 'power3.out' }),
      y: gsap.quickTo(element, 'y', { duration: 0.55, ease: 'power3.out' })
    }));

    const resetNote = () => noteDrift.forEach(({ x, y }) => {
      x(0);
      y(0);
    });
    const moveNote = (event) => {
      if (window.scrollY > 1400) {
        resetNote();
        return;
      }
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      noteDrift.forEach((part) => {
        part.x(x * 12);
        part.y(y * 12);
      });
    };
    const resetOnScroll = () => {
      if (window.scrollY > 1400) resetNote();
    };

    page.addEventListener('pointermove', moveNote);
    page.addEventListener('pointerleave', resetNote);
    window.addEventListener('scroll', resetOnScroll, { passive: true });

    return () => {
      page.removeEventListener('pointermove', moveNote);
      page.removeEventListener('pointerleave', resetNote);
      window.removeEventListener('scroll', resetOnScroll);
    };
  });
})();
