import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, Text, Image } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';

const API_KEY = 'dfbef9fd443b68f1b4944a7dd0bc141d';
import { Data } from '../models/map';

interface LocationType {
  latitude: number;
  longitude: number;
}

const conditionTranslation: { [key: string]: string } = {
  "clear sky": "cielo despejado",
  "few clouds": "pocas nubes",
  "scattered clouds": "nubes dispersas",
  "broken clouds": "nubes rotas",
  "shower rain": "lluvia ligera",
  "rain": "lluvia",
  "thunderstorm": "tormenta eléctrica",
  "snow": "nieve",
  "mist": "niebla",
  "haze": "neblina",
  "dust": "polvo",
  "fog": "niebla",
  "tornado": "tornado",
  "light rain": "lluvia ligera",
};


export default function TabOneScreen() {
  const [weatherData, setWeatherData] = useState<Data | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const kelvinToCelsius = (kelvin: number): string => {
    return kelvin !== undefined ? (kelvin - 273.15).toFixed(1) : "N/A";
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;
      setLocation({ latitude, longitude });
      fetchWeatherData(latitude, longitude);
    } else {
      console.log('Location permission denied');
    }
  };

  const fetchWeatherData = (lat: number, lon: number) => {
    const UrlApi = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    axios.get(UrlApi)
      .then(response => {
        //console.log("Weather data:", response.data); // Verifica la respuesta completa
        setWeatherData(response.data);
      })
      .catch(error => {
        console.error("Error fetching weather data", error);
      });
  };
  useEffect(() => {
    getLocation();
  }, []);

  const getTranslatedCondition = (condition: string) => {
    return conditionTranslation[condition] || condition; // Si no se encuentra en el mapeo, se devuelve el original
  };
  const getWeatherIconUrl = (iconCode: string) => {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`; // URL para obtener el ícono en alta resolución
  };
  return (
    <View style={styles.container}>
      <View style={styles.weatherContainer}>
        <Text style={styles.title}>Clima en la región</Text>
        {weatherData ? (
          <>
            <Text style={styles.weatherText}>
              Temperatura: {kelvinToCelsius(weatherData.list[0].main.temp)}°C
            </Text>
            <Text style={styles.weatherText}>
              Condición: {getTranslatedCondition(weatherData.list[0].weather[0].description)}
            </Text>
            <Text style={styles.weatherText}>
              Temperatura mínima: {kelvinToCelsius(weatherData.list[0].main.temp_min)}°C
            </Text>
            <Text style={styles.weatherText}>
              Temperatura máxima: {kelvinToCelsius(weatherData.list[0].main.temp_max)}°C
            </Text>
            <Text style={styles.weatherText}>
              Humedad: {weatherData.list[0].main.humidity}%
            </Text>
            <Text style={styles.weatherText}>
              Velocidad del viento: {weatherData.list[0].wind.speed} m/s
            </Text>
            <Text style={styles.weatherText}>
              Visibilidad: {weatherData.list[0].visibility / 1000} km
            </Text>
          </>
        ) : (
          <Text style={styles.loadingText}>Cargando datos del clima...</Text>
        )}
      </View>
      <View style={styles.mapContainer}>
        {location && weatherData && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              coordinate={location}
              title="Tu ubicación"
              description={getTranslatedCondition(weatherData.list[0].weather[0].description)}
              image={{ uri: getWeatherIconUrl(weatherData.list[0].weather[0].icon) }} // Usamos el ícono para el marcador
            />
          </MapView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  weatherContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  weatherText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 10,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
