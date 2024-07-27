import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { range } from 'lit/directives/range.js';
import { map } from 'lit/directives/map.js';
import { fetchWeatherApi } from 'openmeteo';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/format-date/format-date.js';

interface IForecast {
  time: Date[];
  temperature2m: Float32Array;
  relativeHumidity2m: Float32Array;
  dewPoint2m: Float32Array;
  temperature80m: Float32Array;
  temperature120m: Float32Array;
  temperature180m: Float32Array;
}

type HourlyData = ReturnType<
  Awaited<ReturnType<typeof fetchWeatherApi>>[0]['hourly']
>;

type Float32Array = ReturnType<
  NonNullable<
    ReturnType<
      NonNullable<
        ReturnType<Awaited<ReturnType<typeof fetchWeatherApi>>[0]['hourly']>
      >['variables']
    >
  >['valuesArray']
>;

function getTimeRange(start: number, stop: number, step: number) {
  return Array.from(
    { length: (stop - start) / step },
    (_, i) => start + i * step
  );
}

function getForecastArray(value: HourlyData, index: number) {
  return value!.variables(index)!.valuesArray()!;
}

@customElement('weather-forecast')
export class AppHeader extends LitElement {
  @property({ type: Number }) dewPoint!: number;

  @state()
  _hasGeolocation = 'geolocation' in navigator;

  @state()
  _coordinates: GeolocationCoordinates | null = null;

  @state()
  _date: Date | null = null;

  @state()
  _timezone = '';

  @state()
  _forecast: IForecast | null = null;

  static styles = css`
    .weather-forecast {
      margin-top: 18px;
    }

    table {
      margin: auto;
    }

    th {
      text-align: start;
    }

    th,
    td {
      padding-inline-end: 8px;
    }

    .debug-information {
      margin-top: 1rem;
      text-align: center;
    }
  `;

  async showForecast() {
    if (!this._hasGeolocation) return;

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve(position);
            },
            (error) => {
              reject(error);
            },
            { enableHighAccuracy: true }
          );
        }
      );

      this._coordinates = position.coords;
      this._date = new Date();
      await this.fetchWeatherForecast();
    } catch (error) {
      if (error != null && typeof error == 'object' && 'message' in error) {
        alert(error.message);
      }

      console.log(error);
    }
  }

  async fetchWeatherForecast() {
    const params = {
      latitude: this._coordinates!.latitude,
      longitude: this._coordinates!.longitude,
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'dew_point_2m',
        'temperature_80m',
        'temperature_120m',
        'temperature_180m',
      ],
      timezone: 'auto',
      past_days: 1,
      forecast_days: 3,
    };
    const url = 'https://api.open-meteo.com/v1/forecast';
    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    this._timezone = response.timezone() ?? '';

    const hourly = response.hourly()!;
    const time = getTimeRange(
      Number(hourly.time()),
      Number(hourly.timeEnd()),
      hourly.interval()
    ).map((t) => new Date((t + utcOffsetSeconds) * 1000));

    // Note: The order of weather variables in the URL query and the indices below need to match!
    this._forecast = {
      time,
      temperature2m: getForecastArray(hourly, 0),
      relativeHumidity2m: getForecastArray(hourly, 1),
      dewPoint2m: getForecastArray(hourly, 2),
      temperature80m: getForecastArray(hourly, 3),
      temperature120m: getForecastArray(hourly, 4),
      temperature180m: getForecastArray(hourly, 5),
    };
  }

  private getTime(shift = 0) {
    const index = this._forecast?.time.findIndex(
      (t) =>
        t.getDate() === this._date?.getDate() &&
        t.getHours() === this._date?.getHours()
    );
    if (!index) return 'N/A';
    if (index + shift < 0 || index + shift > (this._forecast?.time.length ?? 0))
      return 'N/A';

    return this._forecast?.time?.[index + shift];
  }
  private getCurrent(key: keyof IForecast, precision = 1, shift = 0) {
    const index = this._forecast?.time.findIndex(
      (t) =>
        t.getDate() === this._date?.getDate() &&
        t.getHours() === this._date?.getHours()
    );

    if (!index) return 'N/A';
    if (index + shift < 0 || index + shift > (this._forecast?.time.length ?? 0))
      return 'N/A';
    if (key === 'time') return 'N/A';

    return this._forecast?.[key]?.[index + shift].toFixed(precision);
  }

  render() {
    if (!this._coordinates) {
      if (!this._hasGeolocation) {
        return html``;
      } else {
        return html`
          <div class="weather-forecast">
            <sl-button variant="primary" @click=${this.showForecast}>
              Show Forecast
            </sl-button>
          </div>
        `;
      }
    }

    const mapUrl = `https://www.google.com/maps/@${this._coordinates.latitude},${this._coordinates.longitude},18z`;

    return html`
      <div class="weather-forecast">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Dew Point</th>
            </tr>
          </thead>
          <tbody>
            ${map(
              range(5),
              (i) => html`
                <tr>
                  <td>
                    <sl-format-date
                      hour="numeric"
                      minute="numeric"
                      hour-format="24"
                      date="${this.getTime(i - 1)}"
                    ></sl-format-date>
                  </td>
                  <td>
                    ${this.getCurrent('dewPoint2m', 1, i - 1)}℃
                    ${i == 1 ? ` vs ${this.dewPoint}℃` : ''}
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
        <br />

        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Temperature (2m)</td>
              <td>${this.getCurrent('temperature2m', 1)}℃</td>
            </tr>
            <tr>
              <td>Humidity (2m)</td>
              <td>${this.getCurrent('relativeHumidity2m')}%</td>
            </tr>
            <tr>
              <td>Dew point (2m)</td>
              <td>${this.getCurrent('dewPoint2m')}℃</td>
            </tr>
            <tr>
              <td>Temperature (80m)</td>
              <td>${this.getCurrent('temperature80m')}℃</td>
            </tr>
            <tr>
              <td>Temperature (120m)</td>
              <td>${this.getCurrent('temperature120m')}℃</td>
            </tr>
            <tr>
              <td>Temperature (180m)</td>
              <td>${this.getCurrent('temperature180m')}℃</td>
            </tr>
          </tbody>
        </table>

        <div class="debug-information">
          Latitude: ${this._coordinates.latitude}<br />
          Longitude: ${this._coordinates.longitude}<br />
          Timezone: ${this._timezone}<br />
          <br />
          <small>Powered by Open-Meteo</small><br />
          <br />
          <sl-button href="${mapUrl}" target="_blank">
            Check Location on Google Map
          </sl-button>
        </div>
      </div>
    `;
  }
}
