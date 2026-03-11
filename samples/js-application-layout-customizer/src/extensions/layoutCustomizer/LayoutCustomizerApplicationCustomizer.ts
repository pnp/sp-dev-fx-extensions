import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';

interface ILayoutState {
  left: number;
  main: number;
  right: number;
  rightEnabled: boolean;
}

export default class LayoutCustomizerApplicationCustomizer
  extends BaseApplicationCustomizer<{}> {

  private STORAGE_KEY = 'akLayout';

  public onInit(): Promise<void> {

    document.body.classList.add('ak-3col-layout');

    document.documentElement.style.setProperty('--left-col', '15%');
    document.documentElement.style.setProperty('--main-col', '65%');
    document.documentElement.style.setProperty('--right-col', '20%');

    this.injectCSS();
    this.injectUI();
    this.restoreLayout();

    return Promise.resolve();
  }

  private injectCSS(): void {

    const style = document.createElement('style');
    style.id = 'ak-3col-style';

    style.innerHTML = `

@font-face {
  font-family: "FabricMDL2Icons";
  src: url("https://static2.sharepointonline.com/files/fabric/assets/icons/fabricmdl2icons.woff2") format("woff2"),
       url("https://static2.sharepointonline.com/files/fabric/assets/icons/fabricmdl2icons.woff")  format("woff");
  font-weight: normal;
  font-style: normal;
}

.ms-Icon {
  font-family: "FabricMDL2Icons" !important;
  speak: none;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: inline-block;
  line-height: 1;
}

.ms-Icon--ColumnVerticalSection::before { content: "\\F243"; }
.ms-Icon--Edit::before                  { content: "\\E70F"; }
.ms-Icon--Refresh::before               { content: "\\E72C"; }
.ms-Icon--ChromeClose::before           { content: "\\E8BB"; }
.ms-Icon--More::before                  { content: "\\E712"; }
.ms-Icon--CheckMark::before             { content: "\\E73E"; }

html, body {
  overflow-x: hidden !important;
}

body.ak-3col-layout
[data-automation-id="CanvasZone-SectionContainer"]:has(
  > [data-automation-id="CanvasSection"]:nth-child(3)
) {
  display: grid !important;
  grid-template-columns: var(--left-col) var(--main-col) var(--right-col) !important;
  grid-auto-flow: column !important;
  width: 100% !important;
}

body.ak-3col-layout
[data-automation-id="CanvasZone-SectionContainer"]:has(
  > [data-automation-id="CanvasSection"]:nth-child(3)
)
> [data-automation-id="CanvasSection"] {
  min-width: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

body.ak-3col-layout
[data-automation-id="CanvasZone-SectionContainer"]:has(
  > [data-automation-id="CanvasSection"]:nth-child(3)
)
* {
  box-sizing: border-box !important;
  max-width: 100% !important;
  overflow-wrap: break-word !important;
  word-break: break-word !important;
}

:root[style*="--right-col: 0%"]
[data-automation-id="CanvasZone-SectionContainer"]:has(
  > [data-automation-id="CanvasSection"]:nth-child(3)
)
> [data-automation-id="CanvasSection"]:nth-child(3) {
  display: none !important;
}

@media (max-width: 1024px) {
  body.ak-3col-layout
  [data-automation-id="CanvasZone-SectionContainer"]:has(
    > [data-automation-id="CanvasSection"]:nth-child(3)
  ) {
    grid-template-columns: 25% 75% !important;
  }
}

@media (max-width: 640px) {
  body.ak-3col-layout
  [data-automation-id="CanvasZone-SectionContainer"]:has(
    > [data-automation-id="CanvasSection"]:nth-child(3)
  ) {
    grid-template-columns: 1fr !important;
  }
}

#ak-layout-ui {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  font-family: "Segoe UI", system-ui, sans-serif;
  display: flex;
  gap: 8px;
  align-items: center;
}

#ak-layout-btn {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    0 4px 16px rgba(0, 120, 212, 0.45),
    0 1px 4px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s cubic-bezier(.34,1.56,.64,1),
              box-shadow 0.2s ease,
              border-radius 0.25s ease;
  border: 1.5px solid rgba(255,255,255,0.18);
}

#ak-layout-btn .ms-Icon {
  font-size: 20px;
  color: #fff;
  transition: transform 0.3s ease;
}

#ak-layout-btn:hover {
  transform: scale(1.08);
  box-shadow:
    0 6px 20px rgba(0, 120, 212, 0.55),
    0 2px 8px rgba(0, 0, 0, 0.2);
}

#ak-layout-btn:active {
  transform: scale(0.95);
}

#ak-toolbar-pill {
  display: none;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 6px 8px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  animation: pillIn 0.25s cubic-bezier(.34,1.56,.64,1) forwards;
}

@keyframes pillIn {
  from { opacity: 0; transform: scale(0.85) translateY(6px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);   }
}

.ak-icon-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, transform 0.15s ease;
  color: #323130;
}

.ak-icon-btn .ms-Icon {
  font-size: 17px;
  pointer-events: none;
  transition: transform 0.2s ease;
}

.ak-icon-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.ak-icon-btn:hover .ms-Icon {
  transform: scale(1.15);
}

.ak-icon-btn:active {
  transform: scale(0.92);
  background: rgba(0, 0, 0, 0.1);
}

.ak-icon-btn.edit   .ms-Icon { color: #0078d4; }
.ak-icon-btn.layout .ms-Icon { color: #8764b8; }
.ak-icon-btn.reset  .ms-Icon { color: #107c10; }
.ak-icon-btn.close  .ms-Icon { color: #a80000; }

.ak-icon-btn.edit:hover   { background: rgba(0, 120, 212, 0.08); }
.ak-icon-btn.layout:hover { background: rgba(135, 100, 184, 0.08); }
.ak-icon-btn.reset:hover  { background: rgba(16, 124, 16, 0.08); }
.ak-icon-btn.close:hover  { background: rgba(168, 0, 0, 0.08); }

.ak-icon-btn::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: #201f1e;
  color: #fff;
  font-size: 12px;
  font-family: "Segoe UI", sans-serif;
  font-weight: 400;
  padding: 5px 9px;
  border-radius: 5px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform: translateX(-50%) translateY(4px);
  z-index: 1;
}

.ak-icon-btn:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.ak-divider {
  width: 1px;
  height: 22px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 2px;
  border-radius: 1px;
}

#ak-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlayIn 0.2s ease forwards;
}

@keyframes overlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

#ak-layout-panel {
  background: #ffffff;
  width: 440px;
  max-width: 92vw;
  border-radius: 12px;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.18),
    0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: panelIn 0.28s cubic-bezier(.34,1.56,.64,1) forwards;
}

@keyframes panelIn {
  from { opacity: 0; transform: scale(0.92) translateY(16px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}

#ak-panel-header {
  background: linear-gradient(135deg, #0078d4 0%, #004e8c 100%);
  padding: 20px 24px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

#ak-panel-header .ms-Icon {
  font-size: 22px;
  color: rgba(255,255,255,0.9);
}

#ak-panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

#ak-panel-header p {
  margin: 2px 0 0;
  font-size: 12px;
  color: rgba(255,255,255,0.72);
  font-weight: 400;
}

#ak-panel-body {
  padding: 20px 24px 24px;
}

#ak-col-preview {
  display: flex;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid rgba(0,0,0,0.07);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06) inset;
}

#ak-col-preview .ak-col-left  { background: #c7e0f4; transition: flex 0.3s ease; }
#ak-col-preview .ak-col-main  { background: #0078d4; transition: flex 0.3s ease; }
#ak-col-preview .ak-col-right { background: #8764b8; transition: flex 0.3s ease; }

#ak-col-preview .ak-col-label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(255,255,255,0.9);
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
}

#ak-col-preview .ak-col-left .ak-col-label { color: #004578; }

.ak-field-row {
  margin-bottom: 14px;
}

.ak-field-row label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #201f1e;
  margin-bottom: 6px;
}

.ak-field-row label .ms-Icon {
  font-size: 13px;
  color: #605e5c;
}

.ak-field-row label .ak-pct-badge {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  color: #0078d4;
  background: #e8f4fc;
  padding: 1px 7px;
  border-radius: 10px;
}

.ak-slider-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ak-slider {
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #e1dfdd;
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
}

.ak-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0078d4;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0,120,212,0.4);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.ak-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 10px rgba(0,120,212,0.55);
}

.ak-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0078d4;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0,120,212,0.4);
  cursor: pointer;
}

.ak-slider.left-slider::-webkit-slider-thumb  { background: #005a9e; box-shadow: 0 2px 6px rgba(0,90,158,0.4); }
.ak-slider.right-slider::-webkit-slider-thumb { background: #8764b8; box-shadow: 0 2px 6px rgba(135,100,184,0.4); }

.ak-slider.left-slider::-moz-range-thumb  { background: #005a9e; }
.ak-slider.right-slider::-moz-range-thumb { background: #8764b8; }

.ak-slider:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.ak-slider:disabled::-webkit-slider-thumb { cursor: not-allowed; }

.ak-number-input {
  width: 52px;
  padding: 5px 8px;
  border: 1.5px solid #c8c6c4;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  color: #201f1e;
  transition: border-color 0.15s ease;
  -moz-appearance: textfield;
}

.ak-number-input::-webkit-inner-spin-button,
.ak-number-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

.ak-number-input:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0,120,212,0.12);
}

.ak-number-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ak-section-divider {
  height: 1px;
  background: #f3f2f1;
  margin: 18px 0;
}

.ak-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ak-toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #201f1e;
  cursor: pointer;
}

.ak-toggle-label .ms-Icon {
  font-size: 14px;
  color: #605e5c;
}

.ak-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.ak-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.ak-toggle-track {
  position: absolute;
  inset: 0;
  background: #c8c6c4;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.25s ease;
}

.ak-toggle-track::before {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
}

.ak-toggle input:checked + .ak-toggle-track {
  background: #0078d4;
}

.ak-toggle input:checked + .ak-toggle-track::before {
  transform: translateX(20px);
}

.ak-toggle input:focus + .ak-toggle-track {
  box-shadow: 0 0 0 2px rgba(0,120,212,0.25);
}

#ak-validation-hint {
  display: none;
  font-size: 12px;
  color: #a80000;
  margin-top: 8px;
  padding: 7px 10px;
  background: #fde7e9;
  border-radius: 6px;
  border-left: 3px solid #d13438;
}

.ak-button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.ak-button {
  flex: 1;
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: "Segoe UI", sans-serif;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.ak-button .ms-Icon {
  font-size: 14px;
}

.ak-button:active { transform: scale(0.97); }

.ak-button.primary {
  background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,120,212,0.35);
}

.ak-button.primary:hover {
  background: linear-gradient(135deg, #106ebe 0%, #004e8c 100%);
  box-shadow: 0 4px 12px rgba(0,120,212,0.45);
}

.ak-button.secondary {
  background: #f3f2f1;
  color: #323130;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid #e1dfdd;
}

.ak-button.secondary:hover {
  background: #edebe9;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
`;

    document.head.appendChild(style);
  }

  private injectUI(): void {

    const ui = document.createElement('div');
    ui.id = 'ak-layout-ui';

    ui.innerHTML = `
<div id="ak-layout-btn" role="button" aria-label="Layout Customizer" tabindex="0">
  <i class="ms-Icon ms-Icon--ColumnVerticalSection"></i>
</div>

<div id="ak-toolbar-pill" role="toolbar" aria-label="Layout tools">
  <button class="ak-icon-btn edit"   id="editBtn"   data-tooltip="Edit Page">
    <i class="ms-Icon ms-Icon--Edit"></i>
  </button>
  <div class="ak-divider"></div>
  <button class="ak-icon-btn layout" id="railBtn"   data-tooltip="Rail Layout">
    <i class="ms-Icon ms-Icon--ColumnVerticalSection"></i>
  </button>
  <button class="ak-icon-btn reset"  id="resetBtn"  data-tooltip="Reset Layout">
    <i class="ms-Icon ms-Icon--Refresh"></i>
  </button>
  <div class="ak-divider"></div>
  <button class="ak-icon-btn close"  id="cancelBtn" data-tooltip="Close">
    <i class="ms-Icon ms-Icon--ChromeClose"></i>
  </button>
</div>
`;

    document.body.appendChild(ui);

    const fab     = document.getElementById('ak-layout-btn')!;
    const pill    = document.getElementById('ak-toolbar-pill')!;
    const editBtn = document.getElementById('editBtn')!;
    const railBtn = document.getElementById('railBtn')!;
    const resetBtn = document.getElementById('resetBtn')!;
    const cancelBtn = document.getElementById('cancelBtn')!;

    const openToolbar = (): void => {
      fab.style.display = 'none';
      pill.style.display = 'flex';
    };

    const closeToolbar = (): void => {
      pill.style.display = 'none';
      fab.style.display = 'flex';
    };

    fab.addEventListener('click', openToolbar);
    fab.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') openToolbar();
    });

    cancelBtn.addEventListener('click', closeToolbar);

    editBtn.addEventListener('click', () => {
      const editButton =
        (document.querySelector('[data-automation-id="pageCommandEdit"]') as HTMLElement) ||
        (document.querySelector('[data-automationid="editPage"]') as HTMLElement) ||
        (document.querySelector('button[name="Edit"]') as HTMLElement) ||
        (document.querySelector('[aria-label="Edit"]') as HTMLElement);

      if (editButton) {
        editButton.click();
      } else {
        const currentUrl = window.location.href;
        const separator = currentUrl.indexOf('?') > -1 ? '&' : '?';
        window.location.href = currentUrl + separator + 'Mode=Edit';
      }
    });

    railBtn.addEventListener('click', () => {
      this.showRailLayoutModal();
    });

    resetBtn.addEventListener('click', () => {
      if (confirm('Clear all saved layout settings and reload?')) {
        localStorage.removeItem(this.STORAGE_KEY);
        window.location.reload();
      }
    });
  }

  private showRailLayoutModal(): void {
    const s = this.getCurrentState();

    const overlay = document.createElement('div');
    overlay.id = 'ak-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ak-panel-title');

    overlay.innerHTML = `
<div id="ak-layout-panel">

  <!-- Header -->
  <div id="ak-panel-header">
    <i class="ms-Icon ms-Icon--ColumnVerticalSection"></i>
    <div>
      <h3 id="ak-panel-title">Rail Layout</h3>
      <p>Adjust column widths — must total 100%</p>
    </div>
  </div>

  <!-- Body -->
  <div id="ak-panel-body">

    <!-- Visual preview -->
    <div id="ak-col-preview">
      <div class="ak-col-left ak-col-label"  style="flex:${s.left}"><span>L</span></div>
      <div class="ak-col-main ak-col-label"  style="flex:${s.main}"><span>Main</span></div>
      <div class="ak-col-right ak-col-label" style="flex:${s.rightEnabled ? s.right : 0}"><span>R</span></div>
    </div>

    <!-- Left -->
    <div class="ak-field-row">
      <label for="leftCol">
        Left Column
        <span class="ak-pct-badge" id="leftPct">${s.left}%</span>
      </label>
      <div class="ak-slider-wrap">
        <input class="ak-slider left-slider" type="range" id="leftSlider" min="5" max="35" value="${s.left}">
        <input class="ak-number-input" type="number" id="leftCol" min="5" max="35" value="${s.left}">
      </div>
    </div>

    <!-- Main -->
    <div class="ak-field-row">
      <label for="mainCol">
        Main Column
        <span class="ak-pct-badge" id="mainPct">${s.main}%</span>
      </label>
      <div class="ak-slider-wrap">
        <input class="ak-slider" type="range" id="mainSlider" min="30" max="90" value="${s.main}">
        <input class="ak-number-input" type="number" id="mainCol" min="30" max="90" value="${s.main}">
      </div>
    </div>

    <!-- Right -->
    <div class="ak-field-row">
      <label for="rightCol">
        Right Column
        <span class="ak-pct-badge" id="rightPct">${s.right}%</span>
      </label>
      <div class="ak-slider-wrap">
        <input class="ak-slider right-slider" type="range" id="rightSlider" min="0" max="35" value="${s.right}" ${!s.rightEnabled ? 'disabled' : ''}>
        <input class="ak-number-input" type="number" id="rightCol" min="0" max="35" value="${s.right}" ${!s.rightEnabled ? 'disabled' : ''}>
      </div>
    </div>

    <div class="ak-section-divider"></div>

    <!-- Toggle right column -->
    <div class="ak-toggle-row">
      <label class="ak-toggle-label" for="toggleRight">
        Enable Right Navigation Panel
      </label>
      <label class="ak-toggle">
        <input type="checkbox" id="toggleRight" ${s.rightEnabled ? 'checked' : ''}>
        <span class="ak-toggle-track"></span>
      </label>
    </div>

    <!-- Validation hint -->
    <div id="ak-validation-hint">Columns must total exactly 100%</div>

    <!-- Actions -->
    <div class="ak-button-group">
      <button class="ak-button secondary" id="cancelModal">
        Cancel
      </button>
      <button class="ak-button primary" id="applyLayout">
        <i class="ms-Icon ms-Icon--CheckMark"></i>
        Apply
      </button>
    </div>

  </div>
</div>
`;

    document.body.appendChild(overlay);

    const leftSlider  = overlay.querySelector('#leftSlider')  as HTMLInputElement;
    const mainSlider  = overlay.querySelector('#mainSlider')  as HTMLInputElement;
    const rightSlider = overlay.querySelector('#rightSlider') as HTMLInputElement;
    const leftInput   = overlay.querySelector('#leftCol')     as HTMLInputElement;
    const mainInput   = overlay.querySelector('#mainCol')     as HTMLInputElement;
    const rightInput  = overlay.querySelector('#rightCol')    as HTMLInputElement;
    const toggleRight = overlay.querySelector('#toggleRight') as HTMLInputElement;
    const previewLeft  = overlay.querySelector('.ak-col-left')  as HTMLElement;
    const previewMain  = overlay.querySelector('.ak-col-main')  as HTMLElement;
    const previewRight = overlay.querySelector('.ak-col-right') as HTMLElement;
    const leftPct  = overlay.querySelector('#leftPct')  as HTMLElement;
    const mainPct  = overlay.querySelector('#mainPct')  as HTMLElement;
    const rightPct = overlay.querySelector('#rightPct') as HTMLElement;

    const syncPreview = (): void => {
      const l = +leftInput.value;
      const m = +mainInput.value;
      const r = toggleRight.checked ? +rightInput.value : 0;
      leftPct.textContent  = `${l}%`;
      mainPct.textContent  = `${m}%`;
      rightPct.textContent = `${r}%`;
      previewLeft.style.flex  = String(l);
      previewMain.style.flex  = String(m);
      previewRight.style.flex = String(r);
    };

    const bindPair = (slider: HTMLInputElement, input: HTMLInputElement): void => {
      slider.addEventListener('input', () => { input.value = slider.value; syncPreview(); });
      input.addEventListener('input',  () => { slider.value = input.value; syncPreview(); });
    };

    bindPair(leftSlider, leftInput);
    bindPair(mainSlider, mainInput);
    bindPair(rightSlider, rightInput);

    toggleRight.addEventListener('change', () => {
      const off = !toggleRight.checked;
      rightSlider.disabled = off;
      rightInput.disabled  = off;
      syncPreview();
    });

    overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === overlay) overlay.remove();
    });

    overlay.querySelector('#cancelModal')!.addEventListener('click', () => {
      overlay.remove();
    });

    overlay.querySelector('#applyLayout')!.addEventListener('click', () => {
      const valid = this.applyLayout();
      if (valid) overlay.remove();
    });
  }

  private getCurrentState(): ILayoutState {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw) as ILayoutState; } catch {  }
    }
    return { left: 15, main: 65, right: 20, rightEnabled: true };
  }

  private applyLayout(): boolean {
    const left         = +(document.getElementById('leftCol')     as HTMLInputElement).value;
    const mainVal      = +(document.getElementById('mainCol')     as HTMLInputElement).value;
    const rightVal     = +(document.getElementById('rightCol')    as HTMLInputElement).value;
    const rightEnabled = (document.getElementById('toggleRight') as HTMLInputElement).checked;

    let main  = mainVal;
    let right = rightVal;

    if (!rightEnabled) {
      right = 0;
      main  = 100 - left;
    } else if (left + main + right !== 100) {
      const hint = document.getElementById('ak-validation-hint');
      if (hint) hint.style.display = 'block';
      return false;
    }

    document.documentElement.style.setProperty('--left-col',  `${left}%`);
    document.documentElement.style.setProperty('--main-col',  `${main}%`);
    document.documentElement.style.setProperty('--right-col', `${right}%`);

    const state: ILayoutState = { left, main, right, rightEnabled };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    return true;
  }

  private restoreLayout(): void {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return;

    try {
      const state = JSON.parse(raw) as ILayoutState;
      document.documentElement.style.setProperty('--left-col',  `${state.left}%`);
      document.documentElement.style.setProperty('--main-col',  `${state.main}%`);
      document.documentElement.style.setProperty('--right-col', `${state.right}%`);
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}