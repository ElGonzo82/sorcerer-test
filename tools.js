const tools = {
  'sprite-analyzer': {
    name: 'Sprite Analyzer',
    icon: '🖼️',
    description: 'Upload a spritesheet, set frame size, and export frame data.',
    render: renderSpriteAnalyzer,
  },
  'sfx-editor': {
    name: 'SFX Editor',
    icon: '🔊',
    description: 'Preview, trim, and normalize audio clips locally.',
    render: renderSfxEditor,
  },
  tilesets: {
    name: 'Tilesets',
    icon: '🗺️',
    description: 'Preview a tileset as a repeatable background.',
    render: renderTilesets,
  },
  slicer: {
    name: 'Slicer',
    icon: '✂️',
    description: 'Slice spritesheets into frames and download them.',
    render: renderSlicer,
  },
  notes: {
    name: 'Notes',
    icon: '📝',
    description: 'Autosaved project notes stored in your browser.',
    render: renderNotes,
  },
  utils: {
    name: 'Image Utilities',
    icon: '📸',
    description: 'Resize, compress, and convert images locally.',
    render: renderImageUtils,
  },
  'audio-utils': {
    name: 'Audio Utilities',
    icon: '🎵',
    description: 'Normalize and trim audio with simple presets.',
    render: renderAudioUtils,
  },
  'video-utils': {
    name: 'Video Utilities',
    icon: '🎥',
    description: 'Handy FFmpeg recipes to run locally.',
    render: renderVideoUtils,
  },
  'particle-designer': {
    name: 'Particle Designer',
    icon: '💫',
    description: 'Save effect recipes for Phaser-style emitters.',
    render: renderParticleDesigner,
  },
  spelljammer: {
    name: 'Spelljammer',
    icon: '🔮',
    description: 'Draft spell effect configs and save locally.',
    render: renderSpelljammer,
  },
  imgen: {
    name: 'ImGen',
    icon: '🎨',
    description: 'Prompt builder for image generation pipelines.',
    render: renderImgen,
  },
  vidgen: {
    name: 'VidGen',
    icon: '🎬',
    description: 'Storyboard helper for video generation.',
    render: renderVidgen,
  },
  games: {
    name: 'Games',
    icon: '🎮',
    description: 'Launch local builds inside a responsive frame.',
    render: renderGamesPreview,
  },
  layout: {
    name: 'Layout',
    icon: '📐',
    description: 'Preview breakpoints with a simulated device frame.',
    render: renderLayoutPreview,
  },
  'bg-remover': {
    name: 'BG Remover',
    icon: '🪄',
    description: 'Local checklist + queue for background removal tasks.',
    render: renderBgRemover,
  },
  expander: {
    name: 'Expander',
    icon: '🔲',
    description: 'Outpainting task manager for your local pipeline.',
    render: renderExpander,
  },
};

const params = new URLSearchParams(window.location.search);
const toolKey = params.get('tool') || 'notes';
const activeTool = tools[toolKey] || tools.notes;

const toolTitle = document.getElementById('tool-title');
const toolSubtitle = document.getElementById('tool-subtitle');
const toolIcon = document.getElementById('tool-icon');
const toolPanel = document.getElementById('tool-panel');

if (toolTitle && toolSubtitle && toolIcon && toolPanel) {
  toolTitle.textContent = activeTool.name;
  toolSubtitle.textContent = activeTool.description;
  toolIcon.textContent = activeTool.icon;
  activeTool.render(toolPanel);
}

