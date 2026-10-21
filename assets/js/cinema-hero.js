/**
 * KoreFlame - Cinematic 30-Frame Scroll-Controlled Hero Engine
 *
 * Requirements Met:
 * 1. 30 distinct video frames extracted directly from 1080p source footage.
 * 2. Exactly ONE active image frame visible at any time in the fixed viewport.
 * 3. Smooth, responsive scrubbing through all 30 frames on scroll.
 * 4. Reverse scrolling smoothly reverses the 30-frame sequence.
 * 5. Synchronized narrative chapters, HUD timecodes, and culinary spec cards.
 * 6. Natural unpinning to Section 2 after Frame 30.
 * 7. Works across mouse-wheel, trackpads, touch scrolling, and keyboard navigation.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init30FrameHero);

  function init30FrameHero() {
    const container = document.getElementById('kfScrollHeroSection');
    if (!container) return;

    const frames = container.querySelectorAll('.scroll-hero-frame');
    const chapters = container.querySelectorAll('.scroll-frame-content');
    const stepPills = container.querySelectorAll('.scroll-step-pill');
    const progressBar = container.querySelector('.scroll-progress-fill');
    const badgeCounter = container.querySelector('.badge-counter');
    const badgeTc = container.querySelector('.badge-tc');
    const mouseHint = container.querySelector('.scroll-mouse-hint');

    const totalFrames = frames.length; // 30
    const totalChapters = chapters.length; // 6
    if (totalFrames === 0) return;

    // 30 exact timestamps corresponding to each extracted video frame (0.00s to 9.80s)
    const timecodes = [
      '00:00.00', '00:00.34', '00:00.68', '00:01.01', '00:01.35',
      '00:01.69', '00:02.03', '00:02.37', '00:02.70', '00:03.04',
      '00:03.38', '00:03.72', '00:04.06', '00:04.39', '00:04.73',
      '00:05.07', '00:05.41', '00:05.74', '00:06.08', '00:06.42',
      '00:06.76', '00:07.10', '00:07.43', '00:07.77', '00:08.11',
      '00:08.45', '00:08.79', '00:09.12', '00:09.46', '00:09.80'
    ];

    let currentFrameIndex = -1;
    let currentChapterIndex = -1;
    let isTicking = false;

    // Preload all 30 frame images for buttery smooth, zero-flicker scrubbing
    frames.forEach(frame => {
      const img = frame.querySelector('.scroll-frame-img');
      if (img) {
        const src = img.getAttribute('data-src') || img.getAttribute('src');
        if (src) {
          const pre = new Image();
          pre.src = src;
          pre.onload = () => {
            img.src = src;
            img.classList.add('loaded');
          };
        }
      }
    });

    function setFrameState(frameIdx, chapterIdx) {
      // 1. Update image frame (Exactly ONE visible at a time)
      if (frameIdx !== currentFrameIndex) {
        if (currentFrameIndex >= 0 && frames[currentFrameIndex]) {
          frames[currentFrameIndex].classList.remove('active');
        }
        if (frames[frameIdx]) {
          frames[frameIdx].classList.add('active');
        }
        currentFrameIndex = frameIdx;

        // Update live HUD counter & timecode
        if (badgeCounter) {
          badgeCounter.textContent = `FRAME ${String(frameIdx + 1).padStart(2, '0')} / ${String(totalFrames).padStart(2, '0')}`;
        }
        if (badgeTc && timecodes[frameIdx]) {
          badgeTc.textContent = `TC ${timecodes[frameIdx]}`;
        }
      }

      // 2. Update narrative story chapter (Smooth chapter card transitions)
      if (chapterIdx !== currentChapterIndex) {
        if (currentChapterIndex >= 0 && chapters[currentChapterIndex]) {
          chapters[currentChapterIndex].classList.remove('active');
        }
        if (chapters[chapterIdx]) {
          chapters[chapterIdx].classList.add('active');
        }
        currentChapterIndex = chapterIdx;

        // Update stepper pills
        stepPills.forEach((pill, idx) => {
          if (idx === currentChapterIndex) {
            pill.classList.add('active');
            pill.setAttribute('aria-current', 'step');
          } else {
            pill.classList.remove('active');
            pill.removeAttribute('aria-current');
          }
        });

        // Re-initialize Lucide icons on chapter change if needed
        if (window.lucide && typeof window.lucide.createIcons === 'function' && chapters[currentChapterIndex]) {
          window.lucide.createIcons({ root: chapters[currentChapterIndex] });
        }
      }
    }

    function getHeaderOffset() {
      const header = document.querySelector('.kf-header');
      return header ? header.offsetHeight : (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 84);
    }

    function onScroll() {
      const rect = container.getBoundingClientRect();
      const headerH = getHeaderOffset();
      const scrollDistance = container.offsetHeight - (window.innerHeight - headerH);
      if (scrollDistance <= 0) return;

      // Calculate progress (0.0 to 1.0) through the scroll container
      // Pinned right under header: scrubbing begins when container top reaches header bottom
      const currentScroll = Math.max(0, Math.min(scrollDistance, headerH - rect.top));
      const progress = currentScroll / scrollDistance;

      // Update top progress bar
      if (progressBar) {
        progressBar.style.width = `${(progress * 100).toFixed(2)}%`;
      }

      // Hide mouse hint once user begins scrolling
      if (mouseHint) {
        if (progress > 0.015) {
          mouseHint.classList.add('hidden');
        } else {
          mouseHint.classList.remove('hidden');
        }
      }

      // Map progress to 30 frames (0 to 29)
      let targetFrame = Math.floor(progress * totalFrames);
      if (targetFrame >= totalFrames) targetFrame = totalFrames - 1;
      if (targetFrame < 0) targetFrame = 0;

      // Map progress to 6 chapters (0 to 5)
      let targetChapter = Math.floor(progress * totalChapters);
      if (targetChapter >= totalChapters) targetChapter = totalChapters - 1;
      if (targetChapter < 0) targetChapter = 0;

      setFrameState(targetFrame, targetChapter);
    }

    function requestScrollUpdate() {
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          onScroll();
          isTicking = false;
        });
        isTicking = true;
      }
    }

    // Passive scroll and resize listeners for high-performance 60/120fps scrubbing
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate, { passive: true });

    // Step pill click navigation
    stepPills.forEach((pill, idx) => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        const headerH = getHeaderOffset();
        const scrollDistance = container.offsetHeight - (window.innerHeight - headerH);
        // Jump smoothly to the start of this chapter's interval
        const baseOffset = Math.max(0, container.offsetTop - headerH);
        const targetOffset = baseOffset + (idx / totalChapters) * scrollDistance + 10;
        window.scrollTo({
          top: targetOffset,
          behavior: 'smooth'
        });
      });
    });

    // Keyboard navigation (ArrowDown/ArrowUp moves frame by frame)
    window.addEventListener('keydown', (e) => {
      const rect = container.getBoundingClientRect();
      const headerH = getHeaderOffset();
      const inView = rect.top <= headerH + 50 && rect.bottom >= window.innerHeight - 50;
      if (!inView) return;

      const scrollDistance = container.offsetHeight - (window.innerHeight - headerH);
      const baseOffset = Math.max(0, container.offsetTop - headerH);

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentFrameIndex < totalFrames - 1) {
          e.preventDefault();
          const targetOffset = baseOffset + ((currentFrameIndex + 1) / totalFrames) * scrollDistance + 5;
          window.scrollTo({ top: targetOffset, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentFrameIndex > 0) {
          e.preventDefault();
          const targetOffset = baseOffset + ((currentFrameIndex - 1) / totalFrames) * scrollDistance + 5;
          window.scrollTo({ top: targetOffset, behavior: 'smooth' });
        }
      }
    });

    // Initialize first state
    setFrameState(0, 0);
    onScroll();

    // Initial Lucide render
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: container });
    }
  }
})();
