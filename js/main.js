/* ==========================================================================
   CUREVO WOMEN'S HEALTH CENTER — JAVASCRIPT & GSAP ANIMATIONS
   Interactive 3D Slider, 1-Second Auto-Movement, Luxury Heading Shimmer & Modals
   ========================================================================== */

// Immediate Scroll Controller: Ensure Hero Section is always shown at top on normal page navigation & header menu clicks
(function() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    const isReturningFrom404 = sessionStorage.getItem('curevo_returning_from_404') === '1';
    if (isReturningFrom404) {
        const savedPos = sessionStorage.getItem('curevo_scroll_pos');
        if (savedPos !== null) {
            const targetY = parseInt(savedPos, 10);
            if (!isNaN(targetY) && targetY >= 0) {
                window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
            }
        }
    } else {
        sessionStorage.removeItem('curevo_scroll_pos');
        sessionStorage.removeItem('curevo_from_url');
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Ensure viewport starts at top for hero section visibility on fresh loads
    if (sessionStorage.getItem('curevo_returning_from_404') !== '1') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    // Initialize All Interactive Systems
    initHeaderNavScroll();
    initHeroSlider();
    init3DCardTilt();
    initEditorialHeadingAnimations();
    initScrollRevealObserver();
    initSpecialtiesAccordion();
    initDoctorsCarousel();
    initProcessTabs();
    initCaseStudiesCarousel();
    initJourneyBento();
    initPricingPlanSwitcher();
    initWellbeingInteractions();
    initModals();
    initMobileNav();
    init404PositionTracker();
    initAboutPageInteractions();
    initServicesPageInteractions();
    initBlogPageInteractions();
    initContactPageInteractions();
});

/* ==========================================================================
   HEADER NAVIGATION SCROLL & HERO VISIBILITY CONTROLLER
   ========================================================================== */
function initHeaderNavScroll() {
    // Select strictly logo, header menu list, mobile menu logo/links, and footer quick links
    const targetLinks = document.querySelectorAll(
        '.header-container .nav-links-list a, ' +
        '.nav-menu .nav-links-list a, ' +
        '.nav-links-list a, ' +
        '.header-container .brand-logo, ' +
        '.brand-logo, ' +
        '.mobile-menu-header a, ' +
        '.mobile-menu-logo, ' +
        '.footer-logo-link, ' +
        '.footer-col-links a'
    );
    
    targetLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('javascript:') || href.includes('404.html') || link.getAttribute('target') === '_blank' || href.startsWith('http://') || href.startsWith('https://')) return;

            // Clear any 404 return memory on genuine navigations
            sessionStorage.removeItem('curevo_returning_from_404');
            sessionStorage.removeItem('curevo_scroll_pos');
            sessionStorage.removeItem('curevo_from_url');

            // Normalize current path and target href
            const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
            let cleanHref = (href.split('#')[0].split('?')[0].split('/').pop() || '').toLowerCase();

            if (!cleanHref || cleanHref === '#home' || cleanHref === '#') {
                cleanHref = (currentPath === 'index.html' || currentPath === '') ? 'index.html' : currentPath;
            }

            const isSamePage = (
                cleanHref === currentPath ||
                ((currentPath === 'index.html' || currentPath === '') && (cleanHref === 'index.html' || cleanHref === ''))
            );

            // Close mobile menu if open
            const navMenu = document.getElementById('navMenu');
            const mobileToggle = document.getElementById('mobileToggle');
            if (navMenu && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                if (mobileToggle) mobileToggle.classList.remove('active');
                document.body.style.overflow = '';
            }

            if (isSamePage) {
                // If clicking logo, header menu list, or footer quick link for current page:
                // Instantly scroll to top, reload and open the page fresh at hero section
                e.preventDefault();
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                const targetUrl = cleanHref || 'index.html';
                if (window.location.pathname.toLowerCase().endsWith(targetUrl)) {
                    window.location.reload();
                } else {
                    window.location.href = targetUrl;
                }
            } else {
                // Navigating to a different page:
                e.preventDefault();
                window.location.href = cleanHref || href;
            }
        });
    });
}

/* ==========================================================================
   POSITION TRACKER FOR 404 NAVIGATION & PRECISE RESTORATION
   ========================================================================== */
function init404PositionTracker() {
    // Universal capture-phase listener to catch ANY element/link navigating to 404
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="404.html"], a[href="404.html"], .footer-col-services a, .footer-col-social a, .footer-bottom-right a, .leader-social-btn, .social-circle-btn, .btn-media-play, .btn-guide-download, .about-scroll-down-btn, .btn-appointment, .mobile-cta-btn');
        if (link) {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
            sessionStorage.setItem('curevo_scroll_pos', currentScroll.toString());
            sessionStorage.setItem('curevo_from_url', window.location.href);
        }
    }, true);
}

/* ==========================================================================
   1. HERO 3-SLIDE GSAP SLIDER (1 Second Automatic Movement)
   ========================================================================== */
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicatorTracks = document.querySelectorAll('.indicator-track');
    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');
    const heroWrapper = document.querySelector('.hero-wrapper');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    if (!totalSlides || !slides[0]) return;
    let slideInterval = null;
    const autoPlayDelay = 5000; // 5 seconds comfortable, premium auto-sliding cadence
    let isTransitioning = false;

    // Trigger GSAP entrance animations for a slide
    function animateSlideIn(slideElement) {
        const tag = slideElement.querySelector('.hero-tag-badge');
        const headingLines = slideElement.querySelectorAll('.heading-line');
        const italicWord = slideElement.querySelector('.italic-highlight');
        const stats = slideElement.querySelector('.hero-stats-row');
        const desc = slideElement.querySelector('.hero-description');
        const card = slideElement.querySelector('.glass-feature-card');
        const bgImg = slideElement.querySelector('.slide-bg-img');

        // Smooth, luxurious timeline
        const tl = gsap.timeline({
            onComplete: () => { isTransitioning = false; }
        });

        // Background subtle zoom & brightness
        if (bgImg) {
            gsap.set(bgImg, { scale: 1.05, transformOrigin: "50% 20%", filter: 'brightness(0.75) contrast(1.05)' });
            tl.to(bgImg, { scale: 1, filter: 'brightness(0.85) contrast(1.05)', duration: 1.2, ease: "power2.out" }, 0);
        }

        // Tag reveal
        if (tag) {
            tl.fromTo(tag, 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, 
                0.1
            );
        }

        // Heading Mask Reveal (3D Rise)
        if (headingLines && headingLines.length) {
            tl.fromTo(headingLines, 
                { y: '100%', opacity: 0, rotateX: 20 }, 
                { y: '0%', opacity: 1, rotateX: 0, stagger: 0.12, duration: 0.8, ease: "power3.out" }, 
                0.15
            );
        }

        // Luminous Italic Accent Word
        if (italicWord) {
            tl.fromTo(italicWord, 
                { scale: 0.85, opacity: 0 }, 
                { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.6)" }, 
                0.3
            );
        }

        // Stats pill
        if (stats) {
            tl.fromTo(stats, 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, 
                0.4
            );
        }

        // Right side description
        if (desc) {
            tl.fromTo(desc, 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, 
                0.25
            );
        }

        // Right side Glass Feature Card
        if (card) {
            tl.fromTo(card, 
                { y: 30, opacity: 0, scale: 0.94 }, 
                { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 
                0.35
            );
        }
    }

    function goToSlide(newIndex) {
        if (isTransitioning || newIndex === currentSlide) return;
        isTransitioning = true;

        // Outgoing slide
        const currentEl = slides[currentSlide];
        currentEl.classList.remove('active');

        // Incoming slide
        currentSlide = (newIndex + totalSlides) % totalSlides;
        const nextEl = slides[currentSlide];
        nextEl.classList.add('active');

        // Update indicators
        indicatorTracks.forEach((track, idx) => {
            if (idx === currentSlide) {
                track.classList.add('active');
            } else {
                track.classList.remove('active');
            }
        });

        // Trigger GSAP entrance animation
        animateSlideIn(nextEl);
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // Auto Play Timer (1 second interval)
    function startAutoPlay() {
        stopAutoPlay();
        slideInterval = setInterval(nextSlide, autoPlayDelay);
    }

    function stopAutoPlay() {
        if (slideInterval) clearInterval(slideInterval);
    }

    // Event Listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoPlay();
        });
    }

    indicatorTracks.forEach((track) => {
        track.addEventListener('click', () => {
            const slideIdx = parseInt(track.getAttribute('data-slide-to'), 10);
            goToSlide(slideIdx);
            startAutoPlay();
        });
    });

    // Pause on hover so user can read/click if desired
    if (heroWrapper) {
        heroWrapper.addEventListener('mouseenter', stopAutoPlay);
        heroWrapper.addEventListener('mouseleave', startAutoPlay);
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            nextSlide();
            startAutoPlay();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
            startAutoPlay();
        }
    });

    // Initial Trigger for First Slide
    animateSlideIn(slides[0]);
    startAutoPlay();
}

