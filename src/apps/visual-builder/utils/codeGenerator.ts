import type { BuilderComponent, MUIComponentType } from '../types';
import { getComponentDefinition } from './componentDefinitions';

interface GeneratedCode {
  tsx: string;
  jsx: string;
  jquery: string;
  appCode: {
    tsx: string;
    jsx: string;
    jquery: string;
  };
}

interface ImportMap {
  [key: string]: Set<string>;
}

const selfClosingComponents: MUIComponentType[] = [
  'TextField',
  'Checkbox',
  'Switch',
  'Slider',
  'Avatar',
  'Chip',
  'Divider',
  'IconButton',
  'LinearProgress',
  'CircularProgress',
  'Skeleton',
  'Rating',
  'Radio',
];

const formatPropValue = (key: string, value: unknown): string => {
  if (value === undefined || value === null) return '';

  if (typeof value === 'string') {
    return `${key}="${value}"`;
  }

  if (typeof value === 'boolean') {
    return value ? key : '';
  }

  if (typeof value === 'number') {
    return `${key}={${value}}`;
  }

  if (typeof value === 'object') {
    return `${key}={${JSON.stringify(value)}}`;
  }

  return `${key}={${JSON.stringify(value)}}`;
};

const generatePropsString = (props: Record<string, unknown>, excludeKeys: string[] = []): string => {
  const propsArray: string[] = [];

  for (const [key, value] of Object.entries(props)) {
    if (excludeKeys.includes(key)) continue;
    if (value === undefined || value === null) continue;
    if (key === 'children') continue;
    // Skip customStyles - these will be merged into sx
    if (key === 'customStyles') continue;

    const formatted = formatPropValue(key, value);
    if (formatted) {
      propsArray.push(formatted);
    }
  }

  // Handle customStyles by merging into sx
  if (props.customStyles && typeof props.customStyles === 'object') {
    const customStyles = props.customStyles as Record<string, unknown>;
    const existingSx = props.sx as Record<string, unknown> | undefined;
    const mergedSx = { ...customStyles, ...(existingSx || {}) };

    // Filter out empty values
    const filteredSx: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(mergedSx)) {
      if (v !== undefined && v !== null && v !== '') {
        filteredSx[k] = v;
      }
    }

    if (Object.keys(filteredSx).length > 0) {
      propsArray.push(`sx={${JSON.stringify(filteredSx)}}`);
    }
  }

  return propsArray.join(' ');
};

const collectImports = (components: BuilderComponent[]): ImportMap => {
  const imports: ImportMap = {
    '@mui/material': new Set<string>(),
    '@mui/icons-material': new Set<string>(),
  };

  const traverse = (comps: BuilderComponent[]) => {
    for (const comp of comps) {
      imports['@mui/material'].add(comp.type);

      // Add special imports for certain components
      if (comp.type === 'Select') {
        imports['@mui/material'].add('MenuItem');
        imports['@mui/material'].add('FormControl');
        imports['@mui/material'].add('InputLabel');
      }
      if (comp.type === 'Table') {
        imports['@mui/material'].add('TableBody');
        imports['@mui/material'].add('TableCell');
        imports['@mui/material'].add('TableHead');
        imports['@mui/material'].add('TableRow');
      }
      if (comp.type === 'AppBar') {
        imports['@mui/material'].add('Toolbar');
        imports['@mui/material'].add('Typography');
        imports['@mui/material'].add('IconButton');
      }
      if (comp.type === 'List') {
        imports['@mui/material'].add('ListItemText');
      }
      if (comp.type === 'Checkbox' || comp.type === 'Switch' || comp.type === 'Radio') {
        imports['@mui/material'].add('FormControlLabel');
      }
      if (comp.type === 'RadioGroup') {
        imports['@mui/material'].add('FormControlLabel');
        imports['@mui/material'].add('Radio');
      }
      if (comp.type === 'Alert') {
        imports['@mui/material'].add('AlertTitle');
      }
      if (comp.type === 'Accordion') {
        imports['@mui/material'].add('AccordionSummary');
        imports['@mui/material'].add('AccordionDetails');
        imports['@mui/material'].add('Typography');
        imports['@mui/icons-material'].add('ExpandMore as ExpandMoreIcon');
      }
      if (comp.type === 'Breadcrumbs') {
        imports['@mui/material'].add('Link');
        imports['@mui/material'].add('Typography');
      }
      if (comp.type === 'Badge') {
        imports['@mui/material'].add('Avatar');
      }
      // GridItem is now rendered as Box
      if (comp.type === 'GridItem') {
        imports['@mui/material'].add('Box');
      }

      if (comp.children.length > 0) {
        traverse(comp.children);
      }
    }
  };

  traverse(components);
  return imports;
};

