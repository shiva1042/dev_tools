import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import {
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
  Layers,
  ArrowLeftRight,
  X,
  Server,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const inputSx = {
  bgcolor: '#1a1a1a',
  color: 'grey.300',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
  '& .MuiInputBase-input': { color: '#ccc' },
  '& .MuiInputLabel-root': { color: '#888' },
};

interface CRSEntry {
  code: number;
  name: string;
  type: 'Geographic 2D' | 'Geographic 3D' | 'Projected' | 'Engineering' | 'Compound';
  area: string;
  coordSystem: string;
  unit: string;
  datum: string;
  ellipsoid: string;
  projectionMethod: string;
  bounds: [number, number, number, number] | null;
  wkt: string;
  proj4: string;
  category: string[];
  deprecated?: boolean;
}

const CRS_DATA: CRSEntry[] = [
  // Geographic CRS
  {
    code: 4326, name: 'WGS 84', type: 'Geographic 2D', area: 'World', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'World Geodetic System 1984', ellipsoid: 'WGS 84 (a=6378137, 1/f=298.257223563)',
    projectionMethod: 'N/A (geographic)', bounds: [-180, -90, 180, 90],
    wkt: 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4326"]]',
    proj4: '+proj=longlat +datum=WGS84 +no_defs +type=crs',
    category: ['Geographic', 'Popular'],
  },
  {
    code: 4269, name: 'NAD83', type: 'Geographic 2D', area: 'North America - Canada and USA', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'North American Datum 1983', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'N/A (geographic)', bounds: [-172.54, 14.92, -47.74, 84.33],
    wkt: 'GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4269"]]',
    proj4: '+proj=longlat +datum=NAD83 +no_defs +type=crs',
    category: ['Geographic'],
  },
  {
    code: 4267, name: 'NAD27', type: 'Geographic 2D', area: 'North America - Canada and USA', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'North American Datum 1927', ellipsoid: 'Clarke 1866 (a=6378206.4, b=6356583.8)',
    projectionMethod: 'N/A (geographic)', bounds: [-172.54, 14.92, -47.74, 84.33],
    wkt: 'GEOGCS["NAD27",DATUM["North_American_Datum_1927",SPHEROID["Clarke 1866",6378206.4,294.978698213898]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4267"]]',
    proj4: '+proj=longlat +datum=NAD27 +no_defs +type=crs',
    category: ['Geographic'],
  },
  {
    code: 4283, name: 'GDA94', type: 'Geographic 2D', area: 'Australia - onshore and offshore', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'Geocentric Datum of Australia 1994', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'N/A (geographic)', bounds: [93.41, -60.55, 173.34, -8.47],
    wkt: 'GEOGCS["GDA94",DATUM["Geocentric_Datum_of_Australia_1994",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4283"]]',
    proj4: '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs +type=crs',
    category: ['Geographic'],
  },
  {
    code: 4167, name: 'NZGD2000', type: 'Geographic 2D', area: 'New Zealand', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'New Zealand Geodetic Datum 2000', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'N/A (geographic)', bounds: [160.6, -55.95, -171.2, -25.88],
    wkt: 'GEOGCS["NZGD2000",DATUM["New_Zealand_Geodetic_Datum_2000",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4167"]]',
    proj4: '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs +type=crs',
    category: ['Geographic'],
  },
  {
    code: 4258, name: 'ETRS89', type: 'Geographic 2D', area: 'Europe - onshore and offshore', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'European Terrestrial Reference System 1989', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'N/A (geographic)', bounds: [-16.1, 32.88, 40.18, 84.73],
    wkt: 'GEOGCS["ETRS89",DATUM["European_Terrestrial_Reference_System_1989",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4258"]]',
    proj4: '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs +type=crs',
    category: ['Geographic'],
  },
  {
    code: 4674, name: 'SIRGAS 2000', type: 'Geographic 2D', area: 'South America; Central America', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'Sistema de Referencia Geocentrico para las Americas 2000', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'N/A (geographic)', bounds: [-122.19, -59.87, -25.28, 32.72],
    wkt: 'GEOGCS["SIRGAS 2000",DATUM["Sistema_de_Referencia_Geocentrico_para_las_Americas_2000",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4674"]]',
    proj4: '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs +type=crs',
    category: ['Geographic'],
  },
  {
    code: 4612, name: 'JGD2000', type: 'Geographic 2D', area: 'Japan', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'Japanese Geodetic Datum 2000', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'N/A (geographic)', bounds: [122.38, 17.09, 157.65, 46.05],
    wkt: 'GEOGCS["JGD2000",DATUM["Japanese_Geodetic_Datum_2000",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4612"]]',
    proj4: '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs +type=crs',
    category: ['Geographic'],
  },
  {
    code: 4490, name: 'CGCS2000', type: 'Geographic 2D', area: 'China - onshore and offshore', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'China Geodetic Coordinate System 2000', ellipsoid: 'CGCS2000 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'N/A (geographic)', bounds: [73.62, 3.86, 134.77, 53.56],
    wkt: 'GEOGCS["China Geodetic Coordinate System 2000",DATUM["China_2000",SPHEROID["CGCS2000",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4490"]]',
    proj4: '+proj=longlat +ellps=GRS80 +no_defs +type=crs',
    category: ['Geographic'],
  },
  // Projected CRS
  {
    code: 3857, name: 'WGS 84 / Pseudo-Mercator', type: 'Projected', area: 'World between 85.06S and 85.06N', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'World Geodetic System 1984', ellipsoid: 'WGS 84 (a=6378137, 1/f=298.257223563)',
    projectionMethod: 'Popular Visualisation Pseudo Mercator',
    bounds: [-180, -85.06, 180, 85.06],
    wkt: 'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1],AUTHORITY["EPSG","3857"]]',
    proj4: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs',
    category: ['Projected', 'Popular'],
  },
  {
    code: 3395, name: 'WGS 84 / World Mercator', type: 'Projected', area: 'World between 80S and 84N', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'World Geodetic System 1984', ellipsoid: 'WGS 84 (a=6378137, 1/f=298.257223563)',
    projectionMethod: 'Mercator (variant A)',
    bounds: [-180, -80, 180, 84],
    wkt: 'PROJCS["WGS 84 / World Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1],AUTHORITY["EPSG","3395"]]',
    proj4: '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs',
    category: ['Projected', 'Popular'],
  },
  {
    code: 900913, name: 'Google Maps Global Mercator (deprecated)', type: 'Projected', area: 'World', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'World Geodetic System 1984', ellipsoid: 'WGS 84 (a=6378137, 1/f=298.257223563)',
    projectionMethod: 'Popular Visualisation Pseudo Mercator',
    bounds: [-180, -85.06, 180, 85.06],
    wkt: 'PROJCS["Google Maps Global Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1]]',
    proj4: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +no_defs',
    category: ['Projected', 'Popular'], deprecated: true,
  },
  // UTM North zones
  ...[1, 6, 10, 15, 17, 18, 28, 32, 33, 35, 36, 37, 43].map((zone): CRSEntry => {
    const cm = -183 + zone * 6;
    return {
      code: 32600 + zone, name: `WGS 84 / UTM zone ${zone}N`, type: 'Projected',
      area: `Between ${cm - 3}W and ${cm + 3}E, northern hemisphere`, coordSystem: 'Cartesian 2D', unit: 'metre',
      datum: 'World Geodetic System 1984', ellipsoid: 'WGS 84 (a=6378137, 1/f=298.257223563)',
      projectionMethod: 'Transverse Mercator',
      bounds: [cm - 3, 0, cm + 3, 84],
      wkt: `PROJCS["WGS 84 / UTM zone ${zone}N",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",${cm}],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1],AUTHORITY["EPSG","${32600 + zone}"]]`,
      proj4: `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs +type=crs`,
      category: ['Projected', 'UTM'],
    };
  }),
  // UTM South zones
  ...[33, 35, 36, 50, 55, 56].map((zone): CRSEntry => {
    const cm = -183 + zone * 6;
    return {
      code: 32700 + zone, name: `WGS 84 / UTM zone ${zone}S`, type: 'Projected',
      area: `Between ${cm - 3}W and ${cm + 3}E, southern hemisphere`, coordSystem: 'Cartesian 2D', unit: 'metre',
      datum: 'World Geodetic System 1984', ellipsoid: 'WGS 84 (a=6378137, 1/f=298.257223563)',
      projectionMethod: 'Transverse Mercator',
      bounds: [cm - 3, -80, cm + 3, 0],
      wkt: `PROJCS["WGS 84 / UTM zone ${zone}S",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",${cm}],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",10000000],UNIT["metre",1],AUTHORITY["EPSG","${32700 + zone}"]]`,
      proj4: `+proj=utm +zone=${zone} +south +datum=WGS84 +units=m +no_defs +type=crs`,
      category: ['Projected', 'UTM'],
    };
  }),
  {
    code: 2154, name: 'RGF93 / Lambert-93', type: 'Projected', area: 'France - onshore and offshore', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'Reseau Geodesique Francais 1993', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'Lambert Conic Conformal (2SP)',
    bounds: [-9.86, 41.15, 10.38, 51.56],
    wkt: 'PROJCS["RGF93 / Lambert-93",GEOGCS["RGF93",DATUM["Reseau_Geodesique_Francais_1993",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",49],PARAMETER["standard_parallel_2",44],PARAMETER["latitude_of_origin",46.5],PARAMETER["central_meridian",3],PARAMETER["false_easting",700000],PARAMETER["false_northing",6600000],UNIT["metre",1],AUTHORITY["EPSG","2154"]]',
    proj4: '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    category: ['Projected'],
  },
  {
    code: 27700, name: 'OSGB 1936 / British National Grid', type: 'Projected', area: 'United Kingdom - onshore', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'OSGB 1936', ellipsoid: 'Airy 1830 (a=6377563.396, b=6356256.909)',
    projectionMethod: 'Transverse Mercator',
    bounds: [-7.56, 49.96, 1.78, 60.84],
    wkt: 'PROJCS["OSGB 1936 / British National Grid",GEOGCS["OSGB 1936",DATUM["OSGB_1936",SPHEROID["Airy 1830",6377563.396,299.3249646]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",49],PARAMETER["central_meridian",-2],PARAMETER["scale_factor",0.9996012717],PARAMETER["false_easting",400000],PARAMETER["false_northing",-100000],UNIT["metre",1],AUTHORITY["EPSG","27700"]]',
    proj4: '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs +type=crs',
    category: ['Projected'],
  },
  {
    code: 2193, name: 'NZGD2000 / New Zealand Transverse Mercator 2000', type: 'Projected', area: 'New Zealand - onshore', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'New Zealand Geodetic Datum 2000', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'Transverse Mercator',
    bounds: [166.37, -47.33, 178.63, -34.1],
    wkt: 'PROJCS["NZGD2000 / New Zealand Transverse Mercator 2000",GEOGCS["NZGD2000",DATUM["New_Zealand_Geodetic_Datum_2000",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",173],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",1600000],PARAMETER["false_northing",10000000],UNIT["metre",1],AUTHORITY["EPSG","2193"]]',
    proj4: '+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    category: ['Projected'],
  },
  {
    code: 28992, name: 'Amersfoort / RD New', type: 'Projected', area: 'Netherlands - onshore', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'Amersfoort', ellipsoid: 'Bessel 1841 (a=6377397.155, 1/f=299.1528128)',
    projectionMethod: 'Oblique Stereographic',
    bounds: [3.37, 50.75, 7.21, 53.47],
    wkt: 'PROJCS["Amersfoort / RD New",GEOGCS["Amersfoort",DATUM["Amersfoort",SPHEROID["Bessel 1841",6377397.155,299.1528128]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Oblique_Stereographic"],PARAMETER["latitude_of_origin",52.15616055555555],PARAMETER["central_meridian",5.38763888888889],PARAMETER["scale_factor",0.9999079],PARAMETER["false_easting",155000],PARAMETER["false_northing",463000],UNIT["metre",1],AUTHORITY["EPSG","28992"]]',
    proj4: '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs +type=crs',
    category: ['Projected'],
  },
  {
    code: 3006, name: 'SWEREF99 TM', type: 'Projected', area: 'Sweden', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'SWEREF99', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'Transverse Mercator',
    bounds: [10.03, 54.96, 24.17, 69.07],
    wkt: 'PROJCS["SWEREF99 TM",GEOGCS["SWEREF99",DATUM["SWEREF99",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",15],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1],AUTHORITY["EPSG","3006"]]',
    proj4: '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    category: ['Projected'],
  },
  // US State Plane
  {
    code: 2229, name: 'NAD83 / California zone 5 (ftUS)', type: 'Projected', area: 'USA - California - SPCS - 5', coordSystem: 'Cartesian 2D', unit: 'US survey foot',
    datum: 'North American Datum 1983', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'Lambert Conic Conformal (2SP)',
    bounds: [-121.42, 32.76, -114.12, 35.81],
    wkt: 'PROJCS["NAD83 / California zone 5 (ftUS)",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",35.46666666666667],PARAMETER["standard_parallel_2",34.03333333333333],PARAMETER["latitude_of_origin",33.5],PARAMETER["central_meridian",-118],PARAMETER["false_easting",6561666.667],PARAMETER["false_northing",1640416.667],UNIT["US survey foot",0.3048006096012192],AUTHORITY["EPSG","2229"]]',
    proj4: '+proj=lcc +lat_1=35.46666666666667 +lat_2=34.03333333333333 +lat_0=33.5 +lon_0=-118 +x_0=2000000.0001016 +y_0=500000.0001016001 +datum=NAD83 +units=us-ft +no_defs +type=crs',
    category: ['Projected'],
  },
  {
    code: 2230, name: 'NAD83 / California zone 6 (ftUS)', type: 'Projected', area: 'USA - California - SPCS - 6', coordSystem: 'Cartesian 2D', unit: 'US survey foot',
    datum: 'North American Datum 1983', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'Lambert Conic Conformal (2SP)',
    bounds: [-118.15, 32.53, -114.42, 34.08],
    wkt: 'PROJCS["NAD83 / California zone 6 (ftUS)",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",33.88333333333333],PARAMETER["standard_parallel_2",32.78333333333333],PARAMETER["latitude_of_origin",32.16666666666666],PARAMETER["central_meridian",-116.25],PARAMETER["false_easting",6561666.667],PARAMETER["false_northing",1640416.667],UNIT["US survey foot",0.3048006096012192],AUTHORITY["EPSG","2230"]]',
    proj4: '+proj=lcc +lat_1=33.88333333333333 +lat_2=32.78333333333333 +lat_0=32.16666666666666 +lon_0=-116.25 +x_0=2000000.0001016 +y_0=500000.0001016001 +datum=NAD83 +units=us-ft +no_defs +type=crs',
    category: ['Projected'],
  },
  {
    code: 2231, name: 'NAD83 / Colorado North (ftUS)', type: 'Projected', area: 'USA - Colorado - SPCS - N', coordSystem: 'Cartesian 2D', unit: 'US survey foot',
    datum: 'North American Datum 1983', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'Lambert Conic Conformal (2SP)',
    bounds: [-109.06, 39.56, -102.04, 41.0],
    wkt: 'PROJCS["NAD83 / Colorado North (ftUS)",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",40.78333333333333],PARAMETER["standard_parallel_2",39.71666666666667],PARAMETER["latitude_of_origin",39.33333333333334],PARAMETER["central_meridian",-105.5],PARAMETER["false_easting",3000000],PARAMETER["false_northing",1000000],UNIT["US survey foot",0.3048006096012192],AUTHORITY["EPSG","2231"]]',
    proj4: '+proj=lcc +lat_1=40.78333333333333 +lat_2=39.71666666666667 +lat_0=39.33333333333334 +lon_0=-105.5 +x_0=914401.8289 +y_0=304800.6096 +datum=NAD83 +units=us-ft +no_defs +type=crs',
    category: ['Projected'],
  },
  {
    code: 2263, name: 'NAD83 / New York Long Island (ftUS)', type: 'Projected', area: 'USA - New York - SPCS - Long Island', coordSystem: 'Cartesian 2D', unit: 'US survey foot',
    datum: 'North American Datum 1983', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'Lambert Conic Conformal (2SP)',
    bounds: [-74.26, 40.47, -71.8, 41.3],
    wkt: 'PROJCS["NAD83 / New York Long Island (ftUS)",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",41.03333333333333],PARAMETER["standard_parallel_2",40.66666666666666],PARAMETER["latitude_of_origin",40.16666666666666],PARAMETER["central_meridian",-74],PARAMETER["false_easting",984250.0000000002],PARAMETER["false_northing",0],UNIT["US survey foot",0.3048006096012192],AUTHORITY["EPSG","2263"]]',
    proj4: '+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000.0000000001 +y_0=0 +datum=NAD83 +units=us-ft +no_defs +type=crs',
    category: ['Projected'],
  },
  {
    code: 2264, name: 'NAD83 / North Carolina (ftUS)', type: 'Projected', area: 'USA - North Carolina', coordSystem: 'Cartesian 2D', unit: 'US survey foot',
    datum: 'North American Datum 1983', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'Lambert Conic Conformal (2SP)',
    bounds: [-84.32, 33.83, -75.46, 36.59],
    wkt: 'PROJCS["NAD83 / North Carolina (ftUS)",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",36.16666666666666],PARAMETER["standard_parallel_2",34.33333333333334],PARAMETER["latitude_of_origin",33.75],PARAMETER["central_meridian",-79],PARAMETER["false_easting",2000000.002616666],PARAMETER["false_northing",0],UNIT["US survey foot",0.3048006096012192],AUTHORITY["EPSG","2264"]]',
    proj4: '+proj=lcc +lat_1=36.16666666666666 +lat_2=34.33333333333334 +lat_0=33.75 +lon_0=-79 +x_0=609601.2192024384 +y_0=0 +datum=NAD83 +units=us-ft +no_defs +type=crs',
    category: ['Projected'],
  },
  // India
  {
    code: 7755, name: 'WGS 84 / India NSF LCC', type: 'Projected', area: 'India', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'World Geodetic System 1984', ellipsoid: 'WGS 84 (a=6378137, 1/f=298.257223563)',
    projectionMethod: 'Lambert Conic Conformal (2SP)',
    bounds: [68.0, 2.0, 98.0, 38.0],
    wkt: 'PROJCS["WGS 84 / India NSF LCC",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",12.472955],PARAMETER["standard_parallel_2",35.17280556],PARAMETER["latitude_of_origin",24],PARAMETER["central_meridian",80],PARAMETER["false_easting",4000000],PARAMETER["false_northing",4000000],UNIT["metre",1],AUTHORITY["EPSG","7755"]]',
    proj4: '+proj=lcc +lat_1=12.472955 +lat_2=35.17280555555556 +lat_0=24 +lon_0=80 +x_0=4000000 +y_0=4000000 +datum=WGS84 +units=m +no_defs +type=crs',
    category: ['Projected'],
  },
  ...[43, 44, 45, 46].map((zone): CRSEntry => {
    const cm = -183 + zone * 6;
    return {
      code: 32600 + zone, name: `WGS 84 / UTM zone ${zone}N`, type: 'Projected',
      area: `India region - UTM zone ${zone}N`, coordSystem: 'Cartesian 2D', unit: 'metre',
      datum: 'World Geodetic System 1984', ellipsoid: 'WGS 84 (a=6378137, 1/f=298.257223563)',
      projectionMethod: 'Transverse Mercator',
      bounds: [cm - 3, 0, cm + 3, 84],
      wkt: `PROJCS["WGS 84 / UTM zone ${zone}N",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",${cm}],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1],AUTHORITY["EPSG","${32600 + zone}"]]`,
      proj4: `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs +type=crs`,
      category: ['Projected', 'UTM'],
    };
  }),
  // Additional commonly needed
  {
    code: 4617, name: 'NAD83(CSRS)', type: 'Geographic 2D', area: 'Canada', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'NAD83 Canadian Spatial Reference System', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'N/A (geographic)', bounds: [-141.01, 40.04, -47.74, 86.46],
    wkt: 'GEOGCS["NAD83(CSRS)",DATUM["NAD83_Canadian_Spatial_Reference_System",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4617"]]',
    proj4: '+proj=longlat +ellps=GRS80 +no_defs +type=crs',
    category: ['Geographic'],
  },
  {
    code: 4230, name: 'ED50', type: 'Geographic 2D', area: 'Europe - west', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'European Datum 1950', ellipsoid: 'International 1924 (a=6378388, 1/f=297)',
    projectionMethod: 'N/A (geographic)', bounds: [-16.1, 25.71, 48.61, 84.73],
    wkt: 'GEOGCS["ED50",DATUM["European_Datum_1950",SPHEROID["International 1924",6378388,297]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4230"]]',
    proj4: '+proj=longlat +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +no_defs +type=crs',
    category: ['Geographic'],
  },
  {
    code: 4019, name: 'Unknown / GRS 1980', type: 'Geographic 2D', area: 'Not specified', coordSystem: 'Ellipsoidal 2D', unit: 'degree',
    datum: 'Not specified (based on GRS 1980)', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'N/A (geographic)', bounds: null,
    wkt: 'GEOGCS["Unknown",DATUM["Not_specified",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]',
    proj4: '+proj=longlat +ellps=GRS80 +no_defs',
    category: ['Geographic'],
  },
  {
    code: 3035, name: 'ETRS89 / LAEA Europe', type: 'Projected', area: 'Europe', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'European Terrestrial Reference System 1989', ellipsoid: 'GRS 1980 (a=6378137, 1/f=298.257222101)',
    projectionMethod: 'Lambert Azimuthal Equal Area',
    bounds: [-16.1, 32.88, 40.18, 84.73],
    wkt: 'PROJCS["ETRS89 / LAEA Europe",GEOGCS["ETRS89",DATUM["European_Terrestrial_Reference_System_1989",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Lambert_Azimuthal_Equal_Area"],PARAMETER["latitude_of_center",52],PARAMETER["longitude_of_center",10],PARAMETER["false_easting",4321000],PARAMETER["false_northing",3210000],UNIT["metre",1],AUTHORITY["EPSG","3035"]]',
    proj4: '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    category: ['Projected'],
  },
  {
    code: 32662, name: 'WGS 84 / Plate Carree', type: 'Projected', area: 'World', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'World Geodetic System 1984', ellipsoid: 'WGS 84 (a=6378137, 1/f=298.257223563)',
    projectionMethod: 'Equidistant Cylindrical',
    bounds: [-180, -90, 180, 90],
    wkt: 'PROJCS["WGS 84 / Plate Carree",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Equidistant_Cylindrical"],PARAMETER["central_meridian",0],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1],AUTHORITY["EPSG","32662"]]',
    proj4: '+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs',
    category: ['Projected'],
  },
  {
    code: 3785, name: 'Popular Visualisation CRS / Mercator (deprecated)', type: 'Projected', area: 'World', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'Popular Visualisation Datum', ellipsoid: 'Popular Visualisation Sphere',
    projectionMethod: 'Mercator', bounds: [-180, -85.06, 180, 85.06],
    wkt: 'PROJCS["Popular Visualisation CRS / Mercator",GEOGCS["Popular Visualisation CRS",DATUM["Popular_Visualisation_Datum",SPHEROID["Popular Visualisation Sphere",6378137,0]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1],AUTHORITY["EPSG","3785"]]',
    proj4: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +no_defs',
    category: ['Projected'], deprecated: true,
  },
  {
    code: 5514, name: 'S-JTSK / Krovak East North', type: 'Projected', area: 'Czech Republic; Slovakia', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'System of the Unified Trigonometrical Cadastral Network', ellipsoid: 'Bessel 1841',
    projectionMethod: 'Krovak',
    bounds: [12.09, 47.73, 22.56, 51.06],
    wkt: 'PROJCS["S-JTSK / Krovak East North",GEOGCS["S-JTSK",DATUM["System_Jednotne_Trigonometricke_Site_Katastralni",SPHEROID["Bessel 1841",6377397.155,299.1528128]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Krovak"],PARAMETER["latitude_of_center",49.5],PARAMETER["longitude_of_center",24.83333333333333],PARAMETER["azimuth",30.28813972222222],PARAMETER["pseudo_standard_parallel_1",78.5],PARAMETER["scale_factor",0.9999],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1],AUTHORITY["EPSG","5514"]]',
    proj4: '+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +towgs84=589,76,480,0,0,0,0 +units=m +no_defs +type=crs',
    category: ['Projected'],
  },
  {
    code: 4745, name: 'RD/83 / 3-degree Gauss-Kruger zone 4 (E-N)', type: 'Projected', area: 'Germany - Sachsen', coordSystem: 'Cartesian 2D', unit: 'metre',
    datum: 'Rauenberg Datum/83', ellipsoid: 'Bessel 1841',
    projectionMethod: 'Transverse Mercator',
    bounds: [11.57, 50.2, 15.04, 51.66],
    wkt: 'PROJCS["RD/83 / 3-degree Gauss-Kruger zone 4 (E-N)",GEOGCS["RD/83",DATUM["Rauenberg_Datum_83",SPHEROID["Bessel 1841",6377397.155,299.1528128]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",12],PARAMETER["scale_factor",1],PARAMETER["false_easting",4500000],PARAMETER["false_northing",0],UNIT["metre",1],AUTHORITY["EPSG","4745"]]',
    proj4: '+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +no_defs +type=crs',
    category: ['Projected'],
  },
];

// Deduplicate by code
const UNIQUE_CRS = CRS_DATA.reduce((acc, crs) => {
  if (!acc.find((c) => c.code === crs.code)) acc.push(crs);
  return acc;
}, [] as CRSEntry[]);

type FilterCategory = 'All' | 'Geographic' | 'Projected' | 'UTM' | 'Popular';

export default function EPSGCRSReference() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterCategory>('All');
  const [expandedCode, setExpandedCode] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<number | null>(null);
  const [compareB, setCompareB] = useState<number | null>(null);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied!` });
  }, []);

  const filteredCRS = useMemo(() => {
    let results = UNIQUE_CRS;
    if (filter !== 'All') {
      results = results.filter((crs) => crs.category.includes(filter));
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (crs) =>
          crs.code.toString().includes(q) ||
          crs.name.toLowerCase().includes(q) ||
          crs.area.toLowerCase().includes(q) ||
          crs.datum.toLowerCase().includes(q)
      );
    }
    return results.sort((a, b) => {
      const pop = ['Popular'];
      const aPopular = a.category.some((c) => pop.includes(c));
      const bPopular = b.category.some((c) => pop.includes(c));
      if (aPopular && !bPopular) return -1;
      if (!aPopular && bPopular) return 1;
      return a.code - b.code;
    });
  }, [search, filter]);

  const compareDataA = useMemo(() => compareA !== null ? UNIQUE_CRS.find((c) => c.code === compareA) : null, [compareA]);
  const compareDataB = useMemo(() => compareB !== null ? UNIQUE_CRS.find((c) => c.code === compareB) : null, [compareB]);

  const handleCRSClick = (code: number) => {
    if (compareMode) {
      if (compareA === null) {
        setCompareA(code);
      } else if (compareB === null && code !== compareA) {
        setCompareB(code);
      }
    } else {
      setExpandedCode(expandedCode === code ? null : code);
    }
  };

  const renderCRSDetail = (crs: CRSEntry) => (
    <Box sx={{ mt: 1.5 }}>
      <TableContainer>
        <Table size="small">
          <TableBody>
            <TableRow><TableCell sx={{ color: '#888', borderColor: '#222', width: 160 }}>EPSG Code</TableCell><TableCell sx={{ color: '#ccc', borderColor: '#222', fontFamily: 'monospace' }}>EPSG:{crs.code}</TableCell></TableRow>
            <TableRow><TableCell sx={{ color: '#888', borderColor: '#222' }}>Name</TableCell><TableCell sx={{ color: '#ccc', borderColor: '#222' }}>{crs.name}</TableCell></TableRow>
            <TableRow><TableCell sx={{ color: '#888', borderColor: '#222' }}>Type</TableCell><TableCell sx={{ color: '#ccc', borderColor: '#222' }}>{crs.type}</TableCell></TableRow>
            <TableRow><TableCell sx={{ color: '#888', borderColor: '#222' }}>Area of Use</TableCell><TableCell sx={{ color: '#ccc', borderColor: '#222' }}>{crs.area}</TableCell></TableRow>
            <TableRow><TableCell sx={{ color: '#888', borderColor: '#222' }}>Coordinate System</TableCell><TableCell sx={{ color: '#ccc', borderColor: '#222' }}>{crs.coordSystem}</TableCell></TableRow>
            <TableRow><TableCell sx={{ color: '#888', borderColor: '#222' }}>Unit</TableCell><TableCell sx={{ color: '#ccc', borderColor: '#222' }}>{crs.unit}</TableCell></TableRow>
            <TableRow><TableCell sx={{ color: '#888', borderColor: '#222' }}>Datum</TableCell><TableCell sx={{ color: '#ccc', borderColor: '#222' }}>{crs.datum}</TableCell></TableRow>
            <TableRow><TableCell sx={{ color: '#888', borderColor: '#222' }}>Ellipsoid</TableCell><TableCell sx={{ color: '#ccc', borderColor: '#222', fontFamily: 'monospace', fontSize: 12 }}>{crs.ellipsoid}</TableCell></TableRow>
            <TableRow><TableCell sx={{ color: '#888', borderColor: '#222' }}>Projection</TableCell><TableCell sx={{ color: '#ccc', borderColor: '#222' }}>{crs.projectionMethod}</TableCell></TableRow>
            {crs.bounds && (
              <TableRow><TableCell sx={{ color: '#888', borderColor: '#222' }}>Bounds (WSEN)</TableCell><TableCell sx={{ color: '#ccc', borderColor: '#222', fontFamily: 'monospace', fontSize: 12 }}>{crs.bounds.join(', ')}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#90caf9' }}>WKT Definition</Typography>
          <IconButton size="small" onClick={() => copyToClipboard(crs.wkt, 'WKT')} sx={{ color: '#888' }}><Copy size={13} /></IconButton>
        </Box>
        <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 11, color: '#aaa', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 160, overflowY: 'auto' }}>
          {crs.wkt}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#90caf9' }}>Proj4 String</Typography>
          <IconButton size="small" onClick={() => copyToClipboard(crs.proj4, 'Proj4')} sx={{ color: '#888' }}><Copy size={13} /></IconButton>
        </Box>
        <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 11, color: '#4caf50', wordBreak: 'break-all' }}>
          {crs.proj4}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#90caf9', display: 'flex', alignItems: 'center', gap: 0.5 }}><Server size={12} /> GeoServer SRS Format</Typography>
          <IconButton size="small" onClick={() => copyToClipboard(`EPSG:${crs.code}`, 'SRS')} sx={{ color: '#888' }}><Copy size={13} /></IconButton>
        </Box>
        <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 12, color: '#ffb74d' }}>
          SRS: EPSG:{crs.code}
        </Box>
        <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 11, color: '#aaa', mt: 1, whiteSpace: 'pre-wrap' }}>
{`<!-- GeoServer layer configuration -->
<srs>EPSG:${crs.code}</srs>
<nativeCRS>${crs.wkt.substring(0, 80)}...</nativeCRS>

<!-- GeoServer REST API -->
GET /geoserver/rest/workspaces/ws/coverages/layer.json
"srs": "EPSG:${crs.code}"

<!-- WMS GetMap request parameter -->
&SRS=EPSG:${crs.code}
<!-- or for WMS 1.3.0 -->
&CRS=EPSG:${crs.code}`}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined" startIcon={<Copy size={12} />} onClick={() => copyToClipboard(`EPSG:${crs.code}`, 'EPSG code')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', fontSize: 11 }}>
          Copy EPSG Code
        </Button>
        <Button size="small" variant="outlined" startIcon={<Copy size={12} />} onClick={() => copyToClipboard(crs.wkt, 'WKT')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', fontSize: 11 }}>
          Copy WKT
        </Button>
        <Button size="small" variant="outlined" startIcon={<Copy size={12} />} onClick={() => copyToClipboard(crs.proj4, 'Proj4')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', fontSize: 11 }}>
          Copy Proj4
        </Button>
        {crs.bounds && (
          <Button size="small" variant="outlined" startIcon={<Copy size={12} />} onClick={() => copyToClipboard(crs.bounds!.join(','), 'Bounds')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', fontSize: 11 }}>
            Copy Bounds
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', color: 'grey.300', p: 3, pt: 7 }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        Home
      </Link>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Globe size={32} /> EPSG / CRS Reference
      </Typography>
      <Typography variant="body2" sx={{ color: '#888', mb: 3 }}>
        Comprehensive coordinate reference system lookup with WKT, Proj4, and GeoServer integration ({UNIQUE_CRS.length} entries)
      </Typography>

      {/* Search and Filters */}
      <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by EPSG code, name, area, or datum..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: '1 1 300px', ...inputSx }}
            InputProps={{
              startAdornment: <Search size={16} style={{ marginRight: 8, color: '#666' }} />,
            }}
          />
          <Button
            size="small"
            variant={compareMode ? 'contained' : 'outlined'}
            startIcon={<ArrowLeftRight size={14} />}
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareA(null);
              setCompareB(null);
            }}
            sx={{
              textTransform: 'none',
              borderColor: '#333',
              color: compareMode ? '#fff' : '#ccc',
              bgcolor: compareMode ? '#1565c0' : 'transparent',
            }}
          >
            Compare Mode
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(['All', 'Geographic', 'Projected', 'UTM', 'Popular'] as FilterCategory[]).map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              onClick={() => setFilter(cat)}
              sx={{
                bgcolor: filter === cat ? '#1e3a5f' : '#1a1a1a',
                color: filter === cat ? '#90caf9' : '#999',
                border: filter === cat ? '1px solid #2196f3' : '1px solid #333',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#1e3a5f' },
              }}
            />
          ))}
          <Typography variant="caption" sx={{ color: '#666', ml: 1, alignSelf: 'center' }}>
            {filteredCRS.length} results
          </Typography>
        </Box>

        {compareMode && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#0d1117', border: '1px solid #1e3a5f', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: '#90caf9' }}>
              Compare mode: Click two CRS entries to compare them side by side.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
              <Chip
                label={compareA !== null ? `EPSG:${compareA}` : 'Select first CRS'}
                size="small"
                onDelete={compareA !== null ? () => setCompareA(null) : undefined}
                sx={{ bgcolor: compareA !== null ? '#1e3a5f' : '#1a1a1a', color: '#ccc', border: '1px solid #333' }}
              />
              <ArrowLeftRight size={14} style={{ color: '#666' }} />
              <Chip
                label={compareB !== null ? `EPSG:${compareB}` : 'Select second CRS'}
                size="small"
                onDelete={compareB !== null ? () => setCompareB(null) : undefined}
                sx={{ bgcolor: compareB !== null ? '#1e3a5f' : '#1a1a1a', color: '#ccc', border: '1px solid #333' }}
              />
            </Box>
          </Box>
        )}
      </Paper>

      {/* Comparison View */}
      {compareMode && compareDataA && compareDataB && (
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#90caf9' }}>
            Comparison: EPSG:{compareA} vs EPSG:{compareB}
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                {[
                  { label: 'EPSG Code', a: `${compareDataA.code}`, b: `${compareDataB.code}` },
                  { label: 'Name', a: compareDataA.name, b: compareDataB.name },
                  { label: 'Type', a: compareDataA.type, b: compareDataB.type },
                  { label: 'Area', a: compareDataA.area, b: compareDataB.area },
                  { label: 'Coord System', a: compareDataA.coordSystem, b: compareDataB.coordSystem },
                  { label: 'Unit', a: compareDataA.unit, b: compareDataB.unit },
                  { label: 'Datum', a: compareDataA.datum, b: compareDataB.datum },
                  { label: 'Ellipsoid', a: compareDataA.ellipsoid, b: compareDataB.ellipsoid },
                  { label: 'Projection', a: compareDataA.projectionMethod, b: compareDataB.projectionMethod },
                  { label: 'Bounds', a: compareDataA.bounds?.join(', ') || 'N/A', b: compareDataB.bounds?.join(', ') || 'N/A' },
                ].map((row) => {
                  const isDiff = row.a !== row.b;
                  return (
                    <TableRow key={row.label}>
                      <TableCell sx={{ color: '#888', borderColor: '#222', width: 130, fontSize: 12 }}>{row.label}</TableCell>
                      <TableCell sx={{ color: isDiff ? '#4caf50' : '#aaa', borderColor: '#222', fontSize: 12, bgcolor: isDiff ? '#0a1a0a' : 'transparent' }}>{row.a}</TableCell>
                      <TableCell sx={{ color: isDiff ? '#ff9800' : '#aaa', borderColor: '#222', fontSize: 12, bgcolor: isDiff ? '#1a1a0a' : 'transparent' }}>{row.b}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ borderColor: '#222', my: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#4caf50', mb: 0.5, display: 'block' }}>Proj4 (EPSG:{compareA})</Typography>
              <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: 10, color: '#aaa', wordBreak: 'break-all' }}>{compareDataA.proj4}</Box>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#ff9800', mb: 0.5, display: 'block' }}>Proj4 (EPSG:{compareB})</Typography>
              <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: 10, color: '#aaa', wordBreak: 'break-all' }}>{compareDataB.proj4}</Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* CRS List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {filteredCRS.map((crs) => (
          <Paper
            key={crs.code}
            sx={{
              bgcolor: (compareA === crs.code || compareB === crs.code) ? '#0d1a2a' : '#111',
              border: (compareA === crs.code || compareB === crs.code) ? '1px solid #1e3a5f' : '1px solid #222',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
              '&:hover': { borderColor: '#444' },
            }}
          >
            <Box
              onClick={() => handleCRSClick(crs.code)}
              sx={{ p: 1.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#4caf50', fontSize: 13 }}>
                  {crs.code}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#e0e0e0' }}>{crs.name}</Typography>
                  {crs.deprecated && <Chip label="deprecated" size="small" sx={{ bgcolor: '#4a1a1a', color: '#f44336', fontSize: 10, height: 18 }} />}
                </Box>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {crs.type} | {crs.unit} | {crs.area}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {crs.category.map((cat) => (
                  <Chip key={cat} label={cat} size="small" sx={{ bgcolor: '#1a1a1a', color: '#888', fontSize: 10, height: 20, border: '1px solid #222' }} />
                ))}
              </Box>
              <Tooltip title="Copy EPSG code">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(`EPSG:${crs.code}`, 'EPSG code'); }}
                  sx={{ color: '#666' }}
                >
                  <Copy size={14} />
                </IconButton>
              </Tooltip>
              {!compareMode && (expandedCode === crs.code ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </Box>

            {!compareMode && (
              <Collapse in={expandedCode === crs.code}>
                <Box sx={{ px: 2, pb: 2, borderTop: '1px solid #222' }}>
                  {renderCRSDetail(crs)}
                </Box>
              </Collapse>
            )}
          </Paper>
        ))}
      </Box>

      {filteredCRS.length === 0 && (
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#666' }}>
            No CRS found matching your search criteria.
          </Typography>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ bgcolor: '#1b5e20', color: '#fff' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
