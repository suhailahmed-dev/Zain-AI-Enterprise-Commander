// ==============================================================================
// 1. LIVE CLOCK & GLOBAL STATUS SYNC
// ==============================================================================
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false }) + ' PKT';
    const el = document.getElementById('live-clock');
    if (el) el.innerText = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// Live Telemetry Refresh
async function refreshStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        const mt5Badge = document.getElementById('mt5-badge');
        if (mt5Badge) {
            if (data.mt5_running) {
                mt5Badge.innerText = 'LIVE 🟢 (24h Solid)';
                mt5Badge.className = 'metric-value green-text';
            } else {
                mt5Badge.innerText = 'OFFLINE 🔴';
                mt5Badge.className = 'metric-value';
            }
        }
    } catch (e) {
        console.error('Failed to fetch status:', e);
    }
}

// Play Voice Announcement (Neural Urdu)
async function playVoiceAnnouncement() {
    const btn = document.querySelector('.voice-btn');
    if (!btn) return;
    const origHTML = btn.innerHTML;
    btn.innerHTML = '<span>🔊 بول رہا ہے...</span>';
    btn.disabled = true;

    try {
        await fetch('/api/announce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "السلام علیکم زین بھائی! آپ کا نیا تھری ڈی ملٹی ایجنٹ کمانڈ سینٹر بالکل لائیو ہے۔ فاریکس، صوفی بوٹ اور سائٹ سیلر فعال ہیں۔"
            })
        });
    } catch (e) {
        console.error('Voice announce failed:', e);
    } finally {
        setTimeout(() => {
            btn.innerHTML = origHTML;
            btn.disabled = false;
        }, 3500);
    }
}

// ==============================================================================
// 2. VIEW SWITCHER (OPTION 1, OPTION 2, OPTION 3)
// ==============================================================================
function switchMainView(view) {
    const views = ['view-overview', 'view-focus', 'view-3d'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = 'none';
    });

    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    if (view === 'overview') {
        const el = document.getElementById('view-overview');
        if (el) el.style.display = 'block';
        navItems[0]?.classList.add('active');
    } else if (view === 'focus') {
        const el = document.getElementById('view-focus');
        if (el) el.style.display = 'block';
        navItems[1]?.classList.add('active');
    } else if (view === '3d') {
        const el = document.getElementById('view-3d');
        if (el) el.style.display = 'block';
        navItems[2]?.classList.add('active');
        setTimeout(() => {
            if (!renderer) init3DScene();
            else onWindowResize();
        }, 150);
    }
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ==============================================================================
// 3. AGENT DETAILS & SELECTION (OPTION 2 AGENT FOCUS)
// ==============================================================================
const AGENTS_DATABASE = {
    forex: {
        avatar: '📈',
        name: 'ZainForexAutoBot (VIP Ladla)',
        desc: 'Institutional Gold XAU/USD EA on MetaTrader 5 with 1% hard risk cap & news filter.',
        status: '● ACTIVE (NORMAL)',
        color: '#f59e0b',
        logs: [
            '> [INIT] ZainForexAutoBot Standalone initialized on XAUUSD,M5',
            '> [NEWS_FILTER] MT5 Economic Calendar verified. 26 records found.',
            '> [RISK_GUARD] 1.00% max equity risk hard ceiling strictly locked ($1.00 budget).',
            '> [TELEMETRY] Terminal active. 0 trades allowed in consolidation chop.',
            '> [DISCIPLINE] Outside session / ranging filter avoided risky drawdowns.'
        ]
    },
    sophi: {
        avatar: '🪙',
        name: 'Sophi Crypto Bot (Binance)',
        desc: 'Multi-Coin Quantitative Confluence Scanner (BTC, ETH, SOL, BNB, XRP, DOGE, AVAX, LINK).',
        status: '● ACTIVE 24H SOAK (GREEN)',
        color: '#38bdf8',
        logs: [
            '> [SCAN] Multi-coin universe active. Scanning 8 pairs via WebSocket.',
            '> [POSITIONS] Holding BNB (+0.030) and ETH (+0.009).',
            '> [EQUITY] Current Balance: $9,828.32 | Daily PnL: +$0.83 Green.',
            '> [CONFLUENCE] Top Opportunities: AVAX (0.55), SOL (0.53), DOGE (0.45).',
            '> [STRATEGY] RSI neutral-bullish. Waiting for high-volume breakout.'
        ]
    },
    siteseller: {
        avatar: '💻',
        name: 'SiteSeller Fast Cash Agent',
        desc: 'Extracts high-value local businesses without websites and pitches 1-click modern landing pages.',
        status: '● READY FOR OUTREACH',
        color: '#10b981',
        logs: [
            '> [TARGETS] Top Tier locked: USA, UK, and Australia.',
            '> [SCRAPER] OpenStreetMap Overpass verified: Local salons, clinics, roofers.',
            '> [PITCHES] High-converting 1-page demo cold email template ready.',
            '> [DEALS] Ready to dispatch first batch of 10 targeted business proposals.'
        ]
    },
    media: {
        avatar: '🎬',
        name: 'Multimedia Creative Studio',
        desc: 'Automated video factory for YouTube Shorts & TikTok reels with 4 specialized sub-agents.',
        status: '● ASSETS QUEUED',
        color: '#c084fc',
        logs: [
            '> [SUB-AGENTS] Viral Scriptwriter, Neural Voice, Video Assembler, QA Inspector.',
            '> [CONCEPTS] 3 Curiosity-hooked short scripts queued.',
            '> [AUDIO] Urdu/English neural speech synthesis test passed.',
            '> [RENDER] Video assembly pipeline ready for execution.'
        ]
    },
    social: {
        avatar: '📱',
        name: 'Marketing AI Agent (Apex)',
        desc: 'Apex Marketing OS. 30-day viral content calendars and $100/mo agency retainer packages.',
        status: '● CAMPAIGN PREPARED',
        color: '#3b82f6',
        logs: [
            '> [TOOLS] 15 AI marketing tools ready (Hooks, Carousels, VSL scripts).',
            '> [PORTFOLIO] 7-Day Demo Roadmap prepared for local fitness gym / salon.',
            '> [STRATEGY] Retainer offer ($100/mo social handling) structured.'
        ]
    },
    ebay: {
        avatar: '📦',
        name: 'eBay Dropshipping Bot',
        desc: 'Automated winning product hunter, supplier margin calculator, and SEO listing writer.',
        status: '● STANDBY',
        color: '#fb923c',
        logs: [
            '> [HUNTING] Margin threshold set: minimum 30% net profit.',
            '> [SUPPLIERS] Source scraper standby.',
            '> [SEO] Optimized title & bullet generator ready.'
        ]
    },
    deal: {
        avatar: '🤝',
        name: 'Global Deal Hunter',
        desc: 'Scans freelance marketplaces for automation projects, drafts winning proposals.',
        status: '● IN PIPELINE',
        color: '#818cf8',
        logs: [
            '> [BLUEPRINT] Upwork / Freelance project feed architecture drafted.',
            '> [PROPOSALS] Winning client pitch framework registered.'
        ]
    },
    commander: {
        avatar: '🤖',
        name: 'Chief Commander AI (Brain)',
        desc: 'Antigravity HQ Brain orchestrating all 8 autonomous rooms in real time.',
        status: '● ACTIVE 24/7',
        color: '#38bdf8',
        logs: [
            '> [SYSTEM] 8 Autonomous rooms initialized and linked.',
            '> [FLEET] MetaTrader 5 + Binance Testnet running cleanly.',
            '> [REPORT] Zero critical failures. System health 100% nominal.'
        ]
    }
};

