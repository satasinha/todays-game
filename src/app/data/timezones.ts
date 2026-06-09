export interface TzOption {
  label: string;
  value: string;
}

export const COMMON_TIMEZONES: TzOption[] = [
  { label: 'UTC', value: 'UTC' },
  // Americas
  { label: 'New York (ET)',        value: 'America/New_York' },
  { label: 'Chicago (CT)',         value: 'America/Chicago' },
  { label: 'Denver (MT)',          value: 'America/Denver' },
  { label: 'Los Angeles (PT)',     value: 'America/Los_Angeles' },
  { label: 'Toronto',              value: 'America/Toronto' },
  { label: 'Vancouver',            value: 'America/Vancouver' },
  { label: 'Mexico City',          value: 'America/Mexico_City' },
  { label: 'São Paulo',            value: 'America/Sao_Paulo' },
  { label: 'Buenos Aires',         value: 'America/Argentina/Buenos_Aires' },
  // Europe
  { label: 'London (GMT/BST)',     value: 'Europe/London' },
  { label: 'Paris / Berlin (CET)', value: 'Europe/Paris' },
  { label: 'Helsinki (EET)',       value: 'Europe/Helsinki' },
  { label: 'Moscow (MSK)',         value: 'Europe/Moscow' },
  // Middle East & Africa
  { label: 'Riyadh (AST)',         value: 'Asia/Riyadh' },
  { label: 'Dubai (GST)',          value: 'Asia/Dubai' },
  { label: 'Lagos (WAT)',          value: 'Africa/Lagos' },
  { label: 'Nairobi (EAT)',        value: 'Africa/Nairobi' },
  // Asia
  { label: 'Karachi (PKT)',        value: 'Asia/Karachi' },
  { label: 'India (IST)',          value: 'Asia/Kolkata' },
  { label: 'Dhaka (BST)',          value: 'Asia/Dhaka' },
  { label: 'Bangkok (ICT)',        value: 'Asia/Bangkok' },
  { label: 'Singapore (SGT)',      value: 'Asia/Singapore' },
  { label: 'Beijing / Shanghai',   value: 'Asia/Shanghai' },
  { label: 'Tokyo (JST)',          value: 'Asia/Tokyo' },
  { label: 'Seoul (KST)',          value: 'Asia/Seoul' },
  // Pacific
  { label: 'Sydney (AEST)',        value: 'Australia/Sydney' },
  { label: 'Auckland (NZST)',      value: 'Pacific/Auckland' },
];
