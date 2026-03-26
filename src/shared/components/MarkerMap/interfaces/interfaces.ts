export interface IMapMarker{
  id_marker: string,
  id_item: string,
  hoverComponent: React.ReactNode | null;
  clickComponent: React.ReactNode | null;
  color_item: string,
  id_group: string,
  latitude: string;
  longitude: string;
}