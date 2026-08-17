import { html, useState } from '../../lib.js';
import { useStore } from '../../state/store.js';
import { SubItemDetail } from '../SubItemDetail.js';
import { Card } from '../ui/Card.js';

export function DomainsScreen() {
  const { state } = useStore();
  const [expanded, setExpanded] = useState(() => new Set(state.domains.map((d) => d.id)));
  const [selected, setSelected] = useState(null);

  if (selected) {
    return html`
      <${SubItemDetail}
        domainId=${selected.domainId}
        subItemId=${selected.subItemId}
        onBack=${() => setSelected(null)}
        onDeleted=${() => setSelected(null)}
      />
    `;
  }

  function toggleExpanded(domainId) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) next.delete(domainId);
      else next.add(domainId);
      return next;
    });
  }

  return html`
    <div class="screen">
      <header class="screen-header">
        <div class="screen-eyebrow">${state.domains.length} domains</div>
        <h1 class="screen-title">Domains</h1>
      </header>

      ${state.domains.length
        ? null
        : html`
            <div class="empty-note">
              <p>No domains yet.</p>
              <p class="empty-note-sub">Head to the Add tab to create your first one.</p>
            </div>
          `}

      <div class="domain-list">
        ${state.domains.map((domain) => {
          const isOpen = expanded.has(domain.id);
          return html`
            <div class="domain-block" key=${domain.id}>
              <button class="domain-header" onClick=${() => toggleExpanded(domain.id)}>
                <span class="domain-name">${domain.name}</span>
                <span class="domain-meta">
                  ${domain.subItems.length} ${domain.subItems.length === 1 ? 'item' : 'items'}
                  <span class=${'chevron' + (isOpen ? ' open' : '')}>›</span>
                </span>
              </button>
              ${isOpen
                ? html`
                    <div class="subitem-list">
                      ${domain.subItems.length
                        ? domain.subItems.map(
                            (s) => html`
                              <${Card}
                                key=${s.id}
                                className="subitem-card"
                                onClick=${() =>
                                  setSelected({ domainId: domain.id, subItemId: s.id })}
                              >
                                <div class="subitem-row">
                                  <span class="subitem-name">${s.name}</span>
                                  <span class="subitem-tags">
                                    ${s.goal ? html`<span class="tag">Goal</span>` : null}
                                    ${s.plan && s.plan.items.length
                                      ? html`<span class="tag">Plan</span>`
                                      : null}
                                    <span class="tag tag-mono">${s.log.length} logged</span>
                                  </span>
                                </div>
                              <//>
                            `
                          )
                        : html`<p class="empty-note-sub">No sub-items yet.</p>`}
                    </div>
                  `
                : null}
            </div>
          `;
        })}
      </div>
    </div>
  `;
}
