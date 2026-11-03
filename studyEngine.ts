import {
  AppState,
  AttemptComparison,
  MCQQuestion,
  OptionKey,
  StudyDocument,
  StudyRecommendation,
  TestAttempt,
  TestItem,
  TrackerCategory,
} from '../types/study';

export const MAX_TEST_ATTEMPTS = 5;

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function canRetakeTest(test: TestItem): boolean {
  return test.attempts.length < MAX_TEST_ATTEMPTS;
}

export function getRemainingAttempts(test: TestItem): number {
  return Math.max(0, MAX_TEST_ATTEMPTS - test.attempts.length);
}

export function evaluateTestAttempt(
  test: TestItem,
  selectedAnswers: Record<string, OptionKey | null>,
  durationSeconds: number,
  randomizedQuestionsUsed = false,
  randomizedOptionsUsed = false
): TestAttempt {
  if (!canRetakeTest(test)) {
    throw new Error(`Maximum retake limit (${MAX_TEST_ATTEMPTS} attempts) reached for this test.`);
  }

  const totalQuestions = test.questions.length;
  let score = 0;
  const normalizedAnswers: Record<string, OptionKey | null> = {};

  for (const q of test.questions) {
    const chosen = selectedAnswers[q.id] ?? null;
    normalizedAnswers[q.id] = chosen;
    if (chosen && chosen === q.correctOption) {
      score += 1;
    }
  }

  const accuracyPercent =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return {
    id: `attempt_${Date.now()}_${test.attempts.length + 1}`,
    attemptNumber: test.attempts.length + 1,
    completedAt: new Date().toISOString(),
    durationSeconds: Math.max(1, Math.round(durationSeconds)),
    score,
    totalQuestions,
    accuracyPercent,
    answers: normalizedAnswers,
    randomizedQuestionsUsed,
    randomizedOptionsUsed,
  };
}

export function compareTestAttempts(test: TestItem): AttemptComparison {
  const attempts = test.attempts;
  const totalAttempts = attempts.length;
  const remainingAttempts = getRemainingAttempts(test);
  const canRetake = canRetakeTest(test);

  if (totalAttempts === 0) {
    return {
      totalAttempts: 0,
      remainingAttempts,
      canRetake,
      firstScore: 0,
      latestScore: 0,
      bestScore: 0,
      firstAccuracy: 0,
      latestAccuracy: 0,
      bestAccuracy: 0,
      accuracyImprovementDelta: 0,
      scoreImprovementDelta: 0,
      fastestDurationSeconds: 0,
      questionProgress: [],
    };
  }

  const first = attempts[0];
  const latest = attempts[attempts.length - 1];
  const bestScore = Math.max(...attempts.map((a) => a.score));
  const bestAccuracy = Math.max(...attempts.map((a) => a.accuracyPercent));
  const fastestDurationSeconds = Math.min(...attempts.map((a) => a.durationSeconds));

  const questionProgress = test.questions.map((q, idx) => {
    const firstCorrect = first.answers[q.id] === q.correctOption;
    const latestCorrect = latest.answers[q.id] === q.correctOption;
    const everCorrect = attempts.some((a) => a.answers[q.id] === q.correctOption);

    let status: 'improved' | 'consistent_correct' | 'needs_work' | 'regressed' = 'needs_work';
    if (!firstCorrect && latestCorrect) {
      status = 'improved';
    } else if (firstCorrect && latestCorrect) {
      status = 'consistent_correct';
    } else if (firstCorrect && !latestCorrect) {
      status = 'regressed';
    }

    return {
      questionId: q.id,
      questionNumber: idx + 1,
      firstCorrect,
      latestCorrect,
      everCorrect,
      status,
    };
  });

  return {
    totalAttempts,
    remainingAttempts,
    canRetake,
    firstScore: first.score,
    latestScore: latest.score,
    bestScore,
    firstAccuracy: first.accuracyPercent,
    latestAccuracy: latest.accuracyPercent,
    bestAccuracy,
    accuracyImprovementDelta: latest.accuracyPercent - first.accuracyPercent,
    scoreImprovementDelta: latest.score - first.score,
    fastestDurationSeconds,
    questionProgress,
  };
}

export interface RandomizedQuestionView {
  question: MCQQuestion;
  displayOptions: {
    displayKey: OptionKey;
    originalKey: OptionKey;
    text: string;
  }[];
}

export function prepareRandomizedTestRun(
  questions: MCQQuestion[],
  randomizeQuestions: boolean,
  randomizeOptions: boolean,
  seedInput = Date.now()
): RandomizedQuestionView[] {
  let seed = seedInput;
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const orderedQuestions = randomizeQuestions ? shuffle(questions) : [...questions];
  const optionKeys: OptionKey[] = ['A', 'B', 'C', 'D'];

  return orderedQuestions.map((q) => {
    const sourceKeys = randomizeOptions ? shuffle(optionKeys) : [...optionKeys];
    const displayOptions = optionKeys.map((displayKey, idx) => {
      const originalKey = sourceKeys[idx];
      return {
        displayKey,
        originalKey,
        text: q.options[originalKey],
      };
    });
    return {
      question: q,
      displayOptions,
    };
  });
}

