declare module "@mapbox/mapbox-gl-geocoder" {
  export default class MapboxGeocoder {
    constructor(options: Record<string, unknown>);
    addTo(container: string | HTMLElement): unknown;
    on(
      type: string,
      listener: (e: {
        result: {
          place_name: string;
          geometry: { coordinates: [number, number] };
        };
      }) => void,
    ): unknown;
    onRemove(): unknown;
  }
}
