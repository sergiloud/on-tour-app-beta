// Shows Feature Barrel Export
// Main exports for shows management functionality

// Core functionality
export { loadShows, getNextShow, getMonthShows, addLocalShow, createNewShowDefaults } from './core/shows';
export { computeShowFinance, getCosts, addCost, deleteCost, getCostById, restoreCost, renderFinanceModal, type ShowFinanceSummary, type ShowCost } from './core/show-finance';

// Components
export { openShowEditor, bindShowEditor } from './components/show-editor';

export {}; // Empty for now
