import { useState, useCallback, useMemo, type JSX } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import {
  Play,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Code2,
  BookOpen,
  Braces,
  FileCode,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Wand2,
  Layers,
  Variable,
} from 'lucide-react';

/* ---------- Types ---------- */
interface ArcadeFunction {
  name: string;
  syntax: string;
  description: string;
  example: string;
  template: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/* ---------- Function Reference Data ---------- */
const functionCategories: Record<string, ArcadeFunction[]> = {
  Text: [
    { name: 'Concatenate', syntax: 'Concatenate(values, separator?)', description: 'Concatenates values together and returns a string.', example: 'Concatenate([$feature.FirstName, " ", $feature.LastName])', template: 'Concatenate([$feature.Field1, " ", $feature.Field2])' },
    { name: 'Find', syntax: 'Find(searchText, text, startPos?)', description: 'Finds a string within a text string. Returns the index position.', example: 'Find("Main", $feature.StreetName)', template: 'Find("searchText", $feature.FieldName)' },
    { name: 'Left', syntax: 'Left(text, numChars)', description: 'Returns the specified number of characters from the beginning of a string.', example: 'Left($feature.ZipCode, 3)', template: 'Left($feature.FieldName, 3)' },
    { name: 'Mid', syntax: 'Mid(text, startPos, numChars)', description: 'Returns a part of a string based on a starting position and length.', example: 'Mid($feature.Code, 2, 4)', template: 'Mid($feature.FieldName, 0, 5)' },
    { name: 'Right', syntax: 'Right(text, numChars)', description: 'Returns the specified number of characters from the end of a string.', example: 'Right($feature.Phone, 4)', template: 'Right($feature.FieldName, 4)' },
    { name: 'Upper', syntax: 'Upper(text)', description: 'Converts a string to all uppercase.', example: 'Upper($feature.Name)', template: 'Upper($feature.FieldName)' },
    { name: 'Lower', syntax: 'Lower(text)', description: 'Converts a string to all lowercase.', example: 'Lower($feature.Status)', template: 'Lower($feature.FieldName)' },
    { name: 'Trim', syntax: 'Trim(text)', description: 'Removes leading and trailing whitespace from a string.', example: 'Trim($feature.Description)', template: 'Trim($feature.FieldName)' },
    { name: 'Replace', syntax: 'Replace(text, searchText, replacementText)', description: 'Replaces occurrences of a string within another string.', example: 'Replace($feature.Address, "St.", "Street")', template: 'Replace($feature.FieldName, "old", "new")' },
    { name: 'Split', syntax: 'Split(text, separator)', description: 'Splits a string into an array of substrings.', example: 'Split($feature.Tags, ",")', template: 'Split($feature.FieldName, ",")' },
    { name: 'Text', syntax: 'Text(value, format?)', description: 'Converts a value to a formatted text string.', example: 'Text($feature.Population, "#,###")', template: 'Text($feature.FieldName, "#,###")' },
  ],
  Math: [
    { name: 'Abs', syntax: 'Abs(value)', description: 'Returns the absolute value of a number.', example: 'Abs($feature.Elevation)', template: 'Abs($feature.FieldName)' },
    { name: 'Ceil', syntax: 'Ceil(value, numPlaces?)', description: 'Returns the smallest integer greater than or equal to the given value.', example: 'Ceil($feature.Score, 2)', template: 'Ceil($feature.FieldName)' },
    { name: 'Floor', syntax: 'Floor(value, numPlaces?)', description: 'Returns the largest integer less than or equal to the given value.', example: 'Floor($feature.Price)', template: 'Floor($feature.FieldName)' },
    { name: 'Round', syntax: 'Round(value, numPlaces?)', description: 'Rounds a number to the specified number of decimal places.', example: 'Round($feature.Area, 2)', template: 'Round($feature.FieldName, 2)' },
    { name: 'Sqrt', syntax: 'Sqrt(value)', description: 'Returns the square root of a number.', example: 'Sqrt($feature.Variance)', template: 'Sqrt($feature.FieldName)' },
    { name: 'Pow', syntax: 'Pow(base, exponent)', description: 'Returns base raised to the power of exponent.', example: 'Pow($feature.Radius, 2) * PI', template: 'Pow($feature.FieldName, 2)' },
    { name: 'Log', syntax: 'Log(value)', description: 'Returns the natural logarithm (base e) of a number.', example: 'Log($feature.Population)', template: 'Log($feature.FieldName)' },
    { name: 'Min', syntax: 'Min(value1, value2, ...)', description: 'Returns the minimum of the provided values.', example: 'Min($feature.Score1, $feature.Score2)', template: 'Min($feature.Field1, $feature.Field2)' },
    { name: 'Max', syntax: 'Max(value1, value2, ...)', description: 'Returns the maximum of the provided values.', example: 'Max($feature.Score1, $feature.Score2)', template: 'Max($feature.Field1, $feature.Field2)' },
    { name: 'Mean', syntax: 'Mean(values)', description: 'Returns the mean (average) of an array of numbers.', example: 'Mean([$feature.Q1, $feature.Q2, $feature.Q3, $feature.Q4])', template: 'Mean([$feature.Field1, $feature.Field2, $feature.Field3])' },
    { name: 'Sum', syntax: 'Sum(values)', description: 'Returns the sum of an array of numbers.', example: 'Sum([$feature.Jan, $feature.Feb, $feature.Mar])', template: 'Sum([$feature.Field1, $feature.Field2])' },
    { name: 'Stdev', syntax: 'Stdev(values)', description: 'Returns the standard deviation of an array of numbers.', example: 'Stdev([$feature.Score1, $feature.Score2, $feature.Score3])', template: 'Stdev([$feature.Field1, $feature.Field2])' },
    { name: 'Variance', syntax: 'Variance(values)', description: 'Returns the variance of an array of numbers.', example: 'Variance([$feature.V1, $feature.V2])', template: 'Variance([$feature.Field1, $feature.Field2])' },
  ],
  Date: [
    { name: 'Now', syntax: 'Now()', description: 'Returns the current date and time.', example: 'Now()', template: 'Now()' },
    { name: 'Today', syntax: 'Today()', description: 'Returns the current date (without time).', example: 'Today()', template: 'Today()' },
    { name: 'Date', syntax: 'Date(year, month, day, hour?, min?, sec?)', description: 'Creates a date value.', example: 'Date(2024, 0, 1)', template: 'Date(2024, 0, 1)' },
    { name: 'DateAdd', syntax: 'DateAdd(date, value, units)', description: 'Adds a specified amount of time to a date.', example: 'DateAdd($feature.StartDate, 30, "days")', template: 'DateAdd($feature.DateField, 30, "days")' },
    { name: 'DateDiff', syntax: 'DateDiff(date1, date2, units)', description: 'Returns the difference between two dates in the specified units.', example: 'DateDiff(Now(), $feature.CreatedDate, "days")', template: 'DateDiff(Now(), $feature.DateField, "days")' },
    { name: 'Day', syntax: 'Day(date)', description: 'Returns the day of the month (1-31).', example: 'Day($feature.EventDate)', template: 'Day($feature.DateField)' },
    { name: 'Month', syntax: 'Month(date)', description: 'Returns the month (0-11).', example: 'Month($feature.EventDate)', template: 'Month($feature.DateField)' },
    { name: 'Year', syntax: 'Year(date)', description: 'Returns the year.', example: 'Year($feature.EventDate)', template: 'Year($feature.DateField)' },
    { name: 'Hour', syntax: 'Hour(date)', description: 'Returns the hour (0-23).', example: 'Hour($feature.Timestamp)', template: 'Hour($feature.DateField)' },
    { name: 'Minute', syntax: 'Minute(date)', description: 'Returns the minute (0-59).', example: 'Minute($feature.Timestamp)', template: 'Minute($feature.DateField)' },
    { name: 'Second', syntax: 'Second(date)', description: 'Returns the second (0-59).', example: 'Second($feature.Timestamp)', template: 'Second($feature.DateField)' },
    { name: 'Timestamp', syntax: 'Timestamp()', description: 'Returns the current date/time as epoch milliseconds.', example: 'Timestamp()', template: 'Timestamp()' },
  ],
  Geometry: [
    { name: 'Area', syntax: 'Area(geometry, units?)', description: 'Returns the area of a polygon in the specified units.', example: 'Area($feature, "acres")', template: 'Area($feature, "square-meters")' },
    { name: 'AreaGeodetic', syntax: 'AreaGeodetic(geometry, units?)', description: 'Returns the geodetic area of a polygon.', example: 'AreaGeodetic($feature, "hectares")', template: 'AreaGeodetic($feature, "square-meters")' },
    { name: 'Length', syntax: 'Length(geometry, units?)', description: 'Returns the length of a polyline in the specified units.', example: 'Length($feature, "miles")', template: 'Length($feature, "meters")' },
    { name: 'LengthGeodetic', syntax: 'LengthGeodetic(geometry, units?)', description: 'Returns the geodetic length of a polyline.', example: 'LengthGeodetic($feature, "kilometers")', template: 'LengthGeodetic($feature, "meters")' },
    { name: 'Centroid', syntax: 'Centroid(geometry)', description: 'Returns the centroid of a geometry.', example: 'Centroid($feature).x', template: 'Centroid($feature)' },
    { name: 'Buffer', syntax: 'Buffer(geometry, distance, units?)', description: 'Returns a polygon buffered from the input geometry.', example: 'Buffer($feature, 100, "meters")', template: 'Buffer($feature, 100, "meters")' },
    { name: 'Intersection', syntax: 'Intersection(geom1, geom2)', description: 'Returns the intersection of two geometries.', example: 'Intersection($feature, $otherFeature)', template: 'Intersection($feature, bufferGeom)' },
    { name: 'Union', syntax: 'Union(geom1, geom2)', description: 'Returns the union of two geometries.', example: 'Union($feature, $otherFeature)', template: 'Union(geom1, geom2)' },
    { name: 'Clip', syntax: 'Clip(geometry, envelope)', description: 'Clips a geometry to an envelope.', example: 'Clip($feature, Extent($mapView))', template: 'Clip($feature, envelope)' },
    { name: 'Within', syntax: 'Within(innerGeom, outerGeom)', description: 'Returns true if the first geometry is within the second.', example: 'Within($feature, boundaryPolygon)', template: 'Within($feature, containerGeom)' },
    { name: 'Intersects', syntax: 'Intersects(geom1, geom2)', description: 'Returns true if two geometries intersect.', example: 'Intersects($feature, studyArea)', template: 'Intersects($feature, otherGeom)' },
    { name: 'Contains', syntax: 'Contains(outerGeom, innerGeom)', description: 'Returns true if the first geometry contains the second.', example: 'Contains($feature, point)', template: 'Contains($feature, innerGeom)' },
  ],
  Feature: [
    { name: '$feature', syntax: '$feature.fieldName', description: 'References the current feature being evaluated.', example: '$feature.Population', template: '$feature.FieldName' },
    { name: '$layer', syntax: '$layer', description: 'References the current feature layer.', example: 'Count($layer)', template: '$layer' },
    { name: '$map', syntax: '$map', description: 'References the current web map.', example: 'var layer = $map.myLayerId', template: '$map' },
    { name: '$datapoint', syntax: '$datapoint', description: 'References the current data point in charts.', example: '$datapoint.Value', template: '$datapoint' },
    { name: '$config', syntax: '$config', description: 'References configuration parameters.', example: '$config.threshold', template: '$config' },
    { name: 'FeatureSetByName', syntax: 'FeatureSetByName($map, layerName, fields?, includeGeom?)', description: 'Returns a FeatureSet from a layer by its name.', example: 'FeatureSetByName($map, "Parcels", ["*"], true)', template: 'FeatureSetByName($map, "LayerName", ["*"], true)' },
    { name: 'Filter', syntax: 'Filter(featureSet, whereClause)', description: 'Filters a FeatureSet by a SQL-like expression.', example: 'Filter($layer, "Status = \'Active\'")', template: 'Filter($layer, "FieldName = \'value\'")' },
    { name: 'OrderBy', syntax: 'OrderBy(featureSet, fieldName)', description: 'Orders features by a field.', example: 'OrderBy($layer, "Population DESC")', template: 'OrderBy($layer, "FieldName DESC")' },
    { name: 'GroupBy', syntax: 'GroupBy(featureSet, groupFields, statistics)', description: 'Groups features and calculates statistics.', example: 'GroupBy($layer, "Category", {name: "Total", expression: "Amount", statistic: "SUM"})', template: 'GroupBy($layer, "GroupField", {name: "StatName", expression: "ValueField", statistic: "SUM"})' },
    { name: 'Top', syntax: 'Top(featureSet, count)', description: 'Returns the first n features.', example: 'Top(OrderBy($layer, "Score DESC"), 10)', template: 'Top(featureSet, 10)' },
    { name: 'Count', syntax: 'Count(featureSet)', description: 'Returns the number of features.', example: 'Count(Filter($layer, "Type = \'Residential\'"))', template: 'Count($layer)' },
    { name: 'Distinct', syntax: 'Distinct(featureSet, fieldName)', description: 'Returns distinct values from a field.', example: 'Distinct($layer, "Category")', template: 'Distinct($layer, "FieldName")' },
  ],
  Logical: [
    { name: 'IIf', syntax: 'IIf(condition, trueValue, falseValue)', description: 'Returns one of two values based on a condition.', example: 'IIf($feature.Score >= 70, "Pass", "Fail")', template: 'IIf($feature.FieldName > 0, "Yes", "No")' },
    { name: 'When', syntax: 'When(expr1, val1, expr2, val2, ..., default)', description: 'Evaluates expressions in order and returns the value for the first true expression.', example: 'When($feature.Type == "A", "Alpha", $feature.Type == "B", "Beta", "Other")', template: 'When(\n  $feature.FieldName == "A", "Value A",\n  $feature.FieldName == "B", "Value B",\n  "Default"\n)' },
    { name: 'Decode', syntax: 'Decode(value, match1, result1, ..., default)', description: 'Matches a value and returns the corresponding result.', example: 'Decode($feature.Status, 1, "Active", 2, "Inactive", "Unknown")', template: 'Decode($feature.FieldName, "match1", "result1", "match2", "result2", "default")' },
    { name: 'DefaultValue', syntax: 'DefaultValue(value, defaultVal)', description: 'Returns value if not empty, otherwise returns default.', example: 'DefaultValue($feature.Name, "N/A")', template: 'DefaultValue($feature.FieldName, "N/A")' },
    { name: 'IsEmpty', syntax: 'IsEmpty(value)', description: 'Returns true if value is null or empty.', example: 'IsEmpty($feature.Description)', template: 'IsEmpty($feature.FieldName)' },
    { name: 'IsNan', syntax: 'IsNan(value)', description: 'Returns true if value is not a number.', example: 'IsNan($feature.Score)', template: 'IsNan($feature.FieldName)' },
    { name: 'TypeOf', syntax: 'TypeOf(value)', description: 'Returns the type of the value as a string.', example: 'TypeOf($feature.Value)', template: 'TypeOf($feature.FieldName)' },
    { name: 'HasKey', syntax: 'HasKey(dict, key)', description: 'Returns true if a dictionary contains the specified key.', example: 'HasKey($feature, "OptionalField")', template: 'HasKey($feature, "FieldName")' },
    { name: 'DomainName', syntax: 'DomainName($feature, fieldName)', description: 'Returns the domain description for a coded value.', example: 'DomainName($feature, "LandUse")', template: 'DomainName($feature, "FieldName")' },
    { name: 'DomainCode', syntax: 'DomainCode($feature, fieldName, domainName)', description: 'Returns the domain code for a description value.', example: 'DomainCode($feature, "Status", "Active")', template: 'DomainCode($feature, "FieldName", "Description")' },
  ],
  Array: [
    { name: 'Array', syntax: 'Array(size, defaultValue?)', description: 'Creates an array of a specified size.', example: 'Array(10, 0)', template: 'Array(10, 0)' },
    { name: 'Push', syntax: 'Push(array, value)', description: 'Adds an element to the end of an array.', example: 'Push(myArray, newValue)', template: 'Push(arr, value)' },
    { name: 'Pop', syntax: 'Pop(array)', description: 'Removes and returns the last element of an array.', example: 'Pop(myArray)', template: 'Pop(arr)' },
    { name: 'Splice', syntax: 'Splice(array, index, count, ...items)', description: 'Adds/removes elements from an array.', example: 'Splice(myArray, 1, 2)', template: 'Splice(arr, 0, 1)' },
    { name: 'IndexOf', syntax: 'IndexOf(array, value)', description: 'Returns the index of a value in an array.', example: 'IndexOf(categories, "Urban")', template: 'IndexOf(arr, "value")' },
    { name: 'Includes', syntax: 'Includes(array, value)', description: 'Returns true if an array contains the value.', example: 'Includes(validTypes, $feature.Type)', template: 'Includes(arr, $feature.FieldName)' },
    { name: 'Map', syntax: 'Map(array, expression)', description: 'Creates a new array by applying an expression to each element.', example: 'Map([1,2,3], "value * 2")', template: 'Map(arr, "value * 2")' },
    { name: 'Filter', syntax: 'Filter(array, expression)', description: 'Creates a new array with elements that satisfy the expression.', example: 'Filter([1,2,3,4,5], "value > 3")', template: 'Filter(arr, "value > 0")' },
    { name: 'Reduce', syntax: 'Reduce(array, expression)', description: 'Reduces an array to a single value.', example: 'Reduce([1,2,3,4], "accumulator + value")', template: 'Reduce(arr, "accumulator + value")' },
    { name: 'Sort', syntax: 'Sort(array, comparator?)', description: 'Sorts an array.', example: 'Sort([3,1,4,1,5])', template: 'Sort(arr)' },
    { name: 'Reverse', syntax: 'Reverse(array)', description: 'Reverses the order of an array.', example: 'Reverse(myArray)', template: 'Reverse(arr)' },
    { name: 'First', syntax: 'First(featureSet)', description: 'Returns the first element of a FeatureSet or array.', example: 'First(OrderBy($layer, "Date DESC"))', template: 'First(featureSet)' },
  ],
  'Data Access': [
    { name: 'FeatureSetById', syntax: 'FeatureSetById($map, layerId, fields?, includeGeom?)', description: 'Returns a FeatureSet from a layer by its ID.', example: 'FeatureSetById($map, "layer123", ["Name", "Pop"], true)', template: 'FeatureSetById($map, "layerId", ["*"], true)' },
    { name: 'FeatureSetByPortalItem', syntax: 'FeatureSetByPortalItem(portal, itemId, layerIndex, fields?, includeGeom?)', description: 'Returns a FeatureSet from a portal item.', example: 'FeatureSetByPortalItem(Portal("https://www.arcgis.com"), "abc123", 0)', template: 'FeatureSetByPortalItem(Portal("https://www.arcgis.com"), "itemId", 0, ["*"], true)' },
    { name: 'FeatureSetByRelationshipName', syntax: 'FeatureSetByRelationshipName($feature, relName, fields?, includeGeom?)', description: 'Returns related features via a relationship.', example: 'FeatureSetByRelationshipName($feature, "Inspections")', template: 'FeatureSetByRelationshipName($feature, "RelationshipName", ["*"], true)' },
    { name: 'Attachments', syntax: 'Attachments($feature)', description: 'Returns an array of attachment info for a feature.', example: 'Count(Attachments($feature))', template: 'Attachments($feature)' },
  ],
};

const expressionTemplates: { name: string; code: string }[] = [
  {
    name: 'Concatenate Fields',
    code: `// Concatenate multiple fields into a single label\nvar first = $feature.FirstName;\nvar last = $feature.LastName;\nvar title = $feature.Title;\n\nreturn Concatenate([title, first, last], " ");`,
  },
  {
    name: 'Calculate Age',
    code: `// Calculate age from a date of birth field\nvar dob = $feature.DateOfBirth;\nvar today = Now();\nvar age = DateDiff(today, dob, "years");\n\nreturn Floor(age);`,
  },
  {
    name: 'Domain Value Lookup',
    code: `// Return domain description instead of coded value\nvar landUse = DomainName($feature, "LandUseCode");\nvar zoning = DomainName($feature, "ZoningCode");\n\nreturn landUse + " (" + zoning + ")";`,
  },
  {
    name: 'Spatial Intersection Count',
    code: `// Count features from another layer that intersect this feature\nvar parcels = FeatureSetByName($map, "Parcels");\nvar buf = Buffer($feature, 500, "meters");\nvar intersecting = Intersects(parcels, buf);\n\nreturn Count(intersecting);`,
  },
  {
    name: 'Conditional Classification',
    code: `// Classify features based on field values\nvar pop = $feature.Population;\nvar area = $feature.AreaSqKm;\nvar density = pop / area;\n\nreturn When(\n  density > 10000, "Very High",\n  density > 5000, "High",\n  density > 1000, "Medium",\n  density > 100, "Low",\n  "Very Low"\n);`,
  },
  {
    name: 'Population Density',
    code: `// Calculate population density per square kilometer\nvar pop = $feature.TotalPopulation;\nvar areaSqM = AreaGeodetic($feature, "square-meters");\nvar areaSqKm = areaSqM / 1000000;\n\nif (areaSqKm > 0) {\n  return Round(pop / areaSqKm, 2);\n}\nreturn 0;`,
  },
  {
    name: 'Date Formatting',
    code: `// Format a date field into a readable string\nvar d = $feature.InspectionDate;\nvar months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];\n\nvar m = months[Month(d)];\nvar day = Day(d);\nvar yr = Year(d);\n\nreturn m + " " + day + ", " + yr;`,
  },
  {
    name: 'Related Records Sum',
    code: `// Sum values from related records\nvar related = FeatureSetByRelationshipName($feature, "Payments");\nvar total = 0;\n\nfor (var r in related) {\n  total += r.Amount;\n}\n\nreturn Round(total, 2);`,
  },
];

const arcadeKeywords = [
  'var', 'return', 'if', 'else', 'for', 'in', 'function', 'true', 'false', 'null',
  'break', 'continue', 'while', 'do', 'switch', 'case', 'default', 'new', 'typeof',
  'PI', 'Infinity', 'NaN',
];

/* ---------- Helpers ---------- */
const inputSx = {
  bgcolor: '#1a1a1a',
  color: 'grey.300',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c3aed' },
  '& .MuiInputBase-input': { color: '#e0e0e0' },
};

function validateExpression(code: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!code.trim()) {
    return { valid: true, errors: [], warnings: ['Expression is empty'] };
  }