export function computeAutoMetrics(state: AppState): Record<string, number> {
  const today = getTodayIsoDate();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const dailyStudyHours = state.studyLogs
    .filter((log) => log.date === today)
    .reduce((sum, log) => sum + log.hours, 0);

  const weeklyStudyHours = state.studyLogs
    .filter((log) => log.date >= sevenDaysAgo)
    .reduce((sum, log) => sum + log.hours, 0);

  const testsCompleted = state.tests.filter((t) => t.attempts.length > 0).length;
  const allAttempts = state.tests.flatMap((t) => t.attempts);
  const totalAttempts = allAttempts.length;

  const averageAccuracy =
    totalAttempts > 0
      ? Math.round(
          allAttempts.reduce((sum, a) => sum + a.accuracyPercent, 0) / totalAttempts
        )
      : 0;

  const bestAccuracy =
    totalAttempts > 0 ? Math.max(...allAttempts.map((a) => a.accuracyPercent)) : 0;

  return {
    daily_study_hours: Number(dailyStudyHours.toFixed(1)),
    weekly_study_hours: Number(weeklyStudyHours.toFixed(1)),
    tests_completed: testsCompleted,
    total_attempts: totalAttempts,
    average_accuracy: averageAccuracy,
    best_accuracy: bestAccuracy,
  };
}

