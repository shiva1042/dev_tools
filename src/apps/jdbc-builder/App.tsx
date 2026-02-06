import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface DatabaseConfig {
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  schema?: string;
  ssl: boolean;
  sslMode?: string;
  options: Record<string, string>;
}

const DATABASE_CONFIGS: Record<string, { defaultPort: number; driver: string; urlPattern: string; mavenDep: string; gradleDep: string }> = {
  postgresql: {
    defaultPort: 5432,
    driver: 'org.postgresql.Driver',
    urlPattern: 'jdbc:postgresql://{host}:{port}/{database}',
    mavenDep: `<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
</dependency>`,
    gradleDep: `implementation 'org.postgresql:postgresql:42.7.1'`,
  },
  mysql: {
    defaultPort: 3306,
    driver: 'com.mysql.cj.jdbc.Driver',
    urlPattern: 'jdbc:mysql://{host}:{port}/{database}',
    mavenDep: `<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.3.0</version>
</dependency>`,
    gradleDep: `implementation 'com.mysql:mysql-connector-j:8.3.0'`,
  },
  oracle: {
    defaultPort: 1521,
    driver: 'oracle.jdbc.OracleDriver',
    urlPattern: 'jdbc:oracle:thin:@{host}:{port}:{database}',
    mavenDep: `<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ojdbc11</artifactId>
    <version>23.3.0.23.09</version>
</dependency>`,
    gradleDep: `implementation 'com.oracle.database.jdbc:ojdbc11:23.3.0.23.09'`,
  },
  sqlserver: {
    defaultPort: 1433,
    driver: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
    urlPattern: 'jdbc:sqlserver://{host}:{port};databaseName={database}',
    mavenDep: `<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <version>12.4.2.jre11</version>
</dependency>`,
    gradleDep: `implementation 'com.microsoft.sqlserver:mssql-jdbc:12.4.2.jre11'`,
  },
  h2: {
    defaultPort: 9092,
    driver: 'org.h2.Driver',
    urlPattern: 'jdbc:h2:{mode}:{database}',
    mavenDep: `<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <version>2.2.224</version>
</dependency>`,
    gradleDep: `implementation 'com.h2database:h2:2.2.224'`,
  },
  mongodb: {
    defaultPort: 27017,
    driver: 'mongodb.jdbc.MongoDriver',
    urlPattern: 'mongodb://{host}:{port}/{database}',
    mavenDep: `<dependency>
    <groupId>org.mongodb</groupId>
    <artifactId>mongodb-driver-sync</artifactId>
    <version>4.11.1</version>
</dependency>`,
    gradleDep: `implementation 'org.mongodb:mongodb-driver-sync:4.11.1'`,
  },
  neo4j: {
    defaultPort: 7687,
    driver: 'org.neo4j.jdbc.Driver',
    urlPattern: 'jdbc:neo4j:bolt://{host}:{port}',
    mavenDep: `<dependency>
    <groupId>org.neo4j</groupId>
    <artifactId>neo4j-jdbc-driver</artifactId>
    <version>5.13.0</version>
</dependency>`,
    gradleDep: `implementation 'org.neo4j:neo4j-jdbc-driver:5.13.0'`,
  },
  elasticsearch: {
    defaultPort: 9200,
    driver: 'org.elasticsearch.xpack.sql.jdbc.EsDriver',
    urlPattern: 'jdbc:es://{host}:{port}',
    mavenDep: `<dependency>
    <groupId>org.elasticsearch.plugin</groupId>
    <artifactId>x-pack-sql-jdbc</artifactId>
    <version>8.11.3</version>
</dependency>`,
    gradleDep: `implementation 'org.elasticsearch.plugin:x-pack-sql-jdbc:8.11.3'`,
  },
  redis: {
    defaultPort: 6379,
    driver: 'N/A (Use Jedis/Lettuce)',
    urlPattern: 'redis://{host}:{port}',
    mavenDep: `<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>5.1.0</version>
</dependency>
<!-- Or use Lettuce -->
<dependency>
    <groupId>io.lettuce</groupId>
    <artifactId>lettuce-core</artifactId>
    <version>6.3.1.RELEASE</version>
</dependency>`,
    gradleDep: `implementation 'redis.clients:jedis:5.1.0'
// Or use Lettuce
implementation 'io.lettuce:lettuce-core:6.3.1.RELEASE'`,
  },
};

