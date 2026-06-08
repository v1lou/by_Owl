'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}`,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0,
  ].join('|');

  let hash = 0;
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `v_${Math.abs(hash).toString(36)}`;
}

export interface VisitorProfile {
  id?: string;
  visits: number;
  clicks: Record<string, number>;
  sections: Record<string, number>;
  character: string;
  persona?: string;
  phrase?: string;
  sessionDepth?: number;
  clickRatio?: number;
  firstVisit?: string;
  lastVisit?: string;
}

export function useVisitorTracking() {
  const [profile, setProfile] = useState<VisitorProfile | null>(null);
  const [fingerprintId, setFingerprintId] = useState<string>('');
  const trackedSections = useRef<Set<string>>(new Set());

  const sendEvent = useCallback(async (
    event: 'visit' | 'click' | 'section',
    data?: Record<string, string>
  ) => {
    const id = fingerprintId || generateFingerprint();
    try {
      const res = await fetch('/api/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprintId: id, event, data }),
      });
      const json = await res.json();
      if (json.visitor) setProfile(json.visitor);
    } catch (err) {
      console.error('Send event error:', err);
    }
  }, [fingerprintId]);

  useEffect(() => {
    const id = generateFingerprint();
    setFingerprintId(id);
    sendEvent('visit');
  }, []);

  useEffect(() => {
    if (!fingerprintId) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-track]');
      if (target) {
        const key = target.getAttribute('data-track') || 'unknown';
        sendEvent('click', { target: key });
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [fingerprintId, sendEvent]);

  useEffect(() => {
    if (!fingerprintId) return;

    const sections = ['home', 'socials', 'community', 'merch', 'pc-config'];
    const observers: IntersectionObserver[] = [];
    
    trackedSections.current.clear();

    sections.forEach(sectionId => {
      const el = document.getElementById(sectionId);
      if (!el) {
        console.warn(`Section with id "${sectionId}" not found`);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !trackedSections.current.has(sectionId)) {
              trackedSections.current.add(sectionId);
              sendEvent('section', { id: sectionId });
              console.log(`Section viewed: ${sectionId}`);
            }
          });
        },
        { 
          threshold: 0.3,
          rootMargin: '0px'
        }
      );

      observer.observe(el);
      observers.push(observer);
    });
    return () => {
      observers.forEach(observer => {
        observer.disconnect();
      });
      trackedSections.current.clear();
    };
  }, [fingerprintId, sendEvent]);

  useEffect(() => {
    if (!fingerprintId) return;

    const sections = ['home', 'socials', 'community', 'merch', 'pc-config'];
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            sections.forEach(sectionId => {
              const section = element.querySelector?.(`#${sectionId}`) || 
                             (element.id === sectionId ? element : null);
              if (section && !trackedSections.current.has(sectionId)) {
                const io = new IntersectionObserver(
                  (entries) => {
                    entries.forEach(entry => {
                      if (entry.isIntersecting && !trackedSections.current.has(sectionId)) {
                        trackedSections.current.add(sectionId);
                        sendEvent('section', { id: sectionId });
                      }
                    });
                  },
                  { threshold: 0.3 }
                );
                io.observe(section);
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [fingerprintId, sendEvent]);

  return { profile, sendEvent, fingerprintId };
}