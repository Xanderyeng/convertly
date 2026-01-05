'use client';

import { useQueryState } from 'nuqs';
import { SUPPORTED_FORMATS, FORMAT_LABELS } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function FormatSelector() {
  const [format, setFormat] = useQueryState('format', {
    defaultValue: 'webp',
  });

  return (
    <div className="space-y-2">
      <label htmlFor="format" className="text-sm font-medium">
        Output Format
      </label>
      <Select value={format || 'webp'} onValueChange={setFormat}>
        <SelectTrigger id="format">
          <SelectValue placeholder="Select format" />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_FORMATS.filter((f) => f !== 'svg').map((format) => (
            <SelectItem key={format} value={format}>
              {FORMAT_LABELS[format]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}