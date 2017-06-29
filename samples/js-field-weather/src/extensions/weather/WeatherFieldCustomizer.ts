import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import styles from './Weather.module.scss';

import * as $ from 'jquery';
import 'simpleWeather';

export interface IWeatherProperties {
  unit?: string;
}

const LOG_SOURCE: string = 'WeatherFieldCustomizer';

export default class WeatherFieldCustomizer
  extends BaseFieldCustomizer<IWeatherProperties> {

  @override
  public onInit(): Promise<void> {
    return Promise.resolve<void>();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    if (!event.cellValue) {
      return;
    }

    event.cellDiv.parentElement.classList.add(styles.weather);

    ($ as any).simpleWeather({
      location: event.cellValue,
      woeid: '',
      unit: this.properties.unit || 'c',
      success: (weather: any): void => {
        event.cellDiv.innerHTML =
          `${event.cellValue} <i class="icon${weather.code}"></i> ${weather.temp}&deg;${weather.units.temp}`;
      },
      error: (error: any): void => {
        Log.error(LOG_SOURCE, error);
      }
    });
  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    super.onDisposeCell(event);
  }
}
