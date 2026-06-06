/**
 * Scoring Model for GitHub + Copilot Performance Scorecard
 */

// Baselines to calculate scores out of 100 for raw metrics
const BASELINES = {
  commits: 150,
  prsRaised: 30,
  prsMerged: 25,
  repositoriesContributed: 5,
  suggestionsAccepted: 3000,
  acceptanceRate: 50, // 50%
  activeCopilotDays: 20,
  prReviewsDone: 50,
  commentsOnPRs: 100,
};

function calculateMetricScore(value, baseline) {
  const score = (value / baseline) * 100;
  return Math.min(Math.round(score), 100); // Cap at 100
}

export function calculateScores(metrics) {
  // 1. Calculate individual metric scores
  const commitScore = calculateMetricScore(metrics.commits || 0, BASELINES.commits);
  const prRaisedScore = calculateMetricScore(metrics.prsRaised || 0, BASELINES.prsRaised);
  const prMergedScore = calculateMetricScore(metrics.prsMerged || 0, BASELINES.prsMerged);
  const repoContributionScore = calculateMetricScore(metrics.repositoriesContributed || 0, BASELINES.repositoriesContributed);

  const suggestionsAcceptedScore = calculateMetricScore(metrics.suggestionsAccepted || 0, BASELINES.suggestionsAccepted);
  const acceptanceRateScore = calculateMetricScore(metrics.acceptanceRate || 0, BASELINES.acceptanceRate);
  const activeCopilotDaysScore = calculateMetricScore(metrics.activeCopilotDays || 0, BASELINES.activeCopilotDays);

  const prReviewsScore = calculateMetricScore(metrics.prReviewsDone || 0, BASELINES.prReviewsDone);
  const prCommentsScore = calculateMetricScore(metrics.commentsOnPRs || 0, BASELINES.commentsOnPRs);

  // 2. Calculate category scores
  const githubActivityScore = Math.round(
    (commitScore * 0.35) + 
    (prRaisedScore * 0.25) + 
    (prMergedScore * 0.30) + 
    (repoContributionScore * 0.10)
  );

  const copilotAdoptionScore = Math.round(
    (suggestionsAcceptedScore * 0.50) + 
    (acceptanceRateScore * 0.35) + 
    (activeCopilotDaysScore * 0.15)
  );

  const collaborationScore = Math.round(
    (prReviewsScore * 0.60) + 
    (prCommentsScore * 0.40)
  );

  // 3. Calculate overall score
  const overallScore = Math.round(
    (githubActivityScore * 0.40) + 
    (copilotAdoptionScore * 0.40) + 
    (collaborationScore * 0.20)
  );

  return {
    overallScore,
    githubActivityScore,
    copilotAdoptionScore,
    collaborationScore,
    details: {
      commitScore,
      prRaisedScore,
      prMergedScore,
      repoContributionScore,
      suggestionsAcceptedScore,
      acceptanceRateScore,
      activeCopilotDaysScore,
      prReviewsScore,
      prCommentsScore
    }
  };
}
