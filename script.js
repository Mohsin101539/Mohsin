document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initScrollObserver();
    initHeroRotator();
    initViewSwitcher();
    initLightboxModal();
    init3DCardTilt();
    initContactForm();
    loadSiteContent();
});

// 0. Theme Toggle (Dark Atmosphere Default, Light Mode Optional)
function initThemeToggle() {
    const btn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem('mohsin_portfolio_theme') || 'dark';
    
    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            if (btn) btn.innerHTML = '<i class="ph ph-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (btn) btn.innerHTML = '<i class="ph ph-sun"></i>';
        }
    }

    applyTheme(savedTheme);

    if (btn) {
        btn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('mohsin_portfolio_theme', newTheme);
            applyTheme(newTheme);
            showToast(newTheme === 'light' ? 'Switched to Light Studio Mode ☀️' : 'Switched to Dark Atmosphere 🌙');
        });
    }
}

// 0. Hero Spotlight Cursor Listener (Desktop)
function initHeroSpotlight() {
    const hero = document.getElementById('hero');
    const spotlight = document.getElementById('hero-spotlight');
    if (!hero || !spotlight) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        spotlight.style.left = `${x}px`;
        spotlight.style.top = `${y}px`;
    });
}

// 0.1 Hero Text Rotator
function initHeroRotator() {
    const rotator = document.getElementById('hero-rotator');
    if (!rotator) return;

    const phrases = [
        "High-CTR Graphic Design",
        "C++ / Qt Desktop Engineering",
        "Python Automation Scripts",
        "Parallax 3D & Creative Art"
    ];
    let idx = 0;

    setInterval(() => {
        rotator.style.opacity = '0';
        setTimeout(() => {
            idx = (idx + 1) % phrases.length;
            rotator.textContent = phrases[idx];
            rotator.style.opacity = '1';
        }, 300);
    }, 3200);
}

// 1. Navigation & Mobile Menu Logic
function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.style.display === 'flex';
            navLinks.style.display = isOpen ? 'none' : 'flex';
            if (!isOpen) {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#0a0a0a';
                navLinks.style.padding = '20px';
                navLinks.style.zIndex = '999';
            }
        });
    }

    // Close mobile menu on click & smooth scroll
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768 && navLinks) {
                navLinks.style.display = 'none';
            }
        });
    });
}

// 2. IntersectionObserver for Active Nav Link & Scroll Reveal
function initScrollObserver() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.35,
        rootMargin: "-80px 0px 0px 0px"
    });

    sections.forEach(section => sectionObserver.observe(section));

    // Scroll Reveal Observer
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(el => revealObserver.observe(el));
}

// 3. Load Content from content.json & Render
function loadSiteContent() {
    const savedLocal = localStorage.getItem('mohsin_portfolio_content');
    if (savedLocal) {
        try {
            const parsed = JSON.parse(savedLocal);
            renderSite(parsed);
        } catch(e) {}
    }

    fetch('/content.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load content.json');
            return res.json();
        })
        .then(data => {
            if (!savedLocal) renderSite(data);
        })
        .catch(err => console.warn('Using fallback inline HTML:', err));
}

