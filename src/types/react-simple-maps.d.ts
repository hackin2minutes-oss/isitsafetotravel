declare module 'react-simple-maps' {
  import React from 'react';
  
  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
    };
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    width?: number;
    height?: number;
  }
  
  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveStart?: (position: { coordinates: [number, number]; zoom: number }) => void;
    onMove?: (position: { x: number; y: number; zoom: number; dragging: boolean }) => void;
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    children?: React.ReactNode;
  }
  
  interface GeographiesProps {
    geography: string | object;
    children: (data: { geographies: Geography[] }) => React.ReactNode;
    parseGeographies?: (geographies: any[]) => any[];
  }
  
  interface Geography {
    rsmKey: string;
    properties: {
      [key: string]: any;
      NAME?: string;
      ISO_A2?: string;
      ISO_A3?: string;
      iso_a2?: string;
      iso_a3?: string;
      ADM0_A3?: string;
    };
    geometry: any;
    id?: string;
  }
  
  interface GeographyProps {
    geography: Geography;
    className?: string;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onClick?: (geo: Geography) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    onMouseMove?: (event: React.MouseEvent) => void;
    tabIndex?: number | string;
  }
  
  export const ComposableMap: React.FC<ComposableMapProps>;
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
}