/* ==========================================================================
   3. 3D CARD TILT & PARALLAX EFFECT (Interactive Physics)
   ========================================================================== */
function init3DCardTilt() {
    const cards = document.querySelectorAll('.glass-feature-card');

    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cardWidth = rect.width;
            const cardHeight = rect.height;
            const centerX = rect.left + cardWidth / 2;
            const centerY = rect.top + cardHeight / 2;
            
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            
            const rotateX = (-mouseY / (cardHeight / 2)) * 10;
            const rotateY = (mouseX / (cardWidth / 2)) * 10;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.25,
                ease: "power1.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.4)"
            });
        });
    });

    // Subtle Parallax on Hero Left Content
    const heroWrapper = document.querySelector('.hero-wrapper');
    if (heroWrapper) {
        heroWrapper.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.012;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.012;

            gsap.to('.hero-left-content', {
                x: moveX,
                y: moveY,
                duration: 0.5,
                ease: "power1.out"
            });
        });
    }
}

/* ==========================================================================
   4. INTERSECTION OBSERVER (IO) & SMOOTH SCROLL REVEALS
   ========================================================================== */
function initScrollRevealObserver() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('revealed'));
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const delay = parseInt(target.getAttribute('data-delay') || '0', 10);

                setTimeout(() => {
                    target.classList.add('revealed');

                    // If heading reveal wrap
                    const headingInner = target.querySelector('.reveal-inner');
                    if (headingInner) {
                        gsap.fromTo(headingInner, 
                            { y: '80%', opacity: 0, rotateX: 10 },
                            { y: '0%', opacity: 1, rotateX: 0, duration: 0.8, ease: "power3.out" }
                        );
                    }

                    // Feature pillar card specific entrance
                    if (target.classList.contains('pillar-card')) {
                        const icon = target.querySelector('.pillar-svg-icon');
                        if (icon) {
                            gsap.fromTo(icon, 
                                { scale: 0.7, opacity: 0 },
                                { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)" }
                            );
                        }
                    }

                    // Bottom Certified Banner Card
                    if (target.classList.contains('certified-banner-card')) {
                        const certLogos = target.querySelectorAll('.cert-logo-img');
                        gsap.fromTo(certLogos, 
                            { scale: 0.85, opacity: 0 },
                            { scale: 1, opacity: 1, stagger: 0.15, duration: 0.6, ease: "power2.out" }
                        );
                    }
                }, delay);

                obs.unobserve(target); // Only animate once
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // Interactive 3D tilt on the Certified Banner Card
    const bannerCard = document.querySelector('.certified-banner-card');
    if (bannerCard) {
        bannerCard.addEventListener('mousemove', (e) => {
            const rect = bannerCard.getBoundingClientRect();
            const mouseX = e.clientX - (rect.left + rect.width / 2);
            const mouseY = e.clientY - (rect.top + rect.height / 2);
            
            const rotateX = (-mouseY / (rect.height / 2)) * 3;
            const rotateY = (mouseX / (rect.width / 2)) * 3;

            gsap.to(bannerCard, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1200,
                duration: 0.3,
                ease: "power1.out"
            });
        });

        bannerCard.addEventListener('mouseleave', () => {
            gsap.to(bannerCard, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    }
}

/* ==========================================================================
   5. EDITORIAL HEADING ANIMATIONS (Shimmer, Aurora Bloom & Magnetic Feel)
   ========================================================================== */
function initEditorialHeadingAnimations() {
    const headings = document.querySelectorAll('.hero-heading, .trust-main-heading');

    headings.forEach((heading) => {
        heading.addEventListener('mousemove', (e) => {
            const rect = heading.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            const relY = (e.clientY - rect.top) / rect.height;

            // Interactive subtle 3D tilt on heading
            gsap.to(heading, {
                rotateY: (relX - 0.5) * 5,
                rotateX: -(relY - 0.5) * 5,
                transformPerspective: 800,
                duration: 0.3,
                ease: "power1.out"
            });
        });

        heading.addEventListener('mouseleave', () => {
            gsap.to(heading, {
                rotateY: 0,
                rotateX: 0,
                duration: 0.6,
                ease: "power2.out"
            });
        });
    });
}

/* ==========================================================================
   6. MODALS & INTERACTIVE OVERLAYS
   ========================================================================== */
function initModals() {
    // Modal elements cleanly handled if present
    const videoModal = document.getElementById('videoModal');
    const appointmentModal = document.getElementById('appointmentModal');
    if (!videoModal && !appointmentModal) return;
}

/* ==========================================================================
   7. MOBILE NAVIGATION TOGGLE (Full Screen Overlay & Body Lock)
   ========================================================================== */
function initMobileNav() {
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const navMenu = document.getElementById('navMenu');

    function openMenu() {
        if (!navMenu) return;
        navMenu.classList.add('open');
        if (mobileToggle) mobileToggle.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scrolling
    }

    function closeMenu() {
        if (!navMenu) return;
        navMenu.classList.remove('open');
        if (mobileToggle) mobileToggle.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scrolling
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (navMenu && navMenu.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
        });
    }

    // Close when any nav link is clicked
    if (navMenu) {
        const navLinks = navMenu.querySelectorAll('.nav-link, .mobile-cta-btn');
        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });
    }

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
            closeMenu();
        }
    });
}

/* ==========================================================================
   8. SPECIALTIES ACCORDION & MEDIA SYNCHRONIZATION (GSAP Interactive)
   ========================================================================== */