  // Check matched parentheses
  let parenCount = 0;
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '(') parenCount++;
    if (code[i] === ')') parenCount--;
    if (parenCount < 0) {
      errors.push(`Unmatched closing parenthesis at position ${i + 1}`);
      break;
    }
  }
  if (parenCount > 0) {
    errors.push(`${parenCount} unclosed parenthesis(es) detected`);
  }

  // Check matched braces
  let braceCount = 0;
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') braceCount++;
    if (code[i] === '}') braceCount--;
    if (braceCount < 0) {
      errors.push(`Unmatched closing brace at position ${i + 1}`);
      break;
    }
  }
  if (braceCount > 0) {
    errors.push(`${braceCount} unclosed brace(s) detected`);
  }

  // Check matched brackets
  let bracketCount = 0;
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '[') bracketCount++;
    if (code[i] === ']') bracketCount--;
    if (bracketCount < 0) {
      errors.push(`Unmatched closing bracket at position ${i + 1}`);
      break;
    }
  }
  if (bracketCount > 0) {
    errors.push(`${bracketCount} unclosed bracket(s) detected`);
  }

  // Check matched quotes
  const singleQuotes = (code.match(/(?<!\\)'/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    errors.push('Unmatched single quote detected');
  }
  const doubleQuotes = (code.match(/(?<!\\)"/g) || []).length;
  if (doubleQuotes % 2 !== 0) {
    errors.push('Unmatched double quote detected');
  }

  // Check for common issues
  if (code.includes('==') && !code.includes('===')) {
    // Fine for Arcade
  }
  if (code.includes('===')) {
    warnings.push('Arcade uses == for equality, not === (JavaScript-style)');
  }
  if (code.includes('console.log')) {
    warnings.push('console.log is not available in Arcade expressions');
  }
  if (code.includes('document.') || code.includes('window.')) {
    errors.push('DOM/browser APIs are not available in Arcade');
  }

  // Check for return statement in multi-line expressions
  const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
  if (lines.length > 1 && !code.includes('return ')) {
    warnings.push('Multi-line expression may need a return statement');
  }

  // Check for semicolons
  const codeLines = code.split('\n');
  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i].trim();
    if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*') &&
        !line.endsWith('{') && !line.endsWith('}') && !line.endsWith(',') &&
        !line.endsWith(';') && !line.endsWith('(') && !line.endsWith(')') &&
        line.length > 0 && i < codeLines.length - 1 &&
        (line.startsWith('var ') || line.includes('='))) {
      // Arcade doesn't require semicolons but it's not an error
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

function highlightSyntax(code: string): JSX.Element[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const parts: JSX.Element[] = [];
    let remaining = line;
    let keyIndex = 0;

    // Simple tokenizer
    while (remaining.length > 0) {
      // Comments
      if (remaining.startsWith('//')) {
        parts.push(<span key={`${lineIdx}-${keyIndex++}`} style={{ color: '#6b7280' }}>{remaining}</span>);
        remaining = '';
        continue;
      }

      // Strings (double-quoted)
      const dqMatch = remaining.match(/^"(?:[^"\\]|\\.)*"/);
      if (dqMatch) {
        parts.push(<span key={`${lineIdx}-${keyIndex++}`} style={{ color: '#22c55e' }}>{dqMatch[0]}</span>);
        remaining = remaining.slice(dqMatch[0].length);
        continue;
      }

      // Strings (single-quoted)
      const sqMatch = remaining.match(/^'(?:[^'\\]|\\.)*'/);
      if (sqMatch) {
        parts.push(<span key={`${lineIdx}-${keyIndex++}`} style={{ color: '#22c55e' }}>{sqMatch[0]}</span>);
        remaining = remaining.slice(sqMatch[0].length);
        continue;
      }

      // Numbers
      const numMatch = remaining.match(/^\b\d+\.?\d*\b/);
      if (numMatch) {
        parts.push(<span key={`${lineIdx}-${keyIndex++}`} style={{ color: '#f97316' }}>{numMatch[0]}</span>);
        remaining = remaining.slice(numMatch[0].length);
        continue;
      }

      // $feature, $layer, $map, $datapoint, $config
      const varRefMatch = remaining.match(/^\$\w+/);
      if (varRefMatch) {
        parts.push(<span key={`${lineIdx}-${keyIndex++}`} style={{ color: '#60a5fa' }}>{varRefMatch[0]}</span>);
        remaining = remaining.slice(varRefMatch[0].length);
        continue;
      }

      // Keywords
      const kwMatch = remaining.match(/^\b[a-zA-Z_]\w*\b/);
      if (kwMatch) {
        const word = kwMatch[0];
        if (arcadeKeywords.includes(word)) {
          parts.push(<span key={`${lineIdx}-${keyIndex++}`} style={{ color: '#a78bfa' }}>{word}</span>);
        } else {
          // Check if it's a known function name
          const allFuncNames = Object.values(functionCategories).flat().map(f => f.name);
          if (allFuncNames.includes(word)) {
            parts.push(<span key={`${lineIdx}-${keyIndex++}`} style={{ color: '#f0abfc' }}>{word}</span>);
          } else {
            parts.push(<span key={`${lineIdx}-${keyIndex++}`} style={{ color: '#e0e0e0' }}>{word}</span>);
          }
        }
        remaining = remaining.slice(word.length);
        continue;
      }

      // Operators and other characters
      parts.push(<span key={`${lineIdx}-${keyIndex++}`} style={{ color: '#e0e0e0' }}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }

    return (
      <div key={lineIdx} style={{ display: 'flex', minHeight: 20 }}>
        <span style={{ color: '#555', minWidth: 40, textAlign: 'right', paddingRight: 12, userSelect: 'none', fontSize: 13 }}>
          {lineIdx + 1}
        </span>
        <span>{parts}</span>
      </div>
    );
  });
}

