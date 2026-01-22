import { Input } from '../Common';
import { Plus, Trash2 } from 'lucide-react';
import type { GeoBoundingBox, GeoDistance, GeoPolygon } from '../../types';

type GeoType = 'geo_bounding_box' | 'geo_distance' | 'geo_polygon';

interface GeoInputProps {
  type: GeoType;
  value: GeoBoundingBox | GeoDistance | GeoPolygon;
  onChange: (value: GeoBoundingBox | GeoDistance | GeoPolygon) => void;
}

export const GeoInput = ({ type, value, onChange }: GeoInputProps) => {
  if (type === 'geo_bounding_box') {
    const bbox = value as GeoBoundingBox;
    return (
      <div className="flex flex-col gap-2 p-2 bg-gray-50 rounded border">
        <div className="text-xs font-medium text-gray-500">Bounding Box</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16">Top-Left:</span>
          <Input
            placeholder="Lat"
            type="number"
            step="any"
            value={bbox.top_left?.lat || ''}
            onChange={(e) =>
              onChange({
                ...bbox,
                top_left: { ...bbox.top_left, lat: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-24"
          />
          <Input
            placeholder="Lon"
            type="number"
            step="any"
            value={bbox.top_left?.lon || ''}
            onChange={(e) =>
              onChange({
                ...bbox,
                top_left: { ...bbox.top_left, lon: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16">Bottom-Right:</span>
          <Input
            placeholder="Lat"
            type="number"
            step="any"
            value={bbox.bottom_right?.lat || ''}
            onChange={(e) =>
              onChange({
                ...bbox,
                bottom_right: { ...bbox.bottom_right, lat: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-24"
          />
          <Input
            placeholder="Lon"
            type="number"
            step="any"
            value={bbox.bottom_right?.lon || ''}
            onChange={(e) =>
              onChange({
                ...bbox,
                bottom_right: { ...bbox.bottom_right, lon: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-24"
          />
        </div>
      </div>
    );
  }

  if (type === 'geo_distance') {
    const dist = value as GeoDistance;
    return (
      <div className="flex flex-col gap-2 p-2 bg-gray-50 rounded border">
        <div className="text-xs font-medium text-gray-500">Geo Distance</div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Distance (e.g., 10km)"
            value={dist.distance || ''}
            onChange={(e) => onChange({ ...dist, distance: e.target.value })}
            className="w-28"
          />
          <span className="text-xs text-gray-500">from</span>
          <Input
            placeholder="Lat"
            type="number"
            step="any"
            value={dist.location?.lat || ''}
            onChange={(e) =>
              onChange({
                ...dist,
                location: { ...dist.location, lat: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-24"
          />
          <Input
            placeholder="Lon"
            type="number"
            step="any"
            value={dist.location?.lon || ''}
            onChange={(e) =>
              onChange({
                ...dist,
                location: { ...dist.location, lon: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-24"
          />
        </div>
      </div>
    );
  }

  if (type === 'geo_polygon') {
    const poly = value as GeoPolygon;
    const points = poly.points || [];

    const addPoint = () => {
      onChange({ points: [...points, { lat: 0, lon: 0 }] });
    };

    const removePoint = (index: number) => {
      onChange({ points: points.filter((_, i) => i !== index) });
    };

    const updatePoint = (index: number, field: 'lat' | 'lon', newValue: number) => {
      const newPoints = [...points];
      newPoints[index] = { ...newPoints[index], [field]: newValue };
      onChange({ points: newPoints });
    };

    return (
      <div className="flex flex-col gap-2 p-2 bg-gray-50 rounded border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Geo Polygon Points</span>
          <button
            onClick={addPoint}
            className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs"
          >
            <Plus size={14} /> Add Point
          </button>
        </div>
        {points.map((point, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6">#{index + 1}</span>
            <Input
              placeholder="Lat"
              type="number"
              step="any"
              value={point.lat || ''}
              onChange={(e) => updatePoint(index, 'lat', parseFloat(e.target.value) || 0)}
              className="w-24"
            />
            <Input
              placeholder="Lon"
              type="number"
              step="any"
              value={point.lon || ''}
              onChange={(e) => updatePoint(index, 'lon', parseFloat(e.target.value) || 0)}
              className="w-24"
            />
            <button
              onClick={() => removePoint(index)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {points.length === 0 && (
          <div className="text-xs text-gray-400 italic">No points added yet</div>
        )}
      </div>
    );
  }

  return null;
};