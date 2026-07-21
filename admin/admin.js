// admin.js - Dynamic Admin Control Panel Logic

let localContent = {};

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initEventListeners();
});

// 1. Auth Status Verification (Hybrid Support for Node.js Server & Static mohsinatic.com)
function checkAuthStatus() {
    if (sessionStorage.getItem('mohsin_admin_auth') === 'true') {
        showDashboard();
        return;
    }

    fetch('/api/status')
        .then(res => {
            if (!res.ok) throw new Error('Static host');
            return res.json();
        })
        .then(data => {
            if (data.authenticated) {
                sessionStorage.setItem('mohsin_admin_auth', 'true');
                showDashboard();
            } else {
                showLogin();
            }
        })
        .catch(() => showLogin());
}

function showLogin() {
    document.getElementById('login-view').style.display = 'block';
    document.getElementById('dashboard-view').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'block';
    loadContent();
}

function initEventListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passwordInput = document.getElementById('admin-password');
            const password = passwordInput ? passwordInput.value.trim() : '';

            // Attempt Node API Login first
            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })
            .then(res => {
                if (!res.ok && res.status !== 401) throw new Error('Static host or network error');
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    sessionStorage.setItem('mohsin_admin_auth', 'true');
                    showToast('Login successful! Welcome to Admin Panel.', 'success');
                    showDashboard();
                } else if (password === 'admin123') {
                    sessionStorage.setItem('mohsin_admin_auth', 'true');
                    showToast('Login successful!', 'success');
                    showDashboard();
                } else {
                    showToast(data.error || 'Invalid password.', 'error');
                }
            })
            .catch(() => {
                // Static host fallback (e.g. mohsinatic.com)
                if (password === 'admin123') {
                    sessionStorage.setItem('mohsin_admin_auth', 'true');
                    showToast('Login successful! Welcome Admin.', 'success');
                    showDashboard();
                } else {
                    showToast('Invalid password. Please try admin123', 'error');
                }
            });
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('mohsin_admin_auth');
            fetch('/api/logout', { method: 'POST' }).catch(() => {});
            showToast('Logged out successfully.', 'success');
            showLogin();
        });
    }

    const saveAllBtn = document.getElementById('save-all-btn');
    if (saveAllBtn) {
        saveAllBtn.addEventListener('click', saveAllSections);
    }
}

// 2. Fetch Content from API or Static content.json
function loadContent() {
    fetch('/api/content')
        .then(res => {
            if (!res.ok) throw new Error('Static host');
            return res.json();
        })
        .then(data => {
            localContent = data;
            renderFormSections(data);
        })
        .catch(() => {
            // Fallback for static web hosts (e.g. mohsinatic.com)
            fetch('../content.json')
                .then(res => res.json())
                .then(data => {
                    localContent = data;
                    renderFormSections(data);
                })
                .catch(() => showToast('Failed to fetch site content.', 'error'));
        });
}

// 3. Render Form Accordion Sections
function renderFormSections(data) {
    const container = document.getElementById('sections-container');
    container.innerHTML = '';

    const sections = [
        { key: 'hero', title: 'Hero Section' },
        { key: 'about', title: 'About Section' },
        { key: 'testimonials', title: 'Testimonials / Client Feedback' },
        { key: 'education', title: 'Education Timeline' },
        { key: 'projects', title: 'CSE Software Projects' },
        { key: 'designWork', title: 'Design Work Galleries' },
        { key: 'experience', title: 'Work Experience' },
        { key: 'stats', title: 'Key Statistics' },
        { key: 'coursePromo', title: 'Course Banner' },
        { key: 'certificates', title: 'Certificates & Awards' },
        { key: 'whyChooseMe', title: 'Why Choose Me' },
        { key: 'services', title: 'Services List' },
        { key: 'contact', title: 'Contact Information' }
    ];

    sections.forEach(sec => {
        const secData = data[sec.key];
        const card = document.createElement('div');
        card.className = 'accordion-section';

        card.innerHTML = `
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <span>${sec.title}</span>
                <div>
                    <button type="button" class="btn btn-secondary" onclick="event.stopPropagation(); saveSection('${sec.key}')">
                        <i class="ph ph-floppy-disk"></i> Save Section
                    </button>
                    <i class="ph ph-caret-down" style="margin-left: 10px;"></i>
                </div>
            </div>
            <div class="accordion-body" id="body-${sec.key}">
                ${renderSectionBody(sec.key, secData)}
            </div>
        `;

        container.appendChild(card);
    });
}

