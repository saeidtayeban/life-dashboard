import { html } from '../lib.js';

const TABS = [
  { id: 'today', label: 'Today', icon: '◐' },
  { id: 'domains', label: 'Domains', icon: '▤' },
  { id: 'add', label: 'Add', icon: '+' },
];

export function TabBar({ active, onChange }) {
  return html`
    <nav class="tab-bar">
      ${TABS.map(
        (tab) => html`
          <button
            key=${tab.id}
            class=${'tab-btn' + (active === tab.id ? ' active' : '')}
            onClick=${() => onChange(tab.id)}
          >
            <span class="tab-icon">${tab.icon}</span>
            <span class="tab-label">${tab.label}</span>
          </button>
        `
      )}
    </nav>
  `;
}
