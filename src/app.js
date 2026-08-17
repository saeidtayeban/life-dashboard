import { html, useState, Fragment } from './lib.js';
import { StoreProvider } from './state/store.js';
import { TabBar } from './components/TabBar.js';
import { TodayScreen } from './components/screens/TodayScreen.js';
import { DomainsScreen } from './components/screens/DomainsScreen.js';
import { AddScreen } from './components/screens/AddScreen.js';

const TAB_KEY = 'pld:tab';

function App() {
  const [tab, setTab] = useState(() => localStorage.getItem(TAB_KEY) || 'today');

  function changeTab(next) {
    setTab(next);
    localStorage.setItem(TAB_KEY, next);
  }

  return html`
    <${StoreProvider}>
      <${Fragment}>
        <main class="app-main">
          ${tab === 'today' ? html`<${TodayScreen} />` : null}
          ${tab === 'domains' ? html`<${DomainsScreen} />` : null}
          ${tab === 'add' ? html`<${AddScreen} />` : null}
        </main>
        <${TabBar} active=${tab} onChange=${changeTab} />
      <//>
    <//>
  `;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Service worker registration failed', err);
    });
  });
}
