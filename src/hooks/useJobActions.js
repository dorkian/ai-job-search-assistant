import { useCallback } from 'react';
import api from '../api/client.js';
import useStore from '../store/useStore.js';

/**
 * Hook for per-job actions: cover letter, interview prep, job spec, CV optimize
 */
export function useJobActions() {
  const { setActiveAction } = useStore();

  const runAction = useCallback(async (jobId, action, language) => {
    setActiveAction({ jobId, action, content: '', loading: true });

    try {
      let result;
      switch (action) {
        case 'cover-letter':
          result = await api.coverLetter(jobId, language);
          break;
        case 'interview-prep':
          result = await api.interviewPrep(jobId);
          break;
        case 'job-spec':
          result = await api.jobSpec(jobId);
          break;
        case 'cv-optimize':
          result = await api.cvOptimize(jobId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      setActiveAction({ jobId, action, content: result.content, loading: false });
    } catch (err) {
      setActiveAction({ jobId, action, content: `Error: ${err.message}`, loading: false });
    }
  }, []);

  const clearAction = useCallback(() => {
    setActiveAction(null);
  }, []);

  return { runAction, clearAction };
}

export default useJobActions;