/* ---------- Main Component ---------- */
export default function ArcadeExpressionBuilder() {
  const [expressionType, setExpressionType] = useState(0);
  const [code, setCode] = useState<string>(expressionTemplates[0].code);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [expandedFunc, setExpandedFunc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [variableField, setVariableField] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  const categories = useMemo(() => Object.keys(functionCategories), []);

  const validation = useMemo(() => validateExpression(code), [code]);

  const insertAtCursor = useCallback((text: string) => {
    setCode(prev => {
      const textarea = document.getElementById('arcade-editor') as HTMLTextAreaElement | null;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const result = prev.substring(0, start) + text + prev.substring(end);
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + text.length;
        }, 0);
        return result;
      }
      return prev + '\n' + text;
    });
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handlePresetChange = useCallback((name: string) => {
    const preset = expressionTemplates.find(t => t.name === name);
    if (preset) {
      setCode(preset.code);
      setSelectedPreset(name);
    }
  }, []);

  const handleInsertVariable = useCallback(() => {
    if (variableField.trim()) {
      insertAtCursor(`$feature.${variableField.trim()}`);
      setVariableField('');
    }
  }, [variableField, insertAtCursor]);

  const expressionTypes = ['Visualization', 'Popup', 'Label', 'Calculated Field', 'Form Calculation'];

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', color: 'grey.300' }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </Link>

      <Box sx={{ maxWidth: 1600, mx: 'auto', pt: 7, px: 2, pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Code2 size={28} color="#a78bfa" />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#e0e0e0' }}>
            ArcGIS Arcade Expression Builder
          </Typography>
        </Box>

        {/* Expression Type Tabs */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
          <Tabs
            value={expressionType}
            onChange={(_, v) => setExpressionType(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { color: '#888', textTransform: 'none', fontSize: 13 },
              '& .Mui-selected': { color: '#a78bfa !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#a78bfa' },
            }}
          >
            {expressionTypes.map((t, i) => (
              <Tab key={i} label={t} icon={<Layers size={14} />} iconPosition="start" />
            ))}
          </Tabs>
        </Paper>

        {/* Toolbar */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: '#888' }}>Expression Template</InputLabel>
            <Select
              value={selectedPreset}
              label="Expression Template"
              onChange={(e) => handlePresetChange(e.target.value)}
              sx={{ ...inputSx, '& .MuiSelect-select': { color: '#e0e0e0' } }}
            >
              {expressionTemplates.map(t => (
                <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider orientation="vertical" flexItem sx={{ borderColor: '#333', mx: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              size="small"
              placeholder="Field name..."
              value={variableField}
              onChange={e => setVariableField(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInsertVariable()}
              sx={{ ...inputSx, width: 140 }}
              InputProps={{ sx: { color: '#e0e0e0', fontSize: 13 } }}
            />
            <Tooltip title="Insert $feature.fieldName">
              <IconButton size="small" onClick={handleInsertVariable} sx={{ color: '#888' }}>
                <Variable size={16} />
              </IconButton>
            </Tooltip>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ borderColor: '#333', mx: 1 }} />

          <Tooltip title="Copy expression">
            <IconButton size="small" onClick={handleCopy} sx={{ color: copied ? '#22c55e' : '#888' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear editor">
            <IconButton size="small" onClick={() => setCode('')} sx={{ color: '#888' }}>
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset to template">
            <IconButton size="small" onClick={() => { const t = expressionTemplates.find(x => x.name === selectedPreset); if (t) setCode(t.code); }} sx={{ color: '#888' }}>
              <RotateCcw size={16} />
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          {/* Validation status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {validation.valid ? (
              <Chip
                icon={<CheckCircle size={14} />}
                label={validation.warnings.length > 0 ? `Valid (${validation.warnings.length} warning${validation.warnings.length > 1 ? 's' : ''})` : 'Valid'}
                size="small"
                sx={{ bgcolor: validation.warnings.length > 0 ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)', color: validation.warnings.length > 0 ? '#eab308' : '#22c55e', border: `1px solid ${validation.warnings.length > 0 ? '#eab30844' : '#22c55e44'}` }}
              />
            ) : (
              <Chip
                icon={<AlertTriangle size={14} />}
                label={`${validation.errors.length} error${validation.errors.length > 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef444444' }}
              />
            )}
          </Box>
        </Paper>

        {/* Main Content */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Left: Editor */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Code Editor */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Box sx={{ p: 1.5, borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileCode size={16} color="#a78bfa" />
                <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 600 }}>
                  Expression Editor
                </Typography>
                <Chip label={expressionTypes[expressionType]} size="small" sx={{ ml: 1, bgcolor: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid #a78bfa33', fontSize: 11 }} />
              </Box>
              <Box sx={{ position: 'relative' }}>
                <textarea
                  id="arcade-editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  style={{
                    width: '100%',
                    minHeight: 320,
                    background: '#0f172a',
                    color: '#e0e0e0',
                    border: 'none',
                    outline: 'none',
                    fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
                    fontSize: 14,
                    lineHeight: '20px',
                    padding: '12px 16px 12px 56px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    tabSize: 2,
                  }}
                />
                {/* Line numbers overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 44,
                    pt: '12px',
                    pb: '12px',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    lineHeight: '20px',
                    color: '#555',
                    textAlign: 'right',
                    pr: '8px',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    borderRight: '1px solid #1e293b',
                    bgcolor: '#0d1321',
                  }}
                >
                  {code.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </Box>
              </Box>
            </Paper>

            {/* Validation Details */}
            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, p: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#ccc' }}>Validation Results</Typography>
                {validation.errors.map((err, i) => (
                  <Box key={`e-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <AlertTriangle size={14} color="#ef4444" />
                    <Typography variant="body2" sx={{ color: '#ef4444', fontSize: 13 }}>{err}</Typography>
                  </Box>
                ))}
                {validation.warnings.map((w, i) => (
                  <Box key={`w-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <AlertTriangle size={14} color="#eab308" />
                    <Typography variant="body2" sx={{ color: '#eab308', fontSize: 13 }}>{w}</Typography>
                  </Box>
                ))}
              </Paper>
            )}

            {/* Syntax Highlighted Preview */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222' }}>
              <Box sx={{ p: 1.5, borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Play size={16} color="#22c55e" />
                <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 600 }}>Output Preview</Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#0a0e1a',
                  fontFamily: '"Fira Code", "Cascadia Code", monospace',
                  fontSize: 13,
                  lineHeight: '20px',
                  minHeight: 100,
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                {code.trim() ? highlightSyntax(code) : (
                  <Typography variant="body2" sx={{ color: '#555', fontStyle: 'italic' }}>
                    Enter an expression above to see the preview...
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Right: Function Reference */}
          <Box sx={{ width: 400, flexShrink: 0 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222' }}>
              <Box sx={{ p: 1.5, borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 1 }}>
                <BookOpen size={16} color="#60a5fa" />
                <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 600 }}>Function Reference</Typography>
              </Box>

              {/* Category Tabs */}
              <Tabs
                value={activeCategoryIdx}
                onChange={(_, v) => { setActiveCategoryIdx(v); setExpandedFunc(null); }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: '1px solid #222',
                  minHeight: 36,
                  '& .MuiTab-root': { color: '#777', textTransform: 'none', fontSize: 12, minHeight: 36, py: 0.5, px: 1 },
                  '& .Mui-selected': { color: '#60a5fa !important' },
                  '& .MuiTabs-indicator': { backgroundColor: '#60a5fa' },
                }}
              >
                {categories.map((cat, i) => (
                  <Tab key={i} label={cat} />
                ))}
              </Tabs>

              {/* Functions List */}
              <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                {functionCategories[categories[activeCategoryIdx]]?.map((fn) => (
                  <Box key={fn.name} sx={{ borderBottom: '1px solid #1a1a1a' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#1a1a1a' },
                      }}
                      onClick={() => setExpandedFunc(expandedFunc === fn.name ? null : fn.name)}
                    >
                      {expandedFunc === fn.name ? <ChevronDown size={14} color="#666" /> : <ChevronRight size={14} color="#666" />}
                      <Typography variant="body2" sx={{ color: '#e0e0e0', fontFamily: 'monospace', fontSize: 13, fontWeight: 600, flex: 1 }}>
                        {fn.name}
                      </Typography>
                      <Tooltip title="Insert into editor">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); insertAtCursor(fn.template); }}
                          sx={{ color: '#666', '&:hover': { color: '#a78bfa' } }}
                        >
                          <Wand2 size={13} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {expandedFunc === fn.name && (
                      <Box sx={{ px: 2, pb: 1.5, bgcolor: '#0d0d0d' }}>
                        <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>
                          {fn.description}
                        </Typography>
                        <Box sx={{ bgcolor: '#1a1a2e', p: 1, borderRadius: 1, mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#a78bfa', fontFamily: 'monospace', fontSize: 11 }}>
                            {fn.syntax}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Example:</Typography>
                        <Box sx={{ bgcolor: '#1a1a2e', p: 1, borderRadius: 1, mb: 1 }}>
                          <Typography variant="caption" sx={{ color: '#22c55e', fontFamily: 'monospace', fontSize: 11 }}>
                            {fn.example}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => insertAtCursor(fn.template)}
                          startIcon={<Braces size={12} />}
                          sx={{
                            color: '#a78bfa',
                            borderColor: '#a78bfa44',
                            fontSize: 11,
                            textTransform: 'none',
                            py: 0.25,
                            '&:hover': { borderColor: '#a78bfa', bgcolor: 'rgba(167,139,250,0.08)' },
                          }}
                        >
                          Insert Template
                        </Button>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Expression Templates */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mt: 2 }}>
              <Box sx={{ p: 1.5, borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Wand2 size={16} color="#eab308" />
                <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 600 }}>Presets</Typography>
              </Box>
              <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {expressionTemplates.map(t => (
                  <Chip
                    key={t.name}
                    label={t.name}
                    size="small"
                    onClick={() => handlePresetChange(t.name)}
                    sx={{
                      bgcolor: selectedPreset === t.name ? 'rgba(167,139,250,0.2)' : '#1a1a1a',
                      color: selectedPreset === t.name ? '#a78bfa' : '#999',
                      border: `1px solid ${selectedPreset === t.name ? '#a78bfa44' : '#333'}`,
                      fontSize: 11,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(167,139,250,0.1)', color: '#a78bfa' },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
