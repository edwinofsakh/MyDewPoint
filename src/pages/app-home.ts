import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { styles as sharedStyles } from '../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {
  @property({ attribute: false })
  temperature!: number;

  @property({ attribute: false })
  humidity!: number;

  @property({ attribute: false })
  dewPoint!: number;

  @state()
  _hasShareButton = false;

  static styles = [
    sharedStyles,
    css`
      sl-card::part(footer) {
        display: flex;
        justify-content: flex-end;
      }
    `,
  ];

  constructor() {
    super();
    this.temperature = 28;
    this.humidity = 64;
    this._hasShareButton = 'share' in navigator;
  }

  handleDewPointChange(e: CustomEvent) {
    this.dewPoint = e.detail.dewPoint;
  }

  share() {
    if (!this._hasShareButton) return;

    (navigator as any).share({
      title: `Dew point is ${this.dewPoint}`,
      text: `Current temperature is ${this.temperature}. Current humidity is ${this.humidity}. Current dew point is ${this.dewPoint}`,
      // url: 'https://github.com/pwa-builder/pwa-starter',
    });
  }

  render() {
    return html`
      <app-header></app-header>

      <main>
        <div id="pageContainer">
          <sl-card id="pewPointCalculatorCard">
            <dew-point-calculator
              initialTemperature=${this.temperature}
              initialHumidity=${this.humidity}
              @change=${this.handleDewPointChange}
            ></dew-point-calculator>

            ${this._hasShareButton
              ? html`<sl-button
                  slot="footer"
                  variant="primary"
                  @click="${this.share}"
                  >Share</sl-button
                >`
              : null}
          </sl-card>

          <sl-button href="${resolveRouterPath('about')}" variant="primary"
            >Navigate to About</sl-button
          >
        </div>
      </main>
    `;
  }
}