function initSpecialtiesAccordion() {
    const accordionItems = document.querySelectorAll('#specialtiesAccordion .accordion-item');
    const mainImg = document.getElementById('specialtyMainImg');
    const avatarImg = document.getElementById('patientAvatarImg');
    const patientName = document.getElementById('patientName');
    const patientLocation = document.getElementById('patientLocation');
    const patientQuote = document.getElementById('patientQuote');
    const cardWrapper = document.getElementById('specialtyCardWrapper');

    if (!accordionItems.length) return;

    let isUpdating = false;

    // Click handler for each accordion item
    accordionItems.forEach((item) => {
        const header = item.querySelector('.accordion-header');
        const collapse = item.querySelector('.accordion-collapse');

        header.addEventListener('click', () => {
            if (item.classList.contains('active') || isUpdating) return;
            isUpdating = true;

            // Find current active item
            const currentActive = document.querySelector('#specialtiesAccordion .accordion-item.active');
            
            if (currentActive && currentActive !== item) {
                const currentCollapse = currentActive.querySelector('.accordion-collapse');
                const currentHeader = currentActive.querySelector('.accordion-header');

                currentActive.classList.remove('active');
                if (currentHeader) currentHeader.setAttribute('aria-expanded', 'false');

                // Smoothly collapse previous item
                gsap.to(currentCollapse, {
                    height: 0,
                    opacity: 0,
                    duration: 0.35,
                    ease: "power2.inOut"
                });
            }

            // Open clicked item
            item.classList.add('active');
            header.setAttribute('aria-expanded', 'true');

            gsap.fromTo(collapse, 
                { height: 0, opacity: 0 }, 
                { height: 'auto', opacity: 1, duration: 0.45, ease: "power3.out" }
            );

            // Extract data attributes for left media synchronization
            const newImg = item.getAttribute('data-img');
            const newAvatar = item.getAttribute('data-avatar');
            const newName = item.getAttribute('data-name');
            const newLocation = item.getAttribute('data-location');
            const newQuote = item.getAttribute('data-quote');

            // Smooth GSAP Crossfade on Main Image & Testimonial
            const syncTimeline = gsap.timeline({
                onComplete: () => { isUpdating = false; }
            });

            // Fade out main image slightly
            if (mainImg && newImg) {
                syncTimeline.to(mainImg, {
                    opacity: 0.25,
                    scale: 0.96,
                    duration: 0.2,
                    ease: "power1.in",
                    onComplete: () => {
                        mainImg.src = newImg;
                    }
                }, 0);

                syncTimeline.to(mainImg, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.45,
                    ease: "power2.out"
                }, 0.22);
            }

            // Staggered crossfade on patient testimonial details
            const testimonialElements = [avatarImg, patientName, patientLocation, patientQuote].filter(Boolean);
            if (testimonialElements.length) {
                syncTimeline.to(testimonialElements, {
                    opacity: 0,
                    y: 6,
                    duration: 0.18,
                    ease: "power1.in",
                    onComplete: () => {
                        if (avatarImg && newAvatar) avatarImg.src = newAvatar;
                        if (patientName && newName) patientName.textContent = newName;
                        if (patientLocation && newLocation) patientLocation.textContent = newLocation;
                        if (patientQuote && newQuote) patientQuote.innerHTML = newQuote;
                    }
                }, 0);

                syncTimeline.to(testimonialElements, {
                    opacity: 1,
                    y: 0,
                    stagger: 0.04,
                    duration: 0.38,
                    ease: "power2.out"
                }, 0.2);
            }
        });
    });

    // 3D Tilt on Media Card Wrapper
    if (cardWrapper) {
        cardWrapper.addEventListener('mousemove', (e) => {
            const rect = cardWrapper.getBoundingClientRect();
            const mouseX = e.clientX - (rect.left + rect.width / 2);
            const mouseY = e.clientY - (rect.top + rect.height / 2);

            const rotateX = (-mouseY / (rect.height / 2)) * 6;
            const rotateY = (mouseX / (rect.width / 2)) * 6;

            gsap.to(cardWrapper, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.3,
                ease: "power1.out"
            });
        });

        cardWrapper.addEventListener('mouseleave', () => {
            gsap.to(cardWrapper, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.4)"
            });
        });
    }
}

/* ==========================================================================
   9. DOCTORS CAROUSEL — SMOOTH AUTOMATIC LEFT-TO-RIGHT MOVEMENT
   ========================================================================== */
function initDoctorsCarousel() {
    const wrapper = document.getElementById('doctorsCarouselWrapper');
    const track = document.getElementById('doctorsTrack');
    
    if (!wrapper || !track) return;

    // Clone cards to allow seamless infinite loop
    const originalCards = Array.from(track.children);
    originalCards.forEach((card) => {
        const clone1 = card.cloneNode(true);
        track.appendChild(clone1);
    });

    let isHovered = false;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    const speed = 0.9; // Smooth continuous left-to-right velocity

    function getLoopLimit() {
        return track.scrollWidth / 2;
    }

    function animateCarousel() {
        if (!isHovered && !isDragging) {
            // Move left to right (positive increment)
            currentTranslate += speed;
            const loopLimit = getLoopLimit();

            if (currentTranslate >= 0) {
                currentTranslate = -loopLimit;
            }
            track.style.transform = `translateX(${currentTranslate}px)`;
        }
        requestAnimationFrame(animateCarousel);
    }

    // Set initial offset and start animation
    setTimeout(() => {
        const loopLimit = getLoopLimit();
        currentTranslate = -loopLimit / 2;
        track.style.transform = `translateX(${currentTranslate}px)`;
        requestAnimationFrame(animateCarousel);
    }, 150);

    // Pause on hover
    wrapper.addEventListener('mouseenter', () => { isHovered = true; });
    wrapper.addEventListener('mouseleave', () => { 
        isHovered = false; 
        isDragging = false;
    });

    // Touch & Drag Support
    wrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        prevTranslate = currentTranslate;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const delta = e.clientX - startX;
        currentTranslate = prevTranslate + delta;
        const loopLimit = getLoopLimit();
        if (currentTranslate > 0) currentTranslate = -loopLimit;
        if (currentTranslate < -loopLimit) currentTranslate = 0;
        track.style.transform = `translateX(${currentTranslate}px)`;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Mobile Touch
    wrapper.addEventListener('touchstart', (e) => {
        isHovered = true;
        isDragging = true;
        startX = e.touches[0].clientX;
        prevTranslate = currentTranslate;
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const delta = e.touches[0].clientX - startX;
        currentTranslate = prevTranslate + delta;
        const loopLimit = getLoopLimit();
        if (currentTranslate > 0) currentTranslate = -loopLimit;
        if (currentTranslate < -loopLimit) currentTranslate = 0;
        track.style.transform = `translateX(${currentTranslate}px)`;
    }, { passive: true });

    wrapper.addEventListener('touchend', () => {
        isDragging = false;
        isHovered = false;
    });
}

/* ==========================================================================
   10. HOW WE WORK PROCESS TABS (Interactive GSAP Transitions)
   ========================================================================== */
