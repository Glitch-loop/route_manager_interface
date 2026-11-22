export type RouteDayEffectAction =
  | {
      type: 'add_new_route_day';
      idRouteDay: string;
      state: boolean;
      color: string;
    }
  | {
      type: 'show_information';
      idRouteDay: string;
      state: boolean;
    }
  | {
      type: 'assign_color';
      idRouteDay: string;
      color: string;
    }
  | {
      type: 'remove_route_day';
      idRouteDay: string;
    };