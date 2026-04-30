/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Excel export utility for Smart CAF applications.
 * Groups applications by creation date into separate worksheets (one sheet per day).
 * Day sheets come first, Summary sheet last.
 */

import * as XLSX from 'xlsx';
import { Application } from '../data/applications';

export type ExportPeriod = 'today' | 'week' | 'month';

interface ExportOptions {
  applications: Application[];
  period: ExportPeriod;
}

/** Returns the start of a given day (midnight) in local time as a Date. */
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns a "YYYY-MM-DD" string for a given Date. */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns a friendly label like "01 May 2026". */
function toSheetLabel(dateKey: string): string {
  // Parse as local midnight to avoid timezone drift
  const [year, month, day] = dateKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Returns the cutoff date based on selected period. */
function getCutoff(period: ExportPeriod): Date {
  const now = new Date();
  if (period === 'today') return startOfDay(now);
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    return startOfDay(d);
  }
  // month (30 days)
  const d = new Date(now);
  d.setDate(d.getDate() - 29);
  return startOfDay(d);
}

/** Calculates total service price for an application. */
function calcTotal(app: Application): number {
  return (app.selectedServices || []).reduce((sum, s) => sum + (Number(s.price) || 0), 0);
}

/** Builds the flat row object for a single application. */
function buildRow(app: Application): Record<string, string | number> {
  const date = new Date(app.createdAt || app.submittedAt);
  const services = (app.selectedServices || []).map(s => `${s.name} (€${s.price})`).join(' | ');

  return {
    'App ID':           app.applicationId || app._id || '',
    'Full Name':        app.name || '',
    'Email':            app.email || '',
    'Phone':            app.phone || '',
    'Nationality':      app.nationality || '',
    'Codice Fiscale':   app.codiceFiscale || '',
    'Address':          app.address || '',
    'Status':           app.status || '',
    'Payment Method':   app.paymentMethod || 'N/A',
    'TXID':             app.transactionId || 'N/A',
    'Payment Status':   app.paymentStatus || 'Pending',
    'Services':         services,
    'Total (€)':        calcTotal(app),
    'Assigned Agent':   app.reviewerName || 'Unassigned',
    'Submitted At':     isNaN(date.getTime()) ? 'N/A' : date.toLocaleString('en-GB'),
  };
}

/** Column character widths matching the header order above. */
const APP_COL_WIDTHS = [16, 24, 32, 18, 16, 22, 36, 12, 16, 24, 14, 50, 12, 22, 22];

/** Apply column widths to a worksheet. */
function applyColWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map(w => ({ wch: w }));
}

/**
 * Main export function.
 * Each day gets its own sheet (chronological order, newest first).
 * A Summary sheet is appended at the end.
 */
export function exportApplicationsToExcel({ applications, period }: ExportOptions): void {
  const cutoff = getCutoff(period);

  // Filter to only apps within the selected period
  const filtered = applications.filter(app => {
    const raw = app.createdAt || app.submittedAt;
    if (!raw) return false;
    const d = new Date(raw);
    return !isNaN(d.getTime()) && d >= cutoff;
  });

  if (filtered.length === 0) {
    alert('No applications found in the selected period.');
    return;
  }

  // Group by date key
  const byDay = new Map<string, Application[]>();
  filtered.forEach(app => {
    const key = toDateKey(new Date(app.createdAt || app.submittedAt));
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(app);
  });

  // Sort days: newest first so the most recent data is the first sheet Excel opens
  const sortedDays = Array.from(byDay.keys()).sort((a, b) => b.localeCompare(a));

  const workbook = XLSX.utils.book_new();

  // --- Day sheets (newest first) ---
  sortedDays.forEach(dayKey => {
    const dayApps = byDay.get(dayKey)!;
    const rows = dayApps.map(buildRow);

    const ws = XLSX.utils.json_to_sheet(rows);
    applyColWidths(ws, APP_COL_WIDTHS);

    // Tab name: "01 May 2026 (3)" — max 31 chars for Excel
    const label = toSheetLabel(dayKey);
    const tabName = `${label} (${dayApps.length})`.slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, ws, tabName);
  });

  // --- Summary sheet (last) ---
  // Reverse for the summary so it reads oldest → newest
  const summaryRows = [...sortedDays].reverse().map(dayKey => {
    const dayApps = byDay.get(dayKey)!;
    const revenue = dayApps.reduce((sum, a) => sum + calcTotal(a), 0);
    return {
      'Date':                 toSheetLabel(dayKey),
      'Total Applications':   dayApps.length,
      'Approved':             dayApps.filter(a => a.status === 'Approved').length,
      'Reviewing':            dayApps.filter(a => a.status === 'Reviewing').length,
      'Pending':              dayApps.filter(a => a.status === 'Pending').length,
      'Rejected':             dayApps.filter(a => a.status === 'Rejected').length,
      'Revenue (€)':          revenue,
    };
  });

  const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
  applyColWidths(summaryWs, [20, 20, 12, 12, 12, 12, 14]);
  XLSX.utils.book_append_sheet(workbook, summaryWs, 'Summary');

  // Generate filename
  const periodLabel = period === 'today' ? 'Today' : period === 'week' ? 'Last7Days' : 'Last30Days';
  const dateStr = toDateKey(new Date());
  const filename = `SmartCAF_Applications_${periodLabel}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
