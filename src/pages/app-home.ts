import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { styles } from '../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {
  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  @property({ attribute: false })
  temperature!: number;

  @property({ attribute: false })
  humidity!: number;

  @property({ attribute: false })
  dewPoint!: number;

  @state()
  _hasShareButton = false;

  static styles = [
    styles,
    css`
      #welcomeBar {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      #pewPointCalculatorCard,
      #welcomeCard,
      #infoCard {
        padding: 18px;
        padding-top: 0px;
      }

      sl-card::part(footer) {
        display: flex;
        justify-content: flex-end;
      }

      @media (min-width: 750px) {
        sl-card {
          width: 500px;
        }
      }

      @media (horizontal-viewport-segments: 2) {
        #welcomeBar {
          flex-direction: row;
          align-items: flex-start;
          justify-content: space-between;
        }

        #welcomeCard {
          margin-right: 64px;
        }
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
    if (!this._hasShareButton) return

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
        <div id="welcomeBar">
          <sl-card id="pewPointCalculatorCard">
            <h2>Dew Point Calculator</h2>

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

          <sl-card id="welcomeCard">
            <div slot="header">
              <h2>${this.message}</h2>
            </div>

            <p>
              For more information on the PWABuilder pwa-starter, check out the
              <a href="https://docs.pwabuilder.com/#/starter/quick-start">
                documentation</a>.
            </p>

            <p id="mainInfo">
              Welcome to the
              <a href="https://pwabuilder.com">PWABuilder</a>
              pwa-starter! Be sure to head back to
              <a href="https://pwabuilder.com">PWABuilder</a>
              when you are ready to ship this PWA to the Microsoft Store, Google Play
              and the Apple App Store!
            </p>
          </sl-card>

          <sl-card id="infoCard">
            <h2>Technology Used</h2>

            <ul>
              <li>
                <a href="https://www.typescriptlang.org/">TypeScript</a>
              </li>

              <li>
                <a href="https://lit.dev">lit</a>
              </li>

              <li>
                <a href="https://shoelace.style/">Shoelace</a>
              </li>

              <li>
                <a href="https://github.com/thepassle/app-tools/blob/master/router/README.md"
                  >App Tools Router</a>
              </li>
            </ul>
          </sl-card>

          <sl-button href="${resolveRouterPath('about')}" variant="primary">Navigate to About</sl-button>
        </div>
      </main>
    `;
  }
}
