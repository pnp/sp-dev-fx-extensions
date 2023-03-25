import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack, Text } from '@fluentui/react/lib';
import { useWeatherInfo } from '../services/weatherService';
import styles from './WeatherInformation.module.scss';

export interface IWeatherWidgetProps {
  context: any;
  location: string;
}

export const WeatherWidget: React.FC<IWeatherWidgetProps> = (props: IWeatherWidgetProps): JSX.Element => {
  const { context, location } = props;
  const { getWeatherInfo } = useWeatherInfo(context, location);
  const [weatherData, setWeatherData] = useState<any>();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchWeatherData = async (): Promise<void> => {
      try {
        const response = await getWeatherInfo();
        setWeatherData(response);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchWeatherData();
  }, [getWeatherInfo]);

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!weatherData) {
    return <Text>Loading...</Text>;
  }

  return (
    <Stack horizontal tokens={{ childrenGap: 10 }} className={styles['weather-widget-container']}>
      <img src={`https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`} alt="Weather Icon" style={{ verticalAlign: 'middle' }} />
      <Stack verticalAlign="center">
        <div>{weatherData.name}, {weatherData.sys.country}</div>
        <div>{`${Math.round(weatherData.main.temp)} °C`}</div>
      </Stack>
    </Stack>
  );
};