function renderNotes(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group" style="grid-column: 1 / -1;">
        <label for="notes">Project Notes</label>
        <textarea id="notes" rows="12" placeholder="Capture ideas, TODOs, and build notes..."></textarea>
      </div>
      <div class="field-group">
        <label>Saved Status</label>
        <div class="tool-output" id="notes-status">Not saved yet.</div>
      </div>
    </div>
  `;

  const textarea = container.querySelector('#notes');
  const status = container.querySelector('#notes-status');
  const storageKey = 'sorcerer-notes';

  if (textarea) {
    textarea.value = localStorage.getItem(storageKey) || '';
    textarea.addEventListener('input', () => {
      localStorage.setItem(storageKey, textarea.value);
      if (status) {
        status.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
      }
    });
  }
}

function renderSpriteAnalyzer(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="sprite-upload">Spritesheet</label>
        <input id="sprite-upload" type="file" accept="image/*" />
      </div>
      <div class="field-group">
        <label for="frame-width">Frame Width (px)</label>
        <input id="frame-width" type="number" value="64" min="1" />
      </div>
      <div class="field-group">
        <label for="frame-height">Frame Height (px)</label>
        <input id="frame-height" type="number" value="64" min="1" />
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="primary-btn" id="export-frames">Export Frame Data</button>
      </div>
    </div>
    <div class="tool-panel canvas-frame">
      <canvas id="sprite-canvas"></canvas>
    </div>
    <div class="tool-panel">
      <div class="tool-output" id="frame-data">Frame data will appear here.</div>
    </div>
  `;

  const canvas = container.querySelector('#sprite-canvas');
  const upload = container.querySelector('#sprite-upload');
  const widthInput = container.querySelector('#frame-width');
  const heightInput = container.querySelector('#frame-height');
  const output = container.querySelector('#frame-data');
  const exportButton = container.querySelector('#export-frames');
  const ctx = canvas.getContext('2d');
  const image = new Image();

  function drawGrid() {
    if (!image.src) return;
    const frameWidth = Number(widthInput.value || 1);
    const frameHeight = Number(heightInput.value || 1);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    for (let x = 0; x <= image.width; x += frameWidth) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, image.height);
      ctx.stroke();
    }
    for (let y = 0; y <= image.height; y += frameHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(image.width, y);
      ctx.stroke();
    }
  }

  upload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    image.onload = drawGrid;
    image.src = URL.createObjectURL(file);
  });

  widthInput.addEventListener('input', drawGrid);
  heightInput.addEventListener('input', drawGrid);

  exportButton.addEventListener('click', () => {
    if (!image.src) return;
    const frameWidth = Number(widthInput.value || 1);
    const frameHeight = Number(heightInput.value || 1);
    const frames = [];
    for (let y = 0; y < image.height; y += frameHeight) {
      for (let x = 0; x < image.width; x += frameWidth) {
        frames.push({ x, y, width: frameWidth, height: frameHeight });
      }
    }
    output.textContent = JSON.stringify({
      image: { width: image.width, height: image.height },
      frameWidth,
      frameHeight,
      frames,
    }, null, 2);
  });
}

function renderSfxEditor(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="audio-upload">Audio File</label>
        <input id="audio-upload" type="file" accept="audio/*" />
      </div>
      <div class="field-group">
        <label for="trim-start">Trim Start (sec)</label>
        <input id="trim-start" type="number" min="0" value="0" step="0.1" />
      </div>
      <div class="field-group">
        <label for="trim-end">Trim End (sec)</label>
        <input id="trim-end" type="number" min="0" value="0" step="0.1" />
      </div>
      <div class="field-group">
        <label for="volume">Volume</label>
        <input id="volume" type="range" min="0" max="2" step="0.05" value="1" />
      </div>
    </div>
    <div class="tool-panel">
      <audio id="audio-player" controls style="width: 100%;"></audio>
      <p class="section-subtitle" style="margin-top: 16px;">Use the trim values to audition a section.</p>
      <button class="primary-btn" id="play-selection">Play Selection</button>
      <div class="tool-output" id="audio-status">Upload a clip to begin.</div>
    </div>
  `;

  const upload = container.querySelector('#audio-upload');
  const player = container.querySelector('#audio-player');
  const trimStart = container.querySelector('#trim-start');
  const trimEnd = container.querySelector('#trim-end');
  const volume = container.querySelector('#volume');
  const playSelection = container.querySelector('#play-selection');
  const status = container.querySelector('#audio-status');

  upload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    player.src = URL.createObjectURL(file);
    status.textContent = `Loaded ${file.name}`;
  });

  volume.addEventListener('input', () => {
    player.volume = Number(volume.value);
  });

  playSelection.addEventListener('click', () => {
    const start = Number(trimStart.value || 0);
    const end = Number(trimEnd.value || 0);
    if (!player.src) return;
    player.currentTime = start;
    player.play();
    if (end > start) {
      const duration = (end - start) * 1000;
      setTimeout(() => player.pause(), duration);
    }
  });
}

function renderTilesets(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="tile-upload">Tileset Image</label>
        <input id="tile-upload" type="file" accept="image/*" />
      </div>
      <div class="field-group">
        <label for="tile-scale">Preview Scale</label>
        <input id="tile-scale" type="range" min="0.5" max="3" step="0.1" value="1" />
      </div>
    </div>
    <div class="tool-panel canvas-frame">
      <canvas id="tile-canvas" width="800" height="400"></canvas>
    </div>
  `;

  const upload = container.querySelector('#tile-upload');
  const scale = container.querySelector('#tile-scale');
  const canvas = container.querySelector('#tile-canvas');
  const ctx = canvas.getContext('2d');
  let image = null;

  function drawTiles() {
    if (!image) return;
    const tileScale = Number(scale.value);
    const tileWidth = image.width * tileScale;
    const tileHeight = image.height * tileScale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += tileHeight) {
      for (let x = 0; x < canvas.width; x += tileWidth) {
        ctx.drawImage(image, x, y, tileWidth, tileHeight);
      }
    }
  }

  upload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    image = new Image();
    image.onload = drawTiles;
    image.src = URL.createObjectURL(file);
  });

  scale.addEventListener('input', drawTiles);
}