const generateImportsString = (imports: ImportMap): string => {
  const lines: string[] = [];

  for (const [module, items] of Object.entries(imports)) {
    if (items.size > 0) {
      const sortedItems = Array.from(items).sort();
      lines.push(`import { ${sortedItems.join(', ')} } from '${module}';`);
    }
  }

  return lines.join('\n');
};

const generateComponentJSX = (component: BuilderComponent, indent: number = 2): string => {
  const spaces = ' '.repeat(indent);
  const definition = getComponentDefinition(component.type);
  const props = generatePropsString(component.props);
  const propsStr = props ? ` ${props}` : '';

  const isSelfClosing = selfClosingComponents.includes(component.type) && component.children.length === 0;

  // Handle special cases
  if (component.type === 'Select') {
    return `${spaces}<FormControl${component.props.fullWidth ? ' fullWidth' : ''}${component.props.size ? ` size="${component.props.size}"` : ''}>
${spaces}  <InputLabel>${component.props.label || 'Select'}</InputLabel>
${spaces}  <Select${propsStr} label="${component.props.label || 'Select'}">
${spaces}    <MenuItem value="option1">Option 1</MenuItem>
${spaces}    <MenuItem value="option2">Option 2</MenuItem>
${spaces}    <MenuItem value="option3">Option 3</MenuItem>
${spaces}  </Select>
${spaces}</FormControl>`;
  }

  if (component.type === 'Table') {
    return `${spaces}<Table${propsStr}>
${spaces}  <TableHead>
${spaces}    <TableRow>
${spaces}      <TableCell>Column 1</TableCell>
${spaces}      <TableCell>Column 2</TableCell>
${spaces}      <TableCell>Column 3</TableCell>
${spaces}    </TableRow>
${spaces}  </TableHead>
${spaces}  <TableBody>
${spaces}    <TableRow>
${spaces}      <TableCell>Data 1</TableCell>
${spaces}      <TableCell>Data 2</TableCell>
${spaces}      <TableCell>Data 3</TableCell>
${spaces}    </TableRow>
${spaces}  </TableBody>
${spaces}</Table>`;
  }

  if (component.type === 'Tabs') {
    return `${spaces}<Tabs${propsStr}>
${spaces}  <Tab label="Tab 1" />
${spaces}  <Tab label="Tab 2" />
${spaces}  <Tab label="Tab 3" />
${spaces}</Tabs>`;
  }

  if (component.type === 'AppBar') {
    const childrenJSX = component.children.length > 0
      ? component.children.map(child => generateComponentJSX(child, indent + 4)).join('\n')
      : '';
    return `${spaces}<AppBar${propsStr}>
${spaces}  <Toolbar>
${spaces}    <Typography variant="h6" sx={{ flexGrow: 1 }}>
${spaces}      App Bar
${spaces}    </Typography>
${childrenJSX ? `${childrenJSX}\n` : ''}${spaces}  </Toolbar>
${spaces}</AppBar>`;
  }

  // Checkbox with FormControlLabel
  if (component.type === 'Checkbox') {
    return `${spaces}<FormControlLabel
${spaces}  control={<Checkbox${propsStr} />}
${spaces}  label="${component.props.label || 'Checkbox'}"
${spaces}/>`;
  }

  // Switch with FormControlLabel
  if (component.type === 'Switch') {
    return `${spaces}<FormControlLabel
${spaces}  control={<Switch${propsStr} />}
${spaces}  label="${component.props.label || 'Switch'}"
${spaces}/>`;
  }

  // Radio with FormControlLabel
  if (component.type === 'Radio') {
    return `${spaces}<FormControlLabel
${spaces}  control={<Radio${propsStr} />}
${spaces}  label="${component.props.label || 'Radio'}"
${spaces}  value="${component.props.value || 'option'}"
${spaces}/>`;
  }

  // RadioGroup
  if (component.type === 'RadioGroup') {
    const childrenJSX = component.children.length > 0
      ? component.children.map(child => generateComponentJSX(child, indent + 2)).join('\n')
      : `${spaces}  <FormControlLabel value="option1" control={<Radio />} label="Option 1" />\n${spaces}  <FormControlLabel value="option2" control={<Radio />} label="Option 2" />`;
    return `${spaces}<RadioGroup${propsStr}>
${childrenJSX}
${spaces}</RadioGroup>`;
  }

  // Alert with AlertTitle
  if (component.type === 'Alert') {
    const title = component.props.title as string | undefined;
    const alertContent = (component.props.children as string) || 'Alert message';
    return `${spaces}<Alert${propsStr}>${title ? `\n${spaces}  <AlertTitle>${title}</AlertTitle>` : ''}
${spaces}  ${alertContent}
${spaces}</Alert>`;
  }

  // Accordion with Summary and Details
  if (component.type === 'Accordion') {
    const childrenJSX = component.children.length > 0
      ? component.children.map(child => generateComponentJSX(child, indent + 2)).join('\n')
      : `${spaces}  <AccordionSummary expandIcon={<ExpandMoreIcon />}>\n${spaces}    <Typography>Accordion Header</Typography>\n${spaces}  </AccordionSummary>\n${spaces}  <AccordionDetails>\n${spaces}    <Typography>Accordion content</Typography>\n${spaces}  </AccordionDetails>`;
    return `${spaces}<Accordion${propsStr}>
${childrenJSX}
${spaces}</Accordion>`;
  }

  // Breadcrumbs
  if (component.type === 'Breadcrumbs') {
    const childrenJSX = component.children.length > 0
      ? component.children.map(child => generateComponentJSX(child, indent + 2)).join('\n')
      : `${spaces}  <Link href="#">Home</Link>\n${spaces}  <Link href="#">Category</Link>\n${spaces}  <Typography>Current</Typography>`;
    return `${spaces}<Breadcrumbs${propsStr}>
${childrenJSX}
${spaces}</Breadcrumbs>`;
  }

  // Badge
  if (component.type === 'Badge') {
    const childrenJSX = component.children.length > 0
      ? component.children.map(child => generateComponentJSX(child, indent + 2)).join('\n')
      : `${spaces}  <Avatar>B</Avatar>`;
    return `${spaces}<Badge${propsStr}>
${childrenJSX}
${spaces}</Badge>`;
  }

  // GridItem rendered as Box
  if (component.type === 'GridItem') {
    const childrenJSX = component.children.length > 0
      ? component.children.map(child => generateComponentJSX(child, indent + 2)).join('\n')
      : '';
    const xs = component.props.xs as number | undefined;
    const sxProp = xs ? ` sx={{ gridColumn: 'span ${xs}' }}` : '';
    return childrenJSX
      ? `${spaces}<Box${sxProp}>
${childrenJSX}
${spaces}</Box>`
      : `${spaces}<Box${sxProp} />`;
  }

  // ListItem with ListItemText
  if (component.type === 'ListItem') {
    const primary = (component.props.primaryText as string) || 'List Item';
    const secondary = component.props.secondaryText as string | undefined;
    return `${spaces}<ListItem${propsStr}>
${spaces}  <ListItemText primary="${primary}"${secondary ? ` secondary="${secondary}"` : ''} />
${spaces}</ListItem>`;
  }

  // Handle text content for Typography, Button, etc.
  const textContent = component.props.children as string | undefined;

  if (isSelfClosing && !textContent) {
    return `${spaces}<${component.type}${propsStr} />`;
  }

  // Handle components with children
  if (definition?.canHaveChildren && component.children.length > 0) {
    const childrenJSX = component.children
      .map(child => generateComponentJSX(child, indent + 2))
      .join('\n');
    return `${spaces}<${component.type}${propsStr}>
${childrenJSX}
${spaces}</${component.type}>`;
  }

  // Handle text content
  if (textContent) {
    return `${spaces}<${component.type}${propsStr}>${textContent}</${component.type}>`;
  }

  return `${spaces}<${component.type}${propsStr} />`;
};

