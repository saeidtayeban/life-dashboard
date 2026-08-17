import { html, useState } from '../../lib.js';
import { Button } from '../ui/Button.js';

export function DomainForm({ initial = '', onSave, onCancel }) {
  const [name, setName] = useState(initial);

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
  }

  return html`
    <form class="form" onSubmit=${submit}>
      <label class="field">
        <span class="field-label">Domain name</span>
        <input
          class="field-input"
          type="text"
          placeholder="e.g. Finance"
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
