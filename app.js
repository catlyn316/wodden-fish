/* ==========================================================================
   Zen Muyu Online - Core Application & Sound Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. STATE MANAGEMENT
    // ----------------------------------------------------------------------
    const state = {
        merits: parseInt(localStorage.getItem('muyu_merits')) || 0,
        todayMerits: 0,
        maxCombo: parseInt(localStorage.getItem('muyu_max_combo')) || 0,
        currentCombo: 0,
        customText: localStorage.getItem('muyu_custom_text') || '功德',
        customNum: localStorage.getItem('muyu_custom_num') || '+1',
        rotateRange: localStorage.getItem('muyu_rot_range') !== null ? parseInt(localStorage.getItem('muyu_rot_range')) : 40,
        floatDist: parseInt(localStorage.getItem('muyu_float_dist')) || 130,
        volume: localStorage.getItem('muyu_volume') !== null ? parseInt(localStorage.getItem('muyu_volume')) : 100,
        pitch: parseInt(localStorage.getItem('muyu_pitch')) || 600,
        decay: parseInt(localStorage.getItem('muyu_decay')) || 25,
        skin: localStorage.getItem('muyu_skin') || 'classic',
        autoTapEnabled: false,
        autoTapIntervalId: null,
        autoTapSpeed: parseInt(localStorage.getItem('muyu_auto_speed')) || 1000,
        unlockedAchievements: JSON.parse(localStorage.getItem('muyu_achievements')) || []
    };

    // ----------------------------------------------------------------------
    // 2. DOM ELEMENTS
    // ----------------------------------------------------------------------
    const meritCountEl = document.getElementById('meritCount');
    const todayMeritEl = document.getElementById('todayMerit');
    const maxComboEl = document.getElementById('maxCombo');
    const comboBadge = document.getElementById('comboBadge');
    const muyuTapArea = document.getElementById('muyuTapArea');
    const muyuSvg = document.getElementById('muyuSvg');
    const rippleContainer = document.getElementById('rippleContainer');
    const floatingTextArea = document.getElementById('floatingTextArea');
    const ambientGlow = document.getElementById('ambientGlow');
    
    // Controls
    const skinButtons = document.querySelectorAll('.skin-btn');
    const customTextInput = document.getElementById('customTextInput');
    const customNumberInput = document.getElementById('customNumberInput');
    const quickTagBtns = document.querySelectorAll('.tag-btn');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeVal = document.getElementById('volumeVal');
    const pitchSlider = document.getElementById('pitchSlider');
    const pitchVal = document.getElementById('pitchVal');
    const decaySlider = document.getElementById('decaySlider');
    const decayVal = document.getElementById('decayVal');
    const autoTapToggle = document.getElementById('autoTapToggle');
    const autoSpeedSlider = document.getElementById('autoSpeedSlider');
    const autoSpeedVal = document.getElementById('autoSpeedVal');
    const autoSpeedGroup = document.getElementById('autoSpeedGroup');
    const resetDataBtn = document.getElementById('resetDataBtn');
    
    // Floating Text FX Controls
    const rotateRangeSlider = document.getElementById('rotateRangeSlider');
    const rotateRangeVal = document.getElementById('rotateRangeVal');
    const floatDistSlider = document.getElementById('floatDistSlider');
    const floatDistVal = document.getElementById('floatDistVal');

    // Zen Mode
    const zenModeBtn = document.getElementById('zenModeBtn');
    const exitZenBtn = document.getElementById('exitZenBtn');
    
    // Quotes / Breath / Achievements
    const zenQuoteEl = document.getElementById('zenQuote');
    const breathingTextEl = document.getElementById('breathingText');
    const achievementsListEl = document.getElementById('achievementsList');

    // ----------------------------------------------------------------------
    // 3. SOUND SYNTHESIS ENGINE (Web Audio API)
    // ----------------------------------------------------------------------
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    /**
     * Synthesizes a high-fidelity wood block sound dynamically.
     * @param {number} pitchFreq - Fundamental frequency in Hz (300 - 1200)
     * @param {number} decayScale - Decay control (10 - 80)
     * @param {number} volPercent - Volume percentage (0 - 100)
     */
    function playWoodBlockSound(pitchFreq, decayScale, volPercent) {
        initAudio();
        if (!audioCtx) return;

        const volume = (volPercent / 100) * 0.7; // Cap gain to avoid distortion
        const decayTime = decayScale / 100;      // Maps to 0.1s - 0.8s
        const now = audioCtx.currentTime;

        // 1. Resonant Body (Warm, woody tone using triangle wave)
        const bodyOsc = audioCtx.createOscillator();
        const bodyGain = audioCtx.createGain();
        const lowpass = audioCtx.createBiquadFilter();

        bodyOsc.type = 'triangle';
        bodyOsc.frequency.setValueAtTime(pitchFreq, now);
        
        // Rapid pitch sweep downwards to simulate a realistic strike contact decay
        bodyOsc.frequency.exponentialRampToValueAtTime(pitchFreq * 0.45, now + decayTime);

        // Lowpass filter to round out the harsh edges and simulate wood acoustics
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(pitchFreq * 2.8, now);
        lowpass.frequency.exponentialRampToValueAtTime(pitchFreq * 1.2, now + decayTime);
        lowpass.Q.setValueAtTime(1.5, now);

        // Exponential volume envelope
        bodyGain.gain.setValueAtTime(volume, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

        bodyOsc.connect(lowpass);
        lowpass.connect(bodyGain);
        bodyGain.connect(audioCtx.destination);

        // Start & Stop Body
        bodyOsc.start(now);
        bodyOsc.stop(now + decayTime);

        // 2. Initial Transient Strike (The sharp wooden "click")
        const strikeOsc = audioCtx.createOscillator();
        const strikeGain = audioCtx.createGain();

        strikeOsc.type = 'sine';
        strikeOsc.frequency.setValueAtTime(pitchFreq * 2.5, now);
        strikeOsc.frequency.exponentialRampToValueAtTime(pitchFreq * 0.2, now + 0.015);

        // Very brief envelope for the initial stick impact
        strikeGain.gain.setValueAtTime(volume * 0.65, now);
        strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

        strikeOsc.connect(strikeGain);
        strikeGain.connect(audioCtx.destination);

        // Start & Stop Strike
        strikeOsc.start(now);
        strikeOsc.stop(now + 0.015);
    }

    // ----------------------------------------------------------------------
    // 4. ZEN QUOTES ENGINE
    // ----------------------------------------------------------------------
    const zenQuotes = [
        "「心無旁鶩，當下即是修行。」",
        "「菩提本無樹，明鏡亦非台。」",
        "「本來無一物，何處惹塵埃。」",
        "「萬物皆有禪意，靜心者能聽其聲。」",
        "「煩惱如流水，敲擊間皆化浮雲。」",
        "「一花一世界，一葉一如來。」",
        "「安住當下，心如止水。」",
        "「隨遇而安，一切都是最好的安排。」",
        "「息滅妄想，得大自在。」",
        "「行到水窮處，坐看雲起時。」",
        "「修剪雜念，保留靈魂的清香。」"
    ];

    function changeQuote() {
        const randIndex = Math.floor(Math.random() * zenQuotes.length);
        // Fade out transition
        zenQuoteEl.style.opacity = '0';
        setTimeout(() => {
            zenQuoteEl.textContent = zenQuotes[randIndex];
            zenQuoteEl.style.opacity = '1';
        }, 300);
    }

    // Breathing guidance rhythm loops
    const breathingCycle = [
        { text: "吸氣...", duration: 4000 },
        { text: "呼氣...", duration: 4000 }
    ];
    let breathIndex = 0;
    
    function runBreathingGuide() {
        const step = breathingCycle[breathIndex];
        breathingTextEl.textContent = step.text;
        breathIndex = (breathIndex + 1) % breathingCycle.length;
        setTimeout(runBreathingGuide, step.duration);
    }

    // ----------------------------------------------------------------------
    // 5. ACHIEVEMENTS LIST
    // ----------------------------------------------------------------------
    const achievements = [
        { id: 'first_tap', title: '初叩法門', desc: '敲擊木魚 1 次', emoji: '🌱', check: (s) => s.merits >= 1 },
        { id: 'taps_100', title: '漸入佳境', desc: '累計修行達 100 功德', emoji: '🪵', check: (s) => s.merits >= 100 },
        { id: 'taps_1000', title: '功德無量', desc: '累計修行達 1,000 功德', emoji: '✨', check: (s) => s.merits >= 1000 },
        { id: 'taps_10000', title: '超凡入聖', desc: '累計修行達 10,000 功德', emoji: '☸️', check: (s) => s.merits >= 10000 },
        { id: 'combo_10', title: '聚精會神', desc: '達成 10 連擊 (Combo)', emoji: '🔥', check: (s) => s.maxCombo >= 10 },
        { id: 'combo_50', title: '心明眼亮', desc: '達成 50 連擊 (Combo)', emoji: '⚡', check: (s) => s.maxCombo >= 50 },
        { id: 'auto_tap', title: '賽博修行', desc: '啟用自動修行模式', emoji: '🤖', check: (s) => s.unlockedAchievements.includes('auto_tap') || s.autoTapEnabled },
        { id: 'cyber_skin', title: '未來佛陀', desc: '切換至賽博霓虹皮膚', emoji: '🌌', check: (s) => s.skin === 'cyber' },
        { id: 'ink_skin', title: '水墨禪心', desc: '切換至水墨禪心皮膚', emoji: '🖌️', check: (s) => s.skin === 'ink' },
        { id: 'sakura_skin', title: '櫻花粉黛', desc: '切換至櫻花粉黛皮膚', emoji: '🌸', check: (s) => s.skin === 'sakura' },
        { id: 'jade_skin', title: '翡翠玉石', desc: '切換至翡翠玉石皮膚', emoji: '💎', check: (s) => s.skin === 'jade' },
        { id: 'heavy_skin', title: '重金剛身', desc: '切換至金剛黑金皮膚', emoji: '🛡️', check: (s) => s.skin === 'heavy' }
    ];

    function initAchievements() {
        achievementsListEl.innerHTML = '';
        achievements.forEach(ach => {
            const isUnlocked = state.unlockedAchievements.includes(ach.id);
            const item = document.createElement('div');
            item.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
            item.id = `ach-${ach.id}`;
            item.innerHTML = `
                <div class="achievement-badge">${ach.emoji}</div>
                <div class="achievement-info">
                    <h4>${ach.title}</h4>
                    <p>${ach.desc}</p>
                </div>
            `;
            achievementsListEl.appendChild(item);
        });
    }

    function checkAchievements() {
        let changed = false;
        achievements.forEach(ach => {
            if (!state.unlockedAchievements.includes(ach.id) && ach.check(state)) {
                state.unlockedAchievements.push(ach.id);
                changed = true;
                
                // Visual feedback for unlocking
                const element = document.getElementById(`ach-${ach.id}`);
                if (element) {
                    element.classList.add('unlocked');
                    element.style.transform = 'scale(1.08)';
                    setTimeout(() => element.style.transform = 'none', 300);
                }
                
                spawnNotification(`成就解鎖 🏆 ${ach.title}`);
            }
        });

        if (changed) {
            localStorage.setItem('muyu_achievements', JSON.stringify(state.unlockedAchievements));
        }
    }

    // ----------------------------------------------------------------------
    // 6. TODAY MERITS RESET HANDLER
    // ----------------------------------------------------------------------
    function initTodayMerits() {
        const todayStr = new Date().toDateString();
        const savedDate = localStorage.getItem('muyu_today_date');
        const savedTodayMerits = parseInt(localStorage.getItem('muyu_today_merits')) || 0;

        if (savedDate === todayStr) {
            state.todayMerits = savedTodayMerits;
        } else {
            state.todayMerits = 0;
            localStorage.setItem('muyu_today_date', todayStr);
            localStorage.setItem('muyu_today_merits', '0');
        }
        todayMeritEl.textContent = state.todayMerits;
    }

    // ----------------------------------------------------------------------
    // 7. TAP FEEDBACK & PARTICLE ANIMATIONS
    // ----------------------------------------------------------------------
    let comboTimer = null;

    /**
     * Main action trigger when a tapping event occurs.
     */
    function triggerMuyuTap(clientX, clientY) {
        // Increment Merits
        state.merits++;
        state.todayMerits++;
        meritCountEl.textContent = state.merits;
        todayMeritEl.textContent = state.todayMerits;
        localStorage.setItem('muyu_merits', state.merits);
        localStorage.setItem('muyu_today_merits', state.todayMerits);

        // Audio Trigger
        playWoodBlockSound(state.pitch, state.decay, state.volume);

        // Handle Combo system
        state.currentCombo++;
        if (state.currentCombo > state.maxCombo) {
            state.maxCombo = state.currentCombo;
            maxComboEl.textContent = state.maxCombo;
            localStorage.setItem('muyu_max_combo', state.maxCombo);
        }
        
        if (state.currentCombo >= 3) {
            comboBadge.querySelector('span').textContent = state.currentCombo;
            comboBadge.classList.add('active');
        }

        // Reset combo timeline after 2 seconds of inactivity
        clearTimeout(comboTimer);
        comboTimer = setTimeout(() => {
            state.currentCombo = 0;
            comboBadge.classList.remove('active');
        }, 2000);

        // Visual squish animation
        muyuTapArea.classList.remove('tapping');
        void muyuTapArea.offsetWidth; // Force CSS reflow
        muyuTapArea.classList.add('tapping');

        // Spawn particles
        const rect = muyuTapArea.getBoundingClientRect();
        let relativeX, relativeY;

        if (clientX !== undefined && clientY !== undefined) {
            relativeX = clientX - rect.left;
            relativeY = clientY - rect.top;
        } else {
            // Spacebar tapping, default to absolute center
            relativeX = rect.width / 2;
            relativeY = rect.height / 2;
        }

        spawnRipple(relativeX, relativeY);
        spawnFloatingText(relativeX, relativeY);

        // Rotate quote every 15 clicks
        if (state.merits % 15 === 0) {
            changeQuote();
        }

        checkAchievements();
    }

    function spawnRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'muyu-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        rippleContainer.appendChild(ripple);
        
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    function spawnFloatingText(x, y) {
        const floatingEl = document.createElement('span');
        floatingEl.className = 'floating-merit';
        
        // Synthesize dynamic text (Separates word and custom offset nicely, prevents "+-1" or double signs)
        const word = (state.customText || '').trim();
        const number = (state.customNum || '').trim();
        const fullText = `${word} ${number}`.trim() || '功德 +1';
        
        floatingEl.textContent = fullText;
        
        // Position at click point with random variations
        const randXOffset = (Math.random() - 0.5) * 45; // -22.5px to +22.5px
        floatingEl.style.left = `${x + randXOffset}px`;
        floatingEl.style.top = `${y - 10}px`;

        // Apply custom rotation limit
        const range = state.rotateRange; // From slider, 0 to 90
        const randomRotate = (Math.random() - 0.5) * (range * 2); // Random within [-range, +range]
        floatingEl.style.setProperty('--rot', `${randomRotate}deg`);
        
        // Apply custom float distance
        floatingEl.style.setProperty('--dist', `-${state.floatDist}px`);
        
        // Vary sizes slightly
        const randomScale = 0.85 + Math.random() * 0.35; // 0.85 to 1.2
        floatingEl.style.transform = `scale(${randomScale})`;

        floatingTextArea.appendChild(floatingEl);
        
        floatingEl.addEventListener('animationend', () => {
            floatingEl.remove();
        });
    }

    function spawnNotification(text) {
        const containerRect = muyuTapArea.getBoundingClientRect();
        const notification = document.createElement('span');
        notification.className = 'floating-merit';
        notification.style.color = '#FFF';
        notification.style.fontSize = '15px';
        notification.style.fontWeight = '600';
        notification.style.left = `${containerRect.width / 2}px`;
        notification.style.top = `${containerRect.height / 3}px`;
        notification.style.setProperty('--rot', '0deg');
        notification.textContent = text;

        floatingTextArea.appendChild(notification);
        notification.addEventListener('animationend', () => {
            notification.remove();
        });
    }

    // ----------------------------------------------------------------------
    // 8. AUTOMATIC TAP WORKER (Auto Cultivation)
    // ----------------------------------------------------------------------
    function startAutoTap() {
        if (state.autoTapIntervalId) clearInterval(state.autoTapIntervalId);
        
        state.autoTapIntervalId = setInterval(() => {
            triggerMuyuTap();
        }, state.autoTapSpeed);
        
        autoSpeedGroup.style.opacity = '1';
        autoSpeedGroup.style.pointerEvents = 'auto';
        
        setTimeout(() => checkAchievements(), 1000);
    }

    function stopAutoTap() {
        if (state.autoTapIntervalId) {
            clearInterval(state.autoTapIntervalId);
            state.autoTapIntervalId = null;
        }
        autoSpeedGroup.style.opacity = '0.5';
        autoSpeedGroup.style.pointerEvents = 'none';
    }

    // ----------------------------------------------------------------------
    // 9. EVENT BINDINGS
    // ----------------------------------------------------------------------

    // Pointer events on the Wood Fish
    muyuTapArea.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        triggerMuyuTap(e.clientX, e.clientY);
    });

    // Spacebar tapping support
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (document.activeElement.tagName !== 'INPUT') {
                e.preventDefault(); // Prevents scroll
                triggerMuyuTap();
            }
        }
    });

    // Skin Picker (12 skins)
    skinButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            skinButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const selectedSkin = btn.dataset.skin;
            
            // Remove old skin classes
            document.body.classList.remove(
                'skin-classic', 'skin-gold', 'skin-cyber', 'skin-ink',
                'skin-sakura', 'skin-jade', 'skin-abyss', 'skin-lava',
                'skin-ocean', 'skin-aurora', 'skin-porcelain', 'skin-heavy'
            );
            
            // Add new skin class
            document.body.classList.add(`skin-${selectedSkin}`);
            
            state.skin = selectedSkin;
            localStorage.setItem('muyu_skin', selectedSkin);

            checkAchievements();
        });
    });

    // Custom Text and Number split bindings
    customTextInput.value = state.customText;
    customTextInput.addEventListener('input', (e) => {
        state.customText = e.target.value;
        localStorage.setItem('muyu_custom_text', state.customText);
    });

    customNumberInput.value = state.customNum;
    customNumberInput.addEventListener('input', (e) => {
        state.customNum = e.target.value;
        localStorage.setItem('muyu_custom_num', state.customNum);
    });

    // Quick tag clicks (sets both word and number fields correctly!)
    quickTagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const word = btn.dataset.word;
            const num = btn.dataset.num;
            
            state.customText = word;
            state.customNum = num;
            
            customTextInput.value = word;
            customNumberInput.value = num;
            
            localStorage.setItem('muyu_custom_text', word);
            localStorage.setItem('muyu_custom_num', num);
        });
    });

    // Floating Text FX Controls
    rotateRangeSlider.value = state.rotateRange;
    rotateRangeVal.textContent = `${state.rotateRange}度`;
    rotateRangeSlider.addEventListener('input', (e) => {
        state.rotateRange = parseInt(e.target.value);
        rotateRangeVal.textContent = `${state.rotateRange}度`;
        localStorage.setItem('muyu_rot_range', state.rotateRange);
    });

    floatDistSlider.value = state.floatDist;
    floatDistVal.textContent = `${state.floatDist}px`;
    floatDistSlider.addEventListener('input', (e) => {
        state.floatDist = parseInt(e.target.value);
        floatDistVal.textContent = `${state.floatDist}px`;
        localStorage.setItem('muyu_float_dist', state.floatDist);
    });

    // Audio volume controls (default initially to 100)
    volumeSlider.value = state.volume;
    volumeVal.textContent = `${state.volume}%`;
    volumeSlider.addEventListener('input', (e) => {
        state.volume = parseInt(e.target.value);
        volumeVal.textContent = `${state.volume}%`;
        localStorage.setItem('muyu_volume', state.volume);
    });

    // Audio pitch controls
    pitchSlider.value = state.pitch;
    setPitchLabel(state.pitch);
    pitchSlider.addEventListener('input', (e) => {
        state.pitch = parseInt(e.target.value);
        setPitchLabel(state.pitch);
        localStorage.setItem('muyu_pitch', state.pitch);
    });

    function setPitchLabel(val) {
        if (val <= 400) {
            pitchVal.textContent = `低沉重音 (${val}Hz)`;
        } else if (val <= 750) {
            pitchVal.textContent = `標準中音 (${val}Hz)`;
        } else {
            pitchVal.textContent = `清脆高音 (${val}Hz)`;
        }
    }

    // Audio decay controls
    decaySlider.value = state.decay;
    setDecayLabel(state.decay);
    decaySlider.addEventListener('input', (e) => {
        state.decay = parseInt(e.target.value);
        setDecayLabel(state.decay);
        localStorage.setItem('muyu_decay', state.decay);
    });

    function setDecayLabel(val) {
        if (val <= 15) {
            decayVal.textContent = '短促乾脆';
        } else if (val <= 35) {
            decayVal.textContent = '標準大雄殿';
        } else if (val <= 60) {
            decayVal.textContent = '幽深回音';
        } else {
            decayVal.textContent = '空靈繚繞';
        }
    }

    // Auto Tap switches
    autoTapToggle.checked = state.autoTapEnabled;
    autoSpeedSlider.value = state.autoTapSpeed;
    setAutoSpeedLabel(state.autoTapSpeed);
    
    autoTapToggle.addEventListener('change', (e) => {
        state.autoTapEnabled = e.target.checked;
        if (state.autoTapEnabled) {
            startAutoTap();
        } else {
            stopAutoTap();
        }
    });

    autoSpeedSlider.addEventListener('input', (e) => {
        state.autoTapSpeed = parseInt(e.target.value);
        setAutoSpeedLabel(state.autoTapSpeed);
        localStorage.setItem('muyu_auto_speed', state.autoTapSpeed);
        
        if (state.autoTapEnabled) {
            startAutoTap();
        }
    });

    function setAutoSpeedLabel(val) {
        const seconds = (val / 1000).toFixed(1);
        autoSpeedVal.textContent = `${seconds} 秒/次`;
    }

    // Reset Data Bindings
    resetDataBtn.addEventListener('click', () => {
        const confirmClear = confirm("您確定要重置所有的修行數據與功德嗎？此操作不可逆。");
        if (confirmClear) {
            stopAutoTap();
            autoTapToggle.checked = false;
            
            localStorage.removeItem('muyu_merits');
            localStorage.removeItem('muyu_today_merits');
            localStorage.removeItem('muyu_max_combo');
            localStorage.removeItem('muyu_achievements');
            localStorage.removeItem('muyu_custom_text');
            localStorage.removeItem('muyu_custom_num');
            localStorage.removeItem('muyu_rot_range');
            localStorage.removeItem('muyu_float_dist');

            // Reset state
            state.merits = 0;
            state.todayMerits = 0;
            state.maxCombo = 0;
            state.currentCombo = 0;
            state.unlockedAchievements = [];
            state.customText = '功德';
            state.customNum = '+1';
            state.rotateRange = 40;
            state.floatDist = 130;
            
            // Reset elements
            meritCountEl.textContent = '0';
            todayMeritEl.textContent = '0';
            maxComboEl.textContent = '0';
            customTextInput.value = '功德';
            customNumberInput.value = '+1';
            rotateRangeSlider.value = 40;
            rotateRangeVal.textContent = '40度';
            floatDistSlider.value = 130;
            floatDistVal.textContent = '130px';
            comboBadge.classList.remove('active');
            
            initAchievements();
            spawnNotification("修行歸零 🕉️ 重新出發");
        }
    });

    // Zen Mode View Toggles
    zenModeBtn.addEventListener('click', () => {
        document.body.classList.add('zen-active');
        spawnNotification("進入極簡禪修模式 🧘");
    });

    exitZenBtn.addEventListener('click', () => {
        document.body.classList.remove('zen-active');
        spawnNotification("已返回修行面板");
    });

    // ----------------------------------------------------------------------
    // 10. INITIALIZATION
    // ----------------------------------------------------------------------
    
    // Set counters
    meritCountEl.textContent = state.merits;
    maxComboEl.textContent = state.maxCombo;
    
    // Initialize skin
    document.body.classList.remove('skin-classic');
    document.body.classList.add(`skin-${state.skin}`);
    skinButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.skin === state.skin);
    });

    initTodayMerits();
    initAchievements();
    runBreathingGuide();

    // Fade in intro quote
    zenQuoteEl.textContent = zenQuotes[0];

    checkAchievements();
});
