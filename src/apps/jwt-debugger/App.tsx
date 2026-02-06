import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Check,
  Error as ErrorIcon,
  Warning,
  Lock,
  Schedule,
  Person,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface JWTHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

interface DecodedJWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  isExpired: boolean;
  expiresIn: string | null;
}

const base64UrlDecode = (str: string): string => {
  // Replace URL-safe characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' to make it valid base64
  while (base64.length % 4) {
    base64 += '=';
  }
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return atob(base64);
  }
};

const formatTimestamp = (ts: number): string => {
  return new Date(ts * 1000).toLocaleString();
};

const getExpirationStatus = (exp: number | undefined): { isExpired: boolean; expiresIn: string | null } => {
  if (!exp) return { isExpired: false, expiresIn: null };

  const now = Math.floor(Date.now() / 1000);
  const diff = exp - now;

  if (diff < 0) {
    const absDiff = Math.abs(diff);
    if (absDiff < 60) return { isExpired: true, expiresIn: `Expired ${absDiff}s ago` };
    if (absDiff < 3600) return { isExpired: true, expiresIn: `Expired ${Math.floor(absDiff / 60)}m ago` };
    if (absDiff < 86400) return { isExpired: true, expiresIn: `Expired ${Math.floor(absDiff / 3600)}h ago` };
    return { isExpired: true, expiresIn: `Expired ${Math.floor(absDiff / 86400)}d ago` };
  }

  if (diff < 60) return { isExpired: false, expiresIn: `Expires in ${diff}s` };
  if (diff < 3600) return { isExpired: false, expiresIn: `Expires in ${Math.floor(diff / 60)}m` };
  if (diff < 86400) return { isExpired: false, expiresIn: `Expires in ${Math.floor(diff / 3600)}h` };
  return { isExpired: false, expiresIn: `Expires in ${Math.floor(diff / 86400)}d` };
};

const algorithmDescriptions: Record<string, string> = {
  HS256: 'HMAC using SHA-256',
  HS384: 'HMAC using SHA-384',
  HS512: 'HMAC using SHA-512',
  RS256: 'RSA using SHA-256',
  RS384: 'RSA using SHA-384',
  RS512: 'RSA using SHA-512',
  ES256: 'ECDSA using P-256 and SHA-256',
  ES384: 'ECDSA using P-384 and SHA-384',
  ES512: 'ECDSA using P-521 and SHA-512',
  PS256: 'RSA-PSS using SHA-256',
  PS384: 'RSA-PSS using SHA-384',
  PS512: 'RSA-PSS using SHA-512',
  none: 'No digital signature',
};

const claimDescriptions: Record<string, string> = {
  iss: 'Issuer - Who created and signed this token',
  sub: 'Subject - Who this token is about',
  aud: 'Audience - Who this token is intended for',
  exp: 'Expiration Time - When this token expires',
  nbf: 'Not Before - Token not valid before this time',
  iat: 'Issued At - When this token was created',
  jti: 'JWT ID - Unique identifier for this token',
};

const sampleTokens = [
  {
    name: 'Valid Token',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Vg30C57s3l90JNap_VgMhKZjfc-p7SoBXaSAy8c28HA',
  },
  {
    name: 'Expired Token',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ',
  },
  {
    name: 'Complex Claims',
    token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0xMjMifQ.eyJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJzdWIiOiJ1c2VyXzEyMyIsImF1ZCI6WyJhcGkuZXhhbXBsZS5jb20iLCJhcHAuZXhhbXBsZS5jb20iXSwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjk5OTk5OTk5OTksIm5iZiI6MTcwNDA2NzIwMCwianRpIjoiYWJjMTIzIiwicm9sZXMiOlsiYWRtaW4iLCJ1c2VyIl0sInBlcm1pc3Npb25zIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlLCJkZWxldGUiOmZhbHNlfX0.signature',
  },
];

