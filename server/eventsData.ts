import { EventData, CandidateRoute } from '../src/types';

export const EVENTS: Record<string, EventData> = {
  chinnaswamy_ipl: {
    id: 'chinnaswamy_ipl',
    name: 'IPL 2026: RCB vs CSK',
    type: 'sports',
    venue: 'M. Chinnaswamy Stadium, MG Road',
    lat: 12.9788,
    lon: 77.5996,
    startTime: '19:30',
    endTime: '23:15',
    attendees: 35000,
    description: 'High-voltage IPL blockbuster match in central Bengaluru. Massive crowd rush expected along MG Road, Cubbon Road, and Queens Road.',
    nearbyRoads: [
      {
        id: 'road_queens_rd',
        name: 'Queens Road (Balekundri - Stadium)',
        baselineVehicles: 1550,
        capacity: 2000,
        isLowLying: true, // Underpass near Cantonment is water-prone
        latLngs: [
          [12.9865, 77.5985],
          [12.9825, 77.5990],
          [12.9772, 77.5980]
        ]
      },
      {
        id: 'road_cubbon_rd',
        name: 'Cubbon Road (BRV - Manipal)',
        baselineVehicles: 1800,
        capacity: 2400,
        isLowLying: false,
        latLngs: [
          [12.9772, 77.5950],
          [12.9785, 77.6010],
          [12.9798, 77.6080]
        ]
      },
      {
        id: 'road_mg_rd',
        name: 'Mahatma Gandhi (MG) Road',
        baselineVehicles: 2200,
        capacity: 2800,
        isLowLying: false,
        latLngs: [
          [12.9750, 77.6015],
          [12.9745, 77.6075],
          [12.9730, 77.6200]
        ]
      },
      {
        id: 'road_kasturba_rd',
        name: 'Kasturba Road (Museum - Stadium)',
        baselineVehicles: 1400,
        capacity: 1900,
        isLowLying: false,
        latLngs: [
          [12.9715, 77.5945],
          [12.9755, 77.5965],
          [12.9772, 77.5980]
        ]
      },
      {
        id: 'road_residency_rd',
        name: 'Residency Road (Field Marshal Cariappa Rd)',
        baselineVehicles: 1650,
        capacity: 2200,
        isLowLying: false,
        latLngs: [
          [12.9650, 77.5990],
          [12.9710, 77.6080],
          [12.9725, 77.6130]
        ]
      },
      {
        id: 'road_lavelle_rd',
        name: 'Lavelle Road (Richmond - UB City)',
        baselineVehicles: 1100,
        capacity: 1600,
        isLowLying: false,
        latLngs: [
          [12.9660, 77.5975],
          [12.9715, 77.5965],
          [12.9735, 77.5960]
        ]
      }
    ],
    nearbyMetro: [
      {
        id: 'metro_cubbon_park',
        name: 'Cubbon Park Metro',
        line: 'Purple Line',
        distanceMeters: 400,
        lat: 12.9810,
        lon: 77.5968
      },
      {
        id: 'metro_mg_road',
        name: 'MG Road Metro',
        line: 'Purple Line',
        distanceMeters: 700,
        lat: 12.9756,
        lon: 77.6066
      },
      {
        id: 'metro_vidhana_soudha',
        name: 'Vidhana Soudha Metro',
        line: 'Purple Line',
        distanceMeters: 900,
        lat: 12.9797,
        lon: 77.5913
      }
    ]
  },

  palace_grounds_concert: {
    id: 'palace_grounds_concert',
    name: 'A.R. Rahman Live in Concert',
    type: 'concert',
    venue: 'Palace Grounds (Tripuravasini), Bellary Road',
    lat: 13.0034,
    lon: 77.5891,
    startTime: '18:00',
    endTime: '21:30',
    attendees: 20000,
    description: 'Mega musical concert attracting music lovers across the city. Traffic friction along Bellary Road, Mehkri Circle underpass, and Jayamahal.',
    nearbyRoads: [
      {
        id: 'road_mehkri_circle',
        name: 'Mehkri Circle Underpass / Bellary Rd',
        baselineVehicles: 2300,
        capacity: 2700,
        isLowLying: true, // Known flood hotspot during heavy Bengaluru rain
        latLngs: [
          [13.0130, 77.5840],
          [13.0080, 77.5865],
          [13.0020, 77.5890]
        ]
      },
      {
        id: 'road_jayamahal_rd',
        name: 'Jayamahal Main Road',
        baselineVehicles: 1350,
        capacity: 1800,
        isLowLying: false,
        latLngs: [
          [13.0020, 77.5895],
          [12.9985, 77.5960],
          [12.9930, 77.6015]
        ]
      },
      {
        id: 'road_sankey_rd',
        name: 'Sankey Road / Windsor Square',
        baselineVehicles: 1600,
        capacity: 2200,
        isLowLying: false,
        latLngs: [
          [12.9980, 77.5810],
          [12.9920, 77.5840],
          [12.9860, 77.5880]
        ]
      },
      {
        id: 'road_cv_raman_rd',
        name: 'CV Raman Road (Sadashivanagar)',
        baselineVehicles: 1500,
        capacity: 2000,
        isLowLying: false,
        latLngs: [
          [13.0125, 77.5750],
          [13.0100, 77.5820],
          [13.0080, 77.5865]
        ]
      }
    ],
    nearbyMetro: [
      {
        id: 'metro_sampige_road',
        name: 'Mantri Square Sampige Road',
        line: 'Green Line',
        distanceMeters: 1400,
        lat: 12.9904,
        lon: 77.5714
      },
      {
        id: 'metro_sandal_soap',
        name: 'Sandal Soap Factory Metro',
        line: 'Green Line',
        distanceMeters: 2100,
        lat: 13.0076,
        lon: 77.5562
      }
    ]
  },

  lalbagh_festival: {
    id: 'lalbagh_festival',
    name: 'Annual Lalbagh Flower & Cultural Festival',
    type: 'cultural',
    venue: 'Lalbagh Botanical Garden (West Gate)',
    lat: 12.9507,
    lon: 77.5848,
    startTime: '16:00',
    endTime: '20:00',
    attendees: 10000,
    description: 'Premier heritage flower exhibition. Heavy tourist footfall and vehicular queues along Hosur Main Road, Double Road, and Krumbiegal Road.',
    nearbyRoads: [
      {
        id: 'road_krumbiegal_rd',
        name: 'Krumbiegal Road (Lalbagh West Gate)',
        baselineVehicles: 950,
        capacity: 1250,
        isLowLying: true, // Old drain depression
        latLngs: [
          [12.9540, 77.5810],
          [12.9515, 77.5835],
          [12.9485, 77.5850]
        ]
      },
      {
        id: 'road_double_rd',
        name: 'KH Double Road / Shanthi Nagar',
        baselineVehicles: 1850,
        capacity: 2400,
        isLowLying: false,
        latLngs: [
          [12.9600, 77.5920],
          [12.9550, 77.5900],
          [12.9490, 77.5890]
        ]
      },
      {
        id: 'road_hosur_main_rd',
        name: 'Hosur Main Road (Dairy Circle)',
        baselineVehicles: 1950,
        capacity: 2500,
        isLowLying: false,
        latLngs: [
          [12.9470, 77.5910],
          [12.9400, 77.5980],
          [12.9340, 77.6070]
        ]
      },
      {
        id: 'road_rv_rd',
        name: 'RV Road (Minerva - South End)',
        baselineVehicles: 1550,
        capacity: 2100,
        isLowLying: false,
        latLngs: [
          [12.9520, 77.5780],
          [12.9450, 77.5790],
          [12.9380, 77.5800]
        ]
      }
    ],
    nearbyMetro: [
      {
        id: 'metro_lalbagh',
        name: 'Lalbagh Metro Station',
        line: 'Green Line',
        distanceMeters: 300,
        lat: 12.9460,
        lon: 77.5801
      },
      {
        id: 'metro_south_end',
        name: 'South End Circle Metro',
        line: 'Green Line',
        distanceMeters: 1100,
        lat: 12.9377,
        lon: 77.5806
      }
    ]
  }
};

