import { TrainInfo } from '../types/navigation';

export const DEMO_TRAINS: TrainInfo[] = [
  {
    id: 'tr_12345',
    trainNumber: '12345',
    name: 'Express 12345 (Capital Superfast)',
    origin: 'Metro Central (MCJ)',
    destination: 'Northern Gateway Terminus',
    scheduledTime: '10:45 AM',
    expectedTime: '10:45 AM',
    status: 'Boarding',
    platform: 6,
    coachCount: 22,
  },
  {
    id: 'tr_98210',
    trainNumber: '98210',
    name: 'Intercity 98210 (Coastal Express)',
    origin: 'Metro Central (MCJ)',
    destination: 'Bay City Junction',
    scheduledTime: '11:15 AM',
    expectedTime: '11:20 AM',
    status: 'On Time',
    platform: 2,
    coachCount: 18,
  },
  {
    id: 'tr_40201',
    trainNumber: '40201',
    name: 'Metro Shuttle 402 (Airport Link)',
    origin: 'Metro Central (MCJ)',
    destination: 'International Aerocity',
    scheduledTime: '11:00 AM',
    expectedTime: '11:00 AM',
    status: 'On Time',
    platform: 1,
    coachCount: 8,
  },
  {
    id: 'tr_12431',
    trainNumber: '12431',
    name: 'Rajdhani 12431 (Night Cruiser)',
    origin: 'Metro Central (MCJ)',
    destination: 'South Harborside',
    scheduledTime: '11:45 AM',
    expectedTime: '11:45 AM',
    status: 'On Time',
    platform: 4,
    coachCount: 24,
  },
  {
    id: 'tr_56789',
    trainNumber: '56789',
    name: 'Valley Passenger 56789',
    origin: 'Metro Central (MCJ)',
    destination: 'Highland Ridge',
    scheduledTime: '12:10 PM',
    expectedTime: '12:15 PM',
    status: 'On Time',
    platform: 3,
    coachCount: 16,
  },
  {
    id: 'tr_33412',
    trainNumber: '33412',
    name: 'Western Express 33412',
    origin: 'Metro Central (MCJ)',
    destination: 'Oasis Central',
    scheduledTime: '12:30 PM',
    expectedTime: '12:30 PM',
    status: 'On Time',
    platform: 5,
    coachCount: 20,
  }
];

export function getTrainByNumber(query: string): TrainInfo | undefined {
  const clean = query.trim().toLowerCase();
  return DEMO_TRAINS.find(
    (t) => t.trainNumber.toLowerCase().includes(clean) || t.name.toLowerCase().includes(clean)
  );
}