function initProcessTabs() {
    const tabBtns = document.querySelectorAll('.process-tab-btn');
    const leadText = document.getElementById('processLead');
    const checklist = document.getElementById('processChecklist');
    const noteText = document.getElementById('lotusText');
    const processImg = document.getElementById('processImg');

    if (!tabBtns.length) return;

    const processStepsData = [
        {
            lead: "We start by understanding your health goals and concerns through a one-on-one consultation.",
            checkpoints: [
                "Share your symptoms and medical history with our specialists",
                "Get initial guidance on next steps toward diagnosis"
            ],
            note: "Every great recovery begins with the right conversation.",
            img: "images/Primary Care Doctor Consulting with Patient.webp"
        },
        {
            lead: "Our team creates a custom-tailored treatment plan focused on your specific physical and emotional wellness.",
            checkpoints: [
                "Receive individualized therapeutic and clinical regimens",
                "Continuous progress monitoring and adaptive health solutions"
            ],
            note: "Care tailored specifically to your rhythm and lifestyle.",
            img: "images/Professional Gynecologist Consultation in Plano.webp"
        },
        {
            lead: "Long-term wellness tracking, nutritional guidance, and dedicated aftercare for sustained vitality.",
            checkpoints: [
                "Access 24/7 virtual wellness consultations and check-ins",
                "Comprehensive holistic guidance to maintain peak wellbeing"
            ],
            note: "Empowering you to thrive with ongoing care and peace of mind.",
            img: "images/Clinical Documentation Training & Resources _ CoDoc Academy.webp"
        }
    ];

    let isSwitching = false;

    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active') || isSwitching) return;
            isSwitching = true;

            const stepIndex = parseInt(btn.getAttribute('data-step') || '0', 10);
            const data = processStepsData[stepIndex];

            // Update tab button states
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            // GSAP Transition Timeline
            const tl = gsap.timeline({
                onComplete: () => { isSwitching = false; }
            });

            // Fade out current content
            tl.to([leadText, checklist, noteText], {
                opacity: 0,
                y: -6,
                duration: 0.18,
                ease: "power1.in",
                onComplete: () => {
                    // Update Text
                    if (leadText) leadText.textContent = data.lead;
                    if (noteText) noteText.textContent = data.note;

                    // Update Checklist HTML
                    if (checklist) {
                        checklist.innerHTML = data.checkpoints.map(cp => `
                            <li class="checklist-item">
                                <span class="check-icon-badge"><i class="ri-checkbox-circle-fill"></i></span>
                                <span class="check-text">${cp}</span>
                            </li>
                        `).join('');
                    }
                }
            }, 0);

            // Fade & Scale Image
            if (processImg) {
                tl.to(processImg, {
                    opacity: 0.3,
                    scale: 0.96,
                    duration: 0.2,
                    ease: "power1.in",
                    onComplete: () => {
                        processImg.src = data.img;
                    }
                }, 0);

                tl.to(processImg, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.45,
                    ease: "power2.out"
                }, 0.22);
            }

            // Fade in updated text
            tl.to([leadText, checklist, noteText], {
                opacity: 1,
                y: 0,
                stagger: 0.05,
                duration: 0.38,
                ease: "power2.out"
            }, 0.2);
        });
    });
}

/* ==========================================================================
   11. CASE STUDIES CAROUSEL (Interactive GSAP Slider with Drag & Responsive Step)
   ========================================================================== */
function initCaseStudiesCarousel() {
    const track = document.getElementById('casesTrack');
    const viewport = document.getElementById('casesViewport');
    const prevBtn = document.getElementById('casePrevBtn');
    const nextBtn = document.getElementById('caseNextBtn');
    const cards = document.querySelectorAll('.case-card');

    if (!track || !viewport || !cards.length) return;

    let currentIndex = 0;
    let cardWidth = 0;
    let gap = 28;
    let maxIndex = 0;
    let isDragging = false;
    let startX = 0;
    let startTranslate = 0;
    let currentTranslate = 0;

    function updateDimensions() {
        const firstCard = cards[0];
        if (!firstCard) return;
        
        // Calculate gap from computed style if available
        const computedStyle = window.getComputedStyle(track);
        gap = parseFloat(computedStyle.gap) || 28;
        cardWidth = firstCard.getBoundingClientRect().width;
        
        const viewportWidth = viewport.getBoundingClientRect().width;
        const visibleCards = Math.max(1, Math.round(viewportWidth / (cardWidth + gap)));
        maxIndex = Math.max(0, cards.length - visibleCards);

        // Clamp currentIndex if out of bounds
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }
        slideToIndex(currentIndex, false);
    }

    function slideToIndex(index, animated = true) {
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        const step = cardWidth + gap;
        const targetX = -(currentIndex * step);
        currentTranslate = targetX;

        // Update Button States (disabled opacity)
        if (prevBtn) {
            prevBtn.style.opacity = currentIndex === 0 ? '0.45' : '1';
            prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
        }
        if (nextBtn) {
            nextBtn.style.opacity = currentIndex >= maxIndex ? '0.45' : '1';
            nextBtn.style.pointerEvents = currentIndex >= maxIndex ? 'none' : 'auto';
        }

        if (animated) {
            gsap.to(track, {
                x: targetX,
                duration: 0.55,
                ease: "power3.out"
            });
        } else {
            gsap.set(track, { x: targetX });
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            slideToIndex(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            slideToIndex(currentIndex + 1);
        });
    }

    // Touch and Drag Gestures
    viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startTranslate = currentTranslate;
        track.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const newX = startTranslate + deltaX;
        gsap.set(track, { x: newX });
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const deltaX = e.clientX - startX;
        if (deltaX < -50 && currentIndex < maxIndex) {
            slideToIndex(currentIndex + 1);
        } else if (deltaX > 50 && currentIndex > 0) {
            slideToIndex(currentIndex - 1);
        } else {
            slideToIndex(currentIndex);
        }
    });

    // Touch Support
    viewport.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startTranslate = currentTranslate;
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        gsap.set(track, { x: startTranslate + deltaX });
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const deltaX = (e.changedTouches[0]?.clientX || 0) - startX;
        if (deltaX < -40 && currentIndex < maxIndex) {
            slideToIndex(currentIndex + 1);
        } else if (deltaX > 40 && currentIndex > 0) {
            slideToIndex(currentIndex - 1);
        } else {
            slideToIndex(currentIndex);
        }
    });

    // Interactive 3D tilt on case cards
    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const mouseX = e.clientX - (rect.left + rect.width / 2);
            const mouseY = e.clientY - (rect.top + rect.height / 2);

            const rotateX = (-mouseY / (rect.height / 2)) * 4;
            const rotateY = (mouseX / (rect.width / 2)) * 4;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.25,
                ease: "power1.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });

    // Window Resize Handler
    window.addEventListener('resize', updateDimensions);

    // Initial Setup
    setTimeout(updateDimensions, 100);
}

/* ==========================================================================
   12. OUR JOURNEY IN NUMBERS — BENTO STATS & PLAY INTERACTIONS
   ========================================================================== */
