import * as XLSX from 'xlsx';
import { Team, Player, Match, StandingsRow, TopScorer, League, Season, Announcement, RuleChapter } from '../types';

export interface FullBackupData {
  version: string;
  timestamp: string;
  season: Season;
  leagues: League[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  announcements: Announcement[];
  rules: RuleChapter[];
}

/**
 * Downloads a binary/text file in the browser
 */
function downloadFile(content: BlobPart, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports data to Excel (.xlsx) file
 */
export function exportToExcel(sheets: { name: string; data: any[] }[], fileName: string) {
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31));
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadFile(
    wbout,
    `${fileName}.xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

/**
 * Export Standings to Excel
 */
export function exportStandingsToExcel(standings: StandingsRow[], leagueName: string) {
  const formatted = standings.map(s => ({
    'Mesto': s.rank,
    'Ekipa': s.team.name,
    'Kratica': s.team.shortName,
    'Odigrane tekme (OT)': s.played,
    'Zmage (Z)': s.won,
    'Neodločeno (N)': s.drawn,
    'Porazi (P)': s.lost,
    'Dani goli (DG)': s.goalsFor,
    'Prejeti goli (PG)': s.goalsAgainst,
    'Gol razlika (GR)': s.goalDifference,
    'Točke (TOČ)': s.points,
    'Forma (zadnjih 5)': s.form.join('-') || '/'
  }));

  exportToExcel(
    [{ name: `Lestvica ${leagueName}`, data: formatted }],
    `lestvica_${leagueName.toLowerCase().replace(/\s+/g, '_')}`
  );
}

/**
 * Export Top Scorers to Excel
 */
export function exportTopScorersToExcel(scorers: TopScorer[], leagueName: string) {
  const formatted = scorers.map(s => ({
    'Mesto': s.rank,
    'Igralec': s.playerName,
    'Ekipa': s.teamName,
    'Goli': s.goals,
    'Z 11m': s.penaltyGoals,
    'Odigrane tekme': s.matchesPlayed,
    'Povprečje na tekmo': s.averagePerMatch
  }));

  exportToExcel(
    [{ name: `Strelci ${leagueName}`, data: formatted }],
    `strelci_${leagueName.toLowerCase().replace(/\s+/g, '_')}`
  );
}

/**
 * Export Schedule to Excel
 */
export function exportScheduleToExcel(matches: Match[], teams: Team[], leagueName: string) {
  const teamMap = new Map(teams.map(t => [t.id, t.name]));

  const formatted = matches.map(m => ({
    'Krog': m.round,
    'Datum': m.date,
    'Ura': m.time,
    'Domači': teamMap.get(m.homeTeamId) || m.homeTeamId,
    'Gostje': teamMap.get(m.awayTeamId) || m.awayTeamId,
    'Prizorišče': m.venue,
    'Status': m.status,
    'Rezultat': m.status === 'finished' ? `${m.homeScore} : ${m.awayScore}` : ''
  }));

  exportToExcel(
    [{ name: `Razpored ${leagueName}`, data: formatted }],
    `razpored_${leagueName.toLowerCase().replace(/\s+/g, '_')}`
  );
}

/**
 * Export Results to Excel
 */
export function exportResultsToExcel(matches: Match[], teams: Team[], leagueName: string) {
  const teamMap = new Map(teams.map(t => [t.id, t.name]));

  const formatted = matches.map(m => ({
    'Krog': m.round,
    'Datum': m.date,
    'Domača ekipa': teamMap.get(m.homeTeamId) || m.homeTeamId,
    'Gostujoča ekipa': teamMap.get(m.awayTeamId) || m.awayTeamId,
    'Končni rezultat': `${m.homeScore} : ${m.awayScore}`,
    'Polčas': m.homeHalftimeScore !== null && m.homeHalftimeScore !== undefined ? `${m.homeHalftimeScore} : ${m.awayHalftimeScore}` : '',
    'Prizorišče': m.venue
  }));

  exportToExcel(
    [{ name: `Rezultati ${leagueName}`, data: formatted }],
    `rezultati_${leagueName.toLowerCase().replace(/\s+/g, '_')}`
  );
}

/**
 * Export entire database as JSON backup
 */
export function exportBackupToJson(data: FullBackupData) {
  const jsonStr = JSON.stringify(data, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(
    jsonStr,
    `nogometna_liga_backup_${dateStr}.json`,
    'application/json'
  );
}

/**
 * Reads Excel or CSV file and returns array of JSON objects
 */
export async function readExcelOrCsvFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
