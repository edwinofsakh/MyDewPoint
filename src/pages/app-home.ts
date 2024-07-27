import { LitElement, PropertyValues, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';

import { styles } from '../styles/shared-styles';

const B = 17.625
const C = 243.04

function gamma(temperature: number, humidity: number) {
  return Math.log(humidity/100) + B*temperature / (C + temperature);
}

function calcDewPoint(temperature: number, humidity: number) {
  const g = gamma(temperature, humidity)
  return C * g / (B - g);
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 10) / 10
}

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  @property({attribute: false})
  temperature!: number;

  @property({attribute: false})
  humidity!: number;

  @property({attribute: false})
  dewPoint!: number;

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

    @media(min-width: 750px) {
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
  `];

  async firstUpdated() {
    this.temperature = 28
    this.humidity = 64
    this.dewPoint = calcDewPoint(this.temperature, this.humidity);
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    // only need to check changed properties for an expensive computation.
    if (changedProperties.has('temperature') || changedProperties.has('humidity')) {
      this.dewPoint = calcDewPoint(this.temperature, this.humidity);
    }
  }

  handleChange(e: Event) {
    if (!e.target) return
    const { name, value } = e.target as HTMLInputElement;

    switch (name) {
      case  'temperature':
        this.temperature = parseFloat(value)
        break;
      case  'humidity':
        this.humidity = parseFloat(value)
        break;
      default:
        break;
    }
  }

  share() {
    if ((navigator as any).share) {
      (navigator as any).share({
        title: 'PWABuilder pwa-starter',
        text: 'Check out the PWABuilder pwa-starter!',
        url: 'https://github.com/pwa-builder/pwa-starter',
      });
    }
  }

  render() {
    return html`
      <app-header></app-header>

      <main>
        <div id="welcomeBar">
        <sl-card id="pewPointCalculatorCard">
          <h2>Dew Point Calculator</h2>

          <div>
            <sl-input type="number" name="temperature" size="large" label="Temperature" value=${this.temperature} step="0.1" required @sl-change=${this.handleChange}></sl-input>
            <br/>
            <sl-input type="number" name="humidity" size="large" label="Humidity" value=${this.humidity} @sl-change=${this.handleChange}></sl-input>
            <br/>
            <sl-input type="number" name="dewPoint" size="large" label="Dew Point" value=${round(this.dewPoint)} disabled></sl-input>
          </div>
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

            ${'share' in navigator
              ? html`<sl-button slot="footer" variant="primary" @click="${this.share}">Share this Starter!</sl-button>`
              : null}
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