function initJourneyBento() {
    const playBtn = document.getElementById('bentoPlayBtn');
    const playIcon = document.getElementById('bentoPlayIcon');
    const playText = document.getElementById('bentoPlayText');
    const bentoCards = document.querySelectorAll('.bento-card');
    const statCounters = document.querySelectorAll('.bento-stat-val[data-counter]');

    // 1. Play / Pause Ambient Toggle
    if (playBtn) {
        let isPlaying = false;
        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            playBtn.classList.toggle('playing', isPlaying);
            
            if (playIcon) {
                playIcon.className = isPlaying ? 'ri-pause-fill play-icon' : 'ri-play-fill play-icon';
            }
            if (playText) {
                playText.textContent = isPlaying ? 'Pause' : 'Play';
            }

            // GSAP micro-pulse on nature card image
            const mediaImg = playBtn.closest('.bento-card-media')?.querySelector('.bento-media-img');
            if (mediaImg) {
                if (isPlaying) {
                    gsap.to(mediaImg, {
                        scale: 1.08,
                        filter: 'brightness(1.08) contrast(1.05)',
                        duration: 0.6,
                        ease: "power2.out"
                    });
                } else {
                    gsap.to(mediaImg, {
                        scale: 1,
                        filter: 'brightness(1) contrast(1)',
                        duration: 0.6,
                        ease: "power2.out"
                    });
                }
            }

            // Button bounce effect
            gsap.fromTo(playBtn, 
                { scale: 0.9 }, 
                { scale: 1, duration: 0.4, ease: "back.out(2)" }
            );
        });
    }

    // 2. Count-Up Animation with Intersection Observer
    if ('IntersectionObserver' in window && statCounters.length) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const targetNum = parseInt(el.getAttribute('data-counter'), 10);
                    const suffix = el.getAttribute('data-suffix') || '';
                    
                    if (!isNaN(targetNum)) {
                        const counterObj = { val: 0 };
                        gsap.to(counterObj, {
                            val: targetNum,
                            duration: 1.8,
                            ease: "power2.out",
                            onUpdate: () => {
                                el.textContent = Math.floor(counterObj.val) + suffix;
                            }
                        });
                    }
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.3 });

        statCounters.forEach(counter => statsObserver.observe(counter));
    }

    // 3. 3D Tilt Cursor Physics on Bento Cards
    bentoCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const mouseX = e.clientX - (rect.left + rect.width / 2);
            const mouseY = e.clientY - (rect.top + rect.height / 2);

            const rotateX = (-mouseY / (rect.height / 2)) * 4;
            const rotateY = (mouseX / (rect.width / 2)) * 4;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 800,
                duration: 0.25,
                ease: "power1.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });
}

/* ==========================================================================
   13. DYNAMIC PRICING PLAN SWITCHER (GSAP Data Transitions)
   ========================================================================== */
