import React, { useEffect, useRef } from 'react';
import { LandingHeader } from '../components/landing/LandingHeader';
import { HeroSection } from '../components/landing/HeroSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { IntelligenceSection } from '../components/landing/IntelligenceSection';
import { BackupSection } from '../components/landing/BackupSection';
import { PrivacySection } from '../components/landing/PrivacySection';
import { InstallAndWorkflowSection } from '../components/landing/InstallAndWorkflowSection';
import { FaqSection } from '../components/landing/FaqSection';
import { FinalCTASection } from '../components/landing/FinalCTASection';
import { LandingFooter } from '../components/landing/LandingFooter';

const LandingPage: React.FC = () => {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    const sections = Array.from(container.querySelectorAll<HTMLElement>('.reveal-section'));
    if (sections.length === 0) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      sections.forEach((el) => {
        el.dataset.visible = 'true';
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = 'true';
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -48px 0px', threshold: 0.05 }
    );

    sections.forEach((el) => {
      if (!el.dataset.visible) {
        el.dataset.visible = 'false';
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#18191D] font-landing antialiased">
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-[#1E35D0] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Aller au contenu principal
      </a>

      <LandingHeader />

      <main id="contenu-principal" ref={mainRef} className="flex-grow">
        <HeroSection />
        <div className="reveal-section" data-visible="true">
          <ProblemSection />
        </div>
        <div className="reveal-section">
          <FeaturesSection />
        </div>
        <div className="reveal-section">
          <IntelligenceSection />
        </div>
        <div className="reveal-section">
          <BackupSection />
        </div>
        <div className="reveal-section">
          <PrivacySection />
        </div>
        <div className="reveal-section">
          <InstallAndWorkflowSection />
        </div>
        <div className="reveal-section">
          <FaqSection />
        </div>
        <div className="reveal-section">
          <FinalCTASection />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
