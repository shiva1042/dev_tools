import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#10b981' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  fromName: string;
  fromAddress: string;
  fromEmail: string;
  fromPhone: string;
  toName: string;
  toAddress: string;
  toEmail: string;
  toPhone: string;
  items: LineItem[];
  notes: string;
  taxRate: number;
  currency: string;
}

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'JPY', symbol: '¥' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'AUD', symbol: 'A$' },
];

export default function App() {
  const printRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: 'INV-001',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fromName: 'Your Company Name',
    fromAddress: '123 Business Street\nCity, State 12345',
    fromEmail: 'billing@company.com',
    fromPhone: '+1 (555) 123-4567',
    toName: 'Client Company',
    toAddress: '456 Client Avenue\nCity, State 67890',
    toEmail: 'accounts@client.com',
    toPhone: '+1 (555) 987-6543',
    items: [
      { id: '1', description: 'Web Development Services', quantity: 40, unitPrice: 75 },
      { id: '2', description: 'UI/UX Design', quantity: 20, unitPrice: 85 },
    ],
    notes: 'Thank you for your business!\nPayment is due within 30 days.',
    taxRate: 10,
    currency: 'USD',
  });

  const getCurrencySymbol = () => {
    return currencies.find((c) => c.code === invoice.currency)?.symbol || '$';
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax;

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 },
      ],
    });
  };

  const removeItem = (id: string) => {
    setInvoice({
      ...invoice,
      items: invoice.items.filter((item) => item.id !== id),
    });
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoice({
      ...invoice,
      items: invoice.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .title { font-size: 32px; font-weight: bold; color: #10b981; }
            .section { margin-bottom: 24px; }
            .label { font-weight: bold; color: #666; font-size: 12px; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: bold; }
            .totals { text-align: right; }
            .total-row { font-size: 18px; font-weight: bold; }
            .notes { background: #f9f9f9; padding: 16px; border-radius: 4px; white-space: pre-line; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">INVOICE</div>
            <div>
              <div><strong>${invoice.invoiceNumber}</strong></div>
              <div>Date: ${invoice.invoiceDate}</div>
              <div>Due: ${invoice.dueDate}</div>
            </div>
          </div>
          <div style="display: flex; gap: 40px; margin-bottom: 30px;">
            <div class="section" style="flex: 1;">
              <div class="label">FROM</div>
              <div><strong>${invoice.fromName}</strong></div>
              <div style="white-space: pre-line;">${invoice.fromAddress}</div>
              <div>${invoice.fromEmail}</div>
              <div>${invoice.fromPhone}</div>
            </div>
            <div class="section" style="flex: 1;">
              <div class="label">BILL TO</div>
              <div><strong>${invoice.toName}</strong></div>
              <div style="white-space: pre-line;">${invoice.toAddress}</div>
              <div>${invoice.toEmail}</div>
              <div>${invoice.toPhone}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${getCurrencySymbol()}${item.unitPrice.toFixed(2)}</td>
                  <td>${getCurrencySymbol()}${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="totals">
            <div>Subtotal: ${getCurrencySymbol()}${subtotal.toFixed(2)}</div>
            <div>Tax (${invoice.taxRate}%): ${getCurrencySymbol()}${tax.toFixed(2)}</div>
            <div class="total-row">Total: ${getCurrencySymbol()}${total.toFixed(2)}</div>
          </div>
          ${invoice.notes ? `<div class="notes"><strong>Notes:</strong><br/>${invoice.notes}</div>` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <ReceiptIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Invoice Generator
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
              Print / Save PDF
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Editor */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Invoice Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Invoice Number"
                      value={invoice.invoiceNumber}
                      onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Invoice Date"
                      value={invoice.invoiceDate}
                      onChange={(e) => setInvoice({ ...invoice, invoiceDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Due Date"
                      value={invoice.dueDate}
                      onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={3}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      From (Your Details)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <TextField
                        size="small"
                        label="Company Name"
                        value={invoice.fromName}
                        onChange={(e) => setInvoice({ ...invoice, fromName: e.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Address"
                        multiline
                        rows={2}
                        value={invoice.fromAddress}
                        onChange={(e) => setInvoice({ ...invoice, fromAddress: e.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Email"
                        value={invoice.fromEmail}
                        onChange={(e) => setInvoice({ ...invoice, fromEmail: e.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Phone"
                        value={invoice.fromPhone}
                        onChange={(e) => setInvoice({ ...invoice, fromPhone: e.target.value })}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Bill To (Client)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <TextField
                        size="small"
                        label="Client Name"
                        value={invoice.toName}
                        onChange={(e) => setInvoice({ ...invoice, toName: e.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Address"
                        multiline
                        rows={2}
                        value={invoice.toAddress}
                        onChange={(e) => setInvoice({ ...invoice, toAddress: e.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Email"
                        value={invoice.toEmail}
                        onChange={(e) => setInvoice({ ...invoice, toEmail: e.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Phone"
                        value={invoice.toPhone}
                        onChange={(e) => setInvoice({ ...invoice, toPhone: e.target.value })}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    Line Items
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button size="small" startIcon={<AddIcon />} onClick={addItem}>
                    Add Item
                  </Button>
                </Box>

                {invoice.items.map((item, index) => (
                  <Box key={item.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      sx={{ flex: 2 }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      sx={{ width: 80 }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      sx={{ width: 100 }}
                    />
                    <Typography sx={{ width: 100, textAlign: 'right' }}>
                      {getCurrencySymbol()}{(item.quantity * item.unitPrice).toFixed(2)}
                    </Typography>
                    <IconButton size="small" onClick={() => removeItem(item.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={invoice.currency}
                        label="Currency"
                        onChange={(e) => setInvoice({ ...invoice, currency: e.target.value })}
                      >
                        {currencies.map((c) => (
                          <MenuItem key={c.code} value={c.code}>
                            {c.symbol} {c.code}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Tax Rate (%)"
                      value={invoice.taxRate}
                      onChange={(e) => setInvoice({ ...invoice, taxRate: parseFloat(e.target.value) || 0 })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      label="Notes"
                      value={invoice.notes}
                      onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Preview */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: 4, bgcolor: '#ffffff', color: '#333' }} ref={printRef}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    INVOICE
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6">{invoice.invoiceNumber}</Typography>
                    <Typography variant="body2">Date: {invoice.invoiceDate}</Typography>
                    <Typography variant="body2">Due: {invoice.dueDate}</Typography>
                  </Box>
                </Box>

                <Grid container spacing={4} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      FROM
                    </Typography>
                    <Typography fontWeight="bold">{invoice.fromName}</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {invoice.fromAddress}
                    </Typography>
                    <Typography variant="body2">{invoice.fromEmail}</Typography>
                    <Typography variant="body2">{invoice.fromPhone}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      BILL TO
                    </Typography>
                    <Typography fontWeight="bold">{invoice.toName}</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {invoice.toAddress}
                    </Typography>
                    <Typography variant="body2">{invoice.toEmail}</Typography>
                    <Typography variant="body2">{invoice.toPhone}</Typography>
                  </Grid>
                </Grid>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Description</strong></TableCell>
                        <TableCell align="right"><strong>Qty</strong></TableCell>
                        <TableCell align="right"><strong>Unit Price</strong></TableCell>
                        <TableCell align="right"><strong>Amount</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoice.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {getCurrencySymbol()}{item.unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {getCurrencySymbol()}{(item.quantity * item.unitPrice).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, textAlign: 'right' }}>
                  <Typography>Subtotal: {getCurrencySymbol()}{subtotal.toFixed(2)}</Typography>
                  <Typography>Tax ({invoice.taxRate}%): {getCurrencySymbol()}{tax.toFixed(2)}</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    Total: {getCurrencySymbol()}{total.toFixed(2)}
                  </Typography>
                </Box>

                {invoice.notes && (
                  <Box sx={{ mt: 4, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      <strong>Notes:</strong>
                      <br />
                      {invoice.notes}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