function renderSlicer(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="slice-upload">Spritesheet</label>
        <input id="slice-upload" type="file" accept="image/*" />
      </div>
      <div class="field-group">
        <label for="slice-width">Frame Width (px)</label>
        <input id="slice-width" type="number" min="1" value="64" />
      </div>
      <div class="field-group">
        <label for="slice-height">Frame Height (px)</label>
        <input id="slice-height" type="number" min="1" value="64" />
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="primary-btn" id="slice-button">Slice Frames</button>
      </div>
    </div>
    <div class="tool-panel" id="slice-output"></div>
  `;

  const upload = container.querySelector('#slice-upload');
  const widthInput = container.querySelector('#slice-width');
  const heightInput = container.querySelector('#slice-height');
  const button = container.querySelector('#slice-button');
  const output = container.querySelector('#slice-output');
  const image = new Image();

  upload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    image.src = URL.createObjectURL(file);
  });

  button.addEventListener('click', () => {
    if (!image.src) return;
    const frameWidth = Number(widthInput.value || 1);
    const frameHeight = Number(heightInput.value || 1);
    output.innerHTML = '';
    const fragment = document.createDocumentFragment();
    let frameIndex = 0;
    for (let y = 0; y < image.height; y += frameHeight) {
      for (let x = 0; x < image.width; x += frameWidth) {
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, x, y, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `frame-${frameIndex}.png`;
        link.className = 'tool-output';
        link.style.display = 'inline-block';
        link.style.margin = '6px';
        link.appendChild(canvas);
        fragment.appendChild(link);
        frameIndex += 1;
      }
    }
    output.appendChild(fragment);
  });
}

function renderImageUtils(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="image-upload">Image</label>
        <input id="image-upload" type="file" accept="image/*" />
      </div>
      <div class="field-group">
        <label for="resize-width">Width (px)</label>
        <input id="resize-width" type="number" min="1" />
      </div>
      <div class="field-group">
        <label for="resize-height">Height (px)</label>
        <input id="resize-height" type="number" min="1" />
      </div>
      <div class="field-group">
        <label for="format">Export Format</label>
        <select id="format">
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPG</option>
        </select>
      </div>
      <div class="field-group">
        <label for="quality">Quality (JPG)</label>
        <input id="quality" type="range" min="0.4" max="1" step="0.05" value="0.9" />
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="primary-btn" id="export-image">Export Image</button>
      </div>
    </div>
    <div class="tool-panel canvas-frame">
      <canvas id="image-canvas"></canvas>
    </div>
  `;

  const upload = container.querySelector('#image-upload');
  const widthInput = container.querySelector('#resize-width');
  const heightInput = container.querySelector('#resize-height');
  const format = container.querySelector('#format');
  const quality = container.querySelector('#quality');
  const exportButton = container.querySelector('#export-image');
  const canvas = container.querySelector('#image-canvas');
  const ctx = canvas.getContext('2d');
  const image = new Image();

  function drawImage() {
    if (!image.src) return;
    const width = Number(widthInput.value || image.width);
    const height = Number(heightInput.value || image.height);
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, width, height);
  }

  upload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    image.onload = () => {
      widthInput.value = image.width;
      heightInput.value = image.height;
      drawImage();
    };
    image.src = URL.createObjectURL(file);
  });

  widthInput.addEventListener('input', drawImage);
  heightInput.addEventListener('input', drawImage);

  exportButton.addEventListener('click', () => {
    if (!image.src) return;
    const mime = format.value;
    const downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL(mime, Number(quality.value));
    downloadLink.download = `export.${mime === 'image/png' ? 'png' : 'jpg'}`;
    downloadLink.click();
  });
}