function renderSite(data) {
    if (!data) return;

    // A. Hero Section
    if (data.hero) {
        setText('hero-badge', data.hero.badge);
        if (data.hero.headline) {
            document.getElementById('hero-headline').innerHTML = data.hero.headline;
        }
        setText('hero-subtitle', data.hero.subtitle);
        if (data.hero.exploreDevText) {
            const devBtn = document.getElementById('hero-dev-btn');
            if (devBtn && devBtn.childNodes[0]) devBtn.childNodes[0].nodeValue = data.hero.exploreDevText + ' ';
        }
        if (data.hero.exploreDesignText) {
            const designBtn = document.getElementById('hero-design-btn');
            if (designBtn && designBtn.childNodes[0]) designBtn.childNodes[0].nodeValue = data.hero.exploreDesignText + ' ';
        }
    }

    // B. About Section
    if (data.about) {
        setText('about-sec-title', data.about.sectionTitle);
        if (data.about.roleTitle) {
            document.getElementById('about-role-title').innerHTML = data.about.roleTitle;
        }
        if (data.about.profileImg) {
            const aboutImg = document.getElementById('about-img');
            if (aboutImg) aboutImg.src = data.about.profileImg;
        }
        setText('about-exp-num', data.about.experienceBadgeNumber);
        if (data.about.experienceBadgeText) {
            const expText = document.getElementById('about-exp-text');
            if (expText) expText.innerHTML = data.about.experienceBadgeText.replace(' ', '<br>');
        }
        if (Array.isArray(data.about.bioParagraphs)) {
            const bioContainer = document.getElementById('about-bios');
            if (bioContainer) bioContainer.innerHTML = data.about.bioParagraphs.map(p => `<p class="bio-text">${p}</p>`).join('');
        }
        if (Array.isArray(data.about.skillsMini)) {
            const skillsContainer = document.getElementById('about-skills');
            if (skillsContainer) {
                skillsContainer.innerHTML = data.about.skillsMini.map(s => 
                    `<span><i class="ph ${s.icon}"></i> ${s.text}</span>`
                ).join('');
            }
        }
    }

    // C. Testimonials Section
    if (Array.isArray(data.testimonials)) {
        const grid = document.getElementById('testimonials-grid');
        if (grid) {
            grid.innerHTML = data.testimonials.map(t => `
                <div class="review-card">
                    <div class="reviewer-info">
                        <div class="flag">${t.flag}</div>
                        <div>
                            <h4>${t.name}</h4>
                            <span class="country">${t.country}</span>
                        </div>
                    </div>
                    <div class="stars">${'★'.repeat(t.stars)}</div>
                    <p>"${t.quote}"</p>
                </div>
            `).join('');
        }
    }

    // D. Education Section
    if (Array.isArray(data.education)) {
        const timeline = document.getElementById('education-timeline');
        if (timeline) {
            timeline.innerHTML = data.education.map(e => `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="date-badge">${e.period}</div>
                        <h3>${e.degree}</h3>
                        <h4>${e.institution}</h4>
                        <p>${e.description}</p>
                        ${e.status ? `<div class="status">${e.status}</div>` : ''}
                        ${e.gpa ? `<div class="gpa-box"><i class="ph ph-star-fill"></i> ${e.gpa}</div>` : ''}
                    </div>
                </div>
            `).join('');
        }
    }

    // E. CSE Projects Section
    if (Array.isArray(data.projects)) {
        const pGrid = document.getElementById('projects-grid');
        if (pGrid) {
            pGrid.innerHTML = data.projects.map(p => {
                const liveUrl = p.liveLink || (p.link && p.link !== '#' && !p.link.includes('github') && !p.link.includes('behance') && !p.link.includes('figma') ? p.link : '');
                const codeUrl = p.codeLink || (p.link && (p.link.includes('github') || p.link.includes('figma') || p.link.includes('behance') || !liveUrl) ? p.link : '');
                
                let buttonsHtml = '';
                if (liveUrl && codeUrl && liveUrl !== codeUrl && codeUrl !== '#') {
                    buttonsHtml = `
                        <a href="${liveUrl}" target="_blank" class="view-btn view-btn-live"><i class="ph ph-arrow-square-out"></i> Live Demo</a>
                        <a href="${codeUrl}" target="_blank" class="view-btn view-btn-code"><i class="ph ph-code"></i> Source Code</a>
                    `;
                } else if (liveUrl) {
                    buttonsHtml = `<a href="${liveUrl}" target="_blank" class="view-btn view-btn-live"><i class="ph ph-arrow-square-out"></i> Live Demo</a>`;
                } else {
                    buttonsHtml = `<a href="${codeUrl || '#'}" target="_blank" class="view-btn view-btn-code"><i class="ph ph-code"></i> View Code</a>`;
                }

                return `
                    <div class="project-card ${p.featured ? 'featured' : ''}">
                        ${p.featured && p.featuredBadge ? `<div class="featured-project-badge">${p.featuredBadge}</div>` : ''}
                        ${getProjectTelemetrySvg(p.title)}
                        <div class="project-img-box">
                            <img src="${p.image}" alt="${p.title}">
                            <div class="overlay">
                                <div class="overlay-actions">
                                    ${buttonsHtml}
                                </div>
                            </div>
                        </div>
                        <div class="project-info">
                            <h3>${p.title}</h3>
                            <p class="tech-stack">${p.stack}</p>
                            <p class="desc">${p.description}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // F. Design Work Marquees (Dynamic Category Rendering)
    if (data.designWork) {
        const dwContainer = document.getElementById('design-categories-container');
        if (dwContainer) {
            if (Array.isArray(data.designWork)) {
                dwContainer.innerHTML = data.designWork.map((cat, idx) => {
                    const scrollDir = idx % 2 === 0 ? 'scroll-left' : 'scroll-right';
                    const marqueeId = `dw-marquee-${idx}`;
                    return `
                        <h3 class="category-title">${cat.title || 'Design Category'}</h3>
                        <div class="marquee-container">
                            <div class="marquee-content ${scrollDir}" id="${marqueeId}"></div>
                        </div>
                    `;
                }).join('');

                data.designWork.forEach((cat, idx) => {
                    const marqueeId = `dw-marquee-${idx}`;
                    const imgClass = cat.imageType || 'marquee-img';
                    const customHeight = cat.cardHeight || cat.height || null;
                    renderMarquee(marqueeId, cat.images || [], imgClass, customHeight);
                });
            } else {
                dwContainer.innerHTML = `
                    <h3 class="category-title">Thumbnail Designs <span class="count">(High CTR)</span></h3>
                    <div class="marquee-container"><div class="marquee-content scroll-left" id="thumb-marquee-1"></div></div>
                    <div class="marquee-container"><div class="marquee-content scroll-right" id="thumb-marquee-2"></div></div>
                    <h3 class="category-title">Facebook Cover Design</h3>
                    <div class="marquee-container"><div class="marquee-content scroll-left slow" id="fb-marquee"></div></div>
                    <h3 class="category-title">YouTube Channel Art</h3>
                    <div class="marquee-container"><div class="marquee-content scroll-right slow" id="yt-marquee"></div></div>
                    <h3 class="category-title">Poster Design</h3>
                    <div class="marquee-container"><div class="marquee-content scroll-left" id="poster-marquee"></div></div>
                `;
                renderMarquee('thumb-marquee-1', data.designWork.thumbnailsRow1, 'thumb-img');
                renderMarquee('thumb-marquee-2', data.designWork.thumbnailsRow2, 'thumb-img');
                renderMarquee('fb-marquee', data.designWork.facebookCovers, 'cover-img');
                renderMarquee('yt-marquee', data.designWork.youtubeArt, 'banner-img');
                renderMarquee('poster-marquee', data.designWork.posters, 'poster-img');
            }
        }
    }

    // G. Experience Section Cards
    if (Array.isArray(data.experience)) {
        const expCards = document.getElementById('experience-cards');
        if (expCards) {
            expCards.innerHTML = data.experience.map((exp, idx) => `
                <div class="exp-card ${idx % 2 === 1 ? 'reverse' : ''}">
                    <div class="exp-content">
                        <span class="date-badge-outline">${exp.period}</span>
                        <h2>${exp.role}</h2>
                        ${exp.rating ? `<div class="rating-box"><i class="ph ph-star-fill"></i> ${exp.rating}</div>` : ''}
                        <p>${exp.description}</p>
                        ${exp.clients ? `<ul class="client-list">${exp.clients.map(c => `<li><i class="ph ph-check-circle"></i> ${c}</li>`).join('')}</ul>` : ''}
                        ${exp.tags ? `<div class="gig-tags">${exp.tags.map(t => `<span>${t}</span>`).join('')}</div>` : ''}
                        <a href="${exp.link || exp.btnLink || '#'}" target="_blank" class="${exp.isFiverr || (exp.role && exp.role.includes('Fiverr')) ? 'btn-fiverr' : 'btn-primary'}">
                            ${exp.btnText} ${exp.isFiverr || (exp.role && exp.role.includes('Fiverr')) ? '<i class="ph ph-arrow-up-right"></i>' : '<i class="ph ph-code"></i>'}
                        </a>
                    </div>
                    <div class="exp-image">
                        <img src="${exp.image}" alt="${exp.role}">
                    </div>
                </div>
            `).join('');
        }
    }

    // H. Stats Row
    if (data.stats) {
        const statsRow = document.getElementById('stats-row');
        if (statsRow) {
            statsRow.innerHTML = `
                <div class="stat-item"><h3>${data.stats.projectsCompleted}</h3><p>Projects Completed</p></div>
                <div class="stat-item"><h3>${data.stats.satisfiedClients}</h3><p>Satisfied Clients</p></div>
                <div class="stat-item"><h3>${data.stats.socialAudience}</h3><p>Social Media Audience</p></div>
            `;
        }
    }

    // I. Course Promo
    if (data.coursePromo) {
        const courseWrapper = document.getElementById('course-wrapper');
        if (courseWrapper) {
            courseWrapper.innerHTML = `
                <div class="course-text">
                    <h2>${data.coursePromo.title}</h2>
                    <p>${data.coursePromo.description}</p>
                    <a href="${data.coursePromo.enrollLink}" target="_blank" class="btn-primary">Enroll Now <i class="ph ph-student"></i></a>
                </div>
                <div class="course-image">
                    <img src="${data.coursePromo.image}" alt="Course Bundle">
                </div>
            `;
        }
    }

    // J. Brands Marquee (Smooth Infinite Loop)
    if (Array.isArray(data.brands) && data.brands.length > 0) {
        renderMarquee('brands-marquee', data.brands, 'brand-avatar-img', 110);
    }

    // K. Why Choose Me
    if (Array.isArray(data.whyChooseMe)) {
        const whyGrid = document.getElementById('why-choose-grid');
        if (whyGrid) {
            whyGrid.innerHTML = data.whyChooseMe.map(w => `
                <div class="feature-card">
                    <i class="ph ${w.icon} icon-lg"></i>
                    <h3>${w.title}</h3>
                    <p>${w.description}</p>
                </div>
            `).join('');
        }
    }

    // L. Services
    if (Array.isArray(data.services)) {
        const servicesGrid = document.getElementById('services-grid');
        if (servicesGrid) {
            servicesGrid.innerHTML = data.services.map(s => `
                <div class="service-card">
                    <h3>${s.title}</h3>
                    <ul>
                        ${s.items.map(i => `<li><i class="ph ph-check"></i> ${i}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }
    }

    // M. Certificates
    if (Array.isArray(data.certificates)) {
        const certGrid = document.getElementById('cert-grid');
        if (certGrid) {
            certGrid.innerHTML = data.certificates.map(c => `
                <div class="cert-card">
                    <div class="cert-img-box">
                        <img src="${c.image}" alt="${c.title}">
                    </div>
                    <div class="cert-info">
                        <h3>${c.title}</h3>
                        <p class="issuer">${c.issuer}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    // N. Contact Info Cards (With One-Click Copy Buttons)
    if (data.contact) {
        const contactCards = document.getElementById('contact-info-cards');
        if (contactCards) {
            contactCards.innerHTML = `
                <div class="info-card">
                    <div class="icon-box"><i class="ph ph-phone-call"></i></div>
                    <div class="info-text"><h3>Phone Number</h3><p>${data.contact.phone}</p></div>
                    <button class="copy-btn" onclick="copyToClipboard('${data.contact.phone}', 'Phone')"><i class="ph ph-copy"></i> Copy</button>
                </div>
                <div class="info-card">
                    <div class="icon-box"><i class="ph ph-whatsapp-logo"></i></div>
                    <div class="info-text"><h3>WhatsApp</h3><p>${data.contact.whatsapp}</p></div>
                    <button class="copy-btn" onclick="copyToClipboard('${data.contact.whatsapp}', 'WhatsApp')"><i class="ph ph-copy"></i> Copy</button>
                </div>
                <div class="info-card">
                    <div class="icon-box"><i class="ph ph-envelope-simple"></i></div>
                    <div class="info-text"><h3>Email Address</h3><p>${data.contact.email}</p></div>
                    <button class="copy-btn" onclick="copyToClipboard('${data.contact.email}', 'Email')"><i class="ph ph-copy"></i> Copy</button>
                </div>
                <div class="info-card">
                    <div class="icon-box"><i class="ph ph-map-pin"></i></div>
                    <div class="info-text"><h3>Current Address</h3><p>${data.contact.currentAddress}</p></div>
                </div>
                <div class="info-card">
                    <div class="icon-box"><i class="ph ph-house-line"></i></div>
                    <div class="info-text"><h3>Permanent Address</h3><p>${data.contact.permanentAddress}</p></div>
                </div>
            `;
        }
    }
}

// Interactive Mode Switcher (All / Developer Mode / Designer Mode)
function initViewSwitcher() {
    const pills = document.querySelectorAll('.mode-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const mode = pill.getAttribute('data-mode');
            document.body.classList.remove('mode-dev', 'mode-design');
            if (mode === 'dev') {
                document.body.classList.add('mode-dev');
                showToast('Switched to Developer Mode 💻');
            } else if (mode === 'design') {
                document.body.classList.add('mode-design');
                showToast('Switched to Graphic Designer Mode 🎨');
            } else {
                showToast('Switched to All Views ⚡');
            }
        });
    });
}

// Lightbox Preview Modal for Design Gallery & Showcase
function initLightboxModal() {
    const modal = document.getElementById('lightbox-modal');
    const backdrop = document.getElementById('lightbox-backdrop');
    const closeBtn = document.getElementById('lightbox-close');
    const imgEl = document.getElementById('lightbox-img');
    const titleEl = document.getElementById('lightbox-title');
    const directLinkEl = document.getElementById('lightbox-direct-link');

    if (!modal) return;

    function closeModal() {
        modal.style.display = 'none';
    }

    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Event Delegation: Clicking any marquee image opens full-res Lightbox modal
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName === 'IMG' && target.closest('.marquee-content')) {
            const src = target.getAttribute('src');
            if (!src) return;
            imgEl.src = src;
            directLinkEl.href = src;
            titleEl.textContent = 'Design Artwork Showcase';
            modal.style.display = 'flex';
        }
    });
}

