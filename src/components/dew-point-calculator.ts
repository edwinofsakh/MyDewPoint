import { LitElement, PropertyValues, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

const B = 17.625;
const C = 243.04;

function gamma(temperature: number, humidity: number) {
  return Math.log(humidity / 100) + (B * temperature) / (C + temperature);
}

function calcDewPoint(temperature: number, humidity: number) {
  const g = gamma(temperature, humidity);
  return round((C * g) / (B - g));
}

function round(value: number, precision = 1) {
  const base = 10 ** precision;
  return Math.round((value + Number.EPSILON) * base) / base;
}

@customElement('dew-point-calculator')
export class AppHeader extends LitElement {
  @property({ state: true }) _temperature!: number;
  @property({ type: Number }) initialTemperature!: number;
  @property({ state: true }) _humidity!: number;
  @property({ type: Number }) initialHumidity!: number;
  @property({ state: true }) _dewPoint!: number;

  static styles = css``;

  willUpdate(changedProperties: PropertyValues<this>) {
    // only need to check changed properties for an expensive computation.
    if (
      changedProperties.has('initialTemperature') ||
      changedProperties.has('initialHumidity')
    ) {
      this._temperature = this.initialTemperature;
      this._humidity = this.initialHumidity;
    }

    if (
      changedProperties.has('_temperature') ||
      changedProperties.has('_humidity')
    ) {
      this._dewPoint = calcDewPoint(this._temperature, this._humidity);
    }
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('_dewPoint')) {
      this._notify('dewPoint', this._dewPoint);
    }
  }

  private _notify(key: string, value: number) {
    this.dispatchEvent(new CustomEvent('change', { detail: { key, value } }));
  }

  handleChange(e: Event) {
    if (!e.target) return;
    const { name, value } = e.target as HTMLInputElement;

    switch (name) {
      case 'temperature':
        this._temperature = parseFloat(value);
        this._notify('temperature', this._temperature);
        break;
      case 'humidity':
        this._humidity = parseFloat(value);
        this._notify('humidity', this._humidity);
        break;
      default:
        break;
    }
  }

  render() {
    return html`
      <div>
        <sl-input
          type="number"
          name="temperature"
          size="large"
          label="Temperature"
          value=${this._temperature}
          step="0.1"
          required
          @sl-change=${this.handleChange}
        >
          <sl-icon name="thermometer-half" slot="prefix"></sl-icon>
        </sl-input>
        <br />
        <sl-input
          type="number"
          name="humidity"
          size="large"
          label="Humidity"
          value=${this._humidity}
          @sl-change=${this.handleChange}
        >
          <sl-icon name="moisture" slot="prefix"></sl-icon>
        </sl-input>
        <br />
        <sl-input
          type="number"
          name="dewPoint"
          size="large"
          label="Dew Point"
          value=${round(this._dewPoint)}
          disabled
        >
          <sl-icon name="thermometer-snow" slot="prefix"></sl-icon>
        </sl-input>
      </div>
    `;
  }
}
