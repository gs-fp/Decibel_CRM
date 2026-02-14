/**
 * Decibel Bridge – single point of contact between Twenty and Decibel AI.
 * Import AI components from 'decibel-ai' and re-export here.
 * In core Twenty files (e.g. RecordDetails), only add one line to import
 * and render from this bridge; upstream sync conflicts are limited to that line.
 */

export { DecibelRecordPanel } from 'decibel-ai';
export type { DecibelRecordPanelProps } from 'decibel-ai';