// One-Click Copy to Clipboard Handler
function copyToClipboard(text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Copied ${label || 'text'} to clipboard! 📋`);
        }).catch(() => {
            fallbackCopy(text, label);
        });
    } else {
        fallbackCopy(text, label);
    }
}

function fallbackCopy(text, label) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(`Copied ${label || 'text'} to clipboard! 📋`);
}

function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    toast.style.display = 'block';
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 2500);
}

// Helper: Render marquee with 100% mathematical symmetry and equal scroll velocity
function renderMarquee(elementId, imagesArray, imgClass, customHeight) {
    const el = document.getElementById(elementId);
    if (!el || !Array.isArray(imagesArray) || imagesArray.length === 0) return;
    
    // Always use even multipliers (2, 4, 6...) so first half === second half exactly
    let unit = [...imagesArray];
    let count = 2;
    while (unit.length * count < 24) {
        count += 2;
    }
    
    let duplicated = [];
    for (let i = 0; i < count; i++) {
        duplicated = duplicated.concat(unit);
    }
    
    // Constant linear scroll velocity (~75px / sec) across all categories
    const heightVal = customHeight || 220;
    const estWidth = heightVal * 1.5;
    const halfTrackWidth = (duplicated.length / 2) * (estWidth + 20);
    const constantDuration = Math.max(25, Math.round(halfTrackWidth / 75));
    
    el.style.animationDuration = `${constantDuration}s`;
    
    const heightStyle = customHeight ? `height:${customHeight}px;` : '';
    const styleAttr = `style="${heightStyle} width:auto; object-fit:contain; cursor:pointer; margin-right:20px; flex-shrink:0;"`;
    el.innerHTML = duplicated.map(src => `<img src="${src}" class="${imgClass || 'marquee-img'}" ${styleAttr}>`).join('');
}

// Helper: set text content safely
function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
}

// Telemetry SVG Generator for Project Cards
function getProjectTelemetrySvg(title) {
    const t = (title || '').toLowerCase();
    if (t.includes('niramoy') || t.includes('health') || t.includes('telemedicine')) {
        return `<svg class="card-telemetry-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path d="M0,50 L100,50 L110,20 L125,80 L140,10 L155,90 L170,50 L400,50" fill="none" stroke="#6366F1" stroke-width="2" stroke-dasharray="400" stroke-dashoffset="400" class="ecg-pulse-anim"/>
        </svg>`;
    } else if (t.includes('bus') || t.includes('track') || t.includes('buskoi')) {
        return `<svg class="card-telemetry-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path d="M10,50 Q100,10 200,50 T390,50" fill="none" stroke="#F97316" stroke-width="2" stroke-dasharray="6,6"/>
            <circle cx="10" cy="50" r="4" fill="#F97316"><animate attributeName="cx" values="10;390;10" dur="7s" repeatCount="indefinite"/></circle>
        </svg>`;
    } else if (t.includes('budget') || t.includes('utshob') || t.includes('event')) {
        return `<svg class="card-telemetry-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
            <rect x="50" y="40" width="14" height="40" fill="#6366F1" opacity="0.35"><animate attributeName="height" values="40;20;50;40" dur="4s" repeatCount="indefinite"/></rect>
            <rect x="80" y="20" width="14" height="60" fill="#F97316" opacity="0.35"><animate attributeName="height" values="60;40;70;60" dur="5s" repeatCount="indefinite"/></rect>
            <rect x="110" y="50" width="14" height="30" fill="#6366F1" opacity="0.35"><animate attributeName="height" values="30;60;25;30" dur="3.5s" repeatCount="indefinite"/></rect>
        </svg>`;
    }
    return `<svg class="card-telemetry-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
        <line x1="0" y1="50" x2="400" y2="50" stroke="#06B6D4" stroke-width="1" stroke-dasharray="4,4" opacity="0.3"/>
    </svg>`;
}

// 3D Card Interactive Magnetic Outward Tilt (Cursor attracts card edge outward)
function init3DCardTilt() {
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.project-card, .feature-card, .service-card, .cert-card, .exp-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                // 100% Magnetic 3D Attraction on ALL 4 AXES (UP, DOWN, LEFT, RIGHT pull outward toward cursor)
                const rotateX = ((y - centerY) / centerY) * 8;
                const rotateY = ((centerX - x) / centerX) * 8;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.03)`;
                card.style.transition = 'transform 0.1s ease-out';
            } else {
                card.style.transform = '';
                card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            }
        });
    });
}