const toPascalCase = (str: string): string => {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const generateComponentName = (component: BuilderComponent): string => {
  const baseName = component.type;
  const childText = component.props.children as string | undefined;

  if (childText && typeof childText === 'string') {
    const sanitized = toPascalCase(childText.slice(0, 20));
    if (sanitized) {
      return `${sanitized}${baseName}`;
    }
  }

  return `${baseName}Component`;
};

// jQuery/HTML Code Generation
const generateStyleString = (props: Record<string, unknown>): string => {
  const customStyles = props.customStyles as Record<string, unknown> | undefined;
  if (!customStyles) return '';

  const styles: string[] = [];
  Object.entries(customStyles).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      styles.push(`${cssKey}: ${value}`);
    }
  });

  return styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
};

const generateJQueryHTML = (component: BuilderComponent, indent: number = 2): string => {
  const spaces = ' '.repeat(indent);
  const { props, type } = component;
  const styleStr = generateStyleString(props);
  const id = (props.customId as string) || `${type.toLowerCase()}-${component.id.slice(0, 8)}`;
  const textContent = (props.children as string) || '';

  const generateChildren = () => {
    return component.children.map(child => generateJQueryHTML(child, indent + 2)).join('\n');
  };

  // Map MUI components to HTML equivalents
  const componentMap: Partial<Record<MUIComponentType, () => string>> = {
    Button: () => {
      const variant = props.variant as string || 'contained';
      const color = props.color as string || 'primary';
      const disabled = props.disabled ? ' disabled' : '';
      return `${spaces}<button id="${id}" class="btn btn-${color} btn-${variant}"${disabled}${styleStr}>${textContent || 'Button'}</button>`;
    },
    TextField: () => {
      const label = props.label as string || '';
      const placeholder = props.placeholder as string || '';
      const type = props.type as string || 'text';
      const required = props.required ? ' required' : '';
      const disabled = props.disabled ? ' disabled' : '';
      return `${spaces}<div class="form-group"${styleStr}>
${spaces}  <label for="${id}">${label}</label>
${spaces}  <input type="${type}" id="${id}" class="form-control" placeholder="${placeholder}"${required}${disabled}>
${spaces}</div>`;
    },
    Select: () => {
      const label = props.label as string || 'Select';
      const options = (props.options as string[]) || ['Option 1', 'Option 2', 'Option 3'];
      const optionsHtml = options.map(opt => `${spaces}    <option value="${opt}">${opt}</option>`).join('\n');
      return `${spaces}<div class="form-group"${styleStr}>
${spaces}  <label for="${id}">${label}</label>
${spaces}  <select id="${id}" class="form-control">
${optionsHtml}
${spaces}  </select>
${spaces}</div>`;
    },
    Checkbox: () => {
      const label = props.label as string || 'Checkbox';
      const checked = props.defaultChecked ? ' checked' : '';
      return `${spaces}<div class="form-check"${styleStr}>
${spaces}  <input type="checkbox" id="${id}" class="form-check-input"${checked}>
${spaces}  <label class="form-check-label" for="${id}">${label}</label>
${spaces}</div>`;
    },
    Switch: () => {
      const label = props.label as string || 'Switch';
      const checked = props.defaultChecked ? ' checked' : '';
      return `${spaces}<div class="form-check form-switch"${styleStr}>
${spaces}  <input type="checkbox" id="${id}" class="form-check-input"${checked}>
${spaces}  <label class="form-check-label" for="${id}">${label}</label>
${spaces}</div>`;
    },
    Radio: () => {
      const label = props.label as string || 'Radio';
      const value = props.value as string || 'option';
      return `${spaces}<div class="form-check"${styleStr}>
${spaces}  <input type="radio" id="${id}" name="radio-group" class="form-check-input" value="${value}">
${spaces}  <label class="form-check-label" for="${id}">${label}</label>
${spaces}</div>`;
    },
    RadioGroup: () => {
      const childrenHtml = component.children.length > 0
        ? generateChildren()
        : `${spaces}  <div class="form-check">
${spaces}    <input type="radio" id="${id}-1" name="${id}" class="form-check-input" value="option1">
${spaces}    <label class="form-check-label" for="${id}-1">Option 1</label>
${spaces}  </div>
${spaces}  <div class="form-check">
${spaces}    <input type="radio" id="${id}-2" name="${id}" class="form-check-input" value="option2">
${spaces}    <label class="form-check-label" for="${id}-2">Option 2</label>
${spaces}  </div>`;
      return `${spaces}<div id="${id}" class="radio-group"${styleStr}>
${childrenHtml}
${spaces}</div>`;
    },
    Slider: () => {
      const min = props.min as number || 0;
      const max = props.max as number || 100;
      const value = props.defaultValue as number || 50;
      return `${spaces}<div class="form-group"${styleStr}>
${spaces}  <input type="range" id="${id}" class="form-range" min="${min}" max="${max}" value="${value}">
${spaces}</div>`;
    },
    Rating: () => {
      const max = props.max as number || 5;
      const value = props.defaultValue as number || 3;
      const stars = Array.from({ length: max }, (_, i) =>
        `${spaces}  <span class="star${i < value ? ' filled' : ''}" data-value="${i + 1}">★</span>`
      ).join('\n');
      return `${spaces}<div id="${id}" class="rating"${styleStr}>
${stars}
${spaces}</div>`;
    },
    Typography: () => {
      const variant = props.variant as string || 'body1';
      const tagMap: Record<string, string> = {
        h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
        body1: 'p', body2: 'p', caption: 'small', subtitle1: 'h6', subtitle2: 'h6',
      };
      const tag = tagMap[variant] || 'p';
      const align = props.align as string;
      const alignClass = align ? ` text-${align}` : '';
      return `${spaces}<${tag} id="${id}" class="typography-${variant}${alignClass}"${styleStr}>${textContent || 'Text content'}</${tag}>`;
    },
    Box: () => {
      const childrenHtml = generateChildren();
      return `${spaces}<div id="${id}" class="box"${styleStr}>
${childrenHtml || `${spaces}  <!-- Content here -->`}
${spaces}</div>`;
    },
    Stack: () => {
      const direction = props.direction as string || 'column';
      const flexClass = direction === 'row' ? 'd-flex flex-row' : 'd-flex flex-column';
      const gap = props.spacing as number || 2;
      const childrenHtml = generateChildren();
      return `${spaces}<div id="${id}" class="${flexClass} gap-${gap}"${styleStr}>
${childrenHtml || `${spaces}  <!-- Stack items here -->`}
${spaces}</div>`;
    },
    Grid: () => {
      const childrenHtml = generateChildren();
      return `${spaces}<div id="${id}" class="row"${styleStr}>
${childrenHtml || `${spaces}  <!-- Grid items here -->`}
${spaces}</div>`;
    },
    GridItem: () => {
      const xs = props.xs as number || 12;
      const childrenHtml = generateChildren();
      return `${spaces}<div id="${id}" class="col-${xs}"${styleStr}>
${childrenHtml || `${spaces}  <!-- Content here -->`}
${spaces}</div>`;
    },
    Container: () => {
      const maxWidth = props.maxWidth as string || 'lg';
      const childrenHtml = generateChildren();
      return `${spaces}<div id="${id}" class="container-${maxWidth}"${styleStr}>
${childrenHtml || `${spaces}  <!-- Content here -->`}
${spaces}</div>`;
    },
    Card: () => {
      const childrenHtml = generateChildren();
      return `${spaces}<div id="${id}" class="card"${styleStr}>
${spaces}  <div class="card-body">
${childrenHtml || `${spaces}    <!-- Card content here -->`}
${spaces}  </div>
${spaces}</div>`;
    },
    Paper: () => {
      const elevation = props.elevation as number || 1;
      const childrenHtml = generateChildren();
      return `${spaces}<div id="${id}" class="paper shadow-${Math.min(elevation, 5)}"${styleStr}>
${childrenHtml || `${spaces}  <!-- Content here -->`}
${spaces}</div>`;
    },
    Divider: () => {
      return `${spaces}<hr id="${id}" class="divider"${styleStr}>`;
    },
    Avatar: () => {
      const src = props.src as string;
      const alt = props.alt as string || 'Avatar';
      if (src) {
        return `${spaces}<img id="${id}" src="${src}" alt="${alt}" class="avatar rounded-circle"${styleStr}>`;
      }
      return `${spaces}<div id="${id}" class="avatar rounded-circle"${styleStr}>${textContent || 'A'}</div>`;
    },
    Chip: () => {
      const label = props.label as string || 'Chip';
      const variant = props.variant as string || 'filled';
      const color = props.color as string || 'primary';
      return `${spaces}<span id="${id}" class="badge bg-${color} chip-${variant}"${styleStr}>${label}</span>`;
    },
    Badge: () => {
      const content = props.badgeContent as string || '4';
      const childrenHtml = component.children.length > 0
        ? generateChildren()
        : `${spaces}  <span class="avatar">B</span>`;
      return `${spaces}<span id="${id}" class="position-relative"${styleStr}>
${childrenHtml}
${spaces}  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">${content}</span>
${spaces}</span>`;
    },
    Alert: () => {
      const severity = props.severity as string || 'info';
      const title = props.title as string;
      const message = textContent || 'Alert message';
      const alertTypeMap: Record<string, string> = {
        error: 'danger', warning: 'warning', info: 'info', success: 'success',
      };
      return `${spaces}<div id="${id}" class="alert alert-${alertTypeMap[severity] || 'info'}" role="alert"${styleStr}>${title ? `\n${spaces}  <h4 class="alert-heading">${title}</h4>` : ''}
${spaces}  ${message}
${spaces}</div>`;
    },
    LinearProgress: () => {
      const value = props.value as number || 50;
      return `${spaces}<div id="${id}" class="progress"${styleStr}>
${spaces}  <div class="progress-bar" role="progressbar" style="width: ${value}%" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"></div>
${spaces}</div>`;
    },
    CircularProgress: () => {
      return `${spaces}<div id="${id}" class="spinner-border" role="status"${styleStr}>
${spaces}  <span class="visually-hidden">Loading...</span>
${spaces}</div>`;
    },
    Skeleton: () => {
      const width = props.width as number || 100;
      const height = props.height as number || 20;
      return `${spaces}<div id="${id}" class="placeholder-glow"${styleStr}>
${spaces}  <span class="placeholder" style="width: ${width}px; height: ${height}px;"></span>
${spaces}</div>`;
    },
    List: () => {
      const childrenHtml = generateChildren();
      return `${spaces}<ul id="${id}" class="list-group"${styleStr}>
${childrenHtml || `${spaces}  <li class="list-group-item">List Item</li>`}
${spaces}</ul>`;
    },
    ListItem: () => {
      const primary = props.primaryText as string || 'List Item';
      const secondary = props.secondaryText as string;
      return `${spaces}<li id="${id}" class="list-group-item"${styleStr}>
${spaces}  <div class="fw-bold">${primary}</div>${secondary ? `\n${spaces}  <small class="text-muted">${secondary}</small>` : ''}
${spaces}</li>`;
    },
    AppBar: () => {
      const color = props.color as string || 'primary';
      const childrenHtml = generateChildren();
      return `${spaces}<nav id="${id}" class="navbar navbar-expand-lg navbar-dark bg-${color}"${styleStr}>
${spaces}  <div class="container-fluid">
${spaces}    <a class="navbar-brand" href="#">App Bar</a>
${spaces}    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
${spaces}      <span class="navbar-toggler-icon"></span>
${spaces}    </button>
${spaces}    <div class="collapse navbar-collapse" id="navbarNav">
${childrenHtml}
${spaces}    </div>
${spaces}  </div>
${spaces}</nav>`;
    },
    Tabs: () => {
      const childrenHtml = component.children.length > 0
        ? generateChildren()
        : `${spaces}  <li class="nav-item"><a class="nav-link active" href="#">Tab 1</a></li>
${spaces}  <li class="nav-item"><a class="nav-link" href="#">Tab 2</a></li>
${spaces}  <li class="nav-item"><a class="nav-link" href="#">Tab 3</a></li>`;
      return `${spaces}<ul id="${id}" class="nav nav-tabs"${styleStr}>
${childrenHtml}
${spaces}</ul>`;
    },
    Tab: () => {
      const label = props.label as string || 'Tab';
      const disabled = props.disabled ? ' disabled' : '';
      return `${spaces}<li id="${id}" class="nav-item"${styleStr}>
${spaces}  <a class="nav-link${disabled}" href="#">${label}</a>
${spaces}</li>`;
    },
    Table: () => {
      return `${spaces}<table id="${id}" class="table"${styleStr}>
${spaces}  <thead>
${spaces}    <tr>
${spaces}      <th>Column 1</th>
${spaces}      <th>Column 2</th>
${spaces}      <th>Column 3</th>
${spaces}    </tr>
${spaces}  </thead>
${spaces}  <tbody>
${spaces}    <tr>
${spaces}      <td>Data 1</td>
${spaces}      <td>Data 2</td>
${spaces}      <td>Data 3</td>
${spaces}    </tr>
${spaces}  </tbody>
${spaces}</table>`;
    },
    Accordion: () => {
      const childrenHtml = component.children.length > 0
        ? generateChildren()
        : `${spaces}  <div class="accordion-item">
${spaces}    <h2 class="accordion-header">
${spaces}      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${id}-1">
${spaces}        Accordion Header
${spaces}      </button>
${spaces}    </h2>
${spaces}    <div id="${id}-1" class="accordion-collapse collapse show">
${spaces}      <div class="accordion-body">Accordion content goes here</div>
${spaces}    </div>
${spaces}  </div>`;
      return `${spaces}<div id="${id}" class="accordion"${styleStr}>
${childrenHtml}
${spaces}</div>`;
    },
    Link: () => {
      const href = props.href as string || '#';
      const target = props.target as string;
      return `${spaces}<a id="${id}" href="${href}"${target ? ` target="${target}"` : ''}${styleStr}>${textContent || 'Link'}</a>`;
    },
    Breadcrumbs: () => {
      const childrenHtml = component.children.length > 0
        ? generateChildren()
        : `${spaces}  <li class="breadcrumb-item"><a href="#">Home</a></li>
${spaces}  <li class="breadcrumb-item"><a href="#">Category</a></li>
${spaces}  <li class="breadcrumb-item active">Current</li>`;
      return `${spaces}<nav id="${id}" aria-label="breadcrumb"${styleStr}>
${spaces}  <ol class="breadcrumb">
${childrenHtml}
${spaces}  </ol>
${spaces}</nav>`;
    },
    IconButton: () => {
      const icon = props.icon as string || 'menu';
      return `${spaces}<button id="${id}" class="btn btn-icon"${styleStr}>
${spaces}  <i class="bi bi-${icon.toLowerCase()}"></i>
${spaces}</button>`;
    },
    Dialog: () => {
      const title = props.title as string || 'Dialog';
      const childrenHtml = generateChildren();
      return `${spaces}<div id="${id}" class="modal fade" tabindex="-1"${styleStr}>
${spaces}  <div class="modal-dialog">
${spaces}    <div class="modal-content">
${spaces}      <div class="modal-header">
${spaces}        <h5 class="modal-title">${title}</h5>
${spaces}        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
${spaces}      </div>
${spaces}      <div class="modal-body">
${childrenHtml || `${spaces}        <!-- Dialog content here -->`}
${spaces}      </div>
${spaces}    </div>
${spaces}  </div>
${spaces}</div>`;
    },
    Tooltip: () => {
      const title = props.title as string || 'Tooltip';
      const childrenHtml = component.children.length > 0
        ? generateChildren()
        : `${spaces}  <button class="btn btn-secondary">Hover me</button>`;
      return `${spaces}<span id="${id}" data-bs-toggle="tooltip" title="${title}"${styleStr}>
${childrenHtml}
${spaces}</span>`;
    },
    Drawer: () => {
      const childrenHtml = generateChildren();
      return `${spaces}<div id="${id}" class="offcanvas offcanvas-start" tabindex="-1"${styleStr}>
${spaces}  <div class="offcanvas-header">
${spaces}    <h5 class="offcanvas-title">Menu</h5>
${spaces}    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
${spaces}  </div>
${spaces}  <div class="offcanvas-body">
${childrenHtml || `${spaces}    <!-- Drawer content here -->`}
${spaces}  </div>
${spaces}</div>`;
    },
  };

  const generator = componentMap[type];
  if (generator) {
    return generator();
  }

  // Default fallback
  return `${spaces}<div id="${id}" class="${type.toLowerCase()}"${styleStr}>${textContent || `<!-- ${type} -->`}</div>`;
};

