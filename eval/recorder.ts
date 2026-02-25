import * as fs from "node:fs";
import * as path from "node:path";

import type { Recording } from "./types";

/**
 * Save a recording to disk.
 * Path: <baseDir>/<timestamp>/<provider>--<model>/<caseId>.json
 */
export function saveRecording(recording: Recording, baseDir: string): void {
  const timestampDir = recording.timestamp.replace(/:/g, "-");
  const providerModel = `${recording.provider}--${recording.model}`;
  const dir = path.join(baseDir, timestampDir, providerModel);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${recording.caseId}.json`),
    JSON.stringify(recording, null, 2),
  );
}

/**
 * Load a single recording from a JSON file.
 */
export function loadRecording(filePath: string): Recording {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as Recording;
}

/**
 * Recursively find all .json files in a directory and load them as Recordings.
 */
export function loadRecordingsFromDir(dir: string): Recording[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const recordings: Recording[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      recordings.push(...loadRecordingsFromDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      recordings.push(loadRecording(fullPath));
    }
  }

  return recordings;
}

/**
 * Get the most recent recording directory (by timestamp name) inside baseDir.
 * Returns null if baseDir doesn't exist or is empty.
 */
export function getLatestRecordingDir(baseDir: string): string | null {
  if (!fs.existsSync(baseDir)) {
    return null;
  }

  const entries = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  if (entries.length === 0) {
    return null;
  }

  return path.join(baseDir, entries[entries.length - 1]);
}