function renderAudioUtils(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="audio-upload">Audio File</label>
        <input id="audio-upload" type="file" accept="audio/*" />
      </div>
      <div class="field-group">
        <label for="fade-duration">Fade Duration (sec)</label>
        <input id="fade-duration" type="number" min="0" value="0.5" step="0.1" />
      </div>
      <div class="field-group">
        <label for="audio-volume">Normalize Volume</label>
        <input id="audio-volume" type="range" min="0.5" max="1.5" step="0.05" value="1" />
      </div>
    </div>
    <div class="tool-panel">
      <audio id="audio-preview" controls style="width: 100%;"></audio>
      <div class="tool-output">Use these settings as quick references while editing audio in your DAW.</div>
    </div>
  `;

  const upload = container.querySelector('#audio-upload');
  const preview = container.querySelector('#audio-preview');
  const volume = container.querySelector('#audio-volume');

  upload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
  });

  volume.addEventListener('input', () => {
    preview.volume = Number(volume.value);
  });
}

function renderVideoUtils(container) {
  container.innerHTML = `
    <div class="tool-panel">
      <p class="section-subtitle">Suggested FFmpeg recipes</p>
      <div class="tool-output">
        Resize to 1080p:
        ffmpeg -i input.mp4 -vf scale=1920:1080 -crf 22 output-1080.mp4

        Compress video:
        ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow output-compressed.mp4

        Extract frames:
        ffmpeg -i input.mp4 -vf fps=12 frames/out-%03d.png
      </div>
    </div>
  `;
}

function renderGamesPreview(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="game-url">Local Game URL</label>
        <input id="game-url" type="text" placeholder="http://localhost:8080" />
      </div>
      <div class="field-group">
        <label for="device-size">Device Size</label>
        <select id="device-size">
          <option value="1280x720">1280x720 (Desktop)</option>
          <option value="1024x768">1024x768 (Tablet)</option>
          <option value="375x667">375x667 (Mobile)</option>
        </select>
      </div>
    </div>
    <div class="tool-panel canvas-frame">
      <iframe id="game-frame" title="Game Preview" style="width: 100%; height: 540px; border: none;"></iframe>
    </div>
  `;

  const urlInput = container.querySelector('#game-url');
  const sizeSelect = container.querySelector('#device-size');
  const frame = container.querySelector('#game-frame');

  function updateFrame() {
    const [width, height] = sizeSelect.value.split('x');
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    frame.src = urlInput.value || 'about:blank';
  }

  urlInput.addEventListener('change', updateFrame);
  sizeSelect.addEventListener('change', updateFrame);
}

function renderLayoutPreview(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="layout-url">Local Page URL</label>
        <input id="layout-url" type="text" placeholder="http://localhost:3000" />
      </div>
      <div class="field-group">
        <label for="layout-width">Width (px)</label>
        <input id="layout-width" type="number" value="1024" />
      </div>
      <div class="field-group">
        <label for="layout-height">Height (px)</label>
        <input id="layout-height" type="number" value="640" />
      </div>
    </div>
    <div class="tool-panel canvas-frame">
      <iframe id="layout-frame" title="Layout Preview" style="width: 100%; height: 540px; border: none;"></iframe>
    </div>
  `;

  const urlInput = container.querySelector('#layout-url');
  const widthInput = container.querySelector('#layout-width');
  const heightInput = container.querySelector('#layout-height');
  const frame = container.querySelector('#layout-frame');

  function updateFrame() {
    frame.style.width = `${widthInput.value}px`;
    frame.style.height = `${heightInput.value}px`;
    frame.src = urlInput.value || 'about:blank';
  }

  urlInput.addEventListener('change', updateFrame);
  widthInput.addEventListener('input', updateFrame);
  heightInput.addEventListener('input', updateFrame);
}

function renderParticleDesigner(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="particle-name">Effect Name</label>
        <input id="particle-name" type="text" placeholder="Arcane Burst" />
      </div>
      <div class="field-group">
        <label for="particle-count">Emission Count</label>
        <input id="particle-count" type="number" min="1" value="40" />
      </div>
      <div class="field-group">
        <label for="particle-lifespan">Lifespan (ms)</label>
        <input id="particle-lifespan" type="number" min="100" value="1200" />
      </div>
      <div class="field-group">
        <label for="particle-color">Primary Color</label>
        <input id="particle-color" type="text" value="#a855f7" />
      </div>
      <div class="field-group" style="grid-column: 1 / -1;">
        <label for="particle-notes">Notes</label>
        <textarea id="particle-notes" rows="5" placeholder="Describe the emitter behavior..."></textarea>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="primary-btn" id="save-particle">Save Recipe</button>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="secondary-btn" id="download-particle">Download JSON</button>
      </div>
    </div>
    <div class="tool-panel">
      <div class="tool-output" id="particle-output">Saved recipes will appear here.</div>
    </div>
  `;

  const name = container.querySelector('#particle-name');
  const count = container.querySelector('#particle-count');
  const lifespan = container.querySelector('#particle-lifespan');
  const color = container.querySelector('#particle-color');
  const notes = container.querySelector('#particle-notes');
  const output = container.querySelector('#particle-output');
  const saveButton = container.querySelector('#save-particle');
  const downloadButton = container.querySelector('#download-particle');
  const storageKey = 'sorcerer-particle-recipes';

  const load = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
  const save = (data) => localStorage.setItem(storageKey, JSON.stringify(data));
  const updateOutput = (data) => {
    output.textContent = JSON.stringify(data, null, 2);
  };

  const recipes = load();
  updateOutput(recipes);

  saveButton.addEventListener('click', () => {
    const entry = {
      name: name.value.trim() || 'Unnamed Effect',
      emissionCount: Number(count.value || 0),
      lifespanMs: Number(lifespan.value || 0),
      color: color.value.trim(),
      notes: notes.value.trim(),
      updatedAt: new Date().toISOString(),
    };
    const next = [entry, ...load()].slice(0, 20);
    save(next);
    updateOutput(next);
  });

  downloadButton.addEventListener('click', () => {
    downloadJson('particle-recipes.json', load());
  });
}

