import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'WeatherFieldCustomizerStrings';
import styles from './WeatherFieldCustomizer.module.scss';

import * as $ from 'jquery';
import 'simpleWeather';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IWeatherFieldCustomizerProperties {
  unit?: string;
}

const LOG_SOURCE: string = 'WeatherFieldCustomizer';

export default class WeatherFieldCustomizer
  extends BaseFieldCustomizer<IWeatherFieldCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    return Promise.resolve();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    if(!event.fieldValue) {
      return;
    }

    event.domElement.parentElement.classList.add(styles.weather);

    ($ as any).simpleWeather({
      location: event.fieldValue,
      woeid: '',
      unit: this.properties.unit || 'c',
      success: (weather: any): void => {
        event.domElement.innerHTML =
          `${event.fieldValue} <i class="icon${weather.code}"></i> ${weather.temp}&deg;${weather.units.temp}`;
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
