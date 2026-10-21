(() => {
  const videos = [...document.querySelectorAll('.portfolio__video')];
  if (!videos.length) return;

  const controlsMarkup = `
    <button class="video-player__button video-player__button--toggle" type="button" aria-label="Воспроизвести">
      <svg class="video-player__icon--play" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" d="M7 4 20 12 7 20Z"/></svg>
      <svg class="video-player__icon--pause" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
    </button>
    <span class="video-player__time">00:00 / 00:00</span>
    <div class="video-player__seek-wrap">
      <input class="video-player__seek" type="range" min="0" max="1000" value="0" disabled aria-label="Перемотка видео">
    </div>
    <button class="video-player__button video-player__button--mute" type="button" aria-label="Включить звук">
      <svg class="video-player__icon--sound-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6m0-6-5 6"/></svg>
      <svg class="video-player__icon--sound-on" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 9c2 1 2 5 0 6m2-9c4 2 4 10 0 12"/></svg>
    </button>
    <button class="video-player__button video-player__button--fullscreen" type="button" aria-label="На весь экран">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/></svg>
    </button>`;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '00:00';
    const value = Math.floor(seconds);
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  };

  const states = videos.map((video) => {
    const frame = document.createElement('div');
    frame.className = video.className.replace('portfolio__video', 'portfolio__video-player');
    frame.setAttribute('role', 'group');
    frame.setAttribute('aria-label', video.getAttribute('aria-label'));
    frame.tabIndex = 0;
    video.before(frame);
    frame.append(video);
    video.className = 'video-player__media';
    video.controls = false;
    video.muted = true;
    video.loop = true;
    video.preload = 'metadata';

    const controls = document.createElement('div');
    controls.className = 'video-player__controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Управление видео');
    controls.innerHTML = controlsMarkup;
    frame.append(controls);

    const toggle = controls.querySelector('.video-player__button--toggle');
    const mute = controls.querySelector('.video-player__button--mute');
    const fullscreen = controls.querySelector('.video-player__button--fullscreen');
    const seek = controls.querySelector('.video-player__seek');
    const time = controls.querySelector('.video-player__time');
    const state = { frame, video, ratio: 0, manuallyPaused: false };

    const updatePlayback = () => {
      controls.dataset.playing = String(!video.paused && !video.ended);
      toggle.setAttribute('aria-label', video.paused ? 'Воспроизвести' : 'Пауза');
    };
    const updateMute = () => {
      controls.dataset.muted = String(video.muted);
      mute.setAttribute('aria-label', video.muted ? 'Включить звук' : 'Выключить звук');
    };
    const updateTime = () => {
      const duration = video.duration;
      const progress = Number.isFinite(duration) && duration > 0 ? video.currentTime / duration : 0;
      time.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
      seek.disabled = !Number.isFinite(duration) || duration <= 0;
      seek.value = String(Math.round(progress * 1000));
      seek.style.setProperty('--progress', `${progress * 100}%`);
      seek.setAttribute('aria-valuetext', `${formatTime(video.currentTime)} из ${formatTime(duration)}`);
    };
    const showControls = () => {
      controls.style.pointerEvents = 'auto';
      if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.to(controls, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      } else {
        controls.style.opacity = '1';
        controls.style.visibility = 'visible';
        controls.style.transform = 'translateY(0)';
      }
    };
    const hideControls = () => {
      controls.style.pointerEvents = 'none';
      if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.to(controls, { autoAlpha: 0, y: 12, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
      } else {
        controls.style.opacity = '0';
        controls.style.visibility = 'hidden';
        controls.style.transform = 'translateY(12px)';
      }
    };
    const togglePlayback = () => {
      if (video.paused || video.ended) {
        state.manuallyPaused = false;
        video.play().catch(() => {});
      } else {
        state.manuallyPaused = true;
        video.pause();
      }
    };

    frame.addEventListener('pointerenter', showControls);
    frame.addEventListener('pointerleave', () => {
      if (!frame.querySelector(':focus-visible')) hideControls();
    });
    frame.addEventListener('focusin', showControls);
    frame.addEventListener('focusout', (event) => {
      if (!frame.contains(event.relatedTarget) && !frame.matches(':hover')) hideControls();
    });
    video.addEventListener('click', togglePlayback);
    toggle.addEventListener('click', togglePlayback);
    mute.addEventListener('click', () => { video.muted = !video.muted; });
    fullscreen.addEventListener('click', () => {
      if (document.fullscreenElement === frame) document.exitFullscreen();
      else frame.requestFullscreen?.();
    });
    seek.addEventListener('input', () => {
      if (Number.isFinite(video.duration)) video.currentTime = Number(seek.value) / 1000 * video.duration;
    });
    video.addEventListener('play', updatePlayback);
    video.addEventListener('pause', updatePlayback);
    video.addEventListener('ended', updatePlayback);
    video.addEventListener('volumechange', updateMute);
    video.addEventListener('loadedmetadata', updateTime);
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('durationchange', updateTime);
    updatePlayback();
    updateMute();
    updateTime();
    return state;
  });

  const syncAutoplay = () => {
    if (document.hidden) {
      states.forEach(({ video }) => video.pause());
      return;
    }
    const current = states.reduce((best, state) => state.ratio > (best?.ratio ?? 0) ? state : best, null);
    const active = current?.ratio >= 0.5 ? current : null;
    states.forEach((state) => {
      if (state === active && !state.manuallyPaused && state.video.paused && !state.video.ended) {
        state.video.muted = true;
        state.video.play().catch(() => {});
      } else if (state !== active && !state.video.paused) {
        state.video.pause();
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, intersectionRatio }) => {
      const state = states.find(({ frame }) => frame === target);
      state.ratio = intersectionRatio;
      if (intersectionRatio < 0.1) state.manuallyPaused = false;
    });
    syncAutoplay();
  }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
  states.forEach(({ frame }) => observer.observe(frame));
  document.addEventListener('visibilitychange', syncAutoplay);
})();