function renderSpelljammer(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="spell-name">Spell Name</label>
        <input id="spell-name" type="text" placeholder="Starfall Surge" />
      </div>
      <div class="field-group">
        <label for="spell-element">Element</label>
        <select id="spell-element">
          <option>Arcane</option>
          <option>Fire</option>
          <option>Ice</option>
          <option>Lightning</option>
          <option>Nature</option>
        </select>
      </div>
      <div class="field-group">
        <label for="spell-sequence">Sequence Steps</label>
        <textarea id="spell-sequence" rows="4" placeholder="1. Charge glow\n2. Spiral particles\n3. Burst + sound"></textarea>
      </div>
      <div class="field-group">
        <label for="spell-code">Code Snippet</label>
        <textarea id="spell-code" rows="4" placeholder="Paste emitter config or shader notes here..."></textarea>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="primary-btn" id="save-spell">Save Spell</button>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="secondary-btn" id="download-spell">Download JSON</button>
      </div>
    </div>
    <div class="tool-panel">
      <div class="tool-output" id="spell-output">Spell entries will appear here.</div>
    </div>
  `;

  const name = container.querySelector('#spell-name');
  const element = container.querySelector('#spell-element');
  const sequence = container.querySelector('#spell-sequence');
  const code = container.querySelector('#spell-code');
  const output = container.querySelector('#spell-output');
  const saveButton = container.querySelector('#save-spell');
  const downloadButton = container.querySelector('#download-spell');
  const storageKey = 'sorcerer-spelljammer';

  const load = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
  const save = (data) => localStorage.setItem(storageKey, JSON.stringify(data));
  const updateOutput = (data) => {
    output.textContent = JSON.stringify(data, null, 2);
  };

  updateOutput(load());

  saveButton.addEventListener('click', () => {
    const entry = {
      name: name.value.trim() || 'Unnamed Spell',
      element: element.value,
      sequence: sequence.value.trim(),
      code: code.value.trim(),
      updatedAt: new Date().toISOString(),
    };
    const next = [entry, ...load()].slice(0, 20);
    save(next);
    updateOutput(next);
  });

  downloadButton.addEventListener('click', () => {
    downloadJson('spelljammer.json', load());
  });
}

function renderImgen(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="imgen-mode">Generation Mode</label>
        <select id="imgen-mode">
          <option value="comfyui">ComfyUI (Local)</option>
          <option value="chatgpt">ChatGPT API (Remote)</option>
        </select>
      </div>
      <div class="field-group">
        <label for="comfyui-url">ComfyUI URL</label>
        <input id="comfyui-url" type="text" value="http://127.0.0.1:8188" />
      </div>
      <div class="field-group">
        <label for="prompt">Prompt</label>
        <textarea id="prompt" rows="4" placeholder="Describe the scene or asset..."></textarea>
      </div>
      <div class="field-group">
        <label for="style">Style</label>
        <input id="style" type="text" placeholder="Pixel art, 32x32, vibrant" />
      </div>
      <div class="field-group">
        <label for="negative">Negative Prompts</label>
        <input id="negative" type="text" placeholder="blurry, low-res" />
      </div>
      <div class="field-group">
        <label for="dimensions">Dimensions</label>
        <input id="dimensions" type="text" value="512x512" />
      </div>
      <div class="field-group">
        <label for="chatgpt-model">ChatGPT Model</label>
        <input id="chatgpt-model" type="text" value="gpt-image-1" />
      </div>
      <div class="field-group">
        <label for="chatgpt-key">ChatGPT API Key</label>
        <input id="chatgpt-key" type="password" placeholder="sk-..." />
      </div>
      <div class="field-group" style="grid-column: 1 / -1;">
        <label for="comfyui-workflow">ComfyUI Workflow JSON</label>
        <textarea id="comfyui-workflow" rows="6" placeholder='{"prompt": {...}}'></textarea>
      </div>
      <div class="field-group" style="grid-column: 1 / -1;">
        <label for="model-notes">Model + Pipeline Notes</label>
        <textarea id="model-notes" rows="4" placeholder="Which local model or script will you run?"></textarea>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="primary-btn" id="save-imgen">Save Prompt</button>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="secondary-btn" id="send-imgen">Send Request</button>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="secondary-btn" id="download-imgen">Download JSON</button>
      </div>
    </div>
    <div class="tool-panel">
      <div class="tool-output" id="imgen-output">Saved prompts and API responses will appear here.</div>
    </div>
  `;

  const mode = container.querySelector('#imgen-mode');
  const comfyUrl = container.querySelector('#comfyui-url');
  const prompt = container.querySelector('#prompt');
  const style = container.querySelector('#style');
  const negative = container.querySelector('#negative');
  const dimensions = container.querySelector('#dimensions');
  const chatgptModel = container.querySelector('#chatgpt-model');
  const chatgptKey = container.querySelector('#chatgpt-key');
  const comfyWorkflow = container.querySelector('#comfyui-workflow');
  const notes = container.querySelector('#model-notes');
  const output = container.querySelector('#imgen-output');
  const saveButton = container.querySelector('#save-imgen');
  const sendButton = container.querySelector('#send-imgen');
  const downloadButton = container.querySelector('#download-imgen');
  const storageKey = 'sorcerer-imgen-prompts';
  const settingsKey = 'sorcerer-imgen-settings';

  const load = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
  const save = (data) => localStorage.setItem(storageKey, JSON.stringify(data));
  const updateOutput = (data) => {
    output.textContent = JSON.stringify(data, null, 2);
  };

  updateOutput(load());

  const settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
  if (settings.mode) mode.value = settings.mode;
  if (settings.comfyUrl) comfyUrl.value = settings.comfyUrl;
  if (settings.chatgptModel) chatgptModel.value = settings.chatgptModel;
  if (settings.comfyWorkflow) comfyWorkflow.value = settings.comfyWorkflow;
  if (settings.notes) notes.value = settings.notes;

  const persistSettings = () => {
    localStorage.setItem(settingsKey, JSON.stringify({
      mode: mode.value,
      comfyUrl: comfyUrl.value.trim(),
      chatgptModel: chatgptModel.value.trim(),
      comfyWorkflow: comfyWorkflow.value.trim(),
      notes: notes.value.trim(),
    }));
  };

  mode.addEventListener('change', persistSettings);
  comfyUrl.addEventListener('change', persistSettings);
  chatgptModel.addEventListener('change', persistSettings);
  comfyWorkflow.addEventListener('change', persistSettings);
  notes.addEventListener('change', persistSettings);

  saveButton.addEventListener('click', () => {
    const entry = {
      prompt: prompt.value.trim(),
      style: style.value.trim(),
      negative: negative.value.trim(),
      dimensions: dimensions.value.trim(),
      mode: mode.value,
      comfyUiUrl: comfyUrl.value.trim(),
      chatgptModel: chatgptModel.value.trim(),
      notes: notes.value.trim(),
      updatedAt: new Date().toISOString(),
    };
    const next = [entry, ...load()].slice(0, 20);
    save(next);
    updateOutput(next);
  });

  sendButton.addEventListener('click', async () => {
    const payload = {
      prompt: prompt.value.trim(),
      style: style.value.trim(),
      negative: negative.value.trim(),
      dimensions: dimensions.value.trim(),
      notes: notes.value.trim(),
    };

    if (mode.value === 'comfyui') {
      let workflowPayload = null;
      try {
        workflowPayload = comfyWorkflow.value.trim()
          ? JSON.parse(comfyWorkflow.value.trim())
          : null;
      } catch (error) {
        updateOutput({ error: 'Invalid workflow JSON.' });
        return;
      }

      const requestBody = workflowPayload || {
        prompt: {
          text: payload.prompt,
          style: payload.style,
          negative: payload.negative,
          size: payload.dimensions,
        },
      };

      try {
        const response = await fetch(`${comfyUrl.value.replace(/\\/$/, '')}/prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        const result = await response.json();
        updateOutput({ requestBody, result });
      } catch (error) {
        updateOutput({ error: 'Failed to reach ComfyUI. Ensure it is running locally.', details: String(error) });
      }
      return;
    }

    const apiRequest = {
      model: chatgptModel.value.trim() || 'gpt-image-1',
      prompt: payload.prompt,
      size: payload.dimensions || '512x512',
    };

    const curl = [
      'curl https://api.openai.com/v1/images/generations \\',
      '  -H \"Content-Type: application/json\" \\',
      `  -H \"Authorization: Bearer ${chatgptKey.value.trim() || 'YOUR_API_KEY'}\" \\`,
      `  -d '${JSON.stringify(apiRequest)}'`,
    ].join('\n');

    if (!chatgptKey.value.trim()) {
      updateOutput({ apiRequest, curl, warning: 'Add an API key to send the request.' });
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatgptKey.value.trim()}`,
        },
        body: JSON.stringify(apiRequest),
      });
      const result = await response.json();
      updateOutput({ apiRequest, result });
    } catch (error) {
      updateOutput({ apiRequest, curl, error: 'ChatGPT API request failed. Use the curl command locally.', details: String(error) });
    }
  });

  downloadButton.addEventListener('click', () => {
    downloadJson('imgen-prompts.json', load());
  });
}

function renderVidgen(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="vid-title">Storyboard Title</label>
        <input id="vid-title" type="text" placeholder="Intro Cutscene" />
      </div>
      <div class="field-group">
        <label for="vid-duration">Duration (sec)</label>
        <input id="vid-duration" type="number" min="1" value="8" />
      </div>
      <div class="field-group" style="grid-column: 1 / -1;">
        <label for="vid-beats">Key Beats</label>
        <textarea id="vid-beats" rows="5" placeholder="1. Fog roll-in\n2. Hero reveal\n3. Logo flash"></textarea>
      </div>
      <div class="field-group">
        <label for="vid-audio">Audio Notes</label>
        <input id="vid-audio" type="text" placeholder="Use 'mystic_intro.wav'" />
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="primary-btn" id="save-vidgen">Save Storyboard</button>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="secondary-btn" id="download-vidgen">Download JSON</button>
      </div>
    </div>
    <div class="tool-panel">
      <div class="tool-output" id="vidgen-output">Storyboards will appear here.</div>
    </div>
  `;

  const title = container.querySelector('#vid-title');
  const duration = container.querySelector('#vid-duration');
  const beats = container.querySelector('#vid-beats');
  const audio = container.querySelector('#vid-audio');
  const output = container.querySelector('#vidgen-output');
  const saveButton = container.querySelector('#save-vidgen');
  const downloadButton = container.querySelector('#download-vidgen');
  const storageKey = 'sorcerer-vidgen-storyboards';

  const load = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
  const save = (data) => localStorage.setItem(storageKey, JSON.stringify(data));
  const updateOutput = (data) => {
    output.textContent = JSON.stringify(data, null, 2);
  };

  updateOutput(load());

  saveButton.addEventListener('click', () => {
    const entry = {
      title: title.value.trim() || 'Untitled Storyboard',
      durationSeconds: Number(duration.value || 0),
      beats: beats.value.trim(),
      audioNotes: audio.value.trim(),
      updatedAt: new Date().toISOString(),
    };
    const next = [entry, ...load()].slice(0, 20);
    save(next);
    updateOutput(next);
  });

  downloadButton.addEventListener('click', () => {
    downloadJson('vidgen-storyboards.json', load());
  });
}

function renderBgRemover(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="bg-upload">Upload Image</label>
        <input id="bg-upload" type="file" accept="image/*" />
      </div>
      <div class="field-group">
        <label for="bg-file">Asset Name</label>
        <input id="bg-file" type="text" placeholder="hero-portrait.png" />
      </div>
      <div class="field-group">
        <label for="bg-method">Removal Method</label>
        <select id="bg-method">
          <option>Local Script</option>
          <option>Photoshop</option>
          <option>Online API</option>
        </select>
      </div>
      <div class="field-group" style="grid-column: 1 / -1;">
        <label for="bg-notes">Notes</label>
        <textarea id="bg-notes" rows="4" placeholder="Mask details, transparency notes, export target..."></textarea>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="primary-btn" id="save-bg">Save Task</button>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="secondary-btn" id="download-bg">Download JSON</button>
      </div>
    </div>
    <div class="tool-panel">
      <div class="canvas-frame" style="margin-bottom: 12px;">
        <img id="bg-preview" alt="Preview" style="max-width: 100%; display: none;" />
      </div>
      <div class="tool-output" id="bg-output">Queued tasks will appear here.</div>
    </div>
  `;

  const upload = container.querySelector('#bg-upload');
  const file = container.querySelector('#bg-file');
  const method = container.querySelector('#bg-method');
  const notes = container.querySelector('#bg-notes');
  const preview = container.querySelector('#bg-preview');
  const output = container.querySelector('#bg-output');
  const saveButton = container.querySelector('#save-bg');
  const downloadButton = container.querySelector('#download-bg');
  const storageKey = 'sorcerer-bg-remover';

  const load = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
  const save = (data) => localStorage.setItem(storageKey, JSON.stringify(data));
  const updateOutput = (data) => {
    output.textContent = JSON.stringify(data, null, 2);
  };

  updateOutput(load());

  upload.addEventListener('change', (event) => {
    const selected = event.target.files[0];
    if (!selected) return;
    preview.src = URL.createObjectURL(selected);
    preview.style.display = 'block';
    if (!file.value.trim()) {
      file.value = selected.name;
    }
  });

  saveButton.addEventListener('click', () => {
    const entry = {
      asset: file.value.trim(),
      method: method.value,
      notes: notes.value.trim(),
      updatedAt: new Date().toISOString(),
    };
    const next = [entry, ...load()].slice(0, 20);
    save(next);
    updateOutput(next);
  });

  downloadButton.addEventListener('click', () => {
    downloadJson('bg-remover.json', load());
  });
}

function renderExpander(container) {
  container.innerHTML = `
    <div class="tool-grid">
      <div class="field-group">
        <label for="expand-upload">Upload Image</label>
        <input id="expand-upload" type="file" accept="image/*" />
      </div>
      <div class="field-group">
        <label for="expand-asset">Asset Name</label>
        <input id="expand-asset" type="text" placeholder="forest-background.png" />
      </div>
      <div class="field-group">
        <label for="expand-size">Target Size</label>
        <input id="expand-size" type="text" value="2048x1024" />
      </div>
      <div class="field-group" style="grid-column: 1 / -1;">
        <label for="expand-notes">Direction Notes</label>
        <textarea id="expand-notes" rows="4" placeholder="Extend left and top, preserve horizon line..."></textarea>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="primary-btn" id="save-expand">Save Task</button>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button class="secondary-btn" id="download-expand">Download JSON</button>
      </div>
    </div>
    <div class="tool-panel">
      <div class="canvas-frame" style="margin-bottom: 12px;">
        <img id="expand-preview" alt="Preview" style="max-width: 100%; display: none;" />
      </div>
      <div class="tool-output" id="expand-output">Expansion tasks will appear here.</div>
    </div>
  `;

  const upload = container.querySelector('#expand-upload');
  const asset = container.querySelector('#expand-asset');
  const size = container.querySelector('#expand-size');
  const notes = container.querySelector('#expand-notes');
  const preview = container.querySelector('#expand-preview');
  const output = container.querySelector('#expand-output');
  const saveButton = container.querySelector('#save-expand');
  const downloadButton = container.querySelector('#download-expand');
  const storageKey = 'sorcerer-expander';

  const load = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
  const save = (data) => localStorage.setItem(storageKey, JSON.stringify(data));
  const updateOutput = (data) => {
    output.textContent = JSON.stringify(data, null, 2);
  };

  updateOutput(load());

  upload.addEventListener('change', (event) => {
    const selected = event.target.files[0];
    if (!selected) return;
    preview.src = URL.createObjectURL(selected);
    preview.style.display = 'block';
    if (!asset.value.trim()) {
      asset.value = selected.name;
    }
  });

  saveButton.addEventListener('click', () => {
    const entry = {
      asset: asset.value.trim(),
      targetSize: size.value.trim(),
      notes: notes.value.trim(),
      updatedAt: new Date().toISOString(),
    };
    const next = [entry, ...load()].slice(0, 20);
    save(next);
    updateOutput(next);
  });

  downloadButton.addEventListener('click', () => {
    downloadJson('expander.json', load());
  });
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
