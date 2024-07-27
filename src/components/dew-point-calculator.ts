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

  static styles = css`
    /* User invalid styles */
    .validity-styles sl-input[data-user-invalid]::part(base),
    .validity-styles sl-select[data-user-invalid]::part(combobox),
    .validity-styles sl-checkbox[data-user-invalid]::part(control) {
      border-color: var(--sl-color-danger-600);
    }

    .validity-styles [data-user-invalid]::part(form-control-label),
    .validity-styles [data-user-invalid]::part(form-control-help-text),
    .validity-styles sl-checkbox[data-user-invalid]::part(label) {
      color: var(--sl-color-danger-700);
    }

    .validity-styles sl-checkbox[data-user-invalid]::part(control) {
      outline: none;
    }

    .validity-styles sl-input:focus-within[data-user-invalid]::part(base),
    .validity-styles sl-select:focus-within[data-user-invalid]::part(combobox),
    .validity-styles
      sl-checkbox:focus-within[data-user-invalid]::part(control) {
      border-color: var(--sl-color-danger-600);
      box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-color-danger-300);
    }
  `;

  firstUpdated() {
    const form = this.renderRoot.querySelector('.input-validation-required');
    // Wait for controls to be defined before attaching form listeners
    Promise.all([customElements.whenDefined('sl-input')]).then(() => {
      if (!form) return;
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this._dewPoint = calcDewPoint(this._temperature, this._humidity);
      });
    });
  }

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
    if (!value) return;

    switch (name) {
      case 'temperature':
        this.handleTemperatureChange(value);
        break;
      case 'humidity':
        this.handleHumidityChange(value);
        break;
      default:
        break;
    }
  }

  handleTemperatureChange(value: string) {
    const temperature = parseFloat(value);
    if (temperature >= 0 && temperature <= 100) {
      this._temperature = temperature;
      this._notify('temperature', this._temperature);
    }
  }

  handleHumidityChange(value: string) {
    const humidity = parseFloat(value);
    if (humidity >= 0 && humidity <= 100) {
      this._humidity = humidity;
      this._notify('humidity', this._humidity);
    }
  }

  render() {
    return html`
      <form class="input-validation-required validity-styles">
        <sl-input
          type="number"
          inputmode="decimal"
          name="temperature"
          size="large"
          label="Temperature"
          value=${this._temperature}
          min="0"
          max="100"
          step="0.1"
          required
          @sl-input=${this.handleChange}
        >
          <sl-icon name="thermometer-half" slot="prefix"></sl-icon>
        </sl-input>
        <br />
        <sl-input
          type="number"
          inputmode="decimal"
          name="humidity"
          size="large"
          label="Humidity"
          value=${this._humidity}
          min="0"
          max="100"
          required
          @sl-input=${this.handleChange}
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
          readonly
        >
          <sl-icon name="thermometer-snow" slot="prefix"></sl-icon>
        </sl-input>
      </form>
    `;
  }
}
