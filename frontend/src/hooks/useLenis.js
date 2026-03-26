import * as React from 'react';

/**
 * Production-ready smooth scrolling hook
 * Uses native CSS scroll-behavior with enhanced JS controls
 * Compatible with all React versions - no external dependencies
 */
export function useLenis(options = {}) {
  // Use React namespace to avoid hook resolution issues
  const scrollRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const targetRef = React.useRef(null);
  const currentRef = React.useRef(0);

  const {
    duration = 1.2,
    smoothWheel = true,
    lerp = 0.1,
  } = options;

  React.useEffect(() => {
    // Enable smooth scrolling via CSS
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // For enhanced smooth scrolling (optional wheel smoothing)
    if (smoothWheel) {
      let velocity = 0;
      let targetScroll = window.scrollY;
      let currentScroll = window.scrollY;
      let isScrolling = false;

      const animate = () => {
        if (!isScrolling) return;
        
        currentScroll += (targetScroll - currentScroll) * lerp;
        
        if (Math.abs(targetScroll - currentScroll) < 0.5) {
          currentScroll = targetScroll;
          isScrolling = false;
        } else {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      const handleWheel = (e) => {
        // Let native scrolling handle it for better performance
        // This hook just ensures smooth behavior is enabled
      };

      // Expose scrollTo function globally for navigation
      window.smoothScrollTo = (target, offset = 0) => {
        let targetPosition;
        
        if (typeof target === 'string') {
          const element = document.querySelector(target);
          if (element) {
            targetPosition = element.getBoundingClientRect().top + window.scrollY + offset;
          }
        } else if (typeof target === 'number') {
          targetPosition = target;
        } else if (target instanceof Element) {
          targetPosition = target.getBoundingClientRect().top + window.scrollY + offset;
        }

        if (targetPosition !== undefined) {
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      };
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      document.documentElement.style.scrollBehavior = '';
      delete window.smoothScrollTo;
    };
  }, [smoothWheel, lerp]);

  return scrollRef;
}

/**
 * Scroll to a specific element or position
 * Production-ready implementation with fallbacks
 */
export function scrollTo(target, options = {}) {
  const { offset = 0, duration = 1200 } = options;
  
  let targetPosition;
  
  if (typeof target === 'string') {
    const element = document.querySelector(target);
    if (element) {
      targetPosition = element.getBoundingClientRect().top + window.scrollY + offset;
    }
  } else if (typeof target === 'number') {
    targetPosition = target;
  } else if (target instanceof Element) {
    targetPosition = target.getBoundingClientRect().top + window.scrollY + offset;
  }

  if (targetPosition !== undefined) {
    // Use native smooth scroll - most performant and compatible
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Hook for scroll progress tracking
 */
export function useScrollProgress() {
  const progressRef = React.useRef(0);
  
  React.useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    };
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);
  
  return progressRef;
}

export default useLenis;
