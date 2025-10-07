import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Leaf, Users, TrendingUp, Sprout, Award, Globe, ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&h=1080&fit=crop&q=80',
      title: 'Sustainable Farming',
      subtitle: 'Growing the future with eco-friendly practices that preserve our environment for generations to come'
    },
    {
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop&q=80',
      title: 'Smart Agriculture',
      subtitle: 'Technology-driven solutions empowering modern farmers with real-time data insights and precision tools'
    },
    {
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&h=1080&fit=crop&q=80',
      title: 'Community Support',
      subtitle: 'Strengthening agricultural communities through collaboration, shared knowledge and mutual growth'
    },
    {
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop&q=80',
      title: 'Harvest Excellence',
      subtitle: 'Quality crops and sustainable yields creating prosperity for farmers and food security for all'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const features = [
    { icon: <Leaf size={18} />, text: 'Eco-Friendly' },
    { icon: <Users size={18} />, text: 'Community' },
    { icon: <TrendingUp size={18} />, text: 'Analytics' },
    { icon: <Sprout size={18} />, text: 'Growth' },
    { icon: <Award size={18} />, text: 'Quality' },
    { icon: <Globe size={18} />, text: 'Global' }
  ];

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#111827'
    }}>
      {/* Background Carousel */}
      <div style={{ position: 'absolute', inset: '0' }}>
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              inset: '0',
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 1000ms ease-in-out'
            }}
          />
        ))}
        
        {/* Dark Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: '0',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(17, 24, 39, 0.65) 50%, rgba(0, 0, 0, 0.8) 100%)'
        }} />
        
        {/* Bottom Gradient */}
        <div style={{
          position: 'absolute',
          inset: '0',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 40%)'
        }} />
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          left: window.innerWidth > 1024 ? '32px' : '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 30,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          transition: 'all 300ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.target.style.color = 'white';
          e.target.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.target.style.color = 'rgba(255, 255, 255, 0.8)';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          right: window.innerWidth > 1024 ? '32px' : '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 30,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          transition: 'all 300ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.target.style.color = 'white';
          e.target.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.target.style.color = 'rgba(255, 255, 255, 0.8)';
          e.target.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <ChevronRight size={24} />
      </button>

      {/* Slide Indicators */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        display: 'flex',
        gap: '12px'
      }}>
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            style={{
              width: currentSlide === index ? '32px' : '8px',
              height: '8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: currentSlide === index ? '#10B981' : 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              transition: 'all 300ms ease'
            }}
            onMouseEnter={(e) => {
              if (currentSlide !== index) {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentSlide !== index) {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
              }
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{
            maxWidth: '1024px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            {/* Brand Badge */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#6EE7B7',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <Leaf size={16} />
                Agricultural Innovation Platform
              </div>
            </div>

            {/* Main Title */}
            <h1 style={{
              fontSize: window.innerWidth > 1024 ? '7rem' : window.innerWidth > 768 ? '6rem' : '4rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
              lineHeight: '0.9'
            }}>
              <div>AGRO</div>
              <div style={{ color: '#10B981' }}>CONNECT</div>
            </h1>

            {/* Dynamic Content */}
            <div style={{
              marginBottom: '32px',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h2 style={{
                fontSize: window.innerWidth > 1024 ? '3rem' : window.innerWidth > 768 ? '2rem' : '1.5rem',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.95)',
                marginBottom: '16px',
                transition: 'all 500ms ease'
              }}>
                {slides[currentSlide].title}
              </h2>
              <p style={{
                fontSize: window.innerWidth > 768 ? '1.2rem' : '1rem',
                color: 'rgba(255, 255, 255, 0.75)',
                maxWidth: '512px',
                margin: '0 auto',
                lineHeight: '1.6',
                transition: 'all 500ms ease'
              }}>
                {slides[currentSlide].subtitle}
              </p>
            </div>

            {/* Feature Pills */}
            <div style={{ marginBottom: '48px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth > 1024 ? 'repeat(6, 1fr)' : window.innerWidth > 768 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                gap: '12px',
                maxWidth: '1024px',
                margin: '0 auto'
              }}>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 300ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ color: '#10B981' }}>{feature.icon}</span>
                    <span style={{ 
                      whiteSpace: 'nowrap',
                      display: window.innerWidth < 640 ? 'none' : 'inline'
                    }}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth > 640 ? 'row' : 'column',
              gap: '16px',
              justifyContent: 'center',
              marginBottom: '48px'
            }}>
              <button 
                type="button"
                style={{
                  position: 'relative',
                  padding: '16px 32px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 300ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#10B981';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Join Our Program
                <ArrowRight size={18} />
              </button>
              
              <button 
                type="button"
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 300ms ease',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Play size={16} />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
              maxWidth: '384px',
              margin: '0 auto'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: window.innerWidth > 768 ? '3rem' : '2rem',
                  fontWeight: 'bold',
                  color: '#10B981',
                  marginBottom: '4px'
                }}>
                  1000+
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: '500'
                }}>
                  Farmers
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: window.innerWidth > 768 ? '3rem' : '2rem',
                  fontWeight: 'bold',
                  color: '#10B981',
                  marginBottom: '4px'
                }}>
                  500K
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: '500'
                }}>
                  Hectares
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: window.innerWidth > 768 ? '3rem' : '2rem',
                  fontWeight: 'bold',
                  color: '#10B981',
                  marginBottom: '4px'
                }}>
                  95%
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: '500'
                }}>
                  Success
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '128px',
        background: 'linear-gradient(to top, #111827 0%, transparent 100%)',
        zIndex: 10
      }} />
    </div>
  );
};

export default Hero;