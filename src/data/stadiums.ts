export interface Stadium {
  city: string;
  timezone: string;
  country: string;
  name: string;
  capacity: number;
}

export const STADIUMS: Stadium[] = [
  {
    city: "Vancouver",
    timezone: "UTC-7",
    country: "ca",
    name: "BC Place",
    capacity: 54000,
  },
  {
    city: "Seattle",
    timezone: "UTC-7",
    country: "us",
    name: "Lumen Field",
    capacity: 69000,
  },
  {
    city: "San Francisco Bay Area",
    timezone: "UTC-7",
    country: "us",
    name: "Levi's Stadium",
    capacity: 71000,
  },
  {
    city: "Los Angeles",
    timezone: "UTC-7",
    country: "us",
    name: "SoFi Stadium",
    capacity: 70000,
  },
  {
    city: "Guadalajara",
    timezone: "UTC-6",
    country: "mx",
    name: "Estadio Akron",
    capacity: 48000,
  },
  {
    city: "Mexico City",
    timezone: "UTC-6",
    country: "mx",
    name: "Estadio Azteca",
    capacity: 83000,
  },
  {
    city: "Monterrey",
    timezone: "UTC-6",
    country: "mx",
    name: "Estadio BBVA",
    capacity: 53500,
  },
  {
    city: "Houston",
    timezone: "UTC-5",
    country: "us",
    name: "NRG Stadium",
    capacity: 72000,
  },
  {
    city: "Dallas",
    timezone: "UTC-5",
    country: "us",
    name: "AT&T Stadium",
    capacity: 94000,
  },
  {
    city: "Kansas City",
    timezone: "UTC-5",
    country: "us",
    name: "Arrowhead Stadium",
    capacity: 73000,
  },
  {
    city: "Atlanta",
    timezone: "UTC-4",
    country: "us",
    name: "Mercedes-Benz Stadium",
    capacity: 75000,
  },
  {
    city: "Miami",
    timezone: "UTC-4",
    country: "us",
    name: "Hard Rock Stadium",
    capacity: 65000,
  },
  {
    city: "Toronto",
    timezone: "UTC-4",
    country: "ca",
    name: "BMO Field",
    capacity: 45000,
  },
  {
    city: "Boston",
    timezone: "UTC-4",
    country: "us",
    name: "Gillette Stadium",
    capacity: 65000,
  },
  {
    city: "Philadelphia",
    timezone: "UTC-4",
    country: "us",
    name: "Lincoln Financial Field",
    capacity: 69000,
  },
  {
    city: "New York/New Jersey",
    timezone: "UTC-4",
    country: "us",
    name: "MetLife Stadium",
    capacity: 82500,
  },
];

export const TOTAL_STADIUM_CAPACITY = STADIUMS.reduce(
  (sum, s) => sum + s.capacity,
  0,
);
