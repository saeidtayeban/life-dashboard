import { html, useEffect } from '../../lib.js';

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return html`
    <div class="modal-scrim" onClick=${onClose}>
      <div class="modal-sheet" onClick=${(e) => e.stopPropagation()}>
        <div class="modal-handle"></div>
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          <button class="modal-close" onClick=${onClose} aria-label="Close">✕</button>
        </div>
        <div class="modal-body">${children}</div>
      </div>
    </div>
  `;
}