const generateJQueryScript = (components: BuilderComponent[]): string => {
  const scripts: string[] = [];

  const processComponent = (component: BuilderComponent) => {
    const id = (component.props.customId as string) || `${component.type.toLowerCase()}-${component.id.slice(0, 8)}`;

    // Add event handlers based on component type
    switch (component.type) {
      case 'Button':
        scripts.push(`  // ${component.type} click handler
  $('#${id}').on('click', function() {
    console.log('Button clicked');
    // Add your click handler here
  });`);
        break;
      case 'TextField':
        scripts.push(`  // ${component.type} input handler
  $('#${id}').on('input', function() {
    const value = $(this).val();
    console.log('Input value:', value);
  });`);
        break;
      case 'Select':
        scripts.push(`  // ${component.type} change handler
  $('#${id}').on('change', function() {
    const value = $(this).val();
    console.log('Selected:', value);
  });`);
        break;
      case 'Checkbox':
      case 'Switch':
        scripts.push(`  // ${component.type} change handler
  $('#${id}').on('change', function() {
    const checked = $(this).is(':checked');
    console.log('Checked:', checked);
  });`);
        break;
      case 'Slider':
        scripts.push(`  // ${component.type} input handler
  $('#${id}').on('input', function() {
    const value = $(this).val();
    console.log('Slider value:', value);
  });`);
        break;
      case 'Rating':
        scripts.push(`  // ${component.type} click handler
  $('#${id} .star').on('click', function() {
    const value = $(this).data('value');
    $('#${id} .star').removeClass('filled');
    $('#${id} .star').slice(0, value).addClass('filled');
    console.log('Rating:', value);
  });`);
        break;
      case 'Tabs':
        scripts.push(`  // ${component.type} click handler
  $('#${id} .nav-link').on('click', function(e) {
    e.preventDefault();
    $('#${id} .nav-link').removeClass('active');
    $(this).addClass('active');
  });`);
        break;
      case 'Dialog':
        scripts.push(`  // ${component.type} modal handlers
  // Show modal: $('#${id}').modal('show');
  // Hide modal: $('#${id}').modal('hide');`);
        break;
      case 'Tooltip':
        scripts.push(`  // Initialize tooltip
  $('[data-bs-toggle="tooltip"]').tooltip();`);
        break;
    }

    // Process children
    component.children.forEach(processComponent);
  };

  components.forEach(processComponent);

  return scripts.join('\n\n');
};