function initPricingPlanSwitcher() {
    const planTitle = document.getElementById('planTitle');
    const planPriceVal = document.getElementById('planPriceVal');
    const featuresCol1 = document.getElementById('featuresCol1');
    const featuresCol2 = document.getElementById('featuresCol2');
    const prevBtn = document.getElementById('planPrevBtn');
    const nextBtn = document.getElementById('planNextBtn');
    const dots = document.querySelectorAll('.plan-dot');
    const pricingCard = document.getElementById('dynamicPricingCard');

    if (!planTitle || !planPriceVal || !featuresCol1 || !featuresCol2) return;

    const pricingPlans = [
        {
            title: "Basic care plan",
            price: "49",
            featuresCol1: [
                "Annual health checkups",
                "Access to general practitioners",
                "Preventive care tips"
            ],
            featuresCol2: [
                "Basic lab tests",
                "Personalized wellness tips"
            ]
        },
        {
            title: "Standard care plan",
            price: "89",
            featuresCol1: [
                "Everything in Basic Plan",
                "Routine diagnostics & reports",
                "Priority scheduling"
            ],
            featuresCol2: [
                "Specialist consultations (2 per year)",
                "Personalized nutrition guidance"
            ]
        },
        {
            title: "Premium care plan",
            price: "149",
            featuresCol1: [
                "Everything in Standard Plan",
                "24/7 virtual care access",
                "Dedicated wellness coach"
            ],
            featuresCol2: [
                "Unlimited specialist visits",
                "Advanced lab & imaging tests"
            ]
        }
    ];

    let currentPlanIndex = 0;
    let isTransitioning = false;

    function renderFeatures(colElement, featuresArray) {
        if (!colElement) return;
        colElement.innerHTML = featuresArray.map(feat => `
            <li class="feature-item">
                <span class="feature-check-icon"><i class="ri-check-line"></i></span>
                <span class="feature-text">${feat}</span>
            </li>
        `).join('');
    }

    function switchPlan(newIndex, direction = 1) {
        if (isTransitioning || newIndex === currentPlanIndex) return;
        isTransitioning = true;

        currentPlanIndex = (newIndex + pricingPlans.length) % pricingPlans.length;
        const plan = pricingPlans[currentPlanIndex];

        // Update Dots
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentPlanIndex);
        });

        // GSAP Elements to animate
        const animatedElements = [planTitle, planPriceVal, featuresCol1, featuresCol2];

        // Smooth GSAP Crossfade Timeline
        const tl = gsap.timeline({
            onComplete: () => {
                isTransitioning = false;
            }
        });

        // 1. Fade out current content
        tl.to(animatedElements, {
            opacity: 0,
            y: direction * -12,
            duration: 0.2,
            stagger: 0.03,
            ease: "power2.in",
            onComplete: () => {
                // 2. Update DOM
                planTitle.textContent = plan.title;
                planPriceVal.textContent = plan.price;
                renderFeatures(featuresCol1, plan.featuresCol1);
                renderFeatures(featuresCol2, plan.featuresCol2);

                // Set initial position for incoming animation
                gsap.set(animatedElements, {
                    opacity: 0,
                    y: direction * 14
                });
            }
        });

        // 3. Fade in new content
        tl.to(animatedElements, {
            opacity: 1,
            y: 0,
            duration: 0.38,
            stagger: 0.04,
            ease: "power3.out"
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            switchPlan(currentPlanIndex - 1, -1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            switchPlan(currentPlanIndex + 1, 1);
        });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            const dir = idx > currentPlanIndex ? 1 : -1;
            switchPlan(idx, dir);
        });
    });

    // 3D Tilt on Dynamic Pricing Card
    if (pricingCard) {
        pricingCard.addEventListener('mousemove', (e) => {
            const rect = pricingCard.getBoundingClientRect();
            const mouseX = e.clientX - (rect.left + rect.width / 2);
            const mouseY = e.clientY - (rect.top + rect.height / 2);

            const rotateX = (-mouseY / (rect.height / 2)) * 4;
            const rotateY = (mouseX / (rect.width / 2)) * 4;

            gsap.to(pricingCard, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.25,
                ease: "power1.out"
            });
        });

        pricingCard.addEventListener('mouseleave', () => {
            gsap.to(pricingCard, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    }
}

/* ==========================================================================
   14. WELL-BEING MATTERS SECTION INTERACTIONS (Play/Pause & 3D Tilt)
   ========================================================================== */
function initWellbeingInteractions() {
    const playBtn = document.getElementById('wellbeingPlayBtn');
    const playIcon = document.getElementById('wellbeingPlayIcon');
    const imgCards = document.querySelectorAll('.wellbeing-img-card');
    const expertsCard = document.querySelector('.wellbeing-experts-card');

    // 1. Play / Pause Ambient Nature Sound Toggle
    if (playBtn) {
        let isPlaying = true;
        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (playIcon) {
                playIcon.className = isPlaying ? 'ri-pause-fill' : 'ri-play-fill';
            }

            const forestImg = playBtn.closest('.wellbeing-img-card')?.querySelector('.wellbeing-img');
            if (forestImg) {
                if (isPlaying) {
                    gsap.to(forestImg, {
                        scale: 1.05,
                        filter: 'brightness(1.08) contrast(1.04)',
                        duration: 0.6,
                        ease: "power2.out"
                    });
                } else {
                    gsap.to(forestImg, {
                        scale: 1,
                        filter: 'brightness(1) contrast(1)',
                        duration: 0.6,
                        ease: "power2.out"
                    });
                }
            }

            // Button bounce micro-animation
            gsap.fromTo(playBtn, 
                { scale: 0.85 }, 
                { scale: 1, duration: 0.4, ease: "back.out(2)" }
            );
        });
    }

    // 2. 3D Tilt Physics on Visual Image Cards
    imgCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const mouseX = e.clientX - (rect.left + rect.width / 2);
            const mouseY = e.clientY - (rect.top + rect.height / 2);

            const rotateX = (-mouseY / (rect.height / 2)) * 5;
            const rotateY = (mouseX / (rect.width / 2)) * 5;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 800,
                duration: 0.25,
                ease: "power1.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });

    // 3. Subtle Parallax on Experts Card
    if (expertsCard) {
        expertsCard.addEventListener('mousemove', (e) => {
            const rect = expertsCard.getBoundingClientRect();
            const mouseX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
            const mouseY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

            gsap.to(expertsCard, {
                x: mouseX * 4,
                y: mouseY * 4,
                duration: 0.3,
                ease: "power1.out"
            });
        });

        expertsCard.addEventListener('mouseleave', () => {
            gsap.to(expertsCard, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    }
}

/* ==========================================================================
   15. ABOUT.HTML SPECIFIC INTERACTIVE ANIMATIONS & GSAP PARALLAX
   ========================================================================== */
function initAboutPageInteractions() {
    const aboutHero = document.querySelector('.about-hero-section');
    const aboutInteractiveCard = document.getElementById('aboutInteractiveCard');
    const timelineSteps = document.querySelectorAll('.timeline-step');
    const metricCounters = document.querySelectorAll('.about-metrics-section .metric-val[data-counter]');

    // 1. Hero 3D Card Interactive Mouse Tracking
    if (aboutInteractiveCard && aboutHero) {
        aboutHero.addEventListener('mousemove', (e) => {
            const rect = aboutHero.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
            const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(aboutInteractiveCard, {
                rotateY: mouseX * 18,
                rotateX: -mouseY * 18,
                transformPerspective: 1000,
                duration: 0.4,
                ease: "power1.out"
            });

            // Parallax on hero background image
            const bgImg = document.getElementById('aboutHeroBg');
            if (bgImg) {
                gsap.to(bgImg, {
                    x: mouseX * -20,
                    y: mouseY * -20,
                    duration: 0.8,
                    ease: "power1.out"
                });
            }
        });

        aboutHero.addEventListener('mouseleave', () => {
            gsap.to(aboutInteractiveCard, {
                rotateY: 0,
                rotateX: 0,
                duration: 0.8,
                ease: "power2.out"
            });

            const bgImg = document.getElementById('aboutHeroBg');
            if (bgImg) {
                gsap.to(bgImg, {
                    x: 0,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });
            }
        });
    }

    // 2. Interactive Timeline Step Highlighting
    if (timelineSteps.length) {
        timelineSteps.forEach(step => {
            step.addEventListener('mouseenter', () => {
                timelineSteps.forEach(s => s.classList.remove('active'));
                step.classList.add('active');
            });
        });
    }

    // 3. Impact Metrics Count-Up Observer
    if (metricCounters.length && 'IntersectionObserver' in window) {
        const metricsObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    metricCounters.forEach(counter => {
                        const targetVal = parseFloat(counter.getAttribute('data-counter'));
                        const obj = { val: 0 };

                        gsap.to(obj, {
                            val: targetVal,
                            duration: 2.2,
                            ease: "power2.out",
                            onUpdate: () => {
                                counter.textContent = Math.floor(obj.val);
                            }
                        });
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const metricsSection = document.querySelector('.about-metrics-section');
        if (metricsSection) metricsObserver.observe(metricsSection);
    }
}

/* ==========================================================================
   SERVICES PAGE (SERVICE.HTML) INTERACTIVE SYSTEMS
   ========================================================================== */
function initServicesPageInteractions() {
    // 1. Interactive 3D Spotlight Card Physics
    const servicesHero = document.getElementById('servicesHero');
    const spotlightCard = document.getElementById('servicesSpotlightCard');

    if (servicesHero && spotlightCard) {
        servicesHero.addEventListener('mousemove', (e) => {
            const rect = servicesHero.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((mouseY - centerY) / centerY) * -10;
            const rotateY = ((mouseX - centerX) / centerX) * 10;

            gsap.to(spotlightCard, {
                rotateY: rotateY,
                rotateX: rotateX,
                duration: 0.6,
                ease: "power1.out",
                transformPerspective: 1000
            });
        });

        servicesHero.addEventListener('mouseleave', () => {
            gsap.to(spotlightCard, {
                rotateY: 0,
                rotateX: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        });
    }

    // 2. Quick Service Select Handler (Filter Matrix on change)
    const quickSelect = document.getElementById('quickServiceSelect');
    const srvTabBtns = document.querySelectorAll('.srv-tab-btn');
    const serviceCards = document.querySelectorAll('.service-matrix-card');

    if (quickSelect) {
        quickSelect.addEventListener('change', () => {
            const selectedVal = quickSelect.value;
            if (selectedVal && selectedVal !== 'all') {
                srvTabBtns.forEach(btn => {
                    if (btn.getAttribute('data-filter') === selectedVal) {
                        btn.click();
                    }
                });
            } else {
                const allBtn = document.querySelector('.srv-tab-btn[data-filter="all"]');
                if (allBtn) allBtn.click();
            }
        });
    }

    // 3. Service Category Tabs Filter
    if (srvTabBtns.length && serviceCards.length) {
        srvTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                srvTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                serviceCards.forEach(card => {
                    const cardCat = card.getAttribute('data-category');
                    if (filter === 'all' || cardCat === filter) {
                        gsap.to(card, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.35,
                            ease: "power2.out",
                            onStart: () => {
                                card.style.display = 'flex';
                            }
                        });
                    } else {
                        gsap.to(card, {
                            opacity: 0,
                            scale: 0.95,
                            duration: 0.25,
                            ease: "power2.in",
                            onComplete: () => {
                                card.style.display = 'none';
                            }
                        });
                    }
                });
            });
        });
    }

    // 4. Smart Symptom & Service Matcher Widget
    const matcherBtns = document.querySelectorAll('.matcher-pill-btn');
    const recTitle = document.getElementById('recTitle');
    const recDesc = document.getElementById('recDesc');
    const recChecklist = document.getElementById('recChecklist');
    const recDocImg = document.getElementById('recDocImg');
    const recDocName = document.getElementById('recDocName');
    const recDocRole = document.getElementById('recDocRole');
    const recSchedule = document.getElementById('recSchedule');
    const matcherResultPanel = document.getElementById('matcherResultPanel');

    const symptomData = {
        prenatal: {
            title: "Maternal & Fetal Medicine Suite",
            desc: "Dedicated first-trimester genetic screening, 4D viability scans, prenatal blood panels, and personalized nutritional guidance for an anxiety-free pregnancy.",
            tests: [
                "Early Viability & Dating 4D Ultrasound",
                "Non-Invasive Prenatal Testing (NIPT) & Dual Marker",
                "Complete Maternal Hemogram & Thyroid Profile"
            ],
            docImg: "images/d2.webp",
            docName: "Dr. Sarah Jenkins, OB-GYN",
            docRole: "Head of Maternal & Prenatal Health",
            schedule: "Mon – Sat • 10:00 AM – 04:00 PM"
        },
        pcos: {
            title: "PCOS & Metabolic Endocrine Clinic",
            desc: "Comprehensive root-cause hormonal evaluation to resolve irregular menstrual cycles, insulin resistance, androgen excess, and cystic follicular patterns.",
            tests: [
                "12-Point Comprehensive Androgen & Estrogen Panel",
                "High-Resolution Pelvic Ultrasound Mapping",
                "Fasting Glucose & HbA1c Insulin Sensitivity Ratio"
            ],
            docImg: "images/d3.webp",
            docName: "Dr. Maya Sharma, MD",
            docRole: "Endocrinologist & Hormonal Specialist",
            schedule: "Mon – Fri • 10:00 AM – 05:00 PM"
        },
        annual: {
            title: "Comprehensive Well-Woman Preventive Screening",
            desc: "Thorough preventative assessment designed to safeguard cervical, breast, cardiovascular, and reproductive wellness for peace of mind.",
            tests: [
                "Liquid-Based Pap Smear & HPV Co-Testing",
                "Digital Low-Dose Breast Screening & Palpation",
                "Complete Lipid, Liver, Kidney & Iron Screen"
            ],
            docImg: "images/d1.webp",
            docName: "Dr. Priya Sharma, MD",
            docRole: "Lead Obstetrician & Gynecologist",
            schedule: "Mon – Sat • 09:30 AM – 04:30 PM"
        },
        menopause: {
            title: "Peri-Menopause & Active Longevity Suite",
            desc: "Personalized symptom modulation for hot flashes, sleep fragmentation, mood transitions, bone density decline, and hormonal restoration.",
            tests: [
                "Bio-Identical Hormone & FSH/Estradiol Profiling",
                "DEXA Lumbar Spine & Hip Bone Density Scan",
                "Cardiovascular CRP & Lipid Risk Analysis"
            ],
            docImg: "images/d3.webp",
            docName: "Dr. Maya Sharma, MD",
            docRole: "Endocrinologist & Hormonal Specialist",
            schedule: "Tue – Sat • 10:00 AM – 04:00 PM"
        },
        pelvic: {
            title: "Pelvic Floor & Core Rehabilitation",
            desc: "Gentle physical medicine addressing pelvic floor weakness, postpartum recovery, urinary stress incontinence, and chronic pelvic discomfort.",
            tests: [
                "Biofeedback Pelvic Muscular Strength Assessment",
                "Postnatal Diastasis Recti Evaluation",
                "Ultrasound Pelvic Stability Screening"
            ],
            docImg: "images/d1.webp",
            docName: "Dr. Ananya Rao, MPT",
            docRole: "Pelvic Health & Physiotherapy Lead",
            schedule: "Mon – Fri • 11:00 AM – 05:00 PM"
        }
    };

    if (matcherBtns.length && recTitle) {
        matcherBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                matcherBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const symptom = btn.getAttribute('data-symptom');
                const data = symptomData[symptom];
                if (!data) return;

                if (matcherResultPanel) {
                    gsap.fromTo(matcherResultPanel, 
                        { opacity: 0.4, y: 8 }, 
                        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
                    );
                }

                recTitle.textContent = data.title;
                recDesc.textContent = data.desc;
                recDocImg.src = data.docImg;
                recDocName.textContent = data.docName;
                recDocRole.textContent = data.docRole;
                recSchedule.textContent = data.schedule;

                if (recChecklist) {
                    recChecklist.innerHTML = data.tests
                        .map(test => `<li><i class="ri-check-line"></i> ${test}</li>`)
                        .join('');
                }
            });
        });
    }
}

