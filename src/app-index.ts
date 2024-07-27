import { LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { registerIconLibrary } from '@shoelace-style/shoelace/dist/utilities/icon-library.js';

import './pages/app-home';
import './components/header';
import './components/dew-point-calculator';
import './components/weather-forecast';
import './styles/global.css';
import { router } from './router';

registerIconLibrary('default', {
  resolver: name => `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/${name}.svg`
});

@customElement('app-index')
export class AppIndex extends LitElement {
  static styles = css`
    main {
      padding-left: 16px;
      padding-right: 16px;
      padding-bottom: 16px;
    }
  `;

  firstUpdated() {
    router.addEventListener('route-changed', () => {
      if ("startViewTransition" in document) {
        (document as any).startViewTransition(() => this.requestUpdate());
      }
      else {
        this.requestUpdate();
      }
    });
  }

  render() {
    // router config can be round in src/router.ts
    return router.render();
  }
}
