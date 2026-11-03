export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface DocumentPage {
  id: string;
  pageNumber: number;
  label: string;
  selected: boolean;
  ocrText: string;
  confidence: number;
  previewDataUrl?: string;
  sourceType: 'pdf' | 'image' | 'camera' | 'text';
}

export interface StudyDocument {
  id: string;
  title: string;
  fileType: 'pdf' | 'image' | 'camera';
  fileName: string;
  fileSizeKb: number;
  createdAt: string;
  updatedAt: string;
  ocrStatus: 'completed' | 'processing' | 'failed';
  pages: DocumentPage[];
  extractedQuestionsCount: number;
}

export interface IncorrectOptionExplanation {
  option: OptionKey;
  reason: string;
  hindiReason: string;
}

export interface AITeacherSolution {
  detailedSolution: string;
  hindiExplanation: string;
  keyPoints: string[];
  examRelevantInfo: string;
  incorrectOptions: IncorrectOptionExplanation[];
  sourceExcerpt: string;
  additionalInfo: string;
}

export interface MCQQuestion {
  id: string;
  questionText: string;
  questionHindi?: string;
  options: Record<OptionKey, string>;
  correctOption: OptionKey;
  topicTag: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  teacher: AITeacherSolution;
}

export interface TestAttempt {
  id: string;
  attemptNumber: number; // 1 to 5
  completedAt: string;
  durationSeconds: number;
  score: number;
  totalQuestions: number;
  accuracyPercent: number;
  answers: Record<string, OptionKey | null>; // questionId -> selected original OptionKey
  randomizedQuestionsUsed: boolean;
  randomizedOptionsUsed: boolean;
}

export interface TestItem {
  id: string;
  title: string;
  sourceDocumentId: string;
  sourceDocumentTitle: string;
  createdAt: string;
  isTimed: boolean;
  timeLimitMinutes: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  questions: MCQQuestion[];
  attempts: TestAttempt[]; // Max 5 attempts
}

export interface AttemptComparison {
  totalAttempts: number;
  remainingAttempts: number;
  canRetake: boolean;
  firstScore: number;
  latestScore: number;
  bestScore: number;
  firstAccuracy: number;
  latestAccuracy: number;
  bestAccuracy: number;
  accuracyImprovementDelta: number;
  scoreImprovementDelta: number;
  fastestDurationSeconds: number;
  questionProgress: {
    questionId: string;
    questionNumber: number;
    firstCorrect: boolean;
    latestCorrect: boolean;
    everCorrect: boolean;
    status: 'improved' | 'consistent_correct' | 'needs_work' | 'regressed';
  }[];
}

export interface StudyDiagnostic {
  completed: boolean;
  updatedAt: string;
  targetExamName: string;
  examDate: string;
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  dailyHoursTarget: number;
  dailyQuestionsTarget: number;
  weeklyTestsTarget: number;
  baselineAccuracyPercent: number;
  focusPriority: 'Accuracy & Concepts' | 'Speed & Time Management' | 'Practice Volume';
}

export interface DailyTask {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  targetMinutes: number;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export interface StudySessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  hours: number;
  note: string;
  createdAt: string;
}

export interface WeeklySlot {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  timeRange: string;
  activity: string;
  targetHours: number;
  active: boolean;
}

export interface StudyRecommendation {
  id: string;
  title: string;
  reason: string;
  actionLabel: string;
  targetTab: 'upload' | 'tests' | 'tracker' | 'home';
  severity: 'focus' | 'positive' | 'routine';
}

export type TrackerAutoMetric =
  | 'daily_study_hours'
  | 'weekly_study_hours'
  | 'tests_completed'
  | 'total_attempts'
  | 'average_accuracy'
  | 'best_accuracy'
  | 'custom_manual';

export interface TrackerCategory {
  id: string;
  name: string;
  unit: string;
  targetValue: number;
  autoMetric: TrackerAutoMetric;
  manualAdjustment: number;
  currentValue: number;
  hidden: boolean;
  order: number;
  period: 'Daily' | 'Weekly' | 'Monthly' | 'Overall';
}

export interface MilestoneItem {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
}

export type SyncStatus = 'Synced' | 'Syncing' | 'Offline' | 'Failed';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  authMethod: 'google' | 'mobile_otp' | 'local';
  lastSyncedAt?: string;
  driveBackupFileId?: string;
  driveLastBackupAt?: string;
}

export interface AppState {
  version: number;
  theme: ThemeMode;
  profile: UserProfile;
  diagnostic: StudyDiagnostic;
  documents: StudyDocument[];
  tests: TestItem[];
  dailyTasks: DailyTask[];
  studyLogs: StudySessionLog[];
  weeklySchedule: WeeklySlot[];
  trackerCategories: TrackerCategory[];
  milestones: MilestoneItem[];
  customStrongAreas: string[];
  customWeakAreas: string[];
}