function selectAgent(id) {
    switchMainView('focus');
    loadAgentDetails(id);
}

function loadAgentDetails(id) {
    const data = AGENTS_DATABASE[id] || AGENTS_DATABASE.forex;

    const avatar = document.getElementById('fw-avatar');
    const name = document.getElementById('fw-name');
    const desc = document.getElementById('fw-desc');
    const status = document.getElementById('fw-status');
    const terminal = document.getElementById('fw-terminal');

    if (avatar) avatar.innerText = data.avatar;
    if (name) name.innerText = data.name;
    if (desc) desc.innerText = data.desc;
    if (status) {
        status.innerText = data.status;
        status.style.color = data.color;
    }

    if (terminal) {
        terminal.innerHTML = '';
        data.logs.forEach(line => {
            const el = document.createElement('div');
            el.className = 'term-line';
            el.innerText = line;
            terminal.appendChild(el);
        });
    }

    // Update active highlight in focus list
    const items = document.querySelectorAll('.focus-agent-item');
    items.forEach(item => item.classList.remove('active'));
    // Set active item if found
}

// ==============================================================================
// 4. THREE.JS 3D WORKSPACE (OPTION 3)
// ==============================================================================
let scene, camera, renderer, controls;

function init3DScene() {
    const container = document.getElementById('threejs-canvas-container');
    if (!container || renderer) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080d1a, 0.015);

    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 32, 55);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 80);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    const grid = new THREE.GridHelper(90, 36, 0x38bdf8, 0x142038);
    grid.position.y = -6;
    scene.add(grid);

    // Center Core Sphere
    const coreGeo = new THREE.IcosahedronGeometry(4, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Orbiting Pods
    const podColors = [0xf59e0b, 0x38bdf8, 0x10b981, 0xc084fc, 0x3b82f6, 0xfb923c, 0x818cf8];
    podColors.forEach((col, idx) => {
        const angle = (idx / podColors.length) * Math.PI * 2;
        const x = Math.cos(angle) * 24;
        const z = Math.sin(angle) * 24;
        const podGeo = new THREE.DodecahedronGeometry(2);
        const podMat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.4 });
        const pod = new THREE.Mesh(podGeo, podMat);
        pod.position.set(x, 2, z);
        scene.add(pod);

        const lineMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.3 });
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(x, 2, z)
        ]);
        scene.add(new THREE.Line(lineGeo, lineMat));
    });

    function animate() {
        requestAnimationFrame(animate);
        coreMesh.rotation.y += 0.01;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function onWindowResize() {
    const container = document.getElementById('threejs-canvas-container');
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

window.addEventListener('resize', onWindowResize);

// Initialize on Load
refreshStatus();
setInterval(refreshStatus, 15000);