function toggleAccordion(headerEl) {
    const body = headerEl.nextElementSibling;
    body.classList.toggle('open');
}

// 4. Render Section Form Bodies
function renderSectionBody(key, secData) {
    if (!secData) return '<p>No data configured.</p>';

    if (key === 'hero') {
        return `
            <div class="form-group"><label>Badge Text</label><input type="text" id="hero-badge" value="${escapeHtml(secData.badge || '')}"></div>
            <div class="form-group"><label>Headline HTML</label><textarea id="hero-headline" rows="2">${escapeHtml(secData.headline || '')}</textarea></div>
            <div class="form-group"><label>Subtitle</label><textarea id="hero-subtitle" rows="2">${escapeHtml(secData.subtitle || '')}</textarea></div>
            <div class="form-group"><label>Dev CTA Button Text</label><input type="text" id="hero-devText" value="${escapeHtml(secData.exploreDevText || '')}"></div>
            <div class="form-group"><label>Design CTA Button Text</label><input type="text" id="hero-designText" value="${escapeHtml(secData.exploreDesignText || '')}"></div>
        `;
    }

    if (key === 'about') {
        return `
            <div class="form-group"><label>Section Title</label><input type="text" id="about-secTitle" value="${escapeHtml(secData.sectionTitle || '')}"></div>
            <div class="form-group"><label>Role Title HTML</label><textarea id="about-roleTitle" rows="2">${escapeHtml(secData.roleTitle || '')}</textarea></div>
            ${createImageUploader('about-profileImg', secData.profileImg, 'Profile Image')}
            <div class="form-group"><label>Experience Badge Number</label><input type="text" id="about-expNum" value="${escapeHtml(secData.experienceBadgeNumber || '')}"></div>
            <div class="form-group"><label>Experience Badge Text</label><input type="text" id="about-expText" value="${escapeHtml(secData.experienceBadgeText || '')}"></div>
            <div class="form-group"><label>Bio Paragraphs (One per line)</label><textarea id="about-bios" rows="6">${(secData.bioParagraphs || []).join('\n')}</textarea></div>
        `;
    }

    if (key === 'stats') {
        return `
            <div class="form-group"><label>Projects Completed</label><input type="text" id="stats-projects" value="${escapeHtml(secData.projectsCompleted || '')}"></div>
            <div class="form-group"><label>Satisfied Clients</label><input type="text" id="stats-clients" value="${escapeHtml(secData.satisfiedClients || '')}"></div>
            <div class="form-group"><label>Social Audience</label><input type="text" id="stats-social" value="${escapeHtml(secData.socialAudience || '')}"></div>
        `;
    }

    if (key === 'coursePromo') {
        return `
            <div class="form-group"><label>Course Title</label><input type="text" id="course-title" value="${escapeHtml(secData.title || '')}"></div>
            <div class="form-group"><label>Description</label><textarea id="course-desc" rows="3">${escapeHtml(secData.description || '')}</textarea></div>
            <div class="form-group"><label>Enrollment Link</label><input type="text" id="course-link" value="${escapeHtml(secData.enrollLink || '')}"></div>
            ${createImageUploader('course-image', secData.image, 'Course Graphic')}
        `;
    }

    if (key === 'contact') {
        return `
            <div class="form-group"><label>Phone</label><input type="text" id="contact-phone" value="${escapeHtml(secData.phone || '')}"></div>
            <div class="form-group"><label>WhatsApp Number</label><input type="text" id="contact-wa" value="${escapeHtml(secData.whatsapp || '')}"></div>
            <div class="form-group"><label>Email Address</label><input type="email" id="contact-email" value="${escapeHtml(secData.email || '')}"></div>
            <div class="form-group"><label>Current Address</label><input type="text" id="contact-currAdd" value="${escapeHtml(secData.currentAddress || '')}"></div>
            <div class="form-group"><label>Permanent Address</label><input type="text" id="contact-permAdd" value="${escapeHtml(secData.permanentAddress || '')}"></div>
            <div class="form-group"><label>Facebook URL</label><input type="text" id="contact-fb" value="${escapeHtml(secData.socials?.facebook || '')}"></div>
            <div class="form-group"><label>LinkedIn URL</label><input type="text" id="contact-li" value="${escapeHtml(secData.socials?.linkedin || '')}"></div>
            <div class="form-group"><label>Behance URL</label><input type="text" id="contact-be" value="${escapeHtml(secData.socials?.behance || '')}"></div>
            <div class="form-group"><label>YouTube URL</label><input type="text" id="contact-yt" value="${escapeHtml(secData.socials?.youtube || '')}"></div>
        `;
    }

    if (key === 'testimonials') {
        return renderArraySection(key, secData, (t, i) => `
            <div class="form-group"><label>Name</label><input type="text" data-field="name" value="${escapeHtml(t.name || '')}"></div>
            <div class="form-group"><label>Country</label><input type="text" data-field="country" value="${escapeHtml(t.country || '')}"></div>
            <div class="form-group"><label>Flag Emoji</label><input type="text" data-field="flag" value="${escapeHtml(t.flag || '')}"></div>
            <div class="form-group"><label>Stars Rating (1-5)</label><input type="number" min="1" max="5" data-field="stars" value="${t.stars || 5}"></div>
            <div class="form-group"><label>Quote</label><textarea data-field="quote" rows="2">${escapeHtml(t.quote || '')}</textarea></div>
        `);
    }

    if (key === 'education') {
        return renderArraySection(key, secData, (e, i) => `
            <div class="form-group"><label>Degree Title</label><input type="text" data-field="degree" value="${escapeHtml(e.degree || '')}"></div>
            <div class="form-group"><label>Institution</label><input type="text" data-field="institution" value="${escapeHtml(e.institution || '')}"></div>
            <div class="form-group"><label>Period</label><input type="text" data-field="period" value="${escapeHtml(e.period || '')}"></div>
            <div class="form-group"><label>Description</label><textarea data-field="description" rows="2">${escapeHtml(e.description || '')}</textarea></div>
            <div class="form-group"><label>Status (Optional)</label><input type="text" data-field="status" value="${escapeHtml(e.status || '')}"></div>
            <div class="form-group"><label>GPA (Optional)</label><input type="text" data-field="gpa" value="${escapeHtml(e.gpa || '')}"></div>
        `);
    }

    if (key === 'projects') {
        return renderArraySection(key, secData, (p, i) => `
            <div class="form-group"><label>Project Title</label><input type="text" data-field="title" value="${escapeHtml(p.title || '')}"></div>
            <div class="form-group"><label>Tech Stack</label><input type="text" data-field="stack" value="${escapeHtml(p.stack || '')}"></div>
            <div class="form-group"><label>Description</label><textarea data-field="description" rows="2">${escapeHtml(p.description || '')}</textarea></div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                <div class="form-group"><label>Live Demo / Web App Link (Optional)</label><input type="text" data-field="liveLink" value="${escapeHtml(p.liveLink || (p.link && !p.link.includes('github') && !p.link.includes('figma') && !p.link.includes('behance') ? p.link : ''))}" placeholder="https://mizan.mohsinatic.com/"></div>
                <div class="form-group"><label>Source Code / GitHub / Figma Link (Optional)</label><input type="text" data-field="codeLink" value="${escapeHtml(p.codeLink || (p.link && (p.link.includes('github') || p.link.includes('figma') || p.link.includes('behance')) ? p.link : ''))}" placeholder="https://github.com/..."></div>
            </div>
            ${createImageUploader(`projects-img-${i}`, p.image, 'Project Thumbnail')}
            <div class="form-group" style="display:flex; gap:10px; align-items:center; margin-top:10px;">
                <input type="checkbox" id="p-feat-${i}" data-field="featured" ${p.featured ? 'checked' : ''}>
                <label for="p-feat-${i}" style="margin:0;">Featured Project (Highlighted Card)</label>
            </div>
            <div class="form-group"><label>Featured Badge Text</label><input type="text" data-field="featuredBadge" value="${escapeHtml(p.featuredBadge || 'Featured Innovation')}"></div>
        `);
    }

    if (key === 'certificates') {
        return renderArraySection(key, secData, (c, i) => `
            <div class="form-group"><label>Certificate Title</label><input type="text" data-field="title" value="${escapeHtml(c.title || '')}"></div>
            <div class="form-group"><label>Issuer & Date</label><input type="text" data-field="issuer" value="${escapeHtml(c.issuer || '')}"></div>
            ${createImageUploader(`cert-img-${i}`, c.image, 'Certificate Image')}
        `);
    }

    if (key === 'experience') {
        return renderArraySection(key, secData, (exp, i) => `
            <div class="form-group"><label>Role / Position Title</label><input type="text" data-field="role" value="${escapeHtml(exp.role || '')}"></div>
            <div class="form-group"><label>Period / Status</label><input type="text" data-field="period" value="${escapeHtml(exp.period || '')}"></div>
            <div class="form-group"><label>Rating (Optional)</label><input type="text" data-field="rating" value="${escapeHtml(exp.rating || '')}"></div>
            <div class="form-group"><label>Description HTML</label><textarea data-field="description" rows="3">${escapeHtml(exp.description || '')}</textarea></div>
            <div class="form-group"><label>Clients List (One per line)</label><textarea data-field="clients" rows="3">${(exp.clients || []).join('\n')}</textarea></div>
            <div class="form-group"><label>Gigs Tags (Comma separated)</label><input type="text" data-field="gigs" value="${(exp.gigs || []).join(', ')}"></div>
            <div class="form-group"><label>Button Text</label><input type="text" data-field="btnText" value="${escapeHtml(exp.btnText || '')}"></div>
            <div class="form-group"><label>Button Link</label><input type="text" data-field="btnLink" value="${escapeHtml(exp.btnLink || '')}"></div>
            ${createImageUploader(`exp-img-${i}`, exp.image, 'Experience Feature Image')}
        `);
    }

    if (key === 'designWork') {
        let categories = [];
        if (Array.isArray(secData)) {
            categories = secData;
        } else if (secData && typeof secData === 'object') {
            categories = [
                { id: 'dw_1', title: 'Thumbnail Designs (Row 1 - Left)', imageType: 'thumb-img', images: secData.thumbnailsRow1 || [] },
                { id: 'dw_2', title: 'Thumbnail Designs (Row 2 - Right)', imageType: 'thumb-img', images: secData.thumbnailsRow2 || [] },
                { id: 'dw_3', title: 'Facebook Cover Design', imageType: 'cover-img', images: secData.facebookCovers || [] },
                { id: 'dw_4', title: 'YouTube Channel Art', imageType: 'banner-img', images: secData.youtubeArt || [] },
                { id: 'dw_5', title: 'Poster Design', imageType: 'poster-img', images: secData.posters || [] }
            ];
        }

        const blocksHtml = categories.map((cat, catIdx) => {
            const images = cat.images || [];
            const galleryHtml = images.map((imgUrl, imgIdx) => `
                <div class="design-thumb-card">
                    <img src="/${escapeHtml(imgUrl)}" onerror="this.src='https://via.placeholder.com/120x80?text=No+Img'">
                    <div class="design-thumb-info">
                        <span class="path" title="${escapeHtml(imgUrl)}">${escapeHtml(imgUrl)}</span>
                        <button type="button" class="btn btn-danger btn-sm" onclick="removeDesignCategoryItem(${catIdx}, ${imgIdx})">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            return `
                <div class="design-category-block" style="position:relative;">
                    <div style="position:absolute; top:16px; right:16px; display:flex; gap:6px;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="moveDesignCategory(${catIdx}, -1)" ${catIdx === 0 ? 'disabled' : ''} title="Move Up"><i class="ph ph-arrow-up"></i></button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="moveDesignCategory(${catIdx}, 1)" ${catIdx === categories.length - 1 ? 'disabled' : ''} title="Move Down"><i class="ph ph-arrow-down"></i></button>
                        <button type="button" class="btn btn-danger btn-sm" onclick="removeDesignCategory(${catIdx})" title="Remove Category"><i class="ph ph-trash"></i> Remove</button>
                    </div>
                    <div class="form-group" style="max-width:65%;">
                        <label>Category Title / Headline</label>
                        <input type="text" data-field="title" value="${escapeHtml(cat.title || '')}" placeholder="e.g. Logo & Branding Designs...">
                    </div>
                    <div class="form-group" style="max-width:360px;">
                        <label>Row Display Height (px) — Auto-Fits Natural Image Ratio</label>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <input type="number" min="100" max="800" data-field="cardHeight" value="${cat.cardHeight || cat.height || 220}" placeholder="220" style="width:130px;">
                            <span style="font-size:0.85rem; color:var(--text-muted);">px height</span>
                        </div>
                        <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-top:4px;">
                            All uploaded images (wide, tall, square) automatically preserve 100% of their natural aspect ratio without distortion.
                        </span>
                    </div>
                    
                    <label style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Category Images Gallery</label>
                    <div class="design-thumb-grid">
                        ${galleryHtml || '<p style="font-size:0.85rem; color:var(--text-muted); grid-column:1/-1;">No images in this category yet. Upload below!</p>'}
                    </div>

                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
                        <label class="btn btn-secondary" style="cursor: pointer;">
                            <i class="ph ph-upload-simple"></i> Upload Image(s)
                            <input type="file" accept="image/jpeg,image/png,image/webp" multiple style="display:none;" onchange="uploadDesignCategoryImages(this, ${catIdx})">
                        </label>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Select multiple PNG, JPG, or WebP files to upload</span>
                    </div>

                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-size:0.75rem;">Manual Image URLs (One per line)</label>
                        <textarea data-field="images" rows="3">${images.join('\n')}</textarea>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div id="design-categories-list">${blocksHtml}</div>
            <button type="button" class="btn btn-secondary" onclick="addDesignCategory()"><i class="ph ph-plus"></i> Add New Design Category</button>
        `;
    }

    if (key === 'whyChooseMe') {
        return renderArraySection(key, secData, (item, i) => `
            <div class="form-group"><label>Icon (Phosphor class e.g. ph-rocket-launch)</label><input type="text" data-field="icon" value="${escapeHtml(item.icon || '')}"></div>
            <div class="form-group"><label>Title</label><input type="text" data-field="title" value="${escapeHtml(item.title || '')}"></div>
            <div class="form-group"><label>Description</label><textarea data-field="description" rows="2">${escapeHtml(item.description || '')}</textarea></div>
        `);
    }

    if (key === 'services') {
        return renderArraySection(key, secData, (serv, i) => `
            <div class="form-group"><label>Service Title</label><input type="text" data-field="title" value="${escapeHtml(serv.title || '')}"></div>
            <div class="form-group"><label>Service Bullet Items (One per line)</label><textarea data-field="items" rows="3">${(serv.items || []).join('\n')}</textarea></div>
        `);
    }

    return '<p>Dynamic section form renderer ready.</p>';
}

// Helper: Image Uploader with Instant Upload + Preview
function createImageUploader(id, currentUrl, labelText) {
    return `
        <div class="form-group">
            <label>${labelText}</label>
            <input type="hidden" id="${id}" value="${escapeHtml(currentUrl || '')}">
            <div class="image-preview-wrapper">
                <img src="/${currentUrl || 'images/Mohsin.jpg'}" id="preview-${id}" class="image-preview-thumb" onerror="this.src='https://via.placeholder.com/80x60?text=No+Img'">
                <input type="file" accept="image/jpeg,image/png,image/webp" onchange="uploadFile(this, '${id}', 'preview-${id}')">
            </div>
        </div>
    `;
}

// Helper: Array Section Renderer with Add/Remove/Move Position Buttons
function renderArraySection(secKey, arr, renderItemFn) {
    if (!Array.isArray(arr)) arr = [];
    const cards = arr.map((item, idx) => `
        <div class="array-card" data-index="${idx}" style="position:relative;">
            <div style="position:absolute; top:12px; right:12px; display:flex; gap:6px; z-index:5;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="moveArrayItem('${secKey}', ${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="Move Up"><i class="ph ph-arrow-up"></i> Move Up</button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="moveArrayItem('${secKey}', ${idx}, 1)" ${idx === arr.length - 1 ? 'disabled' : ''} title="Move Down"><i class="ph ph-arrow-down"></i> Move Down</button>
                <button type="button" class="btn btn-danger btn-sm" onclick="removeArrayItem('${secKey}', ${idx})" title="Remove Item"><i class="ph ph-trash"></i> Remove</button>
            </div>
            ${renderItemFn(item, idx)}
        </div>
    `).join('');

    return `
        <div id="array-list-${secKey}">${cards}</div>
        <button type="button" class="btn btn-secondary" onclick="addArrayItem('${secKey}')"><i class="ph ph-plus"></i> Add Item</button>
    `;
}

function moveArrayItem(secKey, idx, direction) {
    localContent[secKey] = collectSectionData(secKey);
    const arr = localContent[secKey];
    if (!Array.isArray(arr)) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= arr.length) return;

    const item = arr.splice(idx, 1)[0];
    arr.splice(targetIdx, 0, item);

    renderFormSections(localContent);
    const body = document.getElementById(`body-${secKey}`);
    if (body) body.classList.add('open');
}

function addArrayItem(secKey) {
    localContent[secKey] = collectSectionData(secKey);
    if (!Array.isArray(localContent[secKey])) localContent[secKey] = [];
    localContent[secKey].push({});
    renderFormSections(localContent);
    const body = document.getElementById(`body-${secKey}`);
    if (body) body.classList.add('open');
}

function removeArrayItem(secKey, idx) {
    localContent[secKey] = collectSectionData(secKey);
    if (Array.isArray(localContent[secKey])) {
        localContent[secKey].splice(idx, 1);
        renderFormSections(localContent);
        const body = document.getElementById(`body-${secKey}`);
        if (body) body.classList.add('open');
    }
}

// 5. Image File Upload Handler
function uploadFile(fileInput, hiddenId, previewImgId) {
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.filePath) {
            document.getElementById(hiddenId).value = data.filePath;
            document.getElementById(previewImgId).src = '/' + data.filePath;
            showToast('Image uploaded successfully!', 'success');
        } else {
            showToast(data.error || 'Upload failed.', 'error');
        }
    })
    .catch(() => showToast('Image upload failed.', 'error'));
}

function uploadDesignCategoryImages(fileInput, catIdx) {
    const files = Array.from(fileInput.files);
    if (!files.length) return;

    if (!Array.isArray(localContent.designWork)) localContent.designWork = [];
    if (!localContent.designWork[catIdx]) return;
    if (!Array.isArray(localContent.designWork[catIdx].images)) localContent.designWork[catIdx].images = [];

    let completed = 0;
    const errors = [];
    showToast(`Uploading ${files.length} design image(s)...`, 'info');

    files.forEach(file => {
        const formData = new FormData();
        formData.append('image', file);

        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            completed++;
            if (data.success && data.filePath) {
                localContent.designWork[catIdx].images.push(data.filePath);
            } else {
                errors.push(data.error || 'Upload failed');
            }

            if (completed === files.length) {
                renderFormSections(localContent);
                const body = document.getElementById('body-designWork');
                if (body) body.classList.add('open');

                if (errors.length) {
                    showToast(`Uploaded with errors: ${errors.join(', ')}`, 'error');
                } else {
                    showToast(`${files.length} image(s) uploaded successfully! Save changes to persist.`, 'success');
                }
            }
        })
        .catch(() => {
            completed++;
            errors.push('Network error');
            if (completed === files.length) {
                renderFormSections(localContent);
                const body = document.getElementById('body-designWork');
                if (body) body.classList.add('open');
                showToast('Upload finished with network errors.', 'error');
            }
        });
    });
}

function addDesignCategory() {
    if (!Array.isArray(localContent.designWork)) {
        localContent.designWork = [];
    }
    localContent.designWork.push({
        id: 'dw_' + Date.now(),
        title: 'New Design Category',
        imageType: 'thumb-img',
        images: []
    });
    renderFormSections(localContent);
    const body = document.getElementById('body-designWork');
    if (body) body.classList.add('open');
}

function moveDesignCategory(catIdx, direction) {
    localContent.designWork = collectSectionData('designWork');
    const targetIdx = catIdx + direction;
    if (targetIdx < 0 || targetIdx >= localContent.designWork.length) return;
    
    const item = localContent.designWork.splice(catIdx, 1)[0];
    localContent.designWork.splice(targetIdx, 0, item);
    
    renderFormSections(localContent);
    const body = document.getElementById('body-designWork');
    if (body) body.classList.add('open');
}

function removeDesignCategory(catIdx) {
    localContent.designWork = collectSectionData('designWork');
    if (Array.isArray(localContent.designWork)) {
        localContent.designWork.splice(catIdx, 1);
        renderFormSections(localContent);
        const body = document.getElementById('body-designWork');
        if (body) body.classList.add('open');
    }
}

function removeDesignCategoryItem(catIdx, imgIdx) {
    if (Array.isArray(localContent.designWork) && localContent.designWork[catIdx] && Array.isArray(localContent.designWork[catIdx].images)) {
        localContent.designWork[catIdx].images.splice(imgIdx, 1);
        renderFormSections(localContent);
        const body = document.getElementById('body-designWork');
        if (body) body.classList.add('open');
    }
}

// 6. Gather Form Values & Save Section
function saveSection(secKey) {
    const payloadSlice = collectSectionData(secKey);
    localContent[secKey] = payloadSlice;

    fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [secKey]: payloadSlice })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(`Section "${secKey}" saved successfully!`, 'success');
        } else {
            showToast(data.error || 'Failed to save section.', 'error');
        }
    })
    .catch(() => showToast('Network error while saving.', 'error'));
}

function saveAllSections() {
    const fullPayload = {};
    const keys = ['hero', 'about', 'testimonials', 'education', 'projects', 'designWork', 'experience', 'stats', 'coursePromo', 'certificates', 'whyChooseMe', 'services', 'contact'];

    keys.forEach(k => {
        fullPayload[k] = collectSectionData(k);
    });

    fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('All site sections saved successfully!', 'success');
        } else {
            showToast(data.error || 'Failed to save all changes.', 'error');
        }
    })
    .catch(() => showToast('Network error saving all changes.', 'error'));
}

function collectSectionData(secKey) {
    if (secKey === 'hero') {
        return {
            badge: getValue('hero-badge'),
            headline: getValue('hero-headline'),
            subtitle: getValue('hero-subtitle'),
            exploreDevText: getValue('hero-devText'),
            exploreDesignText: getValue('hero-designText')
        };
    }

    if (secKey === 'about') {
        return {
            sectionTitle: getValue('about-secTitle'),
            roleTitle: getValue('about-roleTitle'),
            profileImg: getValue('about-profileImg'),
            experienceBadgeNumber: getValue('about-expNum'),
            experienceBadgeText: getValue('about-expText'),
            bioParagraphs: getValue('about-bios').split('\n').filter(Boolean),
            skillsMini: localContent.about?.skillsMini || []
        };
    }

    if (secKey === 'stats') {
        return {
            projectsCompleted: getValue('stats-projects'),
            satisfiedClients: getValue('stats-clients'),
            socialAudience: getValue('stats-social')
        };
    }

    if (secKey === 'coursePromo') {
        return {
            title: getValue('course-title'),
            description: getValue('course-desc'),
            enrollLink: getValue('course-link'),
            image: getValue('course-image')
        };
    }

    if (secKey === 'contact') {
        return {
            phone: getValue('contact-phone'),
            whatsapp: getValue('contact-wa'),
            whatsappLink: `https://wa.me/${getValue('contact-wa')}`,
            email: getValue('contact-email'),
            currentAddress: getValue('contact-currAdd'),
            permanentAddress: getValue('contact-permAdd'),
            socials: {
                facebook: getValue('contact-fb'),
                linkedin: getValue('contact-li'),
                behance: getValue('contact-be'),
                youtube: getValue('contact-yt')
            }
        };
    }

    if (secKey === 'designWork') {
        const catBlocks = document.querySelectorAll('#body-designWork .design-category-block');
        const categories = [];
        catBlocks.forEach((block, i) => {
            const titleInput = block.querySelector('[data-field="title"]');
            const heightInput = block.querySelector('[data-field="cardHeight"]');
            const textInput = block.querySelector('[data-field="images"]');
            const parsedHeight = heightInput ? parseInt(heightInput.value, 10) : 220;

            categories.push({
                id: (Array.isArray(localContent.designWork) && localContent.designWork[i] && localContent.designWork[i].id) || `dw_${i + 1}`,
                title: titleInput ? titleInput.value : `Category ${i + 1}`,
                cardHeight: isNaN(parsedHeight) ? 220 : parsedHeight,
                images: textInput ? textInput.value.split('\n').map(s => s.trim()).filter(Boolean) : []
            });
        });
        return categories;
    }

    if (['testimonials', 'education', 'projects', 'certificates', 'experience', 'whyChooseMe', 'services'].includes(secKey)) {
        const cardEls = document.querySelectorAll(`#array-list-${secKey} .array-card`);
        const arr = [];
        cardEls.forEach((card, i) => {
            const item = {};
            card.querySelectorAll('[data-field]').forEach(inp => {
                const field = inp.getAttribute('data-field');
                if (inp.type === 'checkbox') {
                    item[field] = inp.checked;
                } else if (inp.type === 'number') {
                    item[field] = parseInt(inp.value, 10);
                } else if (field === 'clients' || field === 'items') {
                    item[field] = inp.value.split('\n').filter(Boolean);
                } else if (field === 'gigs') {
                    item[field] = inp.value.split(',').map(s => s.trim()).filter(Boolean);
                } else {
                    item[field] = inp.value;
                }
            });

            // Preserve ID for testimonials if present
            if (secKey === 'testimonials' && !item.id) {
                item.id = `t_${i + 1}`;
            }

            // Gather image upload value if exists
            const hiddenImgInput = card.querySelector('input[type="hidden"]');
            if (hiddenImgInput) {
                item.image = hiddenImgInput.value;
            }

            arr.push(item);
        });
        return arr;
    }

    return localContent[secKey] || {};
}

// Utility Helpers
function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast toast-${type} show`;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.className = 'toast';
        toast.style.display = 'none';
    }, 3000);
}
