import { Input } from '../Common';
import type { RangeValue } from '../../types';

interface RangeInputProps {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
}

export const RangeInput = ({ value, onChange }: RangeInputProps) => {
  const handleChange = (field: keyof RangeValue, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue || undefined,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="From (gte)"
        value={value.gte !== undefined ? String(value.gte) : ''}
        onChange={(e) => handleChange('gte', e.target.value)}
        className="w-28"
      />
      <span className="text-gray-400">to</span>
      <Input
        placeholder="To (lte)"
        value={value.lte !== undefined ? String(value.lte) : ''}
        onChange={(e) => handleChange('lte', e.target.value)}
        className="w-28"
      />
    </div>
  );
};