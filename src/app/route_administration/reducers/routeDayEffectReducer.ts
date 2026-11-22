import { RouteDayEffectAction } from "@/app/route_administration/types/routeDayEffectActions";
import { RouteDayEffect } from "@/app/route_administration/types/types";

export default function routeDayReducer(
  routeDayEffects: Map<string, RouteDayEffect>, 
  action: RouteDayEffectAction) {
  switch(action.type) {
    case 'add_new_route_day': {
      const { idRouteDay, state, color } = action;
      routeDayEffects.set(
        idRouteDay, 
        {
          showStores: state,
          assignedColor: color
        }
      );
      return new Map(routeDayEffects);
    }
    case 'show_information': {
      const {idRouteDay, state} = action;
      if (routeDayEffects.has(idRouteDay)) {
        routeDayEffects.get(idRouteDay)!.showStores = state;
      }
      return new Map(routeDayEffects);
    }
    case 'assign_color' : {
      const {idRouteDay, color} = action;
      if (routeDayEffects.has(idRouteDay)) {
        routeDayEffects.get(idRouteDay)!.assignedColor = color;
      }
      return new Map(routeDayEffects);
    }
    case 'remove_route_day': {
      const {idRouteDay} = action;
      routeDayEffects.delete(idRouteDay);
      return new Map(routeDayEffects);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}