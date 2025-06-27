import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { Tooltip as ReactTooltip } from 'react-tooltip';

// URL estándar al archivo topojson del mundo
const geoUrl = 'https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json';

// Definimos el tipo de dato para nuestros puntos en el mapa
export interface GeoPoint {
  name: string; // La IP
  coordinates: [number, number]; // [longitud, latitud]
}

interface MapChartProps {
  points: GeoPoint[];
}

const MapChartComponent: React.FC<MapChartProps> = ({ points }) => {
  return (
    <>
      <ComposableMap
        projectionConfig={{ scale: 160 }}
        style={{ width: '100%', height: 'auto' }}
        data-tooltip-id="map-tooltip" // ID para conectar con el tooltip
      >
        <ZoomableGroup center={[0, 20]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#2C3E50"
                  stroke="#1A222C"
                  style={{
                    default: { outline: 'none' },
                    hover:   { outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
          {points.map(({ name, coordinates }) => (
            <Marker key={name} coordinates={coordinates}>
              <circle
                r={4}
                fill="#F56565" // Usamos un color que resalte, como rojo
                stroke="#FFF"
                strokeWidth={1}
                data-tooltip-content={name} // El contenido del tooltip será la IP
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      {/* El componente Tooltip que se mostrará al pasar el ratón */}
      <ReactTooltip id="map-tooltip" />
    </>
  );
};

export default MapChartComponent;