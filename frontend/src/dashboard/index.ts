/**
 * Dashboard Module Exports
 */

// Components
export { default as DashboardPage } from './components/DashboardPage';
export { default as GitHubStatsCard } from './components/GitHubStatsCard';
export { default as RepoList } from './components/RepoList';
export { default as CommitTimeline } from './components/CommitTimeline';
export { default as CommitHeatmap } from './components/CommitHeatmap';
export { default as ActivityFeed } from './components/ActivityFeed';

// Contexts
export { GitHubProvider, useGitHub } from './contexts/GitHubContext';

// Services
export { 
  GitHubService, 
  MockGitHubService,
  createGitHubService, 
  createGitHubServiceAuto 
} from './services/githubService';

// Types
export * from './types/github.types';

// Utils
export * from './utils/github.utils';