// Automatic Direct Email Dispatcher to mohsin.diu.cse@gmail.com
function initContactForm() {
    const form = document.getElementById('public-contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';
        
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const subject = document.getElementById('contact-subject').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending Message... <i class="ph ph-spinner spin"></i>';
        }

        // Store message locally for Admin Control Panel Inbox
        try {
            const newMsg = {
                id: 'msg_' + Date.now(),
                name: name,
                email: email,
                subject: subject,
                message: message,
                date: new Date().toLocaleString()
            };
            const existingMsgs = JSON.parse(localStorage.getItem('mohsin_portfolio_messages') || '[]');
            existingMsgs.unshift(newMsg);
            localStorage.setItem('mohsin_portfolio_messages', JSON.stringify(existingMsgs));
        } catch(e) {}

        // Send direct email via FormSubmit API to mohsin.diu.cse@gmail.com
        fetch('https://formsubmit.co/ajax/mohsin.diu.cse@gmail.com', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                _replyto: email,
                _subject: `[Portfolio Inquiry] ${subject}`,
                message: message
            })
        })
        .then(res => res.json())
        .then(data => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
            showToast('Message sent successfully! Saved to Admin Inbox.', 'success');
            form.reset();
        })
        .catch(err => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
            // Fallback: Open Mailto app directly
            const mailtoUrl = `mailto:mohsin.diu.cse@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message)}`;
            window.location.href = mailtoUrl;
            showToast('Opening mail app... Message also saved to Admin Inbox!', 'success');
            form.reset();
        });
    });
}