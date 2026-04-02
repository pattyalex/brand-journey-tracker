import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Globe, Calendar, Clock, MapPin, ChevronDown } from 'lucide-react';

const TIMEZONES = [
  // GMT-11
  { value: 'Pacific/Niue', name: 'Niue', offset: 'GMT-11:00' },
  { value: 'Pacific/Pago_Pago', name: 'Pago Pago', offset: 'GMT-11:00' },
  // GMT-10
  { value: 'Pacific/Honolulu', name: 'Hawaii Time', offset: 'GMT-10:00' },
  { value: 'Pacific/Rarotonga', name: 'Rarotonga', offset: 'GMT-10:00' },
  { value: 'Pacific/Tahiti', name: 'Tahiti', offset: 'GMT-10:00' },
  // GMT-9:30
  { value: 'Pacific/Marquesas', name: 'Marquesas', offset: 'GMT-09:30' },
  // GMT-9
  { value: 'America/Anchorage', name: 'Alaska Time', offset: 'GMT-09:00' },
  { value: 'Pacific/Gambier', name: 'Gambier', offset: 'GMT-09:00' },
  // GMT-8
  { value: 'America/Los_Angeles', name: 'Pacific Time', offset: 'GMT-08:00' },
  { value: 'America/Tijuana', name: 'Pacific Time - Tijuana', offset: 'GMT-08:00' },
  { value: 'America/Vancouver', name: 'Pacific Time - Vancouver', offset: 'GMT-08:00' },
  { value: 'America/Whitehorse', name: 'Pacific Time - Whitehorse', offset: 'GMT-08:00' },
  { value: 'Pacific/Pitcairn', name: 'Pitcairn', offset: 'GMT-08:00' },
  // GMT-7
  { value: 'America/Denver', name: 'Mountain Time', offset: 'GMT-07:00' },
  { value: 'America/Dawson_Creek', name: 'Mountain Time - Dawson Creek', offset: 'GMT-07:00' },
  { value: 'America/Edmonton', name: 'Mountain Time - Edmonton', offset: 'GMT-07:00' },
  { value: 'America/Hermosillo', name: 'Mountain Time - Hermosillo', offset: 'GMT-07:00' },
  { value: 'America/Mazatlan', name: 'Mountain Time - Chihuahua, Mazatlan', offset: 'GMT-07:00' },
  { value: 'America/Phoenix', name: 'Mountain Time - Arizona', offset: 'GMT-07:00' },
  { value: 'America/Yellowknife', name: 'Mountain Time - Yellowknife', offset: 'GMT-07:00' },
  // GMT-6
  { value: 'America/Chicago', name: 'Central Time', offset: 'GMT-06:00' },
  { value: 'America/Belize', name: 'Belize', offset: 'GMT-06:00' },
  { value: 'America/Costa_Rica', name: 'Costa Rica', offset: 'GMT-06:00' },
  { value: 'America/El_Salvador', name: 'El Salvador', offset: 'GMT-06:00' },
  { value: 'America/Guatemala', name: 'Guatemala', offset: 'GMT-06:00' },
  { value: 'America/Managua', name: 'Managua', offset: 'GMT-06:00' },
  { value: 'America/Mexico_City', name: 'Central Time - Mexico City', offset: 'GMT-06:00' },
  { value: 'America/Regina', name: 'Central Time - Regina', offset: 'GMT-06:00' },
  { value: 'America/Tegucigalpa', name: 'Central Time - Tegucigalpa', offset: 'GMT-06:00' },
  { value: 'America/Winnipeg', name: 'Central Time - Winnipeg', offset: 'GMT-06:00' },
  { value: 'Pacific/Galapagos', name: 'Galapagos', offset: 'GMT-06:00' },
  // GMT-5
  { value: 'America/New_York', name: 'Eastern Time', offset: 'GMT-05:00' },
  { value: 'America/Bogota', name: 'Bogota', offset: 'GMT-05:00' },
  { value: 'America/Cancun', name: 'Cancun', offset: 'GMT-05:00' },
  { value: 'America/Cayman', name: 'Cayman', offset: 'GMT-05:00' },
  { value: 'America/Guayaquil', name: 'Guayaquil', offset: 'GMT-05:00' },
  { value: 'America/Havana', name: 'Havana', offset: 'GMT-05:00' },
  { value: 'America/Iqaluit', name: 'Eastern Time - Iqaluit', offset: 'GMT-05:00' },
  { value: 'America/Jamaica', name: 'Jamaica', offset: 'GMT-05:00' },
  { value: 'America/Lima', name: 'Lima', offset: 'GMT-05:00' },
  { value: 'America/Nassau', name: 'Nassau', offset: 'GMT-05:00' },
  { value: 'America/Panama', name: 'Panama', offset: 'GMT-05:00' },
  { value: 'America/Port-au-Prince', name: 'Port-au-Prince', offset: 'GMT-05:00' },
  { value: 'America/Rio_Branco', name: 'Rio Branco', offset: 'GMT-05:00' },
  { value: 'America/Toronto', name: 'Eastern Time - Toronto', offset: 'GMT-05:00' },
  { value: 'Pacific/Easter', name: 'Easter Island', offset: 'GMT-05:00' },
  // GMT-4
  { value: 'America/Barbados', name: 'Barbados', offset: 'GMT-04:00' },
  { value: 'America/Boa_Vista', name: 'Boa Vista', offset: 'GMT-04:00' },
  { value: 'America/Caracas', name: 'Caracas', offset: 'GMT-04:00' },
  { value: 'America/Curacao', name: 'Curacao', offset: 'GMT-04:00' },
  { value: 'America/Grand_Turk', name: 'Grand Turk', offset: 'GMT-04:00' },
  { value: 'America/Guyana', name: 'Guyana', offset: 'GMT-04:00' },
  { value: 'America/Halifax', name: 'Atlantic Time - Halifax', offset: 'GMT-04:00' },
  { value: 'America/La_Paz', name: 'La Paz', offset: 'GMT-04:00' },
  { value: 'America/Manaus', name: 'Manaus', offset: 'GMT-04:00' },
  { value: 'America/Martinique', name: 'Martinique', offset: 'GMT-04:00' },
  { value: 'America/Port_of_Spain', name: 'Port of Spain', offset: 'GMT-04:00' },
  { value: 'America/Porto_Velho', name: 'Porto Velho', offset: 'GMT-04:00' },
  { value: 'America/Puerto_Rico', name: 'Puerto Rico', offset: 'GMT-04:00' },
  { value: 'America/Santo_Domingo', name: 'Santo Domingo', offset: 'GMT-04:00' },
  { value: 'America/Thule', name: 'Thule', offset: 'GMT-04:00' },
  { value: 'Atlantic/Bermuda', name: 'Bermuda', offset: 'GMT-04:00' },
  // GMT-3:30
  { value: 'America/St_Johns', name: 'Newfoundland Time - St. Johns', offset: 'GMT-03:30' },
  // GMT-3
  { value: 'America/Argentina/Buenos_Aires', name: 'Buenos Aires', offset: 'GMT-03:00' },
  { value: 'America/Asuncion', name: 'Asuncion', offset: 'GMT-03:00' },
  { value: 'America/Bahia', name: 'Salvador', offset: 'GMT-03:00' },
  { value: 'America/Belem', name: 'Belem', offset: 'GMT-03:00' },
  { value: 'America/Campo_Grande', name: 'Campo Grande', offset: 'GMT-03:00' },
  { value: 'America/Cayenne', name: 'Cayenne', offset: 'GMT-03:00' },
  { value: 'America/Cuiaba', name: 'Cuiaba', offset: 'GMT-03:00' },
  { value: 'America/Fortaleza', name: 'Fortaleza', offset: 'GMT-03:00' },
  { value: 'America/Maceio', name: 'Maceio', offset: 'GMT-03:00' },
  { value: 'America/Miquelon', name: 'Miquelon', offset: 'GMT-03:00' },
  { value: 'America/Montevideo', name: 'Montevideo', offset: 'GMT-03:00' },
  { value: 'America/Paramaribo', name: 'Paramaribo', offset: 'GMT-03:00' },
  { value: 'America/Recife', name: 'Recife', offset: 'GMT-03:00' },
  { value: 'America/Santiago', name: 'Santiago', offset: 'GMT-03:00' },
  { value: 'America/Sao_Paulo', name: 'Sao Paulo', offset: 'GMT-03:00' },
  { value: 'Atlantic/Stanley', name: 'Stanley', offset: 'GMT-03:00' },
  // GMT-2
  { value: 'America/Noronha', name: 'Noronha', offset: 'GMT-02:00' },
  { value: 'Atlantic/South_Georgia', name: 'South Georgia', offset: 'GMT-02:00' },
  // GMT-1
  { value: 'America/Scoresbysund', name: 'Scoresbysund', offset: 'GMT-01:00' },
  { value: 'Atlantic/Azores', name: 'Azores', offset: 'GMT-01:00' },
  { value: 'Atlantic/Cape_Verde', name: 'Cape Verde', offset: 'GMT-01:00' },
  // GMT+0
  { value: 'Africa/Abidjan', name: 'Abidjan', offset: 'GMT+00:00' },
  { value: 'Africa/Accra', name: 'Accra', offset: 'GMT+00:00' },
  { value: 'Africa/Casablanca', name: 'Casablanca', offset: 'GMT+00:00' },
  { value: 'Africa/Monrovia', name: 'Monrovia', offset: 'GMT+00:00' },
  { value: 'Atlantic/Canary', name: 'Canary Islands', offset: 'GMT+00:00' },
  { value: 'Atlantic/Reykjavik', name: 'Reykjavik', offset: 'GMT+00:00' },
  { value: 'Etc/GMT', name: 'GMT (no daylight saving)', offset: 'GMT+00:00' },
  { value: 'Europe/Dublin', name: 'Dublin', offset: 'GMT+00:00' },
  { value: 'Europe/Lisbon', name: 'Lisbon', offset: 'GMT+00:00' },
  { value: 'Europe/London', name: 'London', offset: 'GMT+00:00' },
  // GMT+1
  { value: 'Africa/Algiers', name: 'Algiers', offset: 'GMT+01:00' },
  { value: 'Africa/Lagos', name: 'Lagos', offset: 'GMT+01:00' },
  { value: 'Africa/Tunis', name: 'Tunis', offset: 'GMT+01:00' },
  { value: 'Europe/Amsterdam', name: 'Amsterdam', offset: 'GMT+01:00' },
  { value: 'Europe/Andorra', name: 'Andorra', offset: 'GMT+01:00' },
  { value: 'Europe/Belgrade', name: 'Central European Time - Belgrade', offset: 'GMT+01:00' },
  { value: 'Europe/Berlin', name: 'Berlin', offset: 'GMT+01:00' },
  { value: 'Europe/Brussels', name: 'Brussels', offset: 'GMT+01:00' },
  { value: 'Europe/Budapest', name: 'Budapest', offset: 'GMT+01:00' },
  { value: 'Europe/Copenhagen', name: 'Copenhagen', offset: 'GMT+01:00' },
  { value: 'Europe/Luxembourg', name: 'Luxembourg', offset: 'GMT+01:00' },
  { value: 'Europe/Madrid', name: 'Madrid', offset: 'GMT+01:00' },
  { value: 'Europe/Malta', name: 'Malta', offset: 'GMT+01:00' },
  { value: 'Europe/Monaco', name: 'Monaco', offset: 'GMT+01:00' },
  { value: 'Europe/Oslo', name: 'Oslo', offset: 'GMT+01:00' },
  { value: 'Europe/Paris', name: 'Paris', offset: 'GMT+01:00' },
  { value: 'Europe/Prague', name: 'Central European Time - Prague', offset: 'GMT+01:00' },
  { value: 'Europe/Rome', name: 'Rome', offset: 'GMT+01:00' },
  { value: 'Europe/Stockholm', name: 'Stockholm', offset: 'GMT+01:00' },
  { value: 'Europe/Vienna', name: 'Vienna', offset: 'GMT+01:00' },
  { value: 'Europe/Warsaw', name: 'Warsaw', offset: 'GMT+01:00' },
  { value: 'Europe/Zurich', name: 'Zurich', offset: 'GMT+01:00' },
  // GMT+2
  { value: 'Africa/Cairo', name: 'Cairo', offset: 'GMT+02:00' },
  { value: 'Africa/Johannesburg', name: 'Johannesburg', offset: 'GMT+02:00' },
  { value: 'Africa/Maputo', name: 'Maputo', offset: 'GMT+02:00' },
  { value: 'Africa/Tripoli', name: 'Tripoli', offset: 'GMT+02:00' },
  { value: 'Africa/Windhoek', name: 'Windhoek', offset: 'GMT+02:00' },
  { value: 'Asia/Amman', name: 'Amman', offset: 'GMT+02:00' },
  { value: 'Asia/Beirut', name: 'Beirut', offset: 'GMT+02:00' },
  { value: 'Asia/Damascus', name: 'Damascus', offset: 'GMT+02:00' },
  { value: 'Asia/Gaza', name: 'Gaza', offset: 'GMT+02:00' },
  { value: 'Asia/Jerusalem', name: 'Jerusalem', offset: 'GMT+02:00' },
  { value: 'Asia/Nicosia', name: 'Nicosia', offset: 'GMT+02:00' },
  { value: 'Europe/Athens', name: 'Athens', offset: 'GMT+02:00' },
  { value: 'Europe/Bucharest', name: 'Bucharest', offset: 'GMT+02:00' },
  { value: 'Europe/Chisinau', name: 'Chisinau', offset: 'GMT+02:00' },
  { value: 'Europe/Helsinki', name: 'Helsinki', offset: 'GMT+02:00' },
  { value: 'Europe/Kaliningrad', name: 'Kaliningrad', offset: 'GMT+02:00' },
  { value: 'Europe/Kyiv', name: 'Kyiv', offset: 'GMT+02:00' },
  { value: 'Europe/Riga', name: 'Riga', offset: 'GMT+02:00' },
  { value: 'Europe/Sofia', name: 'Sofia', offset: 'GMT+02:00' },
  { value: 'Europe/Tallinn', name: 'Tallinn', offset: 'GMT+02:00' },
  { value: 'Europe/Vilnius', name: 'Vilnius', offset: 'GMT+02:00' },
  // GMT+3
  { value: 'Africa/Khartoum', name: 'Khartoum', offset: 'GMT+03:00' },
  { value: 'Africa/Nairobi', name: 'Nairobi', offset: 'GMT+03:00' },
  { value: 'Asia/Baghdad', name: 'Baghdad', offset: 'GMT+03:00' },
  { value: 'Asia/Qatar', name: 'Qatar', offset: 'GMT+03:00' },
  { value: 'Asia/Riyadh', name: 'Riyadh', offset: 'GMT+03:00' },
  { value: 'Europe/Istanbul', name: 'Istanbul', offset: 'GMT+03:00' },
  { value: 'Europe/Minsk', name: 'Minsk', offset: 'GMT+03:00' },
  { value: 'Europe/Moscow', name: 'Moscow', offset: 'GMT+03:00' },
  // GMT+3:30
  { value: 'Asia/Tehran', name: 'Tehran', offset: 'GMT+03:30' },
  // GMT+4
  { value: 'Asia/Baku', name: 'Baku', offset: 'GMT+04:00' },
  { value: 'Asia/Dubai', name: 'Dubai', offset: 'GMT+04:00' },
  { value: 'Asia/Tbilisi', name: 'Tbilisi', offset: 'GMT+04:00' },
  { value: 'Asia/Yerevan', name: 'Yerevan', offset: 'GMT+04:00' },
  { value: 'Europe/Samara', name: 'Samara', offset: 'GMT+04:00' },
  { value: 'Indian/Mauritius', name: 'Mauritius', offset: 'GMT+04:00' },
  { value: 'Indian/Reunion', name: 'Reunion', offset: 'GMT+04:00' },
  // GMT+4:30
  { value: 'Asia/Kabul', name: 'Kabul', offset: 'GMT+04:30' },
  // GMT+5
  { value: 'Asia/Aqtobe', name: 'Aqtobe', offset: 'GMT+05:00' },
  { value: 'Asia/Ashgabat', name: 'Ashgabat', offset: 'GMT+05:00' },
  { value: 'Asia/Dushanbe', name: 'Dushanbe', offset: 'GMT+05:00' },
  { value: 'Asia/Karachi', name: 'Karachi', offset: 'GMT+05:00' },
  { value: 'Asia/Tashkent', name: 'Tashkent', offset: 'GMT+05:00' },
  { value: 'Asia/Yekaterinburg', name: 'Yekaterinburg', offset: 'GMT+05:00' },
  { value: 'Indian/Maldives', name: 'Maldives', offset: 'GMT+05:00' },
  // GMT+5:30
  { value: 'Asia/Calcutta', name: 'India Standard Time', offset: 'GMT+05:30' },
  { value: 'Asia/Colombo', name: 'Colombo', offset: 'GMT+05:30' },
  // GMT+5:45
  { value: 'Asia/Katmandu', name: 'Kathmandu', offset: 'GMT+05:45' },
  // GMT+6
  { value: 'Asia/Almaty', name: 'Almaty', offset: 'GMT+06:00' },
  { value: 'Asia/Bishkek', name: 'Bishkek', offset: 'GMT+06:00' },
  { value: 'Asia/Dhaka', name: 'Dhaka', offset: 'GMT+06:00' },
  { value: 'Asia/Omsk', name: 'Omsk', offset: 'GMT+06:00' },
  { value: 'Asia/Thimphu', name: 'Thimphu', offset: 'GMT+06:00' },
  // GMT+6:30
  { value: 'Asia/Rangoon', name: 'Rangoon', offset: 'GMT+06:30' },
  { value: 'Indian/Cocos', name: 'Cocos', offset: 'GMT+06:30' },
  // GMT+7
  { value: 'Asia/Bangkok', name: 'Bangkok', offset: 'GMT+07:00' },
  { value: 'Asia/Ho_Chi_Minh', name: 'Ho Chi Minh', offset: 'GMT+07:00' },
  { value: 'Asia/Hovd', name: 'Hovd', offset: 'GMT+07:00' },
  { value: 'Asia/Jakarta', name: 'Jakarta', offset: 'GMT+07:00' },
  { value: 'Asia/Krasnoyarsk', name: 'Krasnoyarsk', offset: 'GMT+07:00' },
  // GMT+8
  { value: 'Asia/Brunei', name: 'Brunei', offset: 'GMT+08:00' },
  { value: 'Asia/Hong_Kong', name: 'Hong Kong', offset: 'GMT+08:00' },
  { value: 'Asia/Irkutsk', name: 'Irkutsk', offset: 'GMT+08:00' },
  { value: 'Asia/Kuala_Lumpur', name: 'Kuala Lumpur', offset: 'GMT+08:00' },
  { value: 'Asia/Macau', name: 'Macau', offset: 'GMT+08:00' },
  { value: 'Asia/Manila', name: 'Manila', offset: 'GMT+08:00' },
  { value: 'Asia/Shanghai', name: 'China Time - Beijing', offset: 'GMT+08:00' },
  { value: 'Asia/Singapore', name: 'Singapore', offset: 'GMT+08:00' },
  { value: 'Asia/Taipei', name: 'Taipei', offset: 'GMT+08:00' },
  { value: 'Asia/Ulaanbaatar', name: 'Ulaanbaatar', offset: 'GMT+08:00' },
  { value: 'Australia/Perth', name: 'Western Time - Perth', offset: 'GMT+08:00' },
  // GMT+9
  { value: 'Asia/Dili', name: 'Dili', offset: 'GMT+09:00' },
  { value: 'Asia/Seoul', name: 'Seoul', offset: 'GMT+09:00' },
  { value: 'Asia/Tokyo', name: 'Tokyo', offset: 'GMT+09:00' },
  { value: 'Asia/Yakutsk', name: 'Yakutsk', offset: 'GMT+09:00' },
  { value: 'Pacific/Palau', name: 'Palau', offset: 'GMT+09:00' },
  // GMT+9:30
  { value: 'Australia/Darwin', name: 'Central Time - Darwin', offset: 'GMT+09:30' },
  // GMT+10
  { value: 'Asia/Vladivostok', name: 'Vladivostok', offset: 'GMT+10:00' },
  { value: 'Australia/Brisbane', name: 'Eastern Time - Brisbane', offset: 'GMT+10:00' },
  { value: 'Pacific/Chuuk', name: 'Chuuk', offset: 'GMT+10:00' },
  { value: 'Pacific/Guam', name: 'Guam', offset: 'GMT+10:00' },
  { value: 'Pacific/Port_Moresby', name: 'Port Moresby', offset: 'GMT+10:00' },
  // GMT+10:30
  { value: 'Australia/Adelaide', name: 'Central Time - Adelaide', offset: 'GMT+10:30' },
  // GMT+11
  { value: 'Australia/Hobart', name: 'Eastern Time - Hobart', offset: 'GMT+11:00' },
  { value: 'Australia/Sydney', name: 'Eastern Time - Sydney', offset: 'GMT+11:00' },
  { value: 'Pacific/Efate', name: 'Efate', offset: 'GMT+11:00' },
  { value: 'Pacific/Guadalcanal', name: 'Guadalcanal', offset: 'GMT+11:00' },
  { value: 'Pacific/Noumea', name: 'Noumea', offset: 'GMT+11:00' },
  { value: 'Pacific/Norfolk', name: 'Norfolk', offset: 'GMT+11:00' },
  // GMT+12
  { value: 'Asia/Kamchatka', name: 'Petropavlovsk-Kamchatskiy', offset: 'GMT+12:00' },
  { value: 'Pacific/Fiji', name: 'Fiji', offset: 'GMT+12:00' },
  { value: 'Pacific/Funafuti', name: 'Funafuti', offset: 'GMT+12:00' },
  { value: 'Pacific/Kwajalein', name: 'Kwajalein', offset: 'GMT+12:00' },
  { value: 'Pacific/Majuro', name: 'Majuro', offset: 'GMT+12:00' },
  { value: 'Pacific/Nauru', name: 'Nauru', offset: 'GMT+12:00' },
  { value: 'Pacific/Tarawa', name: 'Tarawa', offset: 'GMT+12:00' },
  { value: 'Pacific/Wake', name: 'Wake', offset: 'GMT+12:00' },
  // GMT+13
  { value: 'Pacific/Auckland', name: 'Auckland', offset: 'GMT+13:00' },
  { value: 'Pacific/Enderbury', name: 'Enderbury', offset: 'GMT+13:00' },
  { value: 'Pacific/Fakaofo', name: 'Fakaofo', offset: 'GMT+13:00' },
  { value: 'Pacific/Tongatapu', name: 'Tongatapu', offset: 'GMT+13:00' },
  // GMT+14
  { value: 'Pacific/Apia', name: 'Apia', offset: 'GMT+14:00' },
  { value: 'Pacific/Kiritimati', name: 'Kiritimati', offset: 'GMT+14:00' },
];

interface PreferencesSectionProps {
  selectedTimezone: string;
  handleTimezoneChange: (tz: string) => void;
  firstDayOfWeek: string;
  handleFirstDayChange: (day: string) => void;
}

const PreferencesSection = ({ selectedTimezone, handleTimezoneChange, firstDayOfWeek, handleFirstDayChange }: PreferencesSectionProps) => {
  const [showSpecificPicker, setShowSpecificPicker] = useState(selectedTimezone !== 'auto');

  const isSpecificSelected = selectedTimezone !== 'auto';

  return (
    <div
      className="bg-white/80 rounded-[20px] p-6"
      style={{
        boxShadow: '0 4px 24px rgba(45, 42, 38, 0.04)',
        border: '1px solid rgba(139, 115, 130, 0.06)',
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)',
            boxShadow: '0 4px 12px rgba(107, 74, 94, 0.2)',
          }}
        >
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg text-[#2d2a26]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            Calendar
          </h2>
          <p className="text-xs text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Customize your calendar settings
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Timezone */}
        <div>
          <label className="text-sm font-medium text-[#2d2a26] mb-3 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Timezone
          </label>
          {/* Option 1: Auto */}
          <button
            onClick={() => {
              handleTimezoneChange('auto');
              setShowSpecificPicker(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
              selectedTimezone === 'auto'
                ? "border-[#612a4f]/30 bg-[#612a4f]/5"
                : "border-[#8B7082]/15 bg-white hover:bg-[#8B7082]/5"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                selectedTimezone === 'auto'
                  ? "border-[#612a4f]"
                  : "border-[#8B7082]/40"
              )}
            >
              {selectedTimezone === 'auto' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#612a4f]" />
              )}
            </div>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: selectedTimezone === 'auto'
                  ? 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)'
                  : 'rgba(139, 112, 130, 0.1)',
                boxShadow: selectedTimezone === 'auto' ? '0 2px 8px rgba(107, 74, 94, 0.15)' : 'none',
              }}
            >
              <Globe className={cn("w-4 h-4", selectedTimezone === 'auto' ? "text-white" : "text-[#612a4f]")} />
            </div>
            <div>
              <p className="font-medium text-[#2d2a26] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Auto: Use device timezone
              </p>
              <p className="text-[11px] text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                The calendar always shows times in whatever timezone your phone/laptop is in.
              </p>
            </div>
          </button>

          {/* Option 2: Pick a specific timezone */}
          <button
            onClick={() => {
              if (!isSpecificSelected) {
                setShowSpecificPicker(true);
              }
            }}
            className={cn(
              "w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left mt-2",
              isSpecificSelected
                ? "border-[#612a4f]/30 bg-[#612a4f]/5"
                : showSpecificPicker
                  ? "border-[#612a4f]/20 bg-[#612a4f]/[0.02]"
                  : "border-[#8B7082]/15 bg-white hover:bg-[#8B7082]/5"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                isSpecificSelected
                  ? "border-[#612a4f]"
                  : "border-[#8B7082]/40"
              )}
            >
              {isSpecificSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#612a4f]" />
              )}
            </div>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: isSpecificSelected
                  ? 'linear-gradient(145deg, #8b6a7e 0%, #4a3442 100%)'
                  : 'rgba(139, 112, 130, 0.1)',
                boxShadow: isSpecificSelected ? '0 2px 8px rgba(107, 74, 94, 0.15)' : 'none',
              }}
            >
              <MapPin className={cn("w-4 h-4", isSpecificSelected ? "text-white" : "text-[#612a4f]")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#2d2a26] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Pick a specific timezone
              </p>
              <p className="text-[11px] text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Locks the calendar to that timezone no matter where you are.
              </p>

              {/* Timezone dropdown — visible when this option is active or user clicked it */}
              {(isSpecificSelected || showSpecificPicker) && (
                <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                  <Select value={isSpecificSelected ? selectedTimezone : undefined} onValueChange={handleTimezoneChange}>
                    <SelectTrigger
                      className="w-full h-auto pl-3 pr-4 py-2.5 rounded-lg border-[#8B7082]/20 bg-white hover:bg-[#8B7082]/5 transition-all focus:ring-2 focus:ring-[#612a4f]/20 focus:border-[#612a4f]/30"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {isSpecificSelected ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-[#8B7082]/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-3.5 h-3.5 text-[#612a4f]" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-[#2d2a26] text-sm">
                              {TIMEZONES.find(t => t.value === selectedTimezone)?.name}
                            </p>
                            <p className="text-[10px] text-[#8B7082]">
                              {TIMEZONES.find(t => t.value === selectedTimezone)?.offset}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-[#8B7082]">Select a timezone...</span>
                      )}
                    </SelectTrigger>
                    <SelectContent
                      className="rounded-xl border-[#8B7082]/20 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {TIMEZONES.map((tz) => (
                        <SelectItem
                          key={tz.value}
                          value={tz.value}
                          className="pl-10 pr-4 py-3 cursor-pointer focus:bg-[#612a4f]/10 focus:text-[#612a4f] rounded-lg mx-1 my-0.5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#8B7082]/10 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-[#612a4f] leading-tight">{tz.offset.replace('GMT', '')}</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{tz.name}</p>
                              <p className="text-[11px] text-[#8B7082]">{tz.offset}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </button>
        </div>

        <div className="h-px bg-[#8B7082]/10"></div>

        {/* First Day of Week in Calendar */}
        <div>
          <label className="text-sm font-medium text-[#2d2a26] mb-3 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            First Day of Week
          </label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { value: 'monday', label: 'Monday' },
              { value: 'sunday', label: 'Sunday' },
            ].map((day) => (
              <button
                key={day.value}
                onClick={() => handleFirstDayChange(day.value)}
                className={cn(
                  "px-4 py-3 text-sm rounded-xl transition-all",
                  firstDayOfWeek === day.value
                    ? "bg-[#612a4f]/10 text-[#612a4f] font-medium"
                    : "text-[#2d2a26] hover:bg-[#8B7082]/5 border border-[#E8E4E6]"
                )}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {day.label}
              </button>
            ))}
          </div>

          {/* Calendar Preview */}
          {(() => {
            const today = new Date();
            const todayDate = today.getDate();
            const todayDay = today.getDay();

            const getWeekDates = () => {
              const dates: number[] = [];
              let startOffset: number;

              if (firstDayOfWeek === 'monday') {
                startOffset = todayDay === 0 ? -6 : -(todayDay - 1);
              } else {
                startOffset = -todayDay;
              }

              for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(todayDate + startOffset + i);
                dates.push(d.getDate());
              }
              return dates;
            };

            const getNextWeekDates = () => {
              const dates: number[] = [];
              let startOffset: number;

              if (firstDayOfWeek === 'monday') {
                startOffset = todayDay === 0 ? 1 : (8 - todayDay);
              } else {
                startOffset = 7 - todayDay;
              }

              for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(todayDate + startOffset + i);
                dates.push(d.getDate());
              }
              return dates;
            };

            const weekDates = getWeekDates();
            const nextWeekDates = getNextWeekDates();

            return (
              <div
                className="rounded-xl overflow-hidden border border-[#E8E4E6]"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-[#E8E4E6] bg-[#F5F5F5]">
                  {(firstDayOfWeek === 'monday'
                    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                  ).map((day, index) => {
                    const isWeekend = firstDayOfWeek === 'monday'
                      ? index >= 5
                      : index === 0 || index === 6;
                    return (
                      <div
                        key={day}
                        className="py-2.5 text-center transition-all duration-300"
                        style={{
                          borderRight: index < 6 ? '1px solid #E8E4E6' : 'none',
                          backgroundColor: isWeekend ? '#EDEBEC' : undefined,
                        }}
                      >
                        <span
                          className="uppercase tracking-wider text-[11px] font-medium text-[#8B7082]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Grid - Current Week */}
                <div className="grid grid-cols-7 border-b border-[#E8E4E6]">
                  {weekDates.map((date, index) => {
                    const isToday = date === todayDate;
                    const isWeekend = firstDayOfWeek === 'monday'
                      ? index >= 5
                      : index === 0 || index === 6;
                    return (
                      <div
                        key={`week1-${index}`}
                        className="py-3 text-center transition-all duration-300 relative"
                        style={{
                          borderRight: index < 6 ? '1px solid #E8E4E6' : 'none',
                          backgroundColor: isWeekend ? '#F8F7F8' : 'white',
                        }}
                      >
                        <span
                          className={cn(
                            "text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full transition-all",
                            isToday
                              ? "bg-[#8B7082] text-white"
                              : "text-[#2d2a26]"
                          )}
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {date}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Grid - Next Week */}
                <div className="grid grid-cols-7">
                  {nextWeekDates.map((date, index) => {
                    const isWeekend = firstDayOfWeek === 'monday'
                      ? index >= 5
                      : index === 0 || index === 6;
                    return (
                      <div
                        key={`week2-${index}`}
                        className="py-3 text-center transition-all duration-300 relative"
                        style={{
                          borderRight: index < 6 ? '1px solid #E8E4E6' : 'none',
                          backgroundColor: isWeekend ? '#F8F7F8' : 'white',
                        }}
                      >
                        <span
                          className="text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full text-[#2d2a26]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
};

export default PreferencesSection;
