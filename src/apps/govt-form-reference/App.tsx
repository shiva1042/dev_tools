import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, IconButton, Chip, Button,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LaunchIcon from '@mui/icons-material/Launch';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

interface FormRef {
  name: string; title: string; purpose: string; category: string; rules: string; toolLink?: string;
}

const categories = ['All', 'Travel', 'Medical', 'Leave', 'Tax', 'Pension', 'GPF/NPS', 'Property', 'Service', 'Insurance', 'Education', 'Pay'];

const forms: FormRef[] = [
  { name: 'GAR-14A', title: 'Travelling Allowance Bill', purpose: 'Claim TA/DA for official tours', category: 'Travel', rules: 'SR 44-51, CS(MA) Rules', toolLink: '/ta-da-calculator' },
  { name: 'GAR-14B', title: 'Transfer TA Bill', purpose: 'Claim transfer travelling allowance', category: 'Travel', rules: 'SR 116, Transfer TA Rules', toolLink: '/transfer-ta-calculator' },
  { name: 'GAR-14C', title: 'LTC Claim Form', purpose: 'Leave Travel Concession claim', category: 'Travel', rules: 'CCS(LTC) Rules 1988', toolLink: '/ltc-claim-calculator' },
  { name: 'GAR-12B', title: 'Medical Advance Bill', purpose: 'Advance for medical treatment', category: 'Medical', rules: 'CS(MA) Rules 1944' },
  { name: 'MRC(S)', title: 'Medical Reimbursement Claim', purpose: 'CGHS medical expense reimbursement', category: 'Medical', rules: 'CGHS Rules', toolLink: '/cghs-claim-form' },
  { name: 'CGHS Card Application', title: 'CGHS Beneficiary Card', purpose: 'Apply for CGHS card', category: 'Medical', rules: 'CGHS(MA) Rules' },
  { name: 'Form 12BB', title: 'Investment Declaration', purpose: 'Declare investments for TDS', category: 'Tax', rules: 'Rule 26C, IT Act', toolLink: '/income-tax-calculator' },
  { name: 'Form 16', title: 'TDS Certificate', purpose: 'Annual tax deducted statement', category: 'Tax', rules: 'Section 203, IT Act' },
  { name: 'Form 10E', title: 'Arrears Relief Form', purpose: 'Relief u/s 89(1) for arrears', category: 'Tax', rules: 'Section 89, IT Act' },
  { name: 'Form 12C', title: 'Income from Other Sources', purpose: 'Declare additional income', category: 'Tax', rules: 'Rule 26B' },
  { name: 'Leave Application', title: 'Leave Application Form', purpose: 'Apply for all types of leave', category: 'Leave', rules: 'CCS(Leave) Rules 1972', toolLink: '/leave-manager' },
  { name: 'EL Encashment', title: 'Earned Leave Encashment', purpose: 'Encash earned leave balance', category: 'Leave', rules: 'CCS(Leave) Rules, Rule 39' },
  { name: 'Child Care Leave', title: 'CCL Application', purpose: 'Apply for Child Care Leave', category: 'Leave', rules: 'Rule 43-C' },
  { name: 'GPF Form 3A', title: 'GPF Temporary Advance', purpose: 'Apply for GPF temporary advance', category: 'GPF/NPS', rules: 'GPF(CS) Rules', toolLink: '/gpf-calculator' },
  { name: 'GPF Form 4', title: 'GPF Final Withdrawal', purpose: 'GPF withdrawal on retirement', category: 'GPF/NPS', rules: 'GPF(CS) Rules' },
  { name: 'GPF Nomination', title: 'GPF Nomination Form', purpose: 'Nominate beneficiary for GPF', category: 'GPF/NPS', rules: 'GPF(CS) Rules' },
  { name: 'NPS S1', title: 'NPS Registration', purpose: 'New subscriber registration', category: 'GPF/NPS', rules: 'NPS Rules', toolLink: '/nps-tracker' },
  { name: 'NPS S2', title: 'NPS Contribution', purpose: 'Monthly contribution details', category: 'GPF/NPS', rules: 'NPS Rules' },
  { name: 'NPS Exit', title: 'NPS Withdrawal Form', purpose: 'Withdrawal on retirement/exit', category: 'GPF/NPS', rules: 'NPS Exit Rules' },
  { name: 'Pension Form 5', title: 'Pension Application', purpose: 'Apply for retirement pension', category: 'Pension', rules: 'CCS(Pension) Rules 2021', toolLink: '/pension-gratuity-calculator' },
  { name: 'Pension Form 6-A', title: 'Gratuity Application', purpose: 'Apply for DCRG', category: 'Pension', rules: 'CCS(Pension) Rules' },
  { name: 'Commutation Form', title: 'Pension Commutation', purpose: 'Commute portion of pension', category: 'Pension', rules: 'CCS(Commutation) Rules' },
  { name: 'Family Pension', title: 'Family Pension Form', purpose: 'Apply for family pension', category: 'Pension', rules: 'CCS(Pension) Rules, Rule 54' },
  { name: 'PPO Form', title: 'Pension Payment Order', purpose: 'PPO generation and bank details', category: 'Pension', rules: 'CCS(Pension) Rules' },
  { name: 'IPR Form', title: 'Immovable Property Return', purpose: 'Annual property declaration', category: 'Property', rules: 'CCS(Conduct) Rules, Rule 18', toolLink: '/property-return-form' },
  { name: 'APR Form', title: 'Annual Property Return', purpose: 'Comprehensive property return', category: 'Property', rules: 'Lokpal Rules' },
  { name: 'GIS/CGEGIS', title: 'Group Insurance Scheme', purpose: 'GIS claim/nomination', category: 'Insurance', rules: 'CGEGIS Rules 1980', toolLink: '/gis-cgegis-calculator' },
  { name: 'PLI Form', title: 'Postal Life Insurance', purpose: 'PLI subscription/claim', category: 'Insurance', rules: 'PLI Rules' },
  { name: 'CEA Annexure-I', title: 'CEA Reimbursement', purpose: 'Children education allowance claim', category: 'Education', rules: 'CEA Rules, 6th CPC', toolLink: '/cea-reimbursement' },
  { name: 'CEA Hostel', title: 'Hostel Subsidy Form', purpose: 'Hostel subsidy claim', category: 'Education', rules: 'CEA Rules' },
  { name: 'Tuition Fee Form', title: 'Tuition Fee Reimbursement', purpose: 'School tuition fee claim', category: 'Education', rules: 'DoP&T Orders' },
  { name: 'Festival Advance', title: 'Festival Advance Application', purpose: 'Apply for ₹10,000 festival advance', category: 'Service', rules: 'GFR Rules', toolLink: '/festival-advance-calc' },
  { name: 'LPC', title: 'Last Pay Certificate', purpose: 'Pay details on transfer/retirement', category: 'Pay', rules: 'FR/SR Rules' },
  { name: 'Pay Fixation', title: 'Pay Fixation Statement', purpose: 'Fix pay on promotion/MACP', category: 'Pay', rules: 'CCS(RP) Rules 2016', toolLink: '/pay-fixation-calculator' },
  { name: 'Option Form', title: 'Pay Option Exercise', purpose: 'Choose pay fixation option', category: 'Pay', rules: 'CCS(RP) Rules' },
  { name: 'NOC Passport', title: 'NOC for Passport', purpose: 'No objection for passport', category: 'Service', rules: 'DoP&T Orders' },
  { name: 'NOC Higher Study', title: 'NOC for Higher Studies', purpose: 'Permission for higher education', category: 'Service', rules: 'CCS(Conduct) Rules' },
  { name: 'Vigilance Clearance', title: 'Vigilance Clearance', purpose: 'Clearance for promotion/deputation', category: 'Service', rules: 'CVC Guidelines' },
  { name: 'HBA Application', title: 'House Building Advance', purpose: 'Apply for HBA', category: 'Service', rules: 'HBA Rules' },
  { name: 'Motor Car Advance', title: 'Motor Car/Cycle Advance', purpose: 'Apply for vehicle advance', category: 'Service', rules: 'Advance Rules' },
  { name: 'APAR Form', title: 'Annual Performance Report', purpose: 'Annual appraisal', category: 'Service', rules: 'CCS(APAR) Rules' },
  { name: 'Salary Slip', title: 'Monthly Pay Slip', purpose: 'Monthly salary statement', category: 'Pay', rules: 'FR/SR', toolLink: '/govt-salary-slip' },
  { name: 'HRA Exemption', title: 'HRA Calculation Sheet', purpose: 'HRA tax exemption proof', category: 'Tax', rules: 'Section 10(13A)', toolLink: '/hra-calculator' },
  { name: 'DA Order', title: 'DA Rate Notification', purpose: 'DA rate revision order', category: 'Pay', rules: 'DoE Orders', toolLink: '/da-rate-lookup' },
];

