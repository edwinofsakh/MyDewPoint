import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { styles as sharedStyles } from '../styles/shared-styles';

function getSearchNumber(
  searchParams: URLSearchParams,
  key: string,
  fallback: number
) {
  const param = searchParams.get(key);
  if (!param) return fallback;
  const parsed = parseFloat(param);
  if (isNaN(parsed)) return fallback;
  return parsed;
}

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
    const searchParams = new URLSearchParams(location.search);
    this.temperature = getSearchNumber(searchParams, 'temperature', 28);
    this.humidity = getSearchNumber(searchParams, 'humidity', 64);
    this._hasShareButton = 'share' in navigator;
  }

  handleChange(e: CustomEvent) {
    const { key, value } = e.detail;
    switch (key) {
      case 'temperature':
        this.temperature = value;
        break;
      case 'humidity':
        this.humidity = value;
        break;
      case 'dewPoint':
        this.dewPoint = value;
        break;
      default:
        break;
    }
  }

  share() {
    if (!this._hasShareButton) return;

    const text = `Temperature: ${this.temperature}℃. Humidity: ${this.humidity}%. Dew point: ${this.dewPoint}℃`;
    const url = `https://my-dew-point.web.app/?temperature=${this.temperature}&humidity=${this.humidity}`;

    (navigator as any).share({
      title: `Dew point: ${this.dewPoint}℃`,
      text: `${text}\n${url}`,
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
              @change=${this.handleChange}
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