export default function JWTDebugger() {
  const [token, setToken] = useState<string>(sampleTokens[0].token);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const decoded = useMemo((): DecodedJWT | null => {
    if (!token.trim()) return null;

    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;

    try {
      const header = JSON.parse(base64UrlDecode(parts[0])) as JWTHeader;
      const payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload;
      const { isExpired, expiresIn } = getExpirationStatus(payload.exp);

      return {
        header,
        payload,
        signature: parts[2],
        isExpired,
        expiresIn,
      };
    } catch {
      return null;
    }
  }, [token]);

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied to clipboard` });
  };

  const renderValue = (value: unknown): React.ReactNode => {
    if (value === null) return <span style={{ color: '#636d83' }}>null</span>;
    if (typeof value === 'boolean') return <span style={{ color: '#56b6c2' }}>{String(value)}</span>;
    if (typeof value === 'number') return <span style={{ color: '#d19a66' }}>{value}</span>;
    if (typeof value === 'string') return <span style={{ color: '#98c379' }}>"{value}"</span>;
    if (Array.isArray(value)) {
      return (
        <span style={{ color: '#c678dd' }}>
          [{value.map((v, i) => (
            <span key={i}>
              {i > 0 && ', '}
              {renderValue(v)}
            </span>
          ))}]
        </span>
      );
    }
    if (typeof value === 'object') {
      return (
        <Box sx={{ pl: 2 }}>
          {Object.entries(value as object).map(([k, v]) => (
            <Box key={k}>
              <span style={{ color: '#e06c75' }}>"{k}"</span>: {renderValue(v)}
            </Box>
          ))}
        </Box>
      );
    }
    return String(value);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#111',
          borderBottom: '1px solid #222',
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/">
            <IconButton size="small" sx={{ color: 'grey.500' }}>
              <Home />
            </IconButton>
          </Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
            JWT Debugger
          </Typography>
          {decoded && (
            <>
              <Chip
                icon={decoded.isExpired ? <Warning /> : <Check />}
                label={decoded.isExpired ? 'Expired' : 'Valid'}
                size="small"
                color={decoded.isExpired ? 'warning' : 'success'}
                variant="outlined"
              />
              {decoded.expiresIn && (
                <Chip
                  icon={<Schedule />}
                  label={decoded.expiresIn}
                  size="small"
                  variant="outlined"
                  sx={{ color: 'grey.400', borderColor: 'grey.700' }}
                />
              )}
            </>
          )}
          {!decoded && token && (
            <Chip
              icon={<ErrorIcon />}
              label="Invalid JWT"
              size="small"
              color="error"
              variant="outlined"
            />
          )}
        </Box>
      </Paper>

      {/* Sample Tokens */}
      <Box sx={{ px: 3, py: 1, bgcolor: '#0d0d0d', borderBottom: '1px solid #222', display: 'flex', gap: 1 }}>
        <Typography variant="caption" sx={{ color: 'grey.600', alignSelf: 'center' }}>
          Try:
        </Typography>
        {sampleTokens.map((sample) => (
          <Chip
            key={sample.name}
            label={sample.name}
            size="small"
            onClick={() => setToken(sample.token)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
        {/* Left Panel - Token Input */}
        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
                Encoded Token
              </Typography>
              <Tooltip title="Copy token">
                <IconButton
                  size="small"
                  onClick={() => handleCopy(token, 'Token')}
                  sx={{ color: 'grey.500' }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              multiline
              fullWidth
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your JWT token here..."
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  bgcolor: '#0a0a0a',
                  color: '#d4d4d4',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333',
                },
              }}
            />
          </Paper>

          {/* Token Parts Visualization */}
          {decoded && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>
                Token Structure
              </Typography>
              <Box sx={{ fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all' }}>
                <span style={{ color: '#e06c75' }}>{token.split('.')[0]}</span>
                <span style={{ color: '#636d83' }}>.</span>
                <span style={{ color: '#c678dd' }}>{token.split('.')[1]}</span>
                <span style={{ color: '#636d83' }}>.</span>
                <span style={{ color: '#56b6c2' }}>{token.split('.')[2]}</span>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Chip label="Header" size="small" sx={{ bgcolor: 'rgba(224, 108, 117, 0.2)', color: '#e06c75' }} />
                <Chip label="Payload" size="small" sx={{ bgcolor: 'rgba(198, 120, 221, 0.2)', color: '#c678dd' }} />
                <Chip label="Signature" size="small" sx={{ bgcolor: 'rgba(86, 182, 194, 0.2)', color: '#56b6c2' }} />
              </Box>
            </Paper>
          )}
        </Box>

        {/* Right Panel - Decoded Data */}
        <Box sx={{ width: 450, borderLeft: '1px solid #222', overflow: 'auto', p: 2 }}>
          {decoded ? (
            <>
              {/* Header */}
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lock sx={{ fontSize: 18, color: '#e06c75' }} />
                    <Typography variant="subtitle2" sx={{ color: '#e06c75' }}>
                      Header
                    </Typography>
                  </Box>
                  <Tooltip title="Copy header">
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), 'Header')}
                      sx={{ color: 'grey.500' }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ p: 2 }}>
                  {Object.entries(decoded.header).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#e06c75' }}>
                          "{key}":
                        </Typography>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#98c379' }}>
                          "{String(value)}"
                        </Typography>
                      </Box>
                      {key === 'alg' && algorithmDescriptions[value as string] && (
                        <Typography variant="caption" sx={{ color: 'grey.600', ml: 2 }}>
                          {algorithmDescriptions[value as string]}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Payload */}
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 18, color: '#c678dd' }} />
                    <Typography variant="subtitle2" sx={{ color: '#c678dd' }}>
                      Payload
                    </Typography>
                  </Box>
                  <Tooltip title="Copy payload">
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), 'Payload')}
                      sx={{ color: 'grey.500' }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ p: 2 }}>
                  {Object.entries(decoded.payload).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#e06c75' }}>
                          "{key}":
                        </Typography>
                        <Box sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                          {renderValue(value)}
                        </Box>
                      </Box>
                      {claimDescriptions[key] && (
                        <Typography variant="caption" sx={{ color: 'grey.600', display: 'block', ml: 2 }}>
                          {claimDescriptions[key]}
                        </Typography>
                      )}
                      {(key === 'exp' || key === 'iat' || key === 'nbf') && typeof value === 'number' && (
                        <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', ml: 2 }}>
                          {formatTimestamp(value)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Signature */}
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #222' }}>
                  <Typography variant="subtitle2" sx={{ color: '#56b6c2' }}>
                    Signature
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: 'grey.500', wordBreak: 'break-all' }}>
                    {decoded.signature}
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(97, 175, 239, 0.1)' }}>
                    Signature verification requires the secret key or public key, which is not available in browser.
                  </Alert>
                </Box>
              </Paper>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography sx={{ color: 'grey.600' }}>
                {token ? 'Invalid JWT token format' : 'Paste a JWT token to decode'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
