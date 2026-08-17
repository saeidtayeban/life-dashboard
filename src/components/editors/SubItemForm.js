import { html, useState } from '../../lib.js';
import { Button } from '../ui/Button.js';

export function SubItemForm({ domains, initialDomainId = null, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [domainId, setDomainId] = useState(initialDomainId || (domains[0] && domains[0].id) || '');

  function submit(e) {
    e.preventDefault();
    if (!name.trim() || !domainId) return;
    onSave({ name: name.trim(), domainId });
  }

  return html`
    <form class="form" onSubmit=${submit}>
      <label class="field">
        <span class="field-label">Domain</span>
        <select
          class="field-input"
          value=${domainId}
          onChange=${(e) => setDomainId(e.target.value)}
        >
          ${domains.map((d) => html`<option key=${d.id} value=${d.id}>${d.name}</option>`)}
        </select>
      </label>
      <label class="field">
        <span class="field-label">Sub-item name</span>
        <input
          class="field-input"
          type="text"
          placeholder="e.g. Piano, Budget tracking"
          value=${name}
          onInput=${(e) => setName(e.target.value)}
          autoFocus
        />
      </label>
      <div class="form-actions">
        <span></span>
        <div class="form-actions-right">
          <${Button} variant="ghost" onClick=${onCancel}>Cancel<//>
          <${Button} variant="primary" type="submit">Save<//>
        </div>
      </div>
    </form>
  `;
}