/* ==========================================================================
   BLOG PAGE (BLOG.HTML) INTERACTIVE SYSTEMS
   ========================================================================== */
function initBlogPageInteractions() {
    // 1. 3D Tilt Physics for Featured Cover Story Card
    const heroSection = document.getElementById('blogHero');
    const coverCard = document.getElementById('heroCoverStoryCard');

    if (heroSection && coverCard) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((mouseY - centerY) / centerY) * -8;
            const rotateY = ((mouseX - centerX) / centerX) * 8;

            gsap.to(coverCard, {
                rotateY: rotateY,
                rotateX: rotateX,
                duration: 0.5,
                ease: "power1.out",
                transformPerspective: 1000
            });
        });

        heroSection.addEventListener('mouseleave', () => {
            gsap.to(coverCard, {
                rotateY: 0,
                rotateX: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        });
    }

    // 2. Topic Category Filter Tabs
    const topicTabs = document.querySelectorAll('.topic-tab-btn');
    const articleCards = document.querySelectorAll('.editorial-card');
    const emptyState = document.getElementById('blogEmptyState');
    const btnResetFilters = document.getElementById('btnResetFilters');
    const searchInput = document.getElementById('journalSearchInput');
    const btnClearSearch = document.getElementById('btnSearchClear');

    function filterArticles() {
        const activeTab = document.querySelector('.topic-tab-btn.active');
        const activeCategory = activeTab ? activeTab.getAttribute('data-filter') : 'all';
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

        let visibleCount = 0;

        articleCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            const title = card.querySelector('.card-article-title') ? card.querySelector('.card-article-title').textContent.toLowerCase() : '';
            const excerpt = card.querySelector('.card-excerpt') ? card.querySelector('.card-excerpt').textContent.toLowerCase() : '';
            const tag = card.querySelector('.card-topic-tag') ? card.querySelector('.card-topic-tag').textContent.toLowerCase() : '';

            const matchesCategory = (activeCategory === 'all' || cardCat === activeCategory);
            const matchesSearch = query === '' || title.includes(query) || excerpt.includes(query) || tag.includes(query);

            if (matchesCategory && matchesSearch) {
                visibleCount++;
                gsap.to(card, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.35,
                    ease: "power2.out",
                    onStart: () => {
                        card.style.display = 'flex';
                    }
                });
            } else {
                gsap.to(card, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.25,
                    ease: "power2.in",
                    onComplete: () => {
                        card.style.display = 'none';
                    }
                });
            }
        });

        if (emptyState) {
            if (visibleCount === 0) {
                emptyState.style.display = 'block';
                gsap.fromTo(emptyState, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 });
            } else {
                emptyState.style.display = 'none';
            }
        }
    }

    if (topicTabs.length) {
        topicTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                topicTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Sync with hero trend chips if present
                const filterVal = tab.getAttribute('data-filter');
                document.querySelectorAll('.hero-trend-chip').forEach(chip => {
                    if (chip.getAttribute('data-topic') === filterVal) {
                        chip.classList.add('active');
                    } else {
                        chip.classList.remove('active');
                    }
                });

                filterArticles();
            });
        });
    }

    // Hero Trending Topic Chips Click Handler
    const heroTrendChips = document.querySelectorAll('.hero-trend-chip');
    if (heroTrendChips.length) {
        heroTrendChips.forEach(chip => {
            chip.addEventListener('click', () => {
                heroTrendChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const topic = chip.getAttribute('data-topic');
                const matchingTab = document.querySelector(`.topic-tab-btn[data-filter="${topic}"]`);
                if (matchingTab) {
                    topicTabs.forEach(t => t.classList.remove('active'));
                    matchingTab.classList.add('active');
                }

                filterArticles();

                const targetSection = document.getElementById('editorialMatrix');
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // 3. Live Search Input
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (btnClearSearch) {
                btnClearSearch.style.display = searchInput.value.trim().length > 0 ? 'flex' : 'none';
            }
            filterArticles();
        });

        if (btnClearSearch) {
            btnClearSearch.addEventListener('click', () => {
                searchInput.value = '';
                btnClearSearch.style.display = 'none';
                filterArticles();
                searchInput.focus();
            });
        }
    }

    if (btnResetFilters) {
        btnResetFilters.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                if (btnClearSearch) btnClearSearch.style.display = 'none';
            }
            const allTab = document.querySelector('.topic-tab-btn[data-filter="all"]');
            if (allTab) {
                topicTabs.forEach(t => t.classList.remove('active'));
                allTab.classList.add('active');
            }
            document.querySelectorAll('.hero-trend-chip').forEach(c => {
                if (c.getAttribute('data-topic') === 'all') c.classList.add('active');
                else c.classList.remove('active');
            });
            filterArticles();
        });
    }

    // 4. Interactive Article Bookmark Toggle
    const bookmarkBtns = document.querySelectorAll('.btn-card-bookmark');
    bookmarkBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.toggle('bookmarked');
            const icon = btn.querySelector('i');
            if (icon) {
                if (btn.classList.contains('bookmarked')) {
                    icon.className = 'ri-bookmark-fill';
                } else {
                    icon.className = 'ri-bookmark-line';
                }
            }
        });
    });

    // 5. Myth vs Fact Accordion
    const mythItems = document.querySelectorAll('.myth-card-item');
    mythItems.forEach(item => {
        const toggleBtn = item.querySelector('.myth-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                mythItems.forEach(i => {
                    i.classList.remove('active');
                    const btn = i.querySelector('.myth-toggle-btn');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                });

                if (!isActive) {
                    item.classList.add('active');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });
}

