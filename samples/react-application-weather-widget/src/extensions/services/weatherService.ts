import { HttpClient } from '@microsoft/sp-http';
import { BaseComponentContext } from '@microsoft/sp-component-base';
import * as React from 'react';

interface IWeatherInfo {
  name: string;
  main: { temp: number };
  weather: { icon: string };
  sys: { Country: string }
}

export const useWeatherInfo = (context: BaseComponentContext, location: string) => {
  const getWeatherInfo = React.useCallback(async (): Promise<IWeatherInfo> => {
    const httpClient = context?.httpClient;
    const apiKey = 'XXXXX'; // replace with your API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
    const results = await httpClient?.get(url, HttpClient.configurations.v1);
    const response = await results?.json();
    return response;
  }, [context, location]);

  return { getWeatherInfo };
};
