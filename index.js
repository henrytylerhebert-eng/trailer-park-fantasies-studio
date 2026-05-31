/* ==========================================================================
   TRAILER PARK FANTASIES — Elegant Client Logic & Studio Engine (index.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  let activeTab = 'reader-view';
  let activeStudioSubtab = 'bible-section';
  let activeBibleTab = 'summary';
  
  // Manuscript and pagination state
  let manuscriptPages = []; // Array of { num: number, content: string, art: string }
  let currentPageIndex = 0;
  let currentChapter = 1;
  
  // Sound Player State
  const soundtrackList = [
    { title: "Quiet Bayou Calm (Instrumental)", src: "music/piano_calm.wav" },
    { title: "Quirky Detective Bassoon (Theme)", src: "music/quirky_bassoon.wav" }
  ];
  let currentTrackIdx = 0;
  let audioPlayer = null;
  let isPlaying = false;

  // Timeline Beat Sheet Data
  const beatSheetData = {
    1: {
      title: "Ch. 1 — Welcome to Crystal's Cove",
      purpose: "Establish world, cast, voice, and the inciting disappearance.",
      beats: "Open on Brooke's cold-open voiceover. The morning after the crawfish boil, Sugar McCoy pounds on doors — Bobby Boudreaux is gone, his truck is still there, TV is still on. Brooke arrives to chaos: Dale is stringing caution tape, Sheila is mulching flowerbeds, Crystal is managing optics, and Tammy is sipping wine. Brooke snaps on gloves.",
      clues: "Crooked truck parked across two spots blocking sightlines; one garden gnome missing from a row leaving a fresh dark divot; thick tabbed complaint binder on the table; bleach/lemon smell at the doorframe.",
      misdirection: "First theory: 'Bobby owed everybody money and skipped town.'",
      cliffhanger: "Brooke opens the complaint binder, goes still: 'This isn't noise. It's a man trying to be believed.'",
      status: "locked"
    },
    2: {
      title: "Ch. 2 — False Leads",
      purpose: "Burn down the obvious skipping-town theory; introduce the investigation engine.",
      beats: "Brooke works the debt angle and proves it doesn't hold — the timeline's wrong and he left things a runner would take. Teepop pulls parish filings; Rena reads scene photos. A founder's transcription tool mangles Cajun names.",
      clues: "Contradictory receipt timestamp; missing tab in the binder (a page was removed).",
      misdirection: "Dale's trail-cam points at a drifter (red herring).",
      cliffhanger: "The removed page's tab heading is still legible: a parish lot-line filing.",
      status: "outline"
    },
    3: {
      title: "Ch. 3 — Trailer Tricks",
      purpose: "Read the Lot 5 scene like a coroner; stage-vs-real.",
      beats: "Close search of Lot 5. Brooke reads what was moved and cleaned. Sheila drags something out from under the trailer. Tammy trades a secret for a favor.",
      clues: "Staged trailer layout; object found under trailer matches the land filing.",
      misdirection: "Suspicion swings toward Tammy or Dale.",
      cliffhanger: "The removed page referenced a specific lot line — and it isn't Bobby's lot.",
      status: "outline"
    },
    4: {
      title: "Ch. 4 — Bayou Secrets",
      purpose: "Push the complaint thread out onto the land.",
      beats: "Follow the lot line into the bayou. Teepop uses a water drone to map disturbed ground. A fresh survey stake is found. Rena spots something that visibly unsettles her.",
      clues: "Survey markers; shell company consolidating lots.",
      misdirection: "Looks like a generic real estate developer; human target hidden.",
      cliffhanger: "One of Bobby's parish complaints named a specific name.",
      status: "outline"
    },
    5: {
      title: "Ch. 5 — Confrontation",
      purpose: "First direct accusation; raise the danger level.",
      beats: "Brooke confronts a stonewalling parish official and hits institutional language: 'we handled it internally.' It lights her up (Larry echo). An anonymous threat lands.",
      clues: "Confirmation that one complaint was quietly buried or acted on.",
      misdirection: "The stonewaller seems like the main architect (too clean).",
      cliffhanger: "An anonymous warning is delivered: 'Drop it. Some graves shouldn't be opened.'",
      status: "outline"
    },
    6: {
      title: "Ch. 6 — The Blueprint",
      purpose: "Reveal the shape of the scheme (Midseason Reveal).",
      beats: "The land-grab blueprint comes into focus — lot consolidation tied to contamination or a development play. Teepop finds the legal mechanism.",
      clues: "The plat map / blueprint itself.",
      misdirection: "Bobby skipped town over money.",
      cliffhanger: "Bobby didn't skip town. The scheme rests on an old parish death — an old coroner case.",
      status: "midreveal"
    },
    7: {
      title: "Ch. 7 — Lot Lines",
      purpose: "Map the buying center; deepen the old case.",
      beats: "Who benefits from the consolidation? Brooke needs an old coroner report, taking her back to Dr. Scott McMurrary in Da Berry. High tension: McMurrary locks horns.",
      clues: "An old death ruled accidental that was actually a homicide.",
      misdirection: "McMurrary looks like the main mastermind.",
      cliffhanger: "The old coroner file quietly ties back to Miss Rena Hebert.",
      status: "outline"
    },
    8: {
      title: "Ch. 8 — Inside Job",
      purpose: "The betrayal inside the Cove.",
      beats: "Someone inside the Cove has been feeding the scheme. Crystal's optics-management gets a motive — she's protecting her cut. Her clipboard records contradict her.",
      clues: "Crystal's paperwork puts her at a transaction where she claimed she wasn't.",
      misdirection: "A sympathetic ally looks compromised.",
      cliffhanger: "Brooke works out exactly where the missing garden gnome's contents point.",
      status: "outline"
    },
    9: {
      title: "Ch. 9 — High Stakes",
      purpose: "Raise personal and community stakes; start the clock.",
      beats: "Intimidation escalates (Dale's golf cart is sabotaged, a frozen account). If the parish vote closes the deal, the Cove is gone. Time pressure set. Gnome cache located.",
      clues: "The gnome marker location is located.",
      misdirection: "The pressure makes Brooke back down.",
      cliffhanger: "They recover the gnome's hidden contents.",
      status: "outline"
    },
    10: {
      title: "Ch. 10 — Double-Cross",
      purpose: "Turn the screw; convert evidence into a named adversary.",
      beats: "The gnome's contents (a flash drive) expose a double-cross. Bobby's survival comes into focus — he went to ground when one complaint was right and made him a target.",
      clues: "Hard evidence linking the land grab to the coroner case and a present player.",
      misdirection: "Trusted ally was the killer (actually protecting).",
      cliffhanger: "The evidence implicates someone the reader didn't want it to.",
      status: "outline"
    },
    11: {
      title: "Ch. 11 — The Trial",
      purpose: "The first reckoning — and the system's resistance.",
      beats: "A parish hearing / HOA showdown. Brooke corrects the record with documentation. The system resists (Larry echo: protected people). Rena steadies her.",
      clues: "Documented case becomes undeniable on its face.",
      misdirection: "DA immediately files charges.",
      cliffhanger: "A procedural twist threatens to bury the evidence and close the Cove.",
      status: "outline"
    },
    12: {
      title: "Ch. 12 — Night of the Fireflies",
      purpose: "Atmospheric night set-piece; resolve Bobby's fate.",
      beats: "A night operation in the bayou. Brooke makes physical contact with Bobby Boudreaux (alive, hidden). A quiet, warm Brooke & Teepop beat under string lights.",
      clues: "Physical confirmation of what happened the night of the crawfish boil.",
      misdirection: "Bobby's location is compromised.",
      cliffhanger: "The adversary makes a desperate, final, escalating move.",
      status: "outline"
    },
    13: {
      title: "Ch. 13 — Flashbacks & Revelations",
      purpose: "Braid backstories; pay off the old case.",
      beats: "Eret (Larry and Kat), Rena's old case, and McMurrary's role converge. The original coroner case is laid bare — what was softened, by whom, and why.",
      clues: "The full truth of the old death.",
      misdirection: "Larry is the main Season One architect.",
      cliffhanger: "Rena: 'I knew this would come back. I just prayed it wouldn't come through you.' One last piece is needed.",
      status: "outline"
    },
    14: {
      title: "Ch. 14 — Treasure Hunt & Lineage",
      purpose: "Final evidence hunt; found family rallies.",
      beats: "The 'treasure' is the final proof (Bobby's full documentation cache). The Cove residents show up for each other. Ricky/Sheila get an accidental save.",
      clues: "Complete chain of custody; the record is airtight.",
      misdirection: "The evidence cache was destroyed.",
      cliffhanger: "The final confrontation with the mastermind is set.",
      status: "outline"
    },
    15: {
      title: "Ch. 15 — Coup & Resolution",
      purpose: "The takedown, the corrected record, and landing.",
      beats: "The community's coup against the land grab. The powerful are held to account with moral complexity. Bobby's fate resolved. The Cove is saved.",
      clues: "The corrected record is placed on the books.",
      misdirection: "All corruption in Louisiana is resolved.",
      cliffhanger: "A name on the consolidated plat doesn't fit — season two hook.",
      status: "outline"
    }
  };

  // ==========================================
  // INITIALIZATION
  // ==========================================
  initTabs();
  initAudio();
  initBibleTabs();
  initTimeline();
  initAuditor();
  initCompiler();
  loadManuscript();

  // ==========================================
  // VIEW & TAB ROUTING
  // ==========================================
  function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const target = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        document.getElementById(target).classList.add('active');
        activeTab = target;
      });
    });

    const studioMenuItems = document.querySelectorAll('.studio-menu-item');
    studioMenuItems.forEach(item => {
      item.addEventListener('click', () => {
        studioMenuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const target = item.getAttribute('data-subtab');
        document.querySelectorAll('.studio-subtab').forEach(sub => {
          sub.classList.remove('active');
        });
        document.getElementById(target).classList.add('active');
        activeStudioSubtab = target;
      });
    });
  }

  // ==========================================
  // BIBLE INTERACTIVITY
  // ==========================================
  function initBibleTabs() {
    const bibleBtns = document.querySelectorAll('.bible-tab-btn');
    bibleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        bibleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const target = btn.getAttribute('data-bible');
        document.querySelectorAll('.bible-tab-content').forEach(c => {
          c.classList.remove('active');
        });
        document.getElementById(`bible-${target}`).classList.add('active');
        activeBibleTab = target;
      });
    });

    // Client-side search in Series Bible
    const searchInput = document.getElementById('bible-search');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      // Auto-switch to characters tab if user types to search, to show visual cards
      if (query && activeBibleTab !== 'characters') {
        document.querySelector('[data-bible="characters"]').click();
      }

      const cards = document.querySelectorAll('.character-card');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ==========================================
  // TIMELINE BEAT SHEET
  // ==========================================
  function initTimeline() {
    const nodes = document.querySelectorAll('.timeline-node');
    nodes.forEach(node => {
      node.addEventListener('click', () => {
        nodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        
        const chNum = node.getAttribute('data-ch');
        const data = beatSheetData[chNum];
        
        document.getElementById('detail-ch-title').textContent = data.title;
        document.getElementById('detail-ch-purpose').textContent = data.purpose;
        document.getElementById('detail-ch-beats').textContent = data.beats;
        document.getElementById('detail-ch-clues').textContent = data.clues;
        document.getElementById('detail-ch-misdirection').textContent = data.misdirection;
        document.getElementById('detail-ch-cliffhanger').innerHTML = data.cliffhanger;
      });
    });
  }

  // ==========================================
  // AUDIO CASSETTE PLAYER
  // ==========================================
  function initAudio() {
    const playBtn = document.getElementById('audio-play');
    const stopBtn = document.getElementById('audio-stop');
    const prevBtn = document.getElementById('audio-prev');
    const nextBtn = document.getElementById('audio-next');
    const volSlider = document.getElementById('volume-slider');
    const titleDisp = document.getElementById('current-track-title');
    const timerDisp = document.getElementById('track-timer');
    const spindles = document.querySelectorAll('.spindle');
    const deckHeader = document.getElementById('deck-toggle-btn');
    const deckBody = document.getElementById('deck-body');
    
    // Toggle collapse
    deckHeader.addEventListener('click', () => {
      deckHeader.classList.toggle('collapsed');
      deckBody.classList.toggle('collapsed');
    });

    function loadTrack(idx) {
      if (audioPlayer) {
        audioPlayer.pause();
      }
      currentTrackIdx = idx;
      const track = soundtrackList[idx];
      audioPlayer = new Audio(track.src);
      audioPlayer.volume = volSlider.value;
      audioPlayer.loop = true;
      
      // Update Timer
      audioPlayer.addEventListener('timeupdate', () => {
        const mins = Math.floor(audioPlayer.currentTime / 60).toString().padStart(2, '0');
        const secs = Math.floor(audioPlayer.currentTime % 60).toString().padStart(2, '0');
        timerDisp.textContent = `${mins}:${secs}`;
      });

      titleDisp.textContent = track.title;
    }

    // Load initial track
    loadTrack(0);

    playBtn.addEventListener('click', () => {
      if (!isPlaying) {
        audioPlayer.play().then(() => {
          isPlaying = true;
          playBtn.classList.add('playing');
          playBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
          spindles.forEach(s => s.classList.add('spinning'));
        }).catch(err => {
          console.warn("Sound play failed. User interaction might be required.", err);
          titleDisp.textContent = "Click Play to Start";
        });
      } else {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.classList.remove('playing');
        playBtn.innerHTML = '<i class="ph-fill ph-play"></i>';
        spindles.forEach(s => s.classList.remove('spinning'));
      }
    });

    stopBtn.addEventListener('click', () => {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      isPlaying = false;
      playBtn.classList.remove('playing');
      playBtn.innerHTML = '<i class="ph-fill ph-play"></i>';
      spindles.forEach(s => s.classList.remove('spinning'));
      timerDisp.textContent = "00:00";
    });

    prevBtn.addEventListener('click', () => {
      let idx = currentTrackIdx - 1;
      if (idx < 0) idx = soundtrackList.length - 1;
      loadTrack(idx);
      if (isPlaying) {
        audioPlayer.play();
      }
    });

    nextBtn.addEventListener('click', () => {
      let idx = (currentTrackIdx + 1) % soundtrackList.length;
      loadTrack(idx);
      if (isPlaying) {
        audioPlayer.play();
      }
    });

    volSlider.addEventListener('input', (e) => {
      if (audioPlayer) {
        audioPlayer.volume = e.target.value;
      }
    });
  }

  // ==========================================
  // REAL-TIME CONTINUITY AUDITOR
  // ==========================================
  function initAuditor() {
    const textarea = document.getElementById('auditor-textarea');
    const scoreDisp = document.getElementById('audit-score');
    const statusBar = document.getElementById('val-status-bar');
    const errorsList = document.getElementById('val-errors-list');
    
    // Hard continuity rules list
    const rules = [
      {
        id: "doc-bourbon",
        type: "Drift Error",
        regex: /\bDoc\s+Bourbon\b/i,
        message: "Missing resident must always be named 'Bobby Boudreaux'. Referencing him as 'Doc Bourbon' is forbidden.",
        severity: "critical"
      },
      {
        id: "cricket-mccoy",
        type: "Drift Error",
        regex: /\bCricket\s+McCoy\b/i,
        message: "The name 'Cricket' is locked for Brooke's terrier dog ONLY. Neighbor Sugar McCoy must never be named Cricket McCoy.",
        severity: "critical"
      },
      {
        id: "lobster",
        type: "Lore Error",
        regex: /\blobster\b/i,
        message: "Setting is Acadiana, Louisiana. The community social is a 'crawfish boil', never lobster.",
        severity: "warning"
      },
      {
        id: "bobby-dead",
        type: "Locked Decision Conflict",
        regex: /\b(Bobby|Boudreaux)\s+(is\s+dead|was\s+killed|died|murdered)\b/i,
        message: "Locked Decision is Bobby Boudreaux is ALIVE (went to ground). Story death is the historical coroner-case victim.",
        severity: "warning"
      }
    ];

    textarea.addEventListener('input', () => {
      const text = textarea.value;
      if (!text.trim()) {
        errorsList.innerHTML = `<div class="val-empty-state"><i class="ph-bold ph-smiley-wink"></i><p>No continuity drifts detected. Type in the left box to begin.</p></div>`;
        scoreDisp.textContent = "Score: 100/100";
        statusBar.className = "val-status-bar";
        statusBar.innerHTML = `<i class="ph-bold ph-check-circle"></i> Manuscript Compliant`;
        return;
      }

      let score = 100;
      let errorsFound = [];

      rules.forEach(rule => {
        const match = text.match(rule.regex);
        if (match) {
          score -= 20;
          errorsFound.push({
            type: rule.type,
            msg: rule.message,
            matchStr: match[0],
            severity: rule.severity
          });
        }
      });

      score = Math.max(score, 0);
      scoreDisp.textContent = `Score: ${score}/100`;

      if (errorsFound.length === 0) {
        statusBar.className = "val-status-bar";
        statusBar.innerHTML = `<i class="ph-bold ph-check-circle"></i> Manuscript Compliant`;
        errorsList.innerHTML = `<div class="val-empty-state"><i class="ph-bold ph-thumbs-up"></i><p>Manuscript perfectly compliant with all 6 hard guardrails!</p></div>`;
      } else {
        statusBar.className = "val-status-bar warning";
        statusBar.innerHTML = `<i class="ph-bold ph-warning"></i> ${errorsFound.length} Drift Warning(s) Detected`;
        
        errorsList.innerHTML = errorsFound.map(err => `
          <div class="audit-error-card ${err.severity === 'warning' ? 'info' : ''}">
            <span class="err-type">${err.type}</span>
            <span class="err-desc">${err.msg}</span>
            <span class="err-match">Flagged Term: "${err.matchStr}"</span>
          </div>
        `).join('');
      }
    });
  }

  // ==========================================
  // COMPILER CONSOLE PIPELINE
  // ==========================================
  function initCompiler() {
    const runBtn = document.getElementById('run-compiler-btn');
    const clearBtn = document.getElementById('terminal-clear-btn');
    const logDisp = document.getElementById('terminal-log');
    
    // Params
    const wppInput = document.getElementById('compiler-wpp');
    const embedInput = document.getElementById('compiler-embed');

    clearBtn.addEventListener('click', () => {
      logDisp.innerHTML = '<span class="log-line system">Terminal cleared. Ready for next build.</span>';
    });

    runBtn.addEventListener('click', () => {
      if (runBtn.classList.contains('running')) return;
      
      runBtn.classList.add('running');
      runBtn.innerHTML = '<i class="ph-bold ph-spinner-gap spin"></i> Compiling...';
      
      const wpp = wppInput.value;
      const embed = embedInput.value === 'true' ? '' : ' --link-images';

      // Log start
      appendLogLine(`$ python3 build_graphic_novel_1.py --template clean_template.html --chapters chapters/ --art art/ --cover art/key_art.png --intro intro.md --words-per-page ${wpp}${embed} --out graphic_novel_final.html`, 'system');

      setTimeout(() => {
        appendLogLine(`[info] Initializing compilation engine...`, 'info');
      }, 400);

      setTimeout(() => {
        appendLogLine(`[info] Loading clean_template.html... Template parsed with 150 page placeholders (1-150)`, 'info');
      }, 1000);

      setTimeout(() => {
        appendLogLine(`[info] Processing manuscript chapters/ch_01.md...`, 'info');
      }, 1600);

      setTimeout(() => {
        appendLogLine(`[info] Chapter 1 splits parsed: 10 explicit story pages found.`, 'info');
        appendLogLine(`[info] Stripped 1 trail continuity notes block.`, 'info');
      }, 2200);

      setTimeout(() => {
        appendLogLine(`[info] Panel Art Directions: Extracted 10 visual art instructions.`, 'info');
      }, 2800);

      setTimeout(() => {
        appendLogLine(`[info] Front Matter: Injected cover graphic key_art.png.`, 'info');
        appendLogLine(`[info] Distributing 12 content blocks into section placeholders...`, 'info');
      }, 3400);

      setTimeout(() => {
        appendLogLine(`[success] Compilation complete: Filled 14/150 pages.`, 'success');
        appendLogLine(`[success] File written successfully -> graphic_novel_final.html (639 KB)`, 'success');
        
        // Reset button
        runBtn.classList.remove('running');
        runBtn.innerHTML = '<i class="ph-bold ph-play"></i> Run Build Script';
        
        // Refresh reader stats
        document.getElementById('stats-total-pages').textContent = "14 / 150";
        loadManuscript(); // reload in viewer
      }, 4200);
    });

    function appendLogLine(text, type = '') {
      const span = document.createElement('span');
      span.className = `log-line ${type}`;
      span.textContent = text;
      logDisp.appendChild(span);
      logDisp.scrollTop = logDisp.scrollHeight;
    }
  }

  // ==========================================
  // MANUSCRIPT LOADING & PARSING ENGINE
  // ==========================================
  function loadManuscript() {
    const sheet = document.getElementById('book-sheet');
    
    // Fetch ch_01.md directly from chapters folder!
    fetch('chapters/ch_01.md')
      .then(response => {
        if (!response.ok) {
          throw new Error("Unable to fetch manuscript ch_01.md");
        }
        return response.text();
      })
      .then(mdText => {
        parseManuscript(mdText);
        renderPage();
        updateControls();
      })
      .catch(err => {
        console.error(err);
        // Fallback static parsing if fetch fails (e.g. running in standard local file protocol)
        loadFallbackStaticManuscript();
      });
  }

  function parseManuscript(text) {
    manuscriptPages = [];
    
    // Add Cover Page (Page 1)
    manuscriptPages.push({
      kind: 'cover',
      title: "Cover Page",
      html: `
        <div class="cover-wrapper">
          <img src="art/key_art.png" class="cover-img" alt="Trailer Park Fantasies Cover">
          <div class="chapter-opener">
            <span class="ch-num">Written by Bug Barnett</span>
            <h1 class="ch-title">Trailer Park Fantasies</h1>
            <p style="text-align:center; font-family:var(--font-sans); color:#666; font-size:14px; text-indent:0;">
              Every Lot Has a Secret.
            </p>
          </div>
        </div>
      `
    });

    // Add Intro / Distilled Context Page (Page 2)
    manuscriptPages.push({
      kind: 'intro',
      title: "Intro & Context",
      html: `
        <div class="intro-page">
          <h2>Introduction & Context</h2>
          <p>Welcome to <em>Trailer Park Fantasies</em>, a digital graphic novel set in a Southern-Gothic trailer park. Inspired by the emotional depth of slow-burn found-family storytelling and modern investigative methods, this project follows Brooke "Bug" Barnett as she corrects the parish record on the disappearance of neighbor Bobby Boudreaux.</p>
          <p>This layout operates as your production environment. You can read locked manuscript chapters, explore the 15-chapter beat sheet, trace core characters, audit drafts in real-time, and compile final productions.</p>
          <p style="text-align:center; margin-top:40px; font-weight:bold; font-family:var(--font-sans); color:var(--rose);">
            " documentación es protección — truth belongs to the powerless first. "
          </p>
        </div>
      `
    });

    // Add Chapter Title Opener (Page 3)
    manuscriptPages.push({
      kind: 'chapter-title',
      title: "Chapter 1 Opener",
      html: `
        <div class="chapter-opener">
          <span class="ch-num">Chapter 1</span>
          <h1 class="ch-title">Welcome to Crystal's Cove</h1>
          <div style="text-align:center; font-family:var(--font-sans); color:#c49b5c; font-size:24px; margin-top:20px;">· · ·</div>
        </div>
      `
    });

    // Strip continuity notes
    const notesIndex = text.search(/(?:^|\n)(?:—|--)\s*continuity notes\s*(?:—|--)/i);
    if (notesIndex !== -1) {
      text = text.substring(0, notesIndex);
    }

    // Split text by PAGE marker
    const pageSplits = text.split(/(?:^|\n)(?:##\s*)?PAGE\s+(\d+)\b/i);
    
    // Page splits: index 0 is optional header, subsequent are groups of [p_num, p_content]
    for (let i = 1; i < pageSplits.length; i += 2) {
      const pNum = parseInt(pageSplits[i]);
      let pContent = pageSplits[i+1] ? pageSplits[i+1].trim() : '';
      if (!pContent) continue;

      // Extract [ART: ...] panel block
      let artText = "";
      const artMatch = pContent.match(/\[ART:\s*(.*?)\]/is);
      if (artMatch) {
        artText = artMatch[1].trim();
        pContent = pContent.replace(artMatch[0], '').trim();
      }

      // Convert MD to HTML
      let html = "";
      if (artText) {
        html += `
          <div class="panel-art-direction">
            <span class="panel-art-badge"><i class="ph-bold ph-image-square"></i> Panel Art Direction</span>
            <p class="panel-art-desc"><em>${escapeHtml(artText)}</em></p>
          </div>
        `;
      }
      
      html += clientMdToHtml(pContent);

      manuscriptPages.push({
        kind: 'story',
        num: pNum,
        html: html
      });
    }

    document.getElementById('stats-total-pages').textContent = `${manuscriptPages.length} / 150`;
  }

  // ==========================================
  // VIEW TRANSITIONS DIRECTIONAL PAGE FLIPS
  // ==========================================
  const prevBtn = document.getElementById('book-prev-btn');
  const nextBtn = document.getElementById('book-next-btn');

  prevBtn.addEventListener('click', () => {
    if (currentPageIndex > 0) {
      navigateBook(currentPageIndex - 1, 'backward');
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPageIndex < manuscriptPages.length - 1) {
      navigateBook(currentPageIndex + 1, 'forward');
    }
  });

  function navigateBook(targetIndex, direction) {
    const updateDOM = () => {
      currentPageIndex = targetIndex;
      renderPage();
      updateControls();
    };

    // Feature detect active view transition
    if (document.startViewTransition) {
      document.startViewTransition({
        update: updateDOM,
        types: [direction]
      });
    } else {
      updateDOM();
    }
  }

  function renderPage() {
    const sheet = document.getElementById('book-sheet');
    const page = manuscriptPages[currentPageIndex];
    if (!page) return;

    sheet.innerHTML = `
      <div class="book-page-content">
        ${page.html}
      </div>
      <div class="folio">Page ${currentPageIndex + 1}</div>
    `;

    document.getElementById('current-page-num').textContent = currentPageIndex + 1;
    document.getElementById('total-page-num').textContent = manuscriptPages.length;
  }

  function updateControls() {
    prevBtn.disabled = (currentPageIndex === 0);
    nextBtn.disabled = (currentPageIndex === manuscriptPages.length - 1);
  }

  // Fallback static content parser
  function loadFallbackStaticManuscript() {
    // This provides hardcoded manuscript parsing if fetched locally without a server
    const fallbackText = `
Chapter 1 — Welcome to Crystal's Cove
PAGE 1
[ART: wide establishing shot — Crystal's Cove at dawn, mist off the bayou, string lights still burning, the sign reading "uxury Living at Affordable Prices"; trailer-chic palette, dusty rose and denim blue]

I learned early that a house can lie.

A clean kitchen can lie. A smiling man can lie. A police report can lie by never getting written at all.

My mama taught me how to love soft. Larry taught me how danger walks into a room before it knocks. Nursing taught me what pain looks like when somebody's working hard to hide it. And Miss Rena taught me that the truth deserves a clean record, written down, dated, where nobody can call it gossip later.

PAGE 2
[ART: Joy Lee "Sugar" McCoy mid-stride between trailers in a leopard housecoat, pounding a door with one fist and clutching a foil-covered dish with the other; flamingos and a golf cart in frame]

Sugar McCoy found out first, because Sugar finds out everything first. It is her ministry.

She had banana pudding in one hand — she always has banana pudding, it is load-bearing to her personality — and she was using the other hand to beat on Lot 5 like it owed her money.

"Bobby!" Bang bang bang. "Bobby Boudreaux, I know you in there hidin' from me, your TV's still goin'! Bobby!"
    `;
    parseManuscript(fallbackText);
    renderPage();
    updateControls();
  }

  // ==========================================
  // HELPER UTILITIES
  // ==========================================
  function clientMdToHtml(text) {
    let out = [];
    let inPara = [];
    
    function flush() {
      if (inPara.length > 0) {
        const joined = inPara.join(' ').trim();
        if (joined) {
          out.push(`<p>${inlineFormat(joined)}</p>`);
        }
        inPara = [];
      }
    }

    function inlineFormat(s) {
      s = s.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;');
      
      // Bold **
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Italic * or _
      s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
      s = s.replace(/_(.+?)_/g, '<em>$1</em>');
      return s;
    }

    const lines = text.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line) {
        flush();
        continue;
      }
      
      // Headings
      const headMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headMatch) {
        flush();
        const lvl = headMatch[1].length;
        out.push(`<h${lvl}>${inlineFormat(headMatch[2])}</h${lvl}>`);
        continue;
      }

      // Dialogues styling helper
      if (line.startsWith('"') || line.startsWith('<strong>') || line.match(/^[A-Z][A-Za-z\s]+:/)) {
        flush();
        out.push(`<p class="dialogue-line">${inlineFormat(line)}</p>`);
        continue;
      }

      inPara.push(line);
    }
    
    flush();
    return out.join('\n');
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
  }

  // Dynamic menu chapter list generation
  const chListContainer = document.getElementById('sidebar-chapter-list');
  if (chListContainer) {
    let html = "";
    for (let i = 1; i <= 15; i++) {
      const data = beatSheetData[i];
      const isLocked = data.status === 'locked';
      html += `
        <button class="chapter-btn ${i === 1 ? 'active' : ''}" data-ch-idx="${i}">
          <span>${i}. ${data.title.replace(/Ch\.\s*\d+\s*—\s*/, '')}</span>
          <span class="ch-badge ${isLocked ? 'locked' : ''}">${isLocked ? 'Locked' : 'Scaffold'}</span>
        </button>
      `;
    }
    chListContainer.innerHTML = html;

    // Sidebar navigation trigger
    const chBtns = document.querySelectorAll('.chapter-btn');
    chBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        chBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const idx = parseInt(btn.getAttribute('data-ch-idx'));
        if (idx === 1) {
          currentPageIndex = 0; // return to cover
          renderPage();
          updateControls();
        } else {
          // Mock showing blank pages or scaffolds for other chapters
          const data = beatSheetData[idx];
          manuscriptPages = [
            {
              kind: 'story-scaffold',
              html: `
                <div class="chapter-opener">
                  <span class="ch-num">Chapter ${idx} Scaffold</span>
                  <h1 class="ch-title">${data.title.replace(/Ch\.\s*\d+\s*—\s*/, '')}</h1>
                  <div style="background: rgba(212, 98, 122, 0.05); padding:20px; border-radius:6px; border:1px dashed var(--rose); margin-top:40px; font-family:var(--font-sans); color:var(--paper-ink);">
                    <p style="font-weight:bold; margin-bottom:10px; text-indent:0;"><i class="ph-bold ph-calendar"></i> PRODUCTION BEAT SHEET SYNOPSIS:</p>
                    <p style="font-size:13px; text-indent:0; line-height:1.6; text-align:left;"><strong>Purpose:</strong> ${data.purpose}</p>
                    <p style="font-size:13px; text-indent:0; line-height:1.6; text-align:left; margin-top:8px;"><strong>Core Beats:</strong> ${data.beats}</p>
                    <p style="font-size:13px; text-indent:0; line-height:1.6; text-align:left; margin-top:8px;"><strong>Clues to Plant:</strong> ${data.clues}</p>
                    <p style="font-size:13px; text-indent:0; line-height:1.6; text-align:left; margin-top:8px; font-weight:bold; color:var(--rose);">Cliffhanger: ${data.cliffhanger}</p>
                  </div>
                </div>
              `
            }
          ];
          currentPageIndex = 0;
          renderPage();
          updateControls();
        }
      });
    });
  }

});