const categoryColors: Record<string, string> = {
  Travel: '#3b82f6', Medical: '#ef4444', Leave: '#f59e0b', Tax: '#10b981',
  Pension: '#8b5cf6', 'GPF/NPS': '#6366f1', Property: '#ec4899', Service: '#64748b',
  Insurance: '#14b8a6', Education: '#f97316', Pay: '#22c55e',
};

export default function App() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return forms.filter(f => {
      const matchCat = category === 'All' || f.category === category;
      const matchSearch = search === '' ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        f.purpose.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, category]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small"><HomeIcon /></IconButton>
            <MenuBookIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Government Forms Reference</Typography>
          </Box>

          <Paper sx={{ p: 2, mb: 3 }}>
            <TextField
              fullWidth size="small" placeholder="Search forms by name, title, or keyword..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {categories.map(c => (
                <Chip
                  key={c} label={c} size="small"
                  onClick={() => setCategory(c)}
                  sx={{
                    bgcolor: category === c ? (categoryColors[c] || 'primary.main') : 'action.hover',
                    color: category === c ? 'white' : 'text.primary',
                    cursor: 'pointer', '&:hover': { opacity: 0.8 },
                  }}
                />
              ))}
            </Box>
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{filtered.length} forms found</Typography>

          <Grid container spacing={2}>
            {filtered.map((f, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main">{f.name}</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Chip label={f.category} size="small" sx={{ bgcolor: categoryColors[f.category] || 'grey.700', color: 'white', fontSize: 10 }} />
                  </Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>{f.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>{f.purpose}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">{f.rules}</Typography>
                    {f.toolLink && (
                      <Button component={Link} to={f.toolLink} size="small" endIcon={<LaunchIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: 11, textTransform: 'none' }}>
                        Open Tool
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
