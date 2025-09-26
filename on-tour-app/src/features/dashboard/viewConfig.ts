/**
 * Dashboard view configuration and widget contract
 *
 * Widgets are declarative items that the Dashboard renderer understands.
 * This keeps the Dashboard page lightweight and makes view composition reusable.
 */

export type Widget =
  | { type: 'map'; size: 'sm'|'md'|'lg' }
  | { type: 'actionHub'; kinds?: Array<'risk'|'urgency'|'opportunity'|'offer'|'finrisk'> }
  | { type: 'financeQuicklook' }
  | { type: 'tourOverview' }
  | { type: 'missionHud' };

export type ViewDefinition = {
  main: Widget[];
  sidebar: Widget[];
  mainOrder?: 'order-1'|'order-2';
  sidebarOrder?: 'order-1'|'order-2';
};

export type ViewId = 'default'|'finance'|'operations'|'promo'|`custom:${string}`;

export type ViewConfigMap = Record<string, ViewDefinition>;

export const defaultViews: ViewConfigMap = {
  default: {
    main: [ { type: 'map', size: 'md' }, { type: 'actionHub' } ],
    sidebar: [ { type: 'missionHud' } ]
  },
  finance: {
    main: [ { type: 'financeQuicklook' }, { type: 'map', size: 'sm' }, { type: 'actionHub', kinds: ['risk','finrisk'] } ],
    sidebar: [ { type: 'missionHud' }, { type: 'tourOverview' } ],
    mainOrder: 'order-2',
    sidebarOrder: 'order-1'
  },
  operations: {
    main: [ { type: 'map', size: 'md' }, { type: 'actionHub', kinds: ['urgency','opportunity','offer'] } ],
    sidebar: [ { type: 'missionHud' } ]
  },
  promo: {
    main: [ { type: 'tourOverview' }, { type: 'map', size: 'lg' } ],
    sidebar: [ { type: 'actionHub', kinds: ['offer','opportunity'] } ]
  }
};

/** Helper to resolve a view by id from a map, with fallback */
export function resolveView(map: ViewConfigMap, id: string): ViewDefinition {
  return map[id] || map['default'];
}