export const generateCode = (components: BuilderComponent[]): GeneratedCode => {
  if (components.length === 0) {
    return {
      tsx: '// No components to generate\n// Drag components to the canvas to start building',
      jsx: '// No components to generate\n// Drag components to the canvas to start building',
      jquery: '<!-- No components to generate -->\n<!-- Drag components to the canvas to start building -->',
      appCode: {
        tsx: '',
        jsx: '',
        jquery: '',
      },
    };
  }

  const imports = collectImports(components);
  const importsString = generateImportsString(imports);

  // Generate individual component files
  const componentCodes: { tsx: string; jsx: string; name: string }[] = [];

  components.forEach((component, index) => {
    const componentName = generateComponentName(component) + (index > 0 ? index : '');
    const jsx = generateComponentJSX(component, 4);

    const tsxCode = `${generateImportsString(collectImports([component]))}

interface ${componentName}Props {
  // Add custom props here
}

export default function ${componentName}(props: ${componentName}Props) {
  return (
${jsx}
  );
}
`;

    const jsxCode = `${generateImportsString(collectImports([component]))}

export default function ${componentName}(props) {
  return (
${jsx}
  );
}
`;

    componentCodes.push({ tsx: tsxCode, jsx: jsxCode, name: componentName });
  });

  // Generate App file
  const allComponentsJSX = components
    .map(comp => generateComponentJSX(comp, 6))
    .join('\n');

  const appTsx = `${importsString}
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';

const theme = createTheme();

interface AppProps {
  // Add custom props here
}

export default function App(props: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 2 }}>
${allComponentsJSX}
      </Box>
    </ThemeProvider>
  );
}
`;

  const appJsx = `${importsString}
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';

const theme = createTheme();

export default function App(props) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 2 }}>
${allComponentsJSX}
      </Box>
    </ThemeProvider>
  );
}
`;

  // Combine all component codes for display
  const allTsx = componentCodes.map(c => `// === ${c.name}.tsx ===\n${c.tsx}`).join('\n\n');
  const allJsx = componentCodes.map(c => `// === ${c.name}.jsx ===\n${c.jsx}`).join('\n\n');

  // Generate jQuery/HTML code
  const allComponentsHTML = components
    .map(comp => generateJQueryHTML(comp, 4))
    .join('\n');

  const jqueryScripts = generateJQueryScript(components);

  const jqueryCode = `<!-- Individual Component HTML -->
${components.map((comp, index) => {
  const name = generateComponentName(comp) + (index > 0 ? index : '');
  return `<!-- === ${name}.html === -->
${generateJQueryHTML(comp, 0)}`;
}).join('\n\n')}`;

  const appJquery = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    /* Custom styles */
    .rating .star { cursor: pointer; color: #ccc; font-size: 1.5rem; }
    .rating .star.filled { color: #ffc107; }
    .avatar { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #1976d2; color: white; }
    .btn-contained { }
    .btn-outlined { background: transparent; }
    .btn-text { background: transparent; border: none; }
  </style>
</head>
<body>
  <div class="container py-4">
${allComponentsHTML}
  </div>

  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script>
$(document).ready(function() {
${jqueryScripts || '  // Add your jQuery code here'}
});
  </script>
</body>
</html>`;

  return {
    tsx: allTsx,
    jsx: allJsx,
    jquery: jqueryCode,
    appCode: {
      tsx: appTsx,
      jsx: appJsx,
      jquery: appJquery,
    },
  };
};

export const generateProjectStructure = (components: BuilderComponent[]): string => {
  if (components.length === 0) {
    return '// No project structure to generate';
  }

  const componentNames = components.map((comp, index) => {
    return generateComponentName(comp) + (index > 0 ? index : '');
  });

  return `
Project Structure:
==================

my-react-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
${componentNames.map(name => `│   │   └── ${name}.tsx`).join('\n')}
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── vite.config.ts

Dependencies:
=============
- react
- react-dom
- @mui/material
- @emotion/react
- @emotion/styled
`;
};
