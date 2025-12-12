// SuperMemo 2 (SM-2) Algorithm Implementation

interface ReviewResult {
  interval: number; // in days
  easeFactor: number;
}

/**
 * Calculates the next review interval and ease factor based on performance.
 * 
 * @param quality 0-5 rating of the user's answer quality
 *  5 - perfect response
 *  4 - correct response after a hesitation
 *  3 - correct response recalled with serious difficulty
 *  2 - incorrect response; where the correct one seemed easy to recall
 *  1 - incorrect response; the correct one remembered
 *  0 - complete blackout
 * @param previousInterval The previous interval in days
 * @param previousEaseFactor The previous ease factor
 */
export function calculateNextReview(
  quality: number,
  previousInterval: number,
  previousEaseFactor: number
): ReviewResult {
  let newEaseFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Ease factor cannot drop below 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  let newInterval: number;

  if (quality < 3) {
    // If answer was incorrect or very hard, start over
    newInterval = 1;
  } else {
    if (previousInterval === 0) {
      newInterval = 1;
    } else if (previousInterval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(previousInterval * newEaseFactor);
    }
  }

  return {
    interval: newInterval,
    easeFactor: newEaseFactor
  };
}