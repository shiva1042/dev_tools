import { v4 as uuidv4 } from 'uuid';
import type { Template, BuilderComponent } from '../types';

// Helper to create component with unique ID
const createComponent = (
  type: BuilderComponent['type'],
  props: BuilderComponent['props'] = {},
  children: BuilderComponent[] = []
): BuilderComponent => ({
  id: uuidv4(),
  type,
  library: 'mui',
  props,
  children,
});

export const templates: Template[] = [
  // Auth Templates
  {
    id: 'login-form',
    name: 'Login Form',
    description: 'A simple login form with email, password, and submit button',
    category: 'auth',
    components: [
      createComponent('Card', { customStyles: { padding: 32, maxWidth: 400, margin: '0 auto' } }, [
        createComponent('Typography', { variant: 'h5', children: 'Sign In', customStyles: { marginBottom: 24, textAlign: 'center' } }),
        createComponent('TextField', { label: 'Email', type: 'email', fullWidth: true, customStyles: { marginBottom: 16 } }),
        createComponent('TextField', { label: 'Password', type: 'password', fullWidth: true, customStyles: { marginBottom: 24 } }),
        createComponent('Button', { variant: 'contained', color: 'primary', fullWidth: true, children: 'Sign In' }),
        createComponent('Box', { customStyles: { marginTop: 16, textAlign: 'center' } }, [
          createComponent('Link', { href: '#', children: 'Forgot password?' }),
        ]),
      ]),
    ],
  },
  {
    id: 'signup-form',
    name: 'Sign Up Form',
    description: 'Registration form with name, email, password fields',
    category: 'auth',
    components: [
      createComponent('Card', { customStyles: { padding: 32, maxWidth: 450, margin: '0 auto' } }, [
        createComponent('Typography', { variant: 'h5', children: 'Create Account', customStyles: { marginBottom: 24, textAlign: 'center' } }),
        createComponent('Stack', { direction: 'row', spacing: 2, customStyles: { marginBottom: 16 } }, [
          createComponent('TextField', { label: 'First Name', fullWidth: true }),
          createComponent('TextField', { label: 'Last Name', fullWidth: true }),
        ]),
        createComponent('TextField', { label: 'Email', type: 'email', fullWidth: true, customStyles: { marginBottom: 16 } }),
        createComponent('TextField', { label: 'Password', type: 'password', fullWidth: true, customStyles: { marginBottom: 16 } }),
        createComponent('TextField', { label: 'Confirm Password', type: 'password', fullWidth: true, customStyles: { marginBottom: 16 } }),
        createComponent('FormControlLabel', { label: 'I agree to Terms & Conditions', control: 'checkbox', customStyles: { marginBottom: 16 } }),
        createComponent('Button', { variant: 'contained', color: 'primary', fullWidth: true, children: 'Sign Up' }),
      ]),
    ],
  },

  // Form Templates
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'A contact form with name, email, subject, and message fields',
    category: 'forms',
    components: [
      createComponent('Card', { customStyles: { padding: 24, maxWidth: 600, margin: '0 auto' } }, [
        createComponent('Typography', { variant: 'h5', children: 'Contact Us', customStyles: { marginBottom: 24 } }),
        createComponent('Grid', { container: true, spacing: 2 }, [
          createComponent('GridItem', { xs: 12, sm: 6 }, [
            createComponent('TextField', { label: 'First Name', fullWidth: true }),
          ]),
          createComponent('GridItem', { xs: 12, sm: 6 }, [
            createComponent('TextField', { label: 'Last Name', fullWidth: true }),
          ]),
          createComponent('GridItem', { xs: 12 }, [
            createComponent('TextField', { label: 'Email', type: 'email', fullWidth: true }),
          ]),
          createComponent('GridItem', { xs: 12 }, [
            createComponent('TextField', { label: 'Subject', fullWidth: true }),
          ]),
          createComponent('GridItem', { xs: 12 }, [
            createComponent('TextField', { label: 'Message', multiline: true, rows: 4, fullWidth: true }),
          ]),
          createComponent('GridItem', { xs: 12 }, [
            createComponent('Button', { variant: 'contained', color: 'primary', children: 'Send Message' }),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'settings-form',
    name: 'Settings Form',
    description: 'A settings panel with various input types',
    category: 'forms',
    components: [
      createComponent('Paper', { customStyles: { padding: 24 } }, [
        createComponent('Typography', { variant: 'h6', children: 'Notification Settings', customStyles: { marginBottom: 16 } }),
        createComponent('List', {}, [
          createComponent('ListItem', {}, [
            createComponent('Switch', { defaultChecked: true }),
            createComponent('Typography', { children: 'Email Notifications' }),
          ]),
          createComponent('ListItem', {}, [
            createComponent('Switch', {}),
            createComponent('Typography', { children: 'Push Notifications' }),
          ]),
          createComponent('ListItem', {}, [
            createComponent('Switch', { defaultChecked: true }),
            createComponent('Typography', { children: 'SMS Notifications' }),
          ]),
        ]),
        createComponent('Divider', { customStyles: { margin: '16px 0' } }),
        createComponent('Typography', { variant: 'h6', children: 'Privacy Settings', customStyles: { marginBottom: 16 } }),
        createComponent('FormGroup', {}, [
          createComponent('FormControlLabel', { label: 'Make profile public', control: 'checkbox' }),
          createComponent('FormControlLabel', { label: 'Show online status', control: 'checkbox' }),
          createComponent('FormControlLabel', { label: 'Allow direct messages', control: 'checkbox' }),
        ]),
      ]),
    ],
  },

  // Layout Templates
  {
    id: 'two-column',
    name: 'Two Column Layout',
    description: 'A responsive two-column layout',
    category: 'layouts',
    components: [
      createComponent('Grid', { container: true, spacing: 3 }, [
        createComponent('GridItem', { xs: 12, md: 8 }, [
          createComponent('Paper', { customStyles: { padding: 24, minHeight: 300 } }, [
            createComponent('Typography', { variant: 'h5', children: 'Main Content' }),
            createComponent('Typography', { children: 'This is the main content area. It takes up 8 columns on medium screens and above.' }),
          ]),
        ]),
        createComponent('GridItem', { xs: 12, md: 4 }, [
          createComponent('Paper', { customStyles: { padding: 24, minHeight: 300 } }, [
            createComponent('Typography', { variant: 'h6', children: 'Sidebar' }),
            createComponent('Typography', { children: 'This is the sidebar content.' }),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'three-column',
    name: 'Three Column Layout',
    description: 'A responsive three-column grid layout',
    category: 'layouts',
    components: [
      createComponent('Grid', { container: true, spacing: 3 }, [
        createComponent('GridItem', { xs: 12, sm: 6, md: 4 }, [
          createComponent('Card', { customStyles: { padding: 16 } }, [
            createComponent('Typography', { variant: 'h6', children: 'Column 1' }),
            createComponent('Typography', { children: 'Content for the first column.' }),
          ]),
        ]),
        createComponent('GridItem', { xs: 12, sm: 6, md: 4 }, [
          createComponent('Card', { customStyles: { padding: 16 } }, [
            createComponent('Typography', { variant: 'h6', children: 'Column 2' }),
            createComponent('Typography', { children: 'Content for the second column.' }),
          ]),
        ]),
        createComponent('GridItem', { xs: 12, sm: 6, md: 4 }, [
          createComponent('Card', { customStyles: { padding: 16 } }, [
            createComponent('Typography', { variant: 'h6', children: 'Column 3' }),
            createComponent('Typography', { children: 'Content for the third column.' }),
          ]),
        ]),
      ]),
    ],
  },

  // Navigation Templates
  {
    id: 'header-nav',
    name: 'Header Navigation',
    description: 'A top navigation bar with logo and menu items',
    category: 'navigation',
    components: [
      createComponent('AppBar', { position: 'static', color: 'primary' }, [
        createComponent('Box', { customStyles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' } }, [
          createComponent('Typography', { variant: 'h6', children: 'Brand Logo' }),
          createComponent('Box', { customStyles: { display: 'flex', gap: 16 } }, [
            createComponent('Button', { color: 'inherit', children: 'Home' }),
            createComponent('Button', { color: 'inherit', children: 'About' }),
            createComponent('Button', { color: 'inherit', children: 'Services' }),
            createComponent('Button', { color: 'inherit', children: 'Contact' }),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'breadcrumb-nav',
    name: 'Breadcrumb Navigation',
    description: 'Breadcrumb navigation for showing page hierarchy',
    category: 'navigation',
    components: [
      createComponent('Box', { customStyles: { padding: 16 } }, [
        createComponent('Breadcrumbs', {}, [
          createComponent('Link', { href: '#', children: 'Home' }),
          createComponent('Link', { href: '#', children: 'Products' }),
          createComponent('Link', { href: '#', children: 'Category' }),
          createComponent('Typography', { color: 'text.primary', children: 'Current Page' }),
        ]),
      ]),
    ],
  },
  {
    id: 'tabs-nav',
    name: 'Tabs Navigation',
    description: 'Horizontal tab navigation',
    category: 'navigation',
    components: [
      createComponent('Box', { customStyles: { borderBottom: '1px solid', borderColor: '#e0e0e0' } }, [
        createComponent('Tabs', { value: 0 }, [
          createComponent('Tab', { label: 'Overview' }),
          createComponent('Tab', { label: 'Features' }),
          createComponent('Tab', { label: 'Pricing' }),
          createComponent('Tab', { label: 'Reviews' }),
        ]),
      ]),
    ],
  },

  // Card Templates
  {
    id: 'product-card',
    name: 'Product Card',
    description: 'A product card with image, title, price, and action button',
    category: 'cards',
    components: [
      createComponent('Card', { customStyles: { maxWidth: 345 } }, [
        createComponent('Box', { customStyles: { height: 200, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, [
          createComponent('Typography', { variant: 'h6', color: 'text.secondary', children: 'Product Image' }),
        ]),
        createComponent('Box', { customStyles: { padding: 16 } }, [
          createComponent('Typography', { variant: 'h6', children: 'Product Name' }),
          createComponent('Typography', { variant: 'body2', color: 'text.secondary', children: 'Product description goes here. This is a brief overview of the product features.' }),
          createComponent('Box', { customStyles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 } }, [
            createComponent('Typography', { variant: 'h6', color: 'primary', children: '$99.00' }),
            createComponent('Button', { variant: 'contained', size: 'small', children: 'Add to Cart' }),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'profile-card',
    name: 'Profile Card',
    description: 'A user profile card with avatar and details',
    category: 'cards',
    components: [
      createComponent('Card', { customStyles: { maxWidth: 320, textAlign: 'center', padding: 24 } }, [
        createComponent('Avatar', { customStyles: { width: 80, height: 80, margin: '0 auto 16px', fontSize: 32 }, children: 'JD' }),
        createComponent('Typography', { variant: 'h6', children: 'John Doe' }),
        createComponent('Typography', { variant: 'body2', color: 'text.secondary', children: 'Software Developer' }),
        createComponent('Divider', { customStyles: { margin: '16px 0' } }),
        createComponent('Box', { customStyles: { display: 'flex', justifyContent: 'center', gap: 8 } }, [
          createComponent('Button', { variant: 'contained', size: 'small', children: 'Follow' }),
          createComponent('Button', { variant: 'outlined', size: 'small', children: 'Message' }),
        ]),
      ]),
    ],
  },
  {
    id: 'stat-card',
    name: 'Statistics Card',
    description: 'A card displaying a statistic with trend indicator',
    category: 'cards',
    components: [
      createComponent('Card', { customStyles: { padding: 24 } }, [
        createComponent('Typography', { variant: 'overline', color: 'text.secondary', children: 'Total Revenue' }),
        createComponent('Typography', { variant: 'h4', children: '$24,560' }),
        createComponent('Box', { customStyles: { display: 'flex', alignItems: 'center', marginTop: 8 } }, [
          createComponent('Chip', { label: '+12.5%', color: 'success', size: 'small' }),
          createComponent('Typography', { variant: 'caption', color: 'text.secondary', customStyles: { marginLeft: 8 }, children: 'vs last month' }),
        ]),
      ]),
    ],
  },

  // Dashboard Templates
  {
    id: 'dashboard-header',
    name: 'Dashboard Header',
    description: 'A dashboard header with title, search, and actions',
    category: 'dashboards',
    components: [
      createComponent('Box', { customStyles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 } }, [
        createComponent('Box', {}, [
          createComponent('Typography', { variant: 'h4', children: 'Dashboard' }),
          createComponent('Typography', { variant: 'body2', color: 'text.secondary', children: 'Welcome back, John!' }),
        ]),
        createComponent('Box', { customStyles: { display: 'flex', gap: 16 } }, [
          createComponent('TextField', { placeholder: 'Search...', size: 'small', customStyles: { width: 250 } }),
          createComponent('Button', { variant: 'contained', children: 'New Project' }),
        ]),
      ]),
    ],
  },
  {
    id: 'stats-row',
    name: 'Stats Row',
    description: 'A row of statistic cards for dashboards',
    category: 'dashboards',
    components: [
      createComponent('Grid', { container: true, spacing: 3 }, [
        createComponent('GridItem', { xs: 12, sm: 6, md: 3 }, [
          createComponent('Card', { customStyles: { padding: 20 } }, [
            createComponent('Typography', { variant: 'overline', color: 'text.secondary', children: 'Total Users' }),
            createComponent('Typography', { variant: 'h4', children: '2,543' }),
            createComponent('Chip', { label: '+5.2%', color: 'success', size: 'small', customStyles: { marginTop: 8 } }),
          ]),
        ]),
        createComponent('GridItem', { xs: 12, sm: 6, md: 3 }, [
          createComponent('Card', { customStyles: { padding: 20 } }, [
            createComponent('Typography', { variant: 'overline', color: 'text.secondary', children: 'Revenue' }),
            createComponent('Typography', { variant: 'h4', children: '$45,230' }),
            createComponent('Chip', { label: '+12.8%', color: 'success', size: 'small', customStyles: { marginTop: 8 } }),
          ]),
        ]),
        createComponent('GridItem', { xs: 12, sm: 6, md: 3 }, [
          createComponent('Card', { customStyles: { padding: 20 } }, [
            createComponent('Typography', { variant: 'overline', color: 'text.secondary', children: 'Orders' }),
            createComponent('Typography', { variant: 'h4', children: '1,234' }),
            createComponent('Chip', { label: '-2.4%', color: 'error', size: 'small', customStyles: { marginTop: 8 } }),
          ]),
        ]),
        createComponent('GridItem', { xs: 12, sm: 6, md: 3 }, [
          createComponent('Card', { customStyles: { padding: 20 } }, [
            createComponent('Typography', { variant: 'overline', color: 'text.secondary', children: 'Conversion' }),
            createComponent('Typography', { variant: 'h4', children: '3.24%' }),
            createComponent('Chip', { label: '+1.1%', color: 'success', size: 'small', customStyles: { marginTop: 8 } }),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'activity-list',
    name: 'Activity List',
    description: 'A list showing recent activity items',
    category: 'dashboards',
    components: [
      createComponent('Card', { customStyles: { padding: 16 } }, [
        createComponent('Typography', { variant: 'h6', customStyles: { marginBottom: 16 }, children: 'Recent Activity' }),
        createComponent('List', {}, [
          createComponent('ListItem', {}, [
            createComponent('Avatar', { customStyles: { marginRight: 16 }, children: 'JD' }),
            createComponent('Box', {}, [
              createComponent('Typography', { variant: 'body2', children: 'John Doe created a new project' }),
              createComponent('Typography', { variant: 'caption', color: 'text.secondary', children: '2 hours ago' }),
            ]),
          ]),
          createComponent('Divider', {}),
          createComponent('ListItem', {}, [
            createComponent('Avatar', { customStyles: { marginRight: 16 }, children: 'AS' }),
            createComponent('Box', {}, [
              createComponent('Typography', { variant: 'body2', children: 'Alice Smith updated the settings' }),
              createComponent('Typography', { variant: 'caption', color: 'text.secondary', children: '4 hours ago' }),
            ]),
          ]),
          createComponent('Divider', {}),
          createComponent('ListItem', {}, [
            createComponent('Avatar', { customStyles: { marginRight: 16 }, children: 'BJ' }),
            createComponent('Box', {}, [
              createComponent('Typography', { variant: 'body2', children: 'Bob Johnson added new team member' }),
              createComponent('Typography', { variant: 'caption', color: 'text.secondary', children: '1 day ago' }),
            ]),
          ]),
        ]),
      ]),
    ],
  },
];

export const getTemplatesByCategory = (category: Template['category']): Template[] => {
  return templates.filter(t => t.category === category);
};

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(t => t.id === id);
};

export const templateCategories = [
  { id: 'auth', label: 'Authentication', description: 'Login, signup, and auth forms' },
  { id: 'forms', label: 'Forms', description: 'Contact, settings, and input forms' },
  { id: 'layouts', label: 'Layouts', description: 'Page structure and grids' },
  { id: 'navigation', label: 'Navigation', description: 'Headers, menus, and nav components' },
  { id: 'cards', label: 'Cards', description: 'Product, profile, and info cards' },
  { id: 'dashboards', label: 'Dashboards', description: 'Stats, charts, and admin components' },
] as const;