export function syncTrackerCategoriesWithActivity(
  categories: TrackerCategory[],
  state: AppState
): TrackerCategory[] {
  const metrics = computeAutoMetrics(state);
  return categories
    .map((cat) => {
      if (cat.autoMetric === 'custom_manual') {
        return {
          ...cat,
          currentValue: Math.max(0, Number(cat.manualAdjustment.toFixed(1))),
        };
      }
      const baseAutoValue = metrics[cat.autoMetric] ?? 0;
      const combined = Math.max(0, Number((baseAutoValue + cat.manualAdjustment).toFixed(1)));
      return {
        ...cat,
        currentValue: combined,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function analyzeStrongAndWeakAreas(tests: TestItem[]): {
  strongAreas: { topic: string; accuracy: number; questionsCount: number }[];
  weakAreas: { topic: string; accuracy: number; questionsCount: number }[];
} {
  const topicStats: Record<string, { correct: number; total: number }> = {};

  for (const test of tests) {
    if (test.attempts.length === 0) continue;
    const latestAttempt = test.attempts[test.attempts.length - 1];
    for (const q of test.questions) {
      const topic = q.topicTag || test.sourceDocumentTitle || 'General Study';
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }
      topicStats[topic].total += 1;
      if (latestAttempt.answers[q.id] === q.correctOption) {
        topicStats[topic].correct += 1;
      }
    }
  }

  const strongAreas: { topic: string; accuracy: number; questionsCount: number }[] = [];
  const weakAreas: { topic: string; accuracy: number; questionsCount: number }[] = [];

  for (const [topic, stat] of Object.entries(topicStats)) {
    if (stat.total === 0) continue;
    const accuracy = Math.round((stat.correct / stat.total) * 100);
    if (accuracy >= 70) {
      strongAreas.push({ topic, accuracy, questionsCount: stat.total });
    } else {
      weakAreas.push({ topic, accuracy, questionsCount: stat.total });
    }
  }

  strongAreas.sort((a, b) => b.accuracy - a.accuracy);
  weakAreas.sort((a, b) => a.accuracy - b.accuracy);

  return { strongAreas, weakAreas };
}

export function generateStudyRecommendations(state: AppState): StudyRecommendation[] {
  const recs: StudyRecommendation[] = [];
  const metrics = computeAutoMetrics(state);
  const { weakAreas } = analyzeStrongAndWeakAreas(state.tests);

  if (weakAreas.length > 0) {
    const weakest = weakAreas[0];
    recs.push({
      id: 'rec_weak_area',
      title: `Strengthen ${weakest.topic} (${weakest.accuracy}% accuracy)`,
      reason: `Your latest test attempts show ${weakest.accuracy}% accuracy across ${weakest.questionsCount} questions in "${weakest.topic}". Review the AI Teacher Hindi & English explanations and retake the test.`,
      actionLabel: 'Retake & Review Explanations',
      targetTab: 'tests',
      severity: 'focus',
    });
  }

  const retakableTest = state.tests.find(
    (t) =>
      t.attempts.length > 0 &&
      t.attempts.length < MAX_TEST_ATTEMPTS &&
      t.attempts[t.attempts.length - 1].accuracyPercent < 85
  );
  if (retakableTest) {
    const latestAcc =
      retakableTest.attempts[retakableTest.attempts.length - 1].accuracyPercent;
    recs.push({
      id: 'rec_retake',
      title: `Improve "${retakableTest.title}" (Attempt ${retakableTest.attempts.length}/${MAX_TEST_ATTEMPTS})`,
      reason: `You scored ${latestAcc}% on your last attempt. You have ${MAX_TEST_ATTEMPTS - retakableTest.attempts.length} retake(s) remaining to reach 90%+ mastery.`,
      actionLabel: 'Practice Retake',
      targetTab: 'tests',
      severity: 'routine',
    });
  }

  if (metrics.daily_study_hours < state.diagnostic.dailyHoursTarget) {
    const remaining = Math.max(
      0.5,
      Number((state.diagnostic.dailyHoursTarget - metrics.daily_study_hours).toFixed(1))
    );
    recs.push({
      id: 'rec_daily_hours',
      title: `${remaining} hrs left to hit today's study target`,
      reason: `Your daily diagnostic target is ${state.diagnostic.dailyHoursTarget} hours (${state.diagnostic.focusPriority}). Log a focused session or complete today's planned tasks.`,
      actionLabel: 'Log Study Session',
      targetTab: 'home',
      severity: 'routine',
    });
  } else {
    recs.push({
      id: 'rec_daily_goal_met',
      title: `Daily study hour goal achieved (${metrics.daily_study_hours}h / ${state.diagnostic.dailyHoursTarget}h)`,
      reason: `Consistent daily execution builds exam confidence. Upload a new study PDF or scan a page to generate a fresh timed test.`,
      actionLabel: 'Upload New Study Material',
      targetTab: 'upload',
      severity: 'positive',
    });
  }

  return recs;
}

export function buildFallbackQuestionsFromText(
  docTitle: string,
  rawText: string,
  requestedCount = 5
): MCQQuestion[] {
  const sentences = rawText
    .split(/(?<=[.?!।])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 25);

  const count = Math.min(Math.max(1, requestedCount), 10);
  const questions: MCQQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const sourceLine =
      sentences[i % Math.max(1, sentences.length)] ||
      `Key exam concept from ${docTitle}: Constitutional governance, scientific method, and analytical reasoning principles.`;

    const cleanStatement = sourceLine.replace(/^[0-9]+[.)]\s*/, '').slice(0, 220);
    const topicTag = docTitle.split(/[-–—:]/)[0].trim().slice(0, 32) || 'Uploaded Material';

    questions.push({
      id: `q_gen_${Date.now()}_${i + 1}`,
      questionText: `Based on the study material "${docTitle}", which of the following statements is directly supported by the text?`,
      questionHindi: `अध्ययन सामग्री "${docTitle}" के आधार पर, निम्नलिखित में से कौन-सा कथन सीधे पाठ द्वारा समर्थित है?`,
      options: {
        A: cleanStatement,
        B: `The text states the exact opposite of: ${cleanStatement.slice(0, 90)}...`,
        C: `This mechanism is completely unrelated to ${topicTag} and applies only to marine navigation.`,
        D: `None of the principles mentioned in "${docTitle}" have empirical or statutory validity.`,
      },
      correctOption: 'A',
      topicTag,
      difficulty: i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Moderate' : 'Hard',
      teacher: {
        detailedSolution: `Option A is correct because it directly reflects the primary statement extracted from your uploaded document "${docTitle}": "${cleanStatement}".`,
        hindiExplanation: `विकल्प A सही है क्योंकि यह आपके द्वारा अपलोड किए गए दस्तावेज़ "${docTitle}" के मुख्य तथ्य से सीधे मेल खाता है: "${cleanStatement}"। परीक्षा में ऐसे प्रत्यक्ष तथ्य-आधारित प्रश्नों पर विशेष ध्यान दें।`,
        keyPoints: [
          `Core fact verified from "${docTitle}".`,
          `Eliminate extreme or contradictory distractors (Options B, C, and D).`,
          `Focus on primary definitions and cause-effect statements in the uploaded notes.`,
        ],
        examRelevantInfo: `In competitive exams, statement-verification questions frequently test whether candidates can distinguish source-supported facts from extreme reversals or out-of-scope distractors.`,
        incorrectOptions: [
          {
            option: 'B',
            reason: 'Directly contradicts the explicit statement in the uploaded source text.',
            hindiReason: 'यह अपलोड किए गए मूल पाठ में दिए गए कथन के बिल्कुल विपरीत है।',
          },
          {
            option: 'C',
            reason: 'Introduces an irrelevant domain not present in the uploaded study document.',
            hindiReason: 'यह एक असंबंधित विषय प्रस्तुत करता है जो अध्ययन सामग्री में मौजूद नहीं है।',
          },
          {
            option: 'D',
            reason: 'Uses an invalid absolute negation that dismisses documented principles.',
            hindiReason: 'यह पूर्ण निषेध का उपयोग करता है जो दस्तावेज़ के प्रमाणित सिद्धांतों को नकारता है।',
          },
        ],
        sourceExcerpt: cleanStatement,
        additionalInfo: `Always cross-verify dates, statutory articles, formulas, and key terminology from "${docTitle}" when attempting timed mock tests.`,
      },
    });
  }

  return questions;
}

export function getSelectedPagesText(doc: StudyDocument): string {
  const activePages = doc.pages.filter((p) => p.selected);
  const pagesToUse = activePages.length > 0 ? activePages : doc.pages;
  return pagesToUse.map((p) => `[Page ${p.pageNumber}]\n${p.ocrText}`).join('\n\n');
}
