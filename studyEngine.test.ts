import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canRetakeTest,
  compareTestAttempts,
  evaluateTestAttempt,
  MAX_TEST_ATTEMPTS,
  prepareRandomizedTestRun,
  syncTrackerCategoriesWithActivity,
} from './studyEngine';
import { createInitialAppState } from '../data/initialState';
import { TestItem } from '../types/study';

function makeSampleTest(): TestItem {
  const state = createInitialAppState();
  return {
    ...state.tests[0],
    attempts: [],
  };
}

test('evaluateTestAttempt scores MCQ answers accurately and increments attemptNumber', () => {
  const sampleTest = makeSampleTest();
  const q1 = sampleTest.questions[0];
  const q2 = sampleTest.questions[1];

  const attempt1 = evaluateTestAttempt(
    sampleTest,
    {
      [q1.id]: q1.correctOption,
      [q2.id]: 'D', // wrong if correct is not D
    },
    145
  );

  assert.equal(attempt1.attemptNumber, 1);
  assert.equal(attempt1.totalQuestions, sampleTest.questions.length);
  assert.ok(attempt1.score >= 1);
  assert.equal(
    attempt1.accuracyPercent,
    Math.round((attempt1.score / sampleTest.questions.length) * 100)
  );
});

test('5-attempt retake limit is strictly enforced', () => {
  const sampleTest = makeSampleTest();
  const q1 = sampleTest.questions[0];

  for (let i = 1; i <= MAX_TEST_ATTEMPTS; i++) {
    assert.equal(canRetakeTest(sampleTest), true);
    const attempt = evaluateTestAttempt(sampleTest, { [q1.id]: q1.correctOption }, 60 * i);
    sampleTest.attempts.push(attempt);
  }

  assert.equal(sampleTest.attempts.length, 5);
  assert.equal(canRetakeTest(sampleTest), false);

  assert.throws(() => {
    evaluateTestAttempt(sampleTest, { [q1.id]: q1.correctOption }, 120);
  }, /Maximum retake limit/);
});

test('compareTestAttempts calculates improvement delta between first and latest attempts', () => {
  const sampleTest = makeSampleTest();
  const [q1, q2, q3] = sampleTest.questions;

  const attempt1 = evaluateTestAttempt(
    sampleTest,
    { [q1.id]: q1.correctOption },
    180
  );
  sampleTest.attempts.push(attempt1);

  const attempt2 = evaluateTestAttempt(
    sampleTest,
    {
      [q1.id]: q1.correctOption,
      [q2.id]: q2.correctOption,
      [q3.id]: q3.correctOption,
    },
    120
  );
  sampleTest.attempts.push(attempt2);

  const comparison = compareTestAttempts(sampleTest);
  assert.equal(comparison.totalAttempts, 2);
  assert.equal(comparison.remainingAttempts, 3);
  assert.equal(comparison.firstScore, 1);
  assert.equal(comparison.latestScore, 3);
  assert.equal(comparison.bestScore, 3);
  assert.ok(comparison.accuracyImprovementDelta > 0);
  assert.equal(comparison.fastestDurationSeconds, 120);
});

test('prepareRandomizedTestRun preserves all questions and option mappings', () => {
  const sampleTest = makeSampleTest();
  const randomized = prepareRandomizedTestRun(sampleTest.questions, true, true, 12345);
  assert.equal(randomized.length, sampleTest.questions.length);

  for (const item of randomized) {
    assert.equal(item.displayOptions.length, 4);
    const originalKeys = item.displayOptions.map((o) => o.originalKey).sort();
    assert.deepEqual(originalKeys, ['A', 'B', 'C', 'D']);
  }
});

test('syncTrackerCategoriesWithActivity updates auto metrics and respects manual adjustments', () => {
  const state = createInitialAppState();
  const updated = syncTrackerCategoriesWithActivity(state.trackerCategories, state);
  const hoursTracker = updated.find((c) => c.autoMetric === 'daily_study_hours');
  assert.ok(hoursTracker);
  assert.ok(hoursTracker.currentValue >= 0);

  // Add manual adjustment of +1.5
  hoursTracker.manualAdjustment = 1.5;
  const reSynced = syncTrackerCategoriesWithActivity(updated, state);
  const hoursTrackerAfter = reSynced.find((c) => c.autoMetric === 'daily_study_hours')!;
  assert.equal(
    hoursTrackerAfter.currentValue,
    Number((hoursTracker.currentValue + 1.5).toFixed(1))
  );
});
