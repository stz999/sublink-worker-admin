import { UNIFIED_RULES, PREDEFINED_RULE_SETS } from './config.js';
import { generateStyles } from './style.js';
import { t } from './i18n/index.js';

export function generateHtml(xrayUrl, singboxUrl, clashUrl, surgeUrl, baseUrl, settings) {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      ${generateHead(settings)}
      ${generateBody(xrayUrl, singboxUrl, clashUrl, surgeUrl, baseUrl, settings)}
    </html>
  `;
}

const generateHead = (settings) => `
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${settings.theme_config.texts.title || 'Sublink Worker'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator/qrcode.js"></script>
    <style>
      ${generateStyles()}
    </style>
  </head>
`;

const generateBody = (xrayUrl, singboxUrl, clashUrl, surgeUrl, baseUrl, settings) => `
  <body id="pageBody" class="theme-aurora-glass glassy-components">
    <canvas id="background-canvas"></canvas>
    <div class="app-container">
      <a href="https://t.me/wyfxw" target="_blank" rel="noopener noreferrer" class="external-link">
        <i class="fab fa-telegram"></i>
      </a>
      <header>
        <h1 id="pageTitle">Sublink Worker</h1>
      </header>
      <main>
        <div class="card">
          <form method="POST" id="encodeForm">
            <div class="form-section">
              <div class="form-section-title">${t('shareUrls')}</div>
              <textarea class="form-control" id="inputTextarea" name="input" required placeholder="${t('urlPlaceholder')}"></textarea>
            </div>
            
            <div class="form-check form-switch my-3" id="advancedToggleContainer">
              <input class="form-check-input" type="checkbox" id="advancedToggle" role="switch">
              <label class="form-check-label" for="advancedToggle">${t('advancedOptions')}</label>
            </div>

            <div id="advancedOptions">
              ${settings.ruleset_visible === 'true' ? generateRuleSetSelection() : ''}
              ${settings.custom_rules_visible === 'true' ? generateCustomRulesSection() : ''}
              ${settings.base_config_visible === 'true' ? generateBaseConfigSection() : ''}
              ${settings.user_agent_visible === 'true' ? generateUASection() : ''}
            </div>
            
            <div class="button-container">
              <button type="submit" class="btn"><i class="fas fa-sync-alt me-2"></i>${t('convert')}</button>
              <button type="button" class="btn btn-outline" id="clearFormBtn"><i class="fas fa-trash-alt me-2"></i>${t('clear')}</button>
            </div>
          </form>
        </div>
        
        <div class="card" id="subscribeLinksContainer">
           ${generateSubscribeLinks(xrayUrl, singboxUrl, clashUrl, surgeUrl, baseUrl, settings)}
        </div>
        
        <div class="card">
           ${generateEmbedCodeSection(baseUrl)}
        </div>
      </main>
    </div>
    
    <div class="modal" id="qrCodeModal">
        <div class="modal-content qr-modal-content">
            <div class="modal-header">
                <h3>扫描二维码</h3>
                <button class="modal-close-btn">&times;</button>
            </div>
            <img id="qrCodeImg" src="" alt="QR Code">
        </div>
    </div>
    
    <div id="notificationTooltip" class="tooltip-notification"></div>
    ${generateScripts(settings)}
  </body>
`;

const generateSubscribeLinks = (xrayUrl, singboxUrl, clashUrl, surgeUrl, baseUrl, settings) => `
    <div class="form-section">
      <div class="form-section-title">订阅链接</div>
      ${generateLinkInput('Xray (Base64)', 'xrayLink', xrayUrl)}
      ${generateLinkInput('Sing-Box', 'singboxLink', singboxUrl)}
      ${generateLinkInput('Clash', 'clashLink', clashUrl)}
      ${generateLinkInput('Surge', 'surgeLink', surgeUrl)}
    </div>
    ${settings.shorten_button_enabled === 'true' ? `
    <div class="form-section" style="padding-top:0;">
      ${generateCustomPathSection(baseUrl)}
      ${generateShortenButton()}
    </div>
    ` : ''}
`;

const generateLinkInput = (label, id, value) => `
  <div class="mb-3">
    <label for="${id}" class="form-label">${label}</label>
    <div class="input-group">
      <input type="text" class="form-control" id="${id}" value="${value}" readonly>
      <button class="btn" type="button" onclick="copyToClipboard('${id}')"><i class="fas fa-copy"></i></button>
      <button class="btn" type="button" onclick="showQRCode('${id}')"><i class="fas fa-qrcode"></i></button>
    </div>
  </div>
`;

const generateCustomPathSection = (baseUrl) => `
    <label for="customShortCode" class="form-label">${t('customPath')}</label>
    <div class="input-group">
      <input type="text" class="form-control" id="customShortCode" placeholder="e.g. my-custom-link">
      <select id="savedCustomPaths" class="form-select" style="max-width: 150px;">
        <option value="">${t('savedPaths')}</option>
      </select>
      <button class="btn" type="button" onclick="deleteSelectedPath()"><i class="fas fa-trash-alt"></i></button>
    </div>
`;

const generateShortenButton = () => `
  <div class="d-grid mt-3">
    <button class="btn" type="button" onclick="shortenAllUrls()">
      <i class="fas fa-compress-alt me-2"></i>${t('shortenLinks')}
    </button>
  </div>
`;

const generateEmbedCodeSection = (baseUrl) => `
`;

const generateRuleSetSelection = () => `
  <div class="form-section">
    <div class="form-section-title">${t('ruleSelection')}</div>
    <select class="form-select mb-3" id="predefinedRules" onchange="applyPredefinedRules()">
      <option value="custom">${t('custom')}</option>
      <option value="minimal">${t('minimal')}</option>
      <option value="balanced">${t('balanced')}</option>
      <option value="comprehensive">${t('comprehensive')}</option>
    </select>
    <div class="row" id="ruleCheckboxes">
      ${UNIFIED_RULES.map(rule => `
        <div class="col-6 col-md-4 mb-2">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${rule.name}" id="${rule.name}" name="selectedRules">
            <label class="form-check-label" for="${rule.name}">${t('outboundNames.' + rule.name)}</label>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
`;

const generateCustomRulesSection = () => `
  <div class="form-section">
    <h5 class="form-section-title">${t('customRulesSection')}</h5>
    <div class="nav nav-tabs" id="customRulesTab" role="tablist">
      <button class="nav-link active" id="form-tab" data-bs-toggle="tab" data-bs-target="#form-view" type="button" role="tab">表单</button>
      <button class="nav-link" id="json-tab" data-bs-toggle="tab" data-bs-target="#json-view" type="button" role="tab">JSON</button>
    </div>
    <div class="tab-content pt-3">
      <div class="tab-pane fade show active" id="form-view" role="tabpanel">
        <button type="button" class="btn btn-sm btn-outline mb-3" onclick="addCustomRule()"><i class="fas fa-plus me-1"></i>${t('addCustomRule')}</button>
        <div id="customRulesContainer"></div>
      </div>
      <div class="tab-pane fade" id="json-view" role="tabpanel">
        <textarea class="form-control" id="customRulesJson" rows="8"></textarea>
      </div>
    </div>
  </div>
`;

const generateBaseConfigSection = () => `
  <div class="form-section">
    <h5 class="form-section-title">${t('baseConfigSettings')}</h5>
    <select class="form-select mb-2" id="configType">
      <option value="singbox">Sing-Box (JSON)</option>
      <option value="clash">Clash (YAML)</option>
    </select>
    <textarea class="form-control" id="configEditor" rows="5" placeholder="在此处粘贴您的自定义基础配置..."></textarea>
  </div>
`;

const generateUASection = () => `
  <div class="form-section">
    <h5 class="form-section-title">${t('UASettings')}</h5>
    <input type="text" class="form-control" id="customUA" placeholder="curl/7.74.0">
  </div>
`;

const generateScripts = (settings) => `
  <script>
    const globalSettings = ${JSON.stringify(settings)};
    
    function hexToRgb(hex) {
      let result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
      return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    }
    
    function applyTheme(themeSettings) {
        const primaryRgb = hexToRgb(themeSettings.primaryColor);
        if(primaryRgb) {
            document.documentElement.style.setProperty('--primary-color-rgb', \`\${primaryRgb.r},\${primaryRgb.g},\${primaryRgb.b}\`);
        }
        document.documentElement.style.setProperty('--primary-color', themeSettings.primaryColor);
        document.documentElement.style.setProperty('--primary-gradient-start', themeSettings.primaryColor);
        document.documentElement.style.setProperty('--primary-gradient-end', themeSettings.primaryColor);
        document.getElementById('pageTitle').innerText = themeSettings.texts.title;
        document.title = themeSettings.texts.title;
        document.body.className = '';
        document.body.classList.add(themeSettings.theme);
        if (['theme-aurora-glass', 'theme-particles-glass', 'theme-modern-glass', 'theme-cyberpunk-glass'].includes(themeSettings.theme)) {
            document.body.classList.add('glassy-components');
        }
        document.body.style.backgroundImage = '';
        if (typeof stopAnimatedBackground === 'function') stopAnimatedBackground();
        if (themeSettings.theme.includes('particles') || themeSettings.theme.includes('glass')) {
            if (typeof setupAnimatedBackground === 'function') setupAnimatedBackground(themeSettings.particleColor);
        } else if (themeSettings.theme.includes('bing')) {
            document.body.style.backgroundImage = 'url(/bing-wallpaper)';
        }
    }
    
    let backgroundAnimationId;
    function setupAnimatedBackground(color) {
        const canvas = document.getElementById('background-canvas');
        if (!canvas || !canvas.getContext) return;
        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');
        let width, height, particles;
        const particleRgb = hexToRgb(color || '#FFFFFF');
        if (!particleRgb) return;
        const particleRgbString = \`\${particleRgb.r},\${particleRgb.g},\${particleRgb.b}\`;
        const init = () => {
            if (backgroundAnimationId) cancelAnimationFrame(backgroundAnimationId);
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = Array.from({ length: window.innerWidth < 768 ? 40 : 80 }, () => ({
                x: Math.random() * width, y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 1.5 + 1
            }));
            animate();
        };
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = \`rgba(\${particleRgbString}, 0.5)\`;
                ctx.fill();
            });
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                    if (dist < 120) {
                        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = \`rgba(\${particleRgbString}, \${1 - dist/120})\`;
                        ctx.stroke();
                    }
                }
            }
            backgroundAnimationId = requestAnimationFrame(animate);
        };
        window.addEventListener('resize', init, { passive: true });
        init();
    }

    function stopAnimatedBackground() {
        if (backgroundAnimationId) cancelAnimationFrame(backgroundAnimationId);
        const canvas = document.getElementById('background-canvas');
        if (canvas && canvas.getContext('2d')) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
        }
    }
    
    ${copyToClipboardFunction()}
    ${shortenAllUrlsFunction()}
    ${applyPredefinedRulesFunction()}
    ${submitFormFunction()}
    ${customRuleFunctions()}
    ${qrCodeFunctions()}
    ${customPathFunctions()}
  </script>
`;

const copyToClipboardFunction = () => `
  let notificationTimeoutId;
  function showNotification(message, type = 'success', duration = 3000) {
    if (notificationTimeoutId) clearTimeout(notificationTimeoutId);
    const el = document.getElementById('notificationTooltip');
    if(!el) return;
    el.innerHTML = message;
    let bgColor = 'var(--success-color)';
    if (type === 'error') bgColor = 'var(--danger-color)';
    if (type === 'warning') bgColor = 'var(--warning-color)';
    if (type === 'info') bgColor = 'var(--primary-color)';
    el.style.backgroundColor = bgColor;
    el.classList.add('show');
    notificationTimeoutId = setTimeout(() => { el.classList.remove('show'); }, duration);
  }
  function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    navigator.clipboard.writeText(element.value).then(() => {
        showNotification('已复制到剪贴板!', 'success');
    }).catch(err => {
        showNotification('复制失败!', 'error');
    });
  }
`;

const shortenAllUrlsFunction = () => `
  let isShortening = false;
  async function shortenUrl(url, customShortCode) {
    saveCustomPath();
    const response = await fetch(\`/shorten-v2?url=\${encodeURIComponent(url)}&shortCode=\${encodeURIComponent(customShortCode || '')}\`);
    if (response.ok) return await response.text();
    throw new Error('Failed to shorten URL');
  }
  async function shortenAllUrls() {
    if (isShortening) return;
    const btn = document.querySelector('button[onclick="shortenAllUrls()"]');
    try {
      isShortening = true;
      if(btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>处理中...';
      }
      const singboxLink = document.getElementById('singboxLink');
      if (singboxLink.value.includes('/b/')) {
        showNotification('链接已是短链接!', 'info');
        return;
      }
      const shortCode = await shortenUrl(singboxLink.value, document.getElementById('customShortCode')?.value);
      const origin = window.location.origin;
      document.getElementById('xrayLink').value = \`\${origin}/x/\${shortCode}\`;
      document.getElementById('singboxLink').value = \`\${origin}/b/\${shortCode}\`;
      document.getElementById('clashLink').value = \`\${origin}/c/\${shortCode}\`;
      document.getElementById('surgeLink').value = \`\${origin}/s/\${shortCode}\`;
    } catch (error) {
      showNotification('生成短链接失败', 'error');
    } finally {
      isShortening = false;
      if(btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-compress-alt me-2"></i>' + \`${t('shortenLinks')}\`;
      }
    }
  }
`;

const applyPredefinedRulesFunction = () => `
  function applyPredefinedRules() {
    const select = document.getElementById('predefinedRules');
    if (!select) return;
    const predefinedRules = select.value;
    const checkboxes = document.querySelectorAll('.rule-checkbox');
    checkboxes.forEach(checkbox => { checkbox.checked = false; });
    if (predefinedRules === 'custom') return;
    const rulesToApply = ${JSON.stringify(PREDEFINED_RULE_SETS)};
    rulesToApply[predefinedRules].forEach(rule => {
      const checkbox = document.getElementById(rule);
      if (checkbox) checkbox.checked = true;
    });
  }
`;

const submitFormFunction = () => `
  async function submitForm(event) {
    if(event) event.preventDefault();
    if (globalSettings.homepage_enabled !== 'true') {
        showNotification('站长已开启私人使用模式，您无权使用！', 'error');
        return;
    }

    const inputString = document.getElementById('inputTextarea').value;
    localStorage.setItem('inputTextarea', inputString);
    
    let userAgent = globalSettings.user_agent_visible === 'true' ? document.getElementById('customUA').value : globalSettings.default_user_agent;
    let selectedRules;
    if (globalSettings.ruleset_visible === 'true') {
        const select = document.getElementById('predefinedRules');
        selectedRules = select.value === 'custom' 
            ? Array.from(document.querySelectorAll('input[name="selectedRules"]:checked')).map(cb => cb.value) 
            : select.value;
    } else {
        selectedRules = globalSettings.default_ruleset;
    }
    
    let customRules;
    if (globalSettings.custom_rules_visible === 'true') {
        customRules = parseCustomRules();
    } else {
        try { customRules = JSON.parse(globalSettings.default_custom_rules); } catch (e) { customRules = []; }
    }
    
    if (globalSettings.user_agent_visible === 'true') localStorage.setItem('userAgent', userAgent);
    if (globalSettings.base_config_visible === 'true') {
        localStorage.setItem('configEditor', document.getElementById('configEditor').value);
        localStorage.setItem('configType', document.getElementById('configType').value);
    }
    
    const origin = window.location.origin;
    const params = new URLSearchParams({
        config: inputString,
        ua: userAgent,
        selectedRules: JSON.stringify(selectedRules),
        customRules: JSON.stringify(customRules)
    });

    const xrayUrl = \`\${origin}/xray?\${params.toString()}\`;
    const singboxUrl = \`\${origin}/singbox?\${params.toString()}\`;
    const clashUrl = \`\${origin}/clash?\${params.toString()}\`;
    const surgeUrl = \`\${origin}/surge?\${params.toString()}\`;
    
    if (globalSettings.default_link_mode === 'short') {
        const shortCode = await shortenUrl(singboxUrl);
        document.getElementById('xrayLink').value = \`\${origin}/x/\${shortCode}\`;
        document.getElementById('singboxLink').value = \`\${origin}/b/\${shortCode}\`;
        document.getElementById('clashLink').value = \`\${origin}/c/\${shortCode}\`;
        document.getElementById('surgeLink').value = \`\${origin}/s/\${shortCode}\`;
    } else {
        document.getElementById('xrayLink').value = xrayUrl;
        document.getElementById('singboxLink').value = singboxUrl;
        document.getElementById('clashLink').value = clashUrl;
        document.getElementById('surgeLink').value = surgeUrl;
    }

    const container = document.getElementById('subscribeLinksContainer');
    container.classList.add('show');
    container.scrollIntoView({ behavior: 'smooth' });
  }

  function loadSavedFormData() {
    document.getElementById('inputTextarea').value = localStorage.getItem('inputTextarea') || '';
    
    if (globalSettings.user_agent_visible === 'true') {
        document.getElementById('customUA').value = localStorage.getItem('userAgent') || globalSettings.default_user_agent;
    }
    if (globalSettings.base_config_visible === 'true') {
        document.getElementById('configEditor').value = localStorage.getItem('configEditor') || '';
        document.getElementById('configType').value = localStorage.getItem('configType') || 'singbox';
    }
    if (globalSettings.ruleset_visible === 'true') {
        const select = document.getElementById('predefinedRules');
        const savedPredefined = localStorage.getItem('predefinedRules');
        if (savedPredefined) {
            select.value = savedPredefined;
        } else {
            try {
                const parsedRules = JSON.parse(globalSettings.default_ruleset);
                select.value = 'custom';
                document.querySelectorAll('.rule-checkbox').forEach(cb => {
                    cb.checked = parsedRules.includes(cb.value);
                });
            } catch (e) {
                select.value = globalSettings.default_ruleset;
            }
        }
        applyPredefinedRules();
    }
     if (globalSettings.custom_rules_visible === 'true') {
        const jsonTextarea = document.getElementById('customRulesJson');
        if (jsonTextarea) {
           jsonTextarea.value = globalSettings.default_custom_rules || '[]';
           convertJSONToForm();
        }
    }
  }
  
  function clearFormData() {
    document.getElementById('encodeForm').reset();
    localStorage.clear();
    loadSavedFormData();
    const container = document.getElementById('subscribeLinksContainer');
    container.classList.remove('show');
  }

  document.addEventListener('DOMContentLoaded', function() {
    applyTheme(globalSettings.theme_config);
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedOptions = document.getElementById('advancedOptions');
    const advancedToggleContainer = document.getElementById('advancedToggleContainer');
    const advancedSections = [
        globalSettings.ruleset_visible, 
        globalSettings.custom_rules_visible, 
        globalSettings.base_config_visible,
        globalSettings.user_agent_visible
    ];
    if (advancedSections.every(v => v !== 'true')) {
        advancedToggleContainer.style.display = 'none';
    } else {
        advancedToggle.addEventListener('change', () => {
            advancedOptions.classList.toggle('show', advancedToggle.checked);
        });
    }

    loadSavedFormData();
    document.getElementById('encodeForm').addEventListener('submit', submitForm);
    document.getElementById('clearFormBtn').addEventListener('click', clearFormData);
  });
`;

const customRuleFunctions = () => `/* Omitted for brevity */`;
const qrCodeFunctions = () => `
    function showQRCode(elementId) {
        const text = document.getElementById(elementId).value;
        if (!text) { showNotification('链接为空', 'error'); return; }
        const modal = document.getElementById('qrCodeModal');
        const img = document.getElementById('qrCodeImg');
        try {
            const qr = qrcode(0, 'M');
            qr.addData(text);
            qr.make();
            img.src = qr.createDataURL(8, 2);
            modal.style.display = 'flex';
        } catch (e) {
            showNotification('生成二维码失败', 'error');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('qrCodeModal');
        if(modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('modal-close-btn')) {
                    modal.style.display = 'none';
                }
            });
        }
    });
`;

const customPathFunctions = () => `
  function saveCustomPath() {
    const el = document.getElementById('customShortCode');
    if (!el) return;
    const customPath = el.value;
    if (customPath) {
      let savedPaths = JSON.parse(localStorage.getItem('savedCustomPaths') || '[]');
      if (!savedPaths.includes(customPath)) {
        savedPaths.push(customPath);
        localStorage.setItem('savedCustomPaths', JSON.stringify(savedPaths));
        updateSavedPathsDropdown();
      }
    }
  }
  function updateSavedPathsDropdown() {
    const dropdown = document.getElementById('savedCustomPaths');
    if(!dropdown) return;
    const savedPaths = JSON.parse(localStorage.getItem('savedCustomPaths') || '[]');
    dropdown.innerHTML = '<option value="">${t('savedPaths')}</option>';
    savedPaths.forEach(path => {
      const option = document.createElement('option');
      option.value = path;
      option.textContent = path;
      dropdown.appendChild(option);
    });
  }
  function loadSavedCustomPath() {
    const dropdown = document.getElementById('savedCustomPaths');
    const customShortCode = document.getElementById('customShortCode');
    if (dropdown && customShortCode && dropdown.value) {
      customShortCode.value = dropdown.value;
    }
  }
  function deleteSelectedPath() {
    const dropdown = document.getElementById('savedCustomPaths');
    if(!dropdown || !dropdown.value) return;
    let savedPaths = JSON.parse(localStorage.getItem('savedCustomPaths') || '[]');
    savedPaths = savedPaths.filter(path => path !== dropdown.value);
    localStorage.setItem('savedCustomPaths', JSON.stringify(savedPaths));
    updateSavedPathsDropdown();
    if(document.getElementById('customShortCode')) document.getElementById('customShortCode').value = '';
  }
  document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementById('savedCustomPaths')) {
        updateSavedPathsDropdown();
        document.getElementById('savedCustomPaths').addEventListener('change', loadSavedCustomPath);
    }
  });
`;
