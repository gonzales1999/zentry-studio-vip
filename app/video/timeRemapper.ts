export type KeepSegment = {
  start: number;
  end: number;
  timelineStart: number;
  timelineEnd: number;
  src?: string;
};

/**
 * Remaps an original video time (in seconds) to the compressed output timeline (in seconds)
 * using the segments kept after silence removal and cuts.
 * Returns null if the timestamp falls inside a deleted/cut section.
 */
export function remapTimeToOutput(
  timeSec: number,
  keepSegments: KeepSegment[]
): number | null {
  if (!keepSegments || keepSegments.length === 0) return timeSec;

  let outputOffset = 0;
  for (const segment of keepSegments) {
    const segTStart = segment.timelineStart !== undefined ? segment.timelineStart : segment.start;
    const segTEnd = segment.timelineEnd !== undefined ? segment.timelineEnd : segment.end;
    const segDuration = segment.end - segment.start;

    if (timeSec >= segTStart && timeSec <= segTEnd) {
      const localOffset = timeSec - segTStart;
      return outputOffset + Math.min(segDuration, Math.max(0, localOffset));
    }
    outputOffset += segDuration;
  }

  return null;
}

/**
 * Remaps a start-duration interval [start, start + duration] to the output timeline.
 * If the interval is completely within a deleted silence/cut, returns null.
 * If it overlaps with kept segments, trims to the kept range.
 */
export function remapIntervalToOutput(
  startSec: number,
  durationSec: number,
  keepSegments: KeepSegment[]
): { start: number; duration: number } | null {
  if (!keepSegments || keepSegments.length === 0) {
    return { start: startSec, duration: durationSec };
  }

  const endSec = startSec + durationSec;
  let firstMappedStart: number | null = null;
  let lastMappedEnd: number | null = null;

  let outputOffset = 0;
  for (const segment of keepSegments) {
    const segTStart = segment.timelineStart !== undefined ? segment.timelineStart : segment.start;
    const segTEnd = segment.timelineEnd !== undefined ? segment.timelineEnd : segment.end;
    const segDuration = segment.end - segment.start;

    // Check intersection [startSec, endSec] with [segTStart, segTEnd]
    const overlapStart = Math.max(startSec, segTStart);
    const overlapEnd = Math.min(endSec, segTEnd);

    if (overlapStart < overlapEnd) {
      const mappedStart = outputOffset + (overlapStart - segTStart);
      const mappedEnd = outputOffset + (overlapEnd - segTStart);

      if (firstMappedStart === null || mappedStart < firstMappedStart) {
        firstMappedStart = mappedStart;
      }
      if (lastMappedEnd === null || mappedEnd > lastMappedEnd) {
        lastMappedEnd = mappedEnd;
      }
    }

    outputOffset += segDuration;
  }

  if (firstMappedStart === null || lastMappedEnd === null) {
    return null;
  }

  const newDuration = Math.max(0.1, lastMappedEnd - firstMappedStart);
  return { start: firstMappedStart, duration: newDuration };
}