export default function JdbcBuilder() {
  const [outputTab, setOutputTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [config, setConfig] = useState<DatabaseConfig>({
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: 'mydb',
    username: 'postgres',
    password: '',
    ssl: false,
    sslMode: 'prefer',
    options: {},
  });
  const [h2Mode, setH2Mode] = useState<'mem' | 'file' | 'tcp'>('mem');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const connectionString = useMemo(() => {
    const dbConfig = DATABASE_CONFIGS[config.type];
    if (!dbConfig) return '';

    let url = dbConfig.urlPattern
      .replace('{host}', config.host)
      .replace('{port}', String(config.port))
      .replace('{database}', config.database);

    if (config.type === 'h2') {
      url = url.replace('{mode}', h2Mode);
      if (h2Mode === 'file') {
        url = url.replace(config.database, `./data/${config.database}`);
      }
    }

    // Add connection options
    const options: string[] = [];

    if (config.type === 'postgresql') {
      if (config.schema) options.push(`currentSchema=${config.schema}`);
      if (config.ssl) options.push(`ssl=true&sslmode=${config.sslMode || 'require'}`);
    }

    if (config.type === 'mysql') {
      options.push('useSSL=' + config.ssl);
      options.push('serverTimezone=UTC');
      options.push('allowPublicKeyRetrieval=true');
    }

    if (config.type === 'sqlserver') {
      if (config.ssl) options.push('encrypt=true');
      options.push('trustServerCertificate=' + !config.ssl);
    }

    Object.entries(config.options).forEach(([key, value]) => {
      if (value) options.push(`${key}=${value}`);
    });

    if (options.length > 0) {
      const separator = config.type === 'sqlserver' ? ';' :
                        config.type === 'oracle' ? '?' :
                        url.includes('?') ? '&' : '?';
      url += separator + options.join(config.type === 'sqlserver' ? ';' : '&');
    }

    return url;
  }, [config, h2Mode]);

  const springBootConfig = useMemo(() => {
    const dbConfig = DATABASE_CONFIGS[config.type];
    if (!dbConfig) return '';

    return `# Spring Boot Datasource Configuration
spring.datasource.url=${connectionString}
spring.datasource.username=${config.username}
spring.datasource.password=\${DB_PASSWORD:${config.password || 'changeme'}}
spring.datasource.driver-class-name=${dbConfig.driver}

# HikariCP Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.connection-timeout=30000

# JPA Settings (if using JPA)
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true`;
  }, [connectionString, config]);

  const javaCode = useMemo(() => {
    const dbConfig = DATABASE_CONFIGS[config.type];
    if (!dbConfig) return '';

    return `import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {

    private static final String URL = "${connectionString}";
    private static final String USER = "${config.username}";
    private static final String PASSWORD = System.getenv("DB_PASSWORD"); // Use env variable

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static void main(String[] args) {
        try (Connection conn = getConnection()) {
            System.out.println("Connected successfully!");
            System.out.println("Database: " + conn.getMetaData().getDatabaseProductName());
            System.out.println("Version: " + conn.getMetaData().getDatabaseProductVersion());
        } catch (SQLException e) {
            System.err.println("Connection failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}`;
  }, [connectionString, config]);

  const dependency = useMemo(() => {
    const dbConfig = DATABASE_CONFIGS[config.type];
    return dbConfig ? { maven: dbConfig.mavenDep, gradle: dbConfig.gradleDep } : { maven: '', gradle: '' };
  }, [config.type]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDatabaseChange = (type: string) => {
    const dbConfig = DATABASE_CONFIGS[type];
    setConfig({
      ...config,
      type,
      port: dbConfig?.defaultPort || config.port,
    });
  };

  const outputs = [
    { label: 'Connection String', content: connectionString },
    { label: 'Spring Boot', content: springBootConfig },
    { label: 'Java Code', content: javaCode },
    { label: 'Maven', content: dependency.maven },
    { label: 'Gradle', content: dependency.gradle },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>JDBC Connection String Builder</Typography>
          </Box>
          <Tooltip title="Copy Connection String">
            <IconButton onClick={() => handleCopy(connectionString)} sx={{ color: 'grey.500' }}>
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          {/* Database Type Selection */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Database Type</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.keys(DATABASE_CONFIGS).map(db => (
                <Chip
                  key={db}
                  label={db.toUpperCase()}
                  color={config.type === db ? 'primary' : 'default'}
                  onClick={() => handleDatabaseChange(db)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Paper>

          {/* Connection Settings */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Connection Settings</Typography>

            {config.type === 'h2' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>H2 Mode</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(['mem', 'file', 'tcp'] as const).map(mode => (
                    <Chip
                      key={mode}
                      label={mode.toUpperCase()}
                      color={h2Mode === mode ? 'primary' : 'default'}
                      onClick={() => setH2Mode(mode)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                label="Host"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                sx={{ flex: 2, '& .MuiInputBase-root': { color: 'grey.300' } }}
              />
              <TextField
                size="small"
                label="Port"
                type="number"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 0 })}
                sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300' } }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                label="Database"
                value={config.database}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
                sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }}
              />
              {config.type === 'postgresql' && (
                <TextField
                  size="small"
                  label="Schema"
                  value={config.schema || ''}
                  onChange={(e) => setConfig({ ...config, schema: e.target.value })}
                  placeholder="public"
                  sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                label="Username"
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }}
              />
              <TextField
                size="small"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)} sx={{ color: 'grey.500' }}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <FormControlLabel
                control={<Switch checked={config.ssl} onChange={(e) => setConfig({ ...config, ssl: e.target.checked })} size="small" />}
                label={<Typography sx={{ color: 'grey.400', fontSize: 14 }}>SSL/TLS</Typography>}
              />
              {config.ssl && config.type === 'postgresql' && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>SSL Mode</InputLabel>
                  <Select
                    value={config.sslMode || 'prefer'}
                    label="SSL Mode"
                    onChange={(e) => setConfig({ ...config, sslMode: e.target.value })}
                    sx={{ color: 'grey.300' }}
                  >
                    <MenuItem value="disable">disable</MenuItem>
                    <MenuItem value="allow">allow</MenuItem>
                    <MenuItem value="prefer">prefer</MenuItem>
                    <MenuItem value="require">require</MenuItem>
                    <MenuItem value="verify-ca">verify-ca</MenuItem>
                    <MenuItem value="verify-full">verify-full</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </Paper>

          {/* Driver Info */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 1 }}>Driver Information</Typography>
            <Typography variant="body2" sx={{ color: 'grey.500', fontFamily: 'monospace' }}>
              {DATABASE_CONFIGS[config.type]?.driver || 'N/A'}
            </Typography>
          </Paper>
        </Box>

        {/* Output Panel */}
        <Box sx={{ width: 550, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: '1px solid #222' }}>
            <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)} variant="scrollable" scrollButtons="auto">
              {outputs.map((out, i) => (
                <Tab key={i} label={out.label} sx={{ color: 'grey.400', fontSize: 11, minWidth: 80 }} />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ p: 2, borderBottom: '1px solid #222', display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Copy">
              <IconButton size="small" onClick={() => handleCopy(outputs[outputTab].content)} sx={{ color: 'grey.500' }}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {outputs[outputTab].content}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
