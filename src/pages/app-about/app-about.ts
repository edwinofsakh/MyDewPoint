import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { styles as sharedStyles } from '../../styles/shared-styles'

import '@shoelace-style/shoelace/dist/components/card/card.js';

@customElement('app-about')
export class AppAbout extends LitElement {
  static styles = [
    sharedStyles
  ]

  render() {
    return html`
      <app-header ?enableBack="${true}"></app-header>

      <main>
        <div id="pageContainer">
          <sl-card>
            <h2>MyDewPoint</h2>

            <p>MyDewPoint is a personal dew point calculator.</p>
            <p>Version: 0.0.2</p>
          </sl-card>
        </div>
      </main>
    `;
  }
}