// Safe lookup helper that supports aliases without mutating the EVENTS dictionary
export function getEvent(id: string): EventData | undefined {
  if (id === 'lalbagh_flower_show') {
    return EVENTS.lalbagh_festival;
  }
  return EVENTS[id];
}

// Candidate diversion routes for bottleneck segments
export const CANDIDATE_ROUTES: Record<string, CandidateRoute[]> = {
  // Routes bypassing Queens Road / Stadium direct choke
  road_queens_rd: [
    {
      id: 'route_queens_direct',
      segmentId: 'road_queens_rd',
      name: 'Route 1: Queens Road Direct Corridor (illustrative)',
      description: 'Direct passage past Stadium Gate 1; crosses primary event pedestrian zone.',
      distanceKm: 2.1,
      travelTimeMins: 32,
      hotspotSegmentsCrossed: 2,
      usesClosedRoad: true, // Closed during peak stadium ingress
      lowLyingSegments: 1, // Underpass depression
      waypoints: [
        [12.9865, 77.5985],
        [12.9825, 77.5990],
        [12.9795, 77.5988],
        [12.9770, 77.5980]
      ]
    },
    {
      id: 'route_infantry_bypass',
      segmentId: 'road_queens_rd',
      name: 'Route 2: Infantry Road -> Ali Asker Elevated Bypass (illustrative)',
      description: 'Diverts northbound & eastbound flow via Infantry Rd, wide 4-lane arterial avoiding stadium gates.',
      distanceKm: 2.8,
      travelTimeMins: 14,
      hotspotSegmentsCrossed: 0,
      usesClosedRoad: false,
      lowLyingSegments: 0,
      waypoints: [
        [12.9865, 77.5985],
        [12.9840, 77.5930],
        [12.9790, 77.5925],
        [12.9770, 77.5980]
      ]
    },
    {
      id: 'route_cunningham_detour',
      segmentId: 'road_queens_rd',
      name: 'Route 3: Cunningham Road Loop (illustrative)',
      description: 'Wider loop via Chandrika Hotel & Cunningham Road. Longer distance but steady flow.',
      distanceKm: 3.9,
      travelTimeMins: 22,
      hotspotSegmentsCrossed: 0,
      usesClosedRoad: false,
      lowLyingSegments: 0,
      waypoints: [
        [12.9865, 77.5985],
        [12.9890, 77.5940],
        [12.9850, 77.5880],
        [12.9780, 77.5910],
        [12.9770, 77.5980]
      ]
    }
  ],

  // Routes bypassing Cubbon Road
  road_cubbon_rd: [
    {
      id: 'route_cubbon_direct',
      segmentId: 'road_cubbon_rd',
      name: 'Route 1: Cubbon Road Direct',
      description: 'Through-traffic directly along stadium perimeter.',
      distanceKm: 2.4,
      travelTimeMins: 28,
      hotspotSegmentsCrossed: 2,
      usesClosedRoad: false,
      lowLyingSegments: 0,
      waypoints: [
        [12.9772, 77.5950],
        [12.9785, 77.6010],
        [12.9798, 77.6080]
      ]
    },
    {
      id: 'route_raj_bhavan_bypass',
      segmentId: 'road_cubbon_rd',
      name: 'Route 2: Raj Bhavan -> Kasturba Link (illustrative)',
      description: 'Redirects east-west traffic via Raj Bhavan arterial loop.',
      distanceKm: 3.1,
      travelTimeMins: 15,
      hotspotSegmentsCrossed: 0,
      usesClosedRoad: false,
      lowLyingSegments: 0,
      waypoints: [
        [12.9772, 77.5950],
        [12.9815, 77.5935],
        [12.9830, 77.6010],
        [12.9798, 77.6080]
      ]
    }
  ],

  // Routes bypassing Mehkri Circle Underpass at Palace Grounds
  road_mehkri_circle: [
    {
      id: 'route_mehkri_underpass',
      segmentId: 'road_mehkri_circle',
      name: 'Route 1: Mehkri Circle Underpass Direct (illustrative)',
      description: 'Direct underpass route towards Hebbal. Extremely vulnerable to waterlogging in monsoon.',
      distanceKm: 2.0,
      travelTimeMins: 36,
      hotspotSegmentsCrossed: 2,
      usesClosedRoad: false,
      lowLyingSegments: 2, // Low-lying underpass prone to flash accumulation
      waypoints: [
        [13.0130, 77.5840],
        [13.0080, 77.5865],
        [13.0020, 77.5890]
      ]
    },
    {
      id: 'route_jayamahal_tvtower',
      segmentId: 'road_mehkri_circle',
      name: 'Route 2: Jayamahal -> TV Tower Elevated Bypass (illustrative)',
      description: 'Grade-separated bypass routing via Jayamahal & Nandidurg Rd. High capacity, clear drainage.',
      distanceKm: 3.2,
      travelTimeMins: 16,
      hotspotSegmentsCrossed: 0,
      usesClosedRoad: false,
      lowLyingSegments: 0,
      waypoints: [
        [13.0130, 77.5840],
        [13.0100, 77.5920],
        [13.0030, 77.5960],
        [13.0020, 77.5890]
      ]
    },
    {
      id: 'route_sadashivanagar_link',
      segmentId: 'road_mehkri_circle',
      name: 'Route 3: Sankey Tank -> Sadashivanagar 8th Main (illustrative)',
      description: 'Alternative residential collector route for West-bound traffic.',
      distanceKm: 3.6,
      travelTimeMins: 20,
      hotspotSegmentsCrossed: 1,
      usesClosedRoad: false,
      lowLyingSegments: 0,
      waypoints: [
        [13.0130, 77.5840],
        [13.0090, 77.5790],
        [13.0010, 77.5820],
        [13.0020, 77.5890]
      ]
    }
  ],

  // Routes bypassing Krumbiegal Road at Lalbagh
  road_krumbiegal_rd: [
    {
      id: 'route_krumbiegal_direct',
      segmentId: 'road_krumbiegal_rd',
      name: 'Route 1: Krumbiegal Road Direct',
      description: 'Runs right in front of West Gate entrance with extreme pedestrian crossing friction.',
      distanceKm: 1.4,
      travelTimeMins: 26,
      hotspotSegmentsCrossed: 1,
      usesClosedRoad: true,
      lowLyingSegments: 1,
      waypoints: [
        [12.9540, 77.5810],
        [12.9515, 77.5835],
        [12.9485, 77.5850]
      ]
    },
    {
      id: 'route_double_flyover',
      segmentId: 'road_krumbiegal_rd',
      name: 'Route 2: KH Double Road Elevated Arterial (Recommended)',
      description: 'Continuous movement over KH Double Road flyover avoiding gate bottleneck.',
      distanceKm: 2.1,
      travelTimeMins: 11,
      hotspotSegmentsCrossed: 0,
      usesClosedRoad: false,
      lowLyingSegments: 0,
      waypoints: [
        [12.9540, 77.5810],
        [12.9560, 77.5880],
        [12.9500, 77.5895],
        [12.9485, 77.5850]
      ]
    }
  ]
};

// Protected Emergency Services Green Corridors (Ambulance, Fire & Rescue)
// These routes are strictly excluded from load spreading and general commuter diversions
export interface EmergencyCorridorData {
  id: string;
  name: string;
  destination: string;
  hospitalName: string;
  waypoints: [number, number][];
  baselineSaturationPct: number;
}

export const EMERGENCY_CORRIDORS: Record<string, EmergencyCorridorData> = {
  bowring_hospital_green_corridor: {
    id: 'bowring_hospital_green_corridor',
    name: 'Bowring Hospital Emergency Green Corridor',
    hospitalName: 'Bowring & Lady Curzon Hospital',
    destination: 'Lady Curzon Road / Shivaji Nagar Trauma Center',
    waypoints: [
      [12.9865, 77.5985], // Raj Bhavan Rd / Balekundri Circle
      [12.9835, 77.6015], // Lady Curzon Rd junction
      [12.9818, 77.6052]  // Bowring Hospital ER gate
    ],
    baselineSaturationPct: 44
  }
};
