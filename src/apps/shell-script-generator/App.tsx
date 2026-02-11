import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Download,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

type TemplateType = 'basic' | 'cli' | 'logging' | 'systemd' | 'backup' | 'deploy' | 'docker' | 'cron';

const templateDescriptions: Record<TemplateType, string> = {
  basic: 'Basic script template with standard boilerplate',
  cli: 'CLI tool with argument parsing using getopts',
  logging: 'Script with logging functions and log levels',
  systemd: 'Script designed to run as a systemd service',
  backup: 'Backup script with rotation and compression',
  deploy: 'Deployment script with rollback support',
  docker: 'Docker helper script for common container operations',
  cron: 'Cron job script with locking and logging',
};

export default function ShellScriptGenerator() {
  const [template, setTemplate] = useState<TemplateType>('basic');
  const [scriptName, setScriptName] = useState('myscript.sh');
  const [description, setDescription] = useState('A shell script');
  const [author, setAuthor] = useState('');

  // Options
  const [strictMode, setStrictMode] = useState(true);
  const [loggingFuncs, setLoggingFuncs] = useState(true);
  const [colorOutput, setColorOutput] = useState(true);
  const [argParsing, setArgParsing] = useState(false);
  const [helpFunction, setHelpFunction] = useState(true);
  const [trapCleanup, setTrapCleanup] = useState(true);
  const [tempDir, setTempDir] = useState(false);
  const [lockFile, setLockFile] = useState(false);
  const [rootCheck, setRootCheck] = useState(false);
  const [depCheck, setDepCheck] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const generateScript = (): string => {
    const lines: string[] = [];
    const add = (line: string) => lines.push(line);
    const blank = () => lines.push('');

    add('#!/usr/bin/env bash');
    add('#');
    add(`# ${scriptName}`);
    add(`# ${description}`);
    if (author) add(`# Author: ${author}`);
    add(`# Generated: ${new Date().toISOString().split('T')[0]}`);
    add('#');
    blank();

    if (strictMode) {
      add('set -euo pipefail');
      add('IFS=$\'\\n\\t\'');
      blank();
    }

    // Constants
    add('# ==============================================================================');
    add('# Constants');
    add('# ==============================================================================');
    add(`SCRIPT_NAME="\$(basename "\${BASH_SOURCE[0]}")"`);
    add(`SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"`);
    if (template === 'backup') {
      add('BACKUP_DIR="${BACKUP_DIR:-/var/backups}"');
      add('BACKUP_RETENTION=${BACKUP_RETENTION:-7}');
      add('TIMESTAMP=$(date +%Y%m%d_%H%M%S)');
    }
    if (template === 'deploy') {
      add('DEPLOY_DIR="${DEPLOY_DIR:-/opt/app}"');
      add('RELEASES_DIR="${DEPLOY_DIR}/releases"');
      add('CURRENT_LINK="${DEPLOY_DIR}/current"');
      add('KEEP_RELEASES=${KEEP_RELEASES:-5}');
      add('TIMESTAMP=$(date +%Y%m%d%H%M%S)');
    }
    if (template === 'docker') {
      add('COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"');
      add('PROJECT_NAME="${PROJECT_NAME:-myproject}"');
    }
    if (template === 'cron') {
      add(`LOCK_FILE="/tmp/\${SCRIPT_NAME}.lock"`);
      add(`LOG_FILE="/var/log/\${SCRIPT_NAME}.log"`);
    }
    if (lockFile && template !== 'cron') {
      add(`LOCK_FILE="/tmp/\${SCRIPT_NAME}.lock"`);
    }
    if (tempDir) {
      add('TEMP_DIR=""');
    }
    blank();

    if (colorOutput) {
      add('# ==============================================================================');
      add('# Colors');
      add('# ==============================================================================');
      add('if [[ -t 1 ]]; then');
      add('  RED="\\033[0;31m"');
      add('  GREEN="\\033[0;32m"');
      add('  YELLOW="\\033[0;33m"');
      add('  BLUE="\\033[0;34m"');
      add('  CYAN="\\033[0;36m"');
      add('  NC="\\033[0m" # No Color');
      add('else');
      add('  RED="" GREEN="" YELLOW="" BLUE="" CYAN="" NC=""');
      add('fi');
      blank();
    }

    if (loggingFuncs) {
      add('# ==============================================================================');
      add('# Logging Functions');
      add('# ==============================================================================');
      const logDest = template === 'cron' ? ' | tee -a "${LOG_FILE}"' : '';
      add(`log_info()  { echo -e "\${BLUE}[INFO]\${NC}  \$(date +\'%H:%M:%S\') \$*"${logDest}; }`);
      add(`log_warn()  { echo -e "\${YELLOW}[WARN]\${NC}  \$(date +\'%H:%M:%S\') \$*"${logDest} >&2; }`);
      add(`log_error() { echo -e "\${RED}[ERROR]\${NC} \$(date +\'%H:%M:%S\') \$*"${logDest} >&2; }`);
      add(`log_ok()    { echo -e "\${GREEN}[OK]\${NC}    \$(date +\'%H:%M:%S\') \$*"${logDest}; }`);
      add(`log_debug() { [[ "\${DEBUG:-0}" == "1" ]] && echo -e "\${CYAN}[DEBUG]\${NC} \$(date +\'%H:%M:%S\') \$*"${logDest}; }`);
      blank();
    }

    if (trapCleanup) {
      add('# ==============================================================================');
      add('# Cleanup');
      add('# ==============================================================================');
      add('cleanup() {');
      add('  local exit_code=$?');
      if (tempDir) {
        add('  if [[ -n "${TEMP_DIR}" && -d "${TEMP_DIR}" ]]; then');
        add('    rm -rf "${TEMP_DIR}"');
        add('    log_debug "Cleaned up temp directory: ${TEMP_DIR}"');
        add('  fi');
      }
      if (lockFile || template === 'cron') {
        add('  if [[ -f "${LOCK_FILE}" ]]; then');
        add('    rm -f "${LOCK_FILE}"');
        add('  fi');
      }
      add('  if [[ $exit_code -ne 0 ]]; then');
      add('    log_error "Script exited with code: ${exit_code}"');
      add('  fi');
      add('}');
      add('trap cleanup EXIT');
      blank();
    }

    if (helpFunction) {
      add('# ==============================================================================');
      add('# Usage');
      add('# ==============================================================================');
      add('usage() {');
      add(`  echo "Usage: \${SCRIPT_NAME} [OPTIONS]"`);
      add('  echo ""');
      add(`  echo "  ${description}"`);
      add('  echo ""');
      add('  echo "Options:"');
      if (template === 'cli' || argParsing) {
        add('  echo "  -c, --config FILE   Configuration file"');
        add('  echo "  -v, --verbose       Enable verbose output"');
        add('  echo "  -d, --dry-run       Dry run mode"');
      }
      if (template === 'backup') {
        add('  echo "  -s, --source DIR    Source directory to backup"');
        add('  echo "  -d, --dest DIR      Backup destination directory"');
        add('  echo "  -r, --retention N   Number of backups to retain (default: 7)"');
      }
      if (template === 'deploy') {
        add('  echo "  -b, --branch NAME   Branch to deploy (default: main)"');
        add('  echo "  -r, --rollback      Rollback to previous release"');
      }
      if (template === 'docker') {
        add('  echo "  up                  Start containers"');
        add('  echo "  down                Stop containers"');
        add('  echo "  logs                Show container logs"');
        add('  echo "  restart             Restart containers"');
        add('  echo "  status              Show container status"');
      }
      add('  echo "  -h, --help          Show this help message"');
      add('  echo ""');
      add('  exit 0');
      add('}');
      blank();
    }

    if (depCheck) {
      add('# ==============================================================================');
      add('# Dependency Check');
      add('# ==============================================================================');
      add('check_dependencies() {');
      const deps = template === 'docker' ? 'docker docker-compose' : template === 'backup' ? 'tar gzip find' : 'curl jq';
      add(`  local deps=(${deps})`);
      add('  local missing=()');
      add('  for dep in "${deps[@]}"; do');
      add('    if ! command -v "${dep}" &>/dev/null; then');
      add('      missing+=("${dep}")');
      add('    fi');
      add('  done');
      add('  if [[ ${#missing[@]} -gt 0 ]]; then');
      add('    log_error "Missing dependencies: ${missing[*]}"');
      add('    exit 1');
      add('  fi');
      add('}');
      blank();
    }

    if (rootCheck) {
      add('# ==============================================================================');
      add('# Root Check');
      add('# ==============================================================================');
      add('check_root() {');
      add('  if [[ $EUID -ne 0 ]]; then');
      add('    log_error "This script must be run as root"');
      add('    exit 1');
      add('  fi');
      add('}');
      blank();
    }

    if (lockFile || template === 'cron') {
      add('# ==============================================================================');
      add('# Lock File');
      add('# ==============================================================================');
      add('acquire_lock() {');
      add('  if [[ -f "${LOCK_FILE}" ]]; then');
      add('    local pid');
      add('    pid=$(cat "${LOCK_FILE}")');
      add('    if kill -0 "${pid}" 2>/dev/null; then');
      add('      log_error "Script is already running (PID: ${pid})"');
      add('      exit 1');
      add('    else');
      add('      log_warn "Removing stale lock file"');
      add('      rm -f "${LOCK_FILE}"');
      add('    fi');
      add('  fi');
      add('  echo $$ > "${LOCK_FILE}"');
      add('}');
      blank();
    }

    if (template === 'cli' || argParsing) {
      add('# ==============================================================================');
      add('# Argument Parsing');
      add('# ==============================================================================');
      add('CONFIG_FILE=""');
      add('VERBOSE=0');
      add('DRY_RUN=0');
      blank();
      add('parse_args() {');
      add('  while [[ $# -gt 0 ]]; do');
      add('    case "$1" in');
      add('      -c|--config)  CONFIG_FILE="$2"; shift 2 ;;');
      add('      -v|--verbose) VERBOSE=1; shift ;;');
      add('      -d|--dry-run) DRY_RUN=1; shift ;;');
      add('      -h|--help)    usage ;;');
      add('      --)           shift; break ;;');
      add('      -*)           log_error "Unknown option: $1"; usage ;;');
      add('      *)            break ;;');
      add('    esac');
      add('  done');
      add('}');
      blank();
    }

    if (template === 'backup') {
      add('# ==============================================================================');
      add('# Backup Functions');
      add('# ==============================================================================');
      add('SOURCE_DIR=""');
      blank();
      add('parse_args() {');
      add('  while [[ $# -gt 0 ]]; do');
      add('    case "$1" in');
      add('      -s|--source)    SOURCE_DIR="$2"; shift 2 ;;');
      add('      -d|--dest)      BACKUP_DIR="$2"; shift 2 ;;');
      add('      -r|--retention) BACKUP_RETENTION="$2"; shift 2 ;;');
      add('      -h|--help)      usage ;;');
      add('      *)              log_error "Unknown option: $1"; usage ;;');
      add('    esac');
      add('  done');
      add('}');
      blank();
      add('create_backup() {');
      add('  local backup_name="backup_${TIMESTAMP}.tar.gz"');
      add('  local backup_path="${BACKUP_DIR}/${backup_name}"');
      add('  log_info "Creating backup: ${backup_path}"');
      add('  mkdir -p "${BACKUP_DIR}"');
      add('  tar -czf "${backup_path}" -C "$(dirname "${SOURCE_DIR}")" "$(basename "${SOURCE_DIR}")"');
      add('  log_ok "Backup created successfully: $(du -h "${backup_path}" | cut -f1)"');
      add('}');
      blank();
      add('rotate_backups() {');
      add('  log_info "Rotating backups (keeping last ${BACKUP_RETENTION})"');
      add('  local count');
      add('  count=$(find "${BACKUP_DIR}" -name "backup_*.tar.gz" -type f | wc -l)');
      add('  if [[ $count -gt $BACKUP_RETENTION ]]; then');
      add('    find "${BACKUP_DIR}" -name "backup_*.tar.gz" -type f -printf \'%T@ %p\\n\' | \\');
      add('      sort -n | head -n $((count - BACKUP_RETENTION)) | awk \'{print $2}\' | \\');
      add('      xargs rm -f');
      add('    log_info "Removed $((count - BACKUP_RETENTION)) old backup(s)"');
      add('  fi');
      add('}');
      blank();
    }

    if (template === 'deploy') {
      add('# ==============================================================================');
      add('# Deploy Functions');
      add('# ==============================================================================');
      add('BRANCH="${BRANCH:-main}"');
      add('ROLLBACK=0');
      blank();
      add('parse_args() {');
      add('  while [[ $# -gt 0 ]]; do');
      add('    case "$1" in');
      add('      -b|--branch)   BRANCH="$2"; shift 2 ;;');
      add('      -r|--rollback) ROLLBACK=1; shift ;;');
      add('      -h|--help)     usage ;;');
      add('      *)             log_error "Unknown option: $1"; usage ;;');
      add('    esac');
      add('  done');
      add('}');
      blank();
      add('deploy() {');
      add('  local release_dir="${RELEASES_DIR}/${TIMESTAMP}"');
      add('  log_info "Deploying to ${release_dir}"');
      add('  mkdir -p "${release_dir}"');
      add('  # Clone or copy application');
      add('  log_info "Fetching application (branch: ${BRANCH})..."');
      add('  # git clone --branch "${BRANCH}" --depth 1 REPO_URL "${release_dir}"');
      add('  # Update symlink');
      add('  ln -sfn "${release_dir}" "${CURRENT_LINK}"');
      add('  log_ok "Deployed successfully"');
      add('}');
      blank();
      add('rollback() {');
      add('  local previous');
      add('  previous=$(ls -1t "${RELEASES_DIR}" | sed -n "2p")');
      add('  if [[ -z "${previous}" ]]; then');
      add('    log_error "No previous release to rollback to"');
      add('    exit 1');
      add('  fi');
      add('  log_info "Rolling back to ${previous}"');
      add('  ln -sfn "${RELEASES_DIR}/${previous}" "${CURRENT_LINK}"');
      add('  log_ok "Rollback complete"');
      add('}');
      blank();
      add('cleanup_releases() {');
      add('  local count');
      add('  count=$(ls -1 "${RELEASES_DIR}" | wc -l)');
      add('  if [[ $count -gt $KEEP_RELEASES ]]; then');
      add('    ls -1t "${RELEASES_DIR}" | tail -n +$((KEEP_RELEASES + 1)) | \\');
      add('      xargs -I{} rm -rf "${RELEASES_DIR}/{}"');
      add('    log_info "Cleaned up old releases"');
      add('  fi');
      add('}');
      blank();
    }

    if (template === 'docker') {
      add('# ==============================================================================');
      add('# Docker Functions');
      add('# ==============================================================================');
      add('docker_up() {');
      add('  log_info "Starting containers..."');
      add('  docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" up -d');
      add('  log_ok "Containers started"');
      add('}');
      blank();
      add('docker_down() {');
      add('  log_info "Stopping containers..."');
      add('  docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" down');
      add('  log_ok "Containers stopped"');
      add('}');
      blank();
      add('docker_logs() {');
      add('  docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" logs -f --tail=100');
      add('}');
      blank();
      add('docker_status() {');
      add('  docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" ps');
      add('}');
      blank();
      add('docker_restart() {');
      add('  log_info "Restarting containers..."');
      add('  docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" restart');
      add('  log_ok "Containers restarted"');
      add('}');
      blank();
    }

    // Main function
    add('# ==============================================================================');
    add('# Main');
    add('# ==============================================================================');
    add('main() {');
    if (rootCheck) add('  check_root');
    if (depCheck) add('  check_dependencies');
    if (lockFile || template === 'cron') add('  acquire_lock');
    if (tempDir) {
      add('  TEMP_DIR=$(mktemp -d)');
      add('  log_debug "Created temp directory: ${TEMP_DIR}"');
    }
    if (template === 'cli' || template === 'backup' || template === 'deploy' || argParsing) {
      add('  parse_args "$@"');
    }
    blank();

    if (template === 'basic' || template === 'logging' || template === 'systemd') {
      add('  log_info "Starting ${SCRIPT_NAME}..."');
      add('');
      add('  # TODO: Add your main logic here');
      add('');
      add('  log_ok "Completed successfully"');
    } else if (template === 'cli') {
      add('  log_info "Starting ${SCRIPT_NAME}..."');
      add('  [[ $VERBOSE -eq 1 ]] && log_debug "Verbose mode enabled"');
      add('  [[ $DRY_RUN -eq 1 ]] && log_warn "Dry run mode - no changes will be made"');
      add('');
      add('  # TODO: Add your main logic here');
      add('');
      add('  log_ok "Completed successfully"');
    } else if (template === 'backup') {
      add('  if [[ -z "${SOURCE_DIR}" ]]; then');
      add('    log_error "Source directory is required (-s)"');
      add('    usage');
      add('  fi');
      add('  create_backup');
      add('  rotate_backups');
    } else if (template === 'deploy') {
      add('  if [[ $ROLLBACK -eq 1 ]]; then');
      add('    rollback');
      add('  else');
      add('    deploy');
      add('    cleanup_releases');
      add('  fi');
    } else if (template === 'docker') {
      add('  local cmd="${1:-}"');
      add('  case "${cmd}" in');
      add('    up)      docker_up ;;');
      add('    down)    docker_down ;;');
      add('    logs)    docker_logs ;;');
      add('    restart) docker_restart ;;');
      add('    status)  docker_status ;;');
      add('    -h|--help|"") usage ;;');
      add('    *)       log_error "Unknown command: ${cmd}"; usage ;;');
      add('  esac');
    } else if (template === 'cron') {
      add('  log_info "Cron job started"');
      add('');
      add('  # TODO: Add your cron job logic here');
      add('');
      add('  log_ok "Cron job completed"');
    }

    add('}');
    blank();
    add('main "$@"');

    return lines.join('\n');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateScript());
    setSnackbar({ open: true, message: 'Script copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([generateScript()], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = scriptName; a.click();
    URL.revokeObjectURL(url);
  };

  const inputSx = {
    '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: '#d4d4d4', fontSize: 14 },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
    '& .MuiInputLabel-root': { color: 'grey.500' },
  };
  const selectSx = { color: '#d4d4d4', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Shell Script Generator</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, p: 3, minHeight: 'calc(100vh - 72px)' }}>
        {/* Left: Config */}
        <Box sx={{ width: 400, display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Script Info</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField label="Script Name" size="small" fullWidth value={scriptName} onChange={e => setScriptName(e.target.value)} sx={inputSx} />
              <TextField label="Description" size="small" fullWidth value={description} onChange={e => setDescription(e.target.value)} sx={inputSx} />
              <TextField label="Author" size="small" fullWidth value={author} onChange={e => setAuthor(e.target.value)} sx={inputSx} />
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Template</Typography>
            <FormControl size="small" fullWidth sx={inputSx}>
              <InputLabel sx={{ color: 'grey.500' }}>Template Type</InputLabel>
              <Select value={template} label="Template Type" onChange={e => {
                const t = e.target.value as TemplateType;
                setTemplate(t);
                if (t === 'cron') { setLockFile(true); setLoggingFuncs(true); }
                if (t === 'cli') { setArgParsing(true); }
                if (t === 'docker') { setDepCheck(true); }
                if (t === 'backup') { setTempDir(true); }
              }} sx={selectSx}>
                {(Object.keys(templateDescriptions) as TemplateType[]).map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" sx={{ color: 'grey.600', mt: 1, display: 'block' }}>
              {templateDescriptions[template]}
            </Typography>
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Options</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Strict mode (set -euo pipefail)', checked: strictMode, set: setStrictMode },
                { label: 'Logging functions', checked: loggingFuncs, set: setLoggingFuncs },
                { label: 'Color output', checked: colorOutput, set: setColorOutput },
                { label: 'Argument parsing (getopts)', checked: argParsing, set: setArgParsing },
                { label: 'Help / usage function', checked: helpFunction, set: setHelpFunction },
                { label: 'Trap cleanup handler', checked: trapCleanup, set: setTrapCleanup },
                { label: 'Temp directory handling', checked: tempDir, set: setTempDir },
                { label: 'Lock file (prevent concurrent runs)', checked: lockFile, set: setLockFile },
                { label: 'Root check', checked: rootCheck, set: setRootCheck },
                { label: 'Dependency checking', checked: depCheck, set: setDepCheck },
              ].map((opt, i) => (
                <FormControlLabel
                  key={i}
                  control={<Switch checked={opt.checked} onChange={e => opt.set(e.target.checked)} size="small" />}
                  label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>{opt.label}</Typography>}
                  sx={{ ml: 0 }}
                />
              ))}
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Quick Presets</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                { label: 'Minimal', fn: () => { setStrictMode(true); setLoggingFuncs(false); setColorOutput(false); setArgParsing(false); setHelpFunction(false); setTrapCleanup(false); setTempDir(false); setLockFile(false); setRootCheck(false); setDepCheck(false); setTemplate('basic'); } },
                { label: 'Full Featured', fn: () => { setStrictMode(true); setLoggingFuncs(true); setColorOutput(true); setArgParsing(true); setHelpFunction(true); setTrapCleanup(true); setTempDir(true); setLockFile(true); setRootCheck(false); setDepCheck(true); setTemplate('cli'); } },
                { label: 'System Admin', fn: () => { setStrictMode(true); setLoggingFuncs(true); setColorOutput(true); setArgParsing(false); setHelpFunction(true); setTrapCleanup(true); setTempDir(false); setLockFile(false); setRootCheck(true); setDepCheck(true); setTemplate('systemd'); } },
                { label: 'Cron Job', fn: () => { setStrictMode(true); setLoggingFuncs(true); setColorOutput(false); setArgParsing(false); setHelpFunction(false); setTrapCleanup(true); setTempDir(false); setLockFile(true); setRootCheck(false); setDepCheck(false); setTemplate('cron'); } },
              ].map((preset, i) => (
                <Button key={i} size="small" variant="outlined" onClick={preset.fn} sx={{ color: 'grey.400', borderColor: '#333', textTransform: 'none', fontSize: 12 }}>
                  {preset.label}
                </Button>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Right: Output */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>{scriptName}</Typography>
                <Chip label={`${generateScript().split('\n').length} lines`} size="small" sx={{ bgcolor: '#1a2a1a', color: '#a5d6a7', fontSize: 11 }} />
                <Chip label={template} size="small" sx={{ bgcolor: '#1a1a2a', color: '#90caf9', fontSize: 11 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Copy"><IconButton size="small" onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Download"><IconButton size="small" onClick={handleDownload} sx={{ color: 'grey.500' }}><Download fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Box>
            <Box sx={{ flex: 1, p: 0, overflow: 'auto', bgcolor: '#0a0a0a' }}>
              <Box sx={{ display: 'flex', minHeight: '100%' }}>
                {/* Line numbers */}
                <Box sx={{ p: 2, pr: 1, textAlign: 'right', userSelect: 'none', borderRight: '1px solid #1a1a1a', flexShrink: 0 }}>
                  {generateScript().split('\n').map((_, i) => (
                    <Typography key={i} sx={{ fontFamily: 'monospace', fontSize: 12, color: 'grey.700', lineHeight: '20px' }}>
                      {i + 1}
                    </Typography>
                  ))}
                </Box>
                {/* Code */}
                <Box sx={{ p: 2, pl: 2, flex: 1 }}>
                  {generateScript().split('\n').map((line, i) => {
                    let color = '#d4d4d4';
                    if (line.startsWith('#')) color = '#6a9955';
                    else if (line.startsWith('  #')) color = '#6a9955';
                    else if (/^[A-Z_]+=/.test(line)) color = '#9cdcfe';
                    else if (/^\s*(if|then|else|fi|for|do|done|while|case|esac|function)\b/.test(line)) color = '#c586c0';
                    else if (/^\s*(local|export|readonly)\b/.test(line)) color = '#569cd6';
                    else if (line.includes('log_info') || line.includes('log_ok')) color = '#4ec9b0';
                    else if (line.includes('log_error') || line.includes('log_warn')) color = '#ce9178';
                    else if (line.trim().startsWith('echo')) color = '#dcdcaa';
                    else if (line.trim() === '') color = 'transparent';
                    return (
                      <Typography key={i} sx={{ fontFamily: 'monospace', fontSize: 12, color, lineHeight: '20px', whiteSpace: 'pre' }}>
                        {line || ' '}
                      </Typography>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
