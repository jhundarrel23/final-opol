import React, { useEffect, useRef, useState } from "react";
import "./TopBar.css";
import Logo from "src/components/LogoSign"; // Your redesigned Logo component

const sections = [
  { id: "program-overview", label: "Program Overview" },
  { id: "moa-information", label: "MOA Information" },
  { id: "beneficiary-directory", label: "Beneficiary Directory" },
  { id: "news-updates", label: "News & Updates" },
  { id: "photo-gallery", label: "Photo Gallery" },
  { id: "contact-information", label: "Contact Information" }
];

export default function TopBar() {
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerOffset, setHeaderOffset] = useState(120); // taller to match bigger logo
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingToSection, setIsScrollingToSection] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const navRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const computeOffset = () => {
      const height = navRef.current ? navRef.current.offsetHeight : 120;
      setHeaderOffset(height);
    };
    computeOffset();
    window.addEventListener("resize", computeOffset);
    return () => window.removeEventListener("resize", computeOffset);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);

      if (isScrollingToSection && targetSectionId) return;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      scrollTimeoutRef.current = setTimeout(() => {
        let currentSection = null;
        const offset = headerOffset + 50;
        let maxVisibleHeight = 0;

        sections.forEach((section) => {
          const element = document.getElementById(section.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollPosition;
            const elementBottom = elementTop + element.offsetHeight;
            const viewportTop = scrollPosition + offset;
            const viewportBottom = scrollPosition + window.innerHeight;
            const visibleTop = Math.max(elementTop, viewportTop);
            const visibleBottom = Math.min(elementBottom, viewportBottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);

            if (visibleHeight > maxVisibleHeight) {
              maxVisibleHeight = visibleHeight;
              currentSection = section.id;
            }
          }
        });

        setActiveSectionId(currentSection);
      }, 100);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [headerOffset, isScrollingToSection, targetSectionId]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      setIsScrollingToSection(true);
      setTargetSectionId(id);
      setActiveSectionId(id);
      setIsMenuOpen(false);

      const y = element.getBoundingClientRect().top + window.scrollY - headerOffset - 20;
      window.scrollTo({ top: y, behavior: "smooth" });

      setTimeout(() => {
        setIsScrollingToSection(false);
        setTargetSectionId(null);
      }, 1000);
    }
  };

  return (
    <nav ref={navRef} className={`topbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="topbar-container">
        {/* Logo centered */}
        <button
          type="button"
          onClick={() => {
            setIsScrollingToSection(true);
            setTargetSectionId(null);
            setActiveSectionId(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => setIsScrollingToSection(false), 1000);
          }}
          className="logo-button"
        >
          <Logo /> {/* <- Your extra-big animated logo */}
        </button>

        <div className="desktop-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              aria-current={activeSectionId === section.id ? "page" : undefined}
              className={`nav-item ${activeSectionId === section.id ? "active" : ""}`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="desktop-actions">
          <button type="button" onClick={() => scrollToSection("login-options")} className="login-button">
            Login
          </button>
        </div>

        <div className="mobile-menu-wrapper">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="primary-menu"
            className="mobile-menu-toggle"
          >
            <svg className="menu-icon" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div id="primary-menu" className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              aria-current={activeSectionId === section.id ? "page" : undefined}
              className={`mobile-nav-item ${activeSectionId === section.id ? "active" : ""}`}
            >
              {section.label}
            </button>
          ))}
          <button type="button" onClick={() => scrollToSection("login-options")} className="mobile-login-button">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}