// 6. Global Newsletter Subscription Handler (Direct Navigation to 404 without message)
function handleNewsletterSubscribe() {
    const input = document.getElementById('subscriberEmail');
    if (!input) return;

    const email = input.value.trim();
    if (email && email.includes('@')) {
        // Record scroll position so clicking 'Go Back' returns cleanly
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
        sessionStorage.setItem('curevo_scroll_pos', currentScroll.toString());
        sessionStorage.setItem('curevo_from_url', window.location.href);

        window.location.href = '404.html';
    } else {
        input.focus();
        input.parentElement.style.borderColor = '#ff6b6b';
        setTimeout(() => {
            input.parentElement.style.borderColor = '';
        }, 2000);
    }
}

/* ==========================================================================
   7. CONTACT PAGE INTERACTIVE CONSULTATION & BOOKING SYSTEMS
   ========================================================================== */
function initContactPageInteractions() {
    // 1. Specialty Selection in Booking Wizard
    const specialtyTiles = document.querySelectorAll('.specialty-tile');
    specialtyTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            specialtyTiles.forEach(t => t.classList.remove('selected'));
            tile.classList.add('selected');
        });
    });

    // 2. Doctor Selection in Booking Wizard
    const doctorTiles = document.querySelectorAll('.doctor-tile');
    doctorTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            doctorTiles.forEach(d => d.classList.remove('selected'));
            tile.classList.add('selected');
        });
    });

    // 3. Time Pill Selection in Booking Wizard
    const timePills = document.querySelectorAll('.time-pill-btn');
    timePills.forEach(pill => {
        pill.addEventListener('click', () => {
            timePills.forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
        });
    });

    // 4. Contact FAQ Accordion
    const faqItems = document.querySelectorAll('.contact-faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.contact-faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // 5. Booking Step Indicators clickable
    const stepIndicators = document.querySelectorAll('.booking-steps-bar .step-item');
    stepIndicators.forEach(ind => {
        ind.addEventListener('click', () => {
            const stepNum = parseInt(ind.getAttribute('data-step'), 10);
            if (!isNaN(stepNum)) {
                goToBookingStep(stepNum);
            }
        });
    });

    // 6. Direct Google Maps & Driving Directions Integration (No permission prompt)
    const btnGpsDirections = document.getElementById('btnGpsDirections');
    const btnOpenGoogleMaps = document.getElementById('btnOpenGoogleMaps');

    if (btnOpenGoogleMaps) {
        btnOpenGoogleMaps.setAttribute('target', '_blank');
        btnOpenGoogleMaps.setAttribute('rel', 'noopener noreferrer');
    }

    if (btnGpsDirections) {
        btnGpsDirections.setAttribute('target', '_blank');
        btnGpsDirections.setAttribute('rel', 'noopener noreferrer');
    }
}

// Global Step Switcher for Booking Wizard
function goToBookingStep(stepNumber) {
    const totalSteps = 4;
    if (stepNumber < 1 || stepNumber > totalSteps) return;

    // Switch step panes
    for (let i = 1; i <= totalSteps; i++) {
        const pane = document.getElementById(`wizardStep${i}`);
        const indicator = document.getElementById(`stepIndicator${i}`);
        if (pane) {
            if (i === stepNumber) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        }
        if (indicator) {
            indicator.classList.remove('active');
            if (i === stepNumber) {
                indicator.classList.add('active');
            } else if (i < stepNumber) {
                indicator.classList.add('completed');
            } else {
                indicator.classList.remove('completed');
            }
        }
    }

    // Scroll slightly if on mobile
    const wizardCard = document.querySelector('.booking-wizard-card');
    if (wizardCard && window.innerWidth < 768) {
        wizardCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Submit Booking Appointment Handler
function submitBookingAppointment() {
    const fullName = document.getElementById('patientFullName');
    const phone = document.getElementById('patientPhone');
    const email = document.getElementById('patientEmail');
    const age = document.getElementById('patientAge');

    if (!fullName || !fullName.value.trim()) {
        if (fullName) fullName.focus();
        return;
    }
    
    // Validate Phone: must be exactly 10 digits (numbers only)
    if (!phone || !/^\d{10}$/.test(phone.value.trim())) {
        if (phone) {
            phone.focus();
            phone.style.borderColor = '#ff6b6b';
            setTimeout(() => { phone.style.borderColor = ''; }, 2000);
        }
        return;
    }

    if (!email || !email.value.trim() || !email.value.includes('@')) {
        if (email) email.focus();
        return;
    }

    // Validate Age: must be valid number
    if (!age || !/^\d{1,3}$/.test(age.value.trim()) || parseInt(age.value.trim(), 10) < 1 || parseInt(age.value.trim(), 10) > 120) {
        if (age) {
            age.focus();
            age.style.borderColor = '#ff6b6b';
            setTimeout(() => { age.style.borderColor = ''; }, 2000);
        }
        return;
    }

    // Save scroll position for returning
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    sessionStorage.setItem('curevo_scroll_pos', currentScroll.toString());
    sessionStorage.setItem('curevo_from_url', window.location.href);

    window.location.href = '404.html';
}

// Submit Clinical Inquiry Form Handler
function handleInquirySubmit() {
    const name = document.getElementById('inqName');
    const phone = document.getElementById('inqPhone');
    const email = document.getElementById('inqEmail');
    const message = document.getElementById('inqMessage');

    if (!name || !name.value.trim()) {
        if (name) name.focus();
        return;
    }

    // Validate Phone: must be exactly 10 digits (numbers only)
    if (!phone || !/^\d{10}$/.test(phone.value.trim())) {
        if (phone) {
            phone.focus();
            phone.style.borderColor = '#ff6b6b';
            setTimeout(() => { phone.style.borderColor = ''; }, 2000);
        }
        return;
    }

    if (!email || !email.value.trim() || !email.value.includes('@')) {
        if (email) email.focus();
        return;
    }
    if (!message || !message.value.trim()) {
        if (message) message.focus();
        return;
    }

    // Save scroll position for returning
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    sessionStorage.setItem('curevo_scroll_pos', currentScroll.toString());
    sessionStorage.setItem('curevo_from_url', window.location.href);

    window.location.href = '404.html';
}







