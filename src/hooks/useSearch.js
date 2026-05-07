import { useCallback } from 'react';
import api from '../api/client.js';
import useStore from '../store/useStore.js';

/**
 * Hook that orchestrates the full search pipeline:
 * 1. Analyze CV
 * 2. Search jobs
 * 3. Grade results
 * 4. Generate market insights
 * 5. Run gap analysis
 */
export function useSearch() {
  const {
    cv, settings, cvAnalysis,
    setCVAnalysis, setJobs, appendJobs,
    setIsSearching, addProgress, clearProgress,
    setMarketInsights, setGapAnalysis,
    setSearchHistory,
  } = useStore();

  const runSearch = useCallback(async () => {
    if (!cv.trim()) throw new Error('Please enter your CV first');
    if (!settings.country.trim()) throw new Error('Please set your country in settings');

    setIsSearching(true);
    clearProgress();

    try {
      // Step 1: Analyze CV (or use cached)
      let analysis = cvAnalysis;
      if (!analysis || !analysis.skills?.length) {
        addProgress('🧠 Analyzing your CV...');
        analysis = await api.analyzeCV(cv);
        setCVAnalysis(analysis);
        addProgress(`✅ Found ${analysis.skills?.length || 0} skills, ${analysis.jobTitles?.length || 0} target roles`);
      } else {
        addProgress('📋 Using cached CV analysis');
      }

      // Step 2: Search jobs
      addProgress('🔍 Searching job platforms...');
      const { jobs: newJobs, searchId } = await api.searchJobs(settings, analysis, cv);
      addProgress(`📋 Found ${newJobs.length} new job postings`);

      if (newJobs.length === 0) {
        addProgress('ℹ️ No new jobs found. Try broader filters.');
        return;
      }

      // Jobs are already graded from the server
      appendJobs(newJobs);
      addProgress(`🏆 ${newJobs.length} jobs graded and saved`);

      // Step 3: Market insights
      addProgress('📊 Generating market insights...');
      try {
        const insights = await api.marketInsights(newJobs, searchId);
        setMarketInsights(insights);
        addProgress('✅ Market insights ready');
      } catch (e) {
        addProgress(`⚠️ Market insights skipped: ${e.message}`);
      }

      // Step 4: Gap analysis
      addProgress('🧩 Running skill gap analysis...');
      try {
        const gap = await api.gapAnalysis(analysis.skills, newJobs, searchId);
        setGapAnalysis(gap);
        addProgress('✅ Gap analysis complete');
      } catch (e) {
        addProgress(`⚠️ Gap analysis skipped: ${e.message}`);
      }

      // Step 5: Update history
      const history = await api.getHistory();
      setSearchHistory(history);

      addProgress(`✨ Done! ${newJobs.length} new jobs found and graded.`);
    } finally {
      setIsSearching(false);
    }
  }, [cv, settings, cvAnalysis]);

  return { runSearch };
}

export default useSearch;
