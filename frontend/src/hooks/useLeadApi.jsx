// File: src/hooks/useLeadApi.js
import { useState, useCallback } from 'react';

export function useLeadApi() {
  const [dataCache, setDataCache] = useState({
    leads: {},
    engagements: {},
    draftEmails: {},
    draftSummaries: {},
    recentLeads: {},
    nextSteps: {}
  });
  const [loading, setLoading] = useState({
    lead: false,
    engagements: false,
    draftEmail: false,
    draftSummary: false,
    recentLeads: false,
    sendEmail: false,
    nextSteps: false,
    saveSummaryNote: false,
    saveNextStepsNote: false
  });
  const [error, setError] = useState(null);

  // States for fetched data
  const [leadData, setLeadData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [draftEmail, setDraftEmail] = useState(null);
  const [draftSummary, setDraftSummary] = useState(null);
  const [nextSteps, setNextSteps] = useState(null);

  // General-purpose fetch function with caching
  const fetchData = useCallback((url, cacheKey, cacheSection, setter = null, loadingKey = null, asText = false) => {
    // Return cached data if available
    if (dataCache[cacheSection] && dataCache[cacheSection][cacheKey]) {
      if (setter) {
        setter(dataCache[cacheSection][cacheKey]);
      }
      return Promise.resolve(dataCache[cacheSection][cacheKey]);
    }
    
    // Set loading state if needed
    if (loadingKey) {
      setLoading(prev => ({ ...prev, [loadingKey]: true }));
    }
    
    setError(null);
    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return asText ? res.text() : res.json();
      })
      .then((data) => {
        // Update cache
        setDataCache(prevCache => ({
          ...prevCache,
          [cacheSection]: { ...prevCache[cacheSection], [cacheKey]: data }
        }));
        if (setter) {
          setter(data);
        }
        if (loadingKey) {
          setLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
        return data;
      })
      .catch((err) => {
        setError(err.message);
        if (loadingKey) {
          setLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
        throw err;
      });
  }, [dataCache]);

  // API functions
  const getRecentLeads = useCallback((limit = 20, days = 7) => {
    return fetchData(
      `/api/leads/recent?limit=${limit}&days=${days}`,
      `${limit}_${days}`,
      'recentLeads',
      null,
      'recentLeads'
    );
  }, [fetchData]);

  const getLeadData = useCallback((id) => {
    return fetchData(`/api/leads/${id}`, id, 'leads', setLeadData, 'lead');
  }, [fetchData]);

  const getEngagements = useCallback((id) => {
    return fetchData(`/api/leads/engagement/${id}`, id, 'engagements', setEngagementData, 'engagements');
  }, [fetchData]);

  const generateDraftEmail = useCallback((id) => {
    // Ensure lead data exists before fetching the email
    const ensureLeadData = dataCache.leads[id]
      ? Promise.resolve(dataCache.leads[id])
      : getLeadData(id);
      
    return ensureLeadData.then(() => {
      return fetchData(`/api/leads/draft_email/${id}`, id, 'draftEmails', setDraftEmail, 'draftEmail');
    });
  }, [fetchData, getLeadData, dataCache.leads]);

  const generateSummary = useCallback((id) => {
    // Ensure engagement data is available
    const ensureEngagements = dataCache.engagements[id]
      ? Promise.resolve(dataCache.engagements[id])
      : getEngagements(id);
      
    return ensureEngagements.then(() => {
      return fetchData(`/api/leads/draft_summary/${id}`, id, 'draftSummaries', setDraftSummary, 'draftSummary');
    });
  }, [fetchData, getEngagements, dataCache.engagements]);

  const generateNextSteps = useCallback((id, emailData, summaryData) => {
    setError(null);
    setLoading(prev => ({ ...prev, nextSteps: true }));

    const requestData = {
      draftEmail: emailData?.draftEmail || "",
      draftSummary: summaryData?.draftSummary || "",
      userInfo: {
        name: "Jeffrey Crooks",
        company: "Palona",
        title: "GTM Engineer",
        email: "jeffrey@palona.com"
      }
    };

    return fetch(`/api/leads/next_steps/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setDataCache(prevCache => ({
          ...prevCache,
          nextSteps: { ...prevCache.nextSteps, [id]: data }
        }));
        setNextSteps(data);
        setLoading(prev => ({ ...prev, nextSteps: false }));
        return data;
      })
      .catch((err) => {
        setError(`Failed to generate next steps: ${err.message}`);
        setLoading(prev => ({ ...prev, nextSteps: false }));
        throw err;
      });
  }, []);

  const createNote = useCallback((id, noteText, noteType) => {
    setError(null);
    setLoading(prev => ({ ...prev, [`save${noteType}Note`]: true }));
    const noteData = {
      properties: {
        hs_note_body: noteText,
      }
    };

    return fetch(`/api/leads/create_note/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        alert(`${noteType} saved to HubSpot as a note!`);
        return data;
      })
      .catch((err) => {
        setError(`Failed to save ${noteType} as note: ${err.message}`);
        throw err;
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, [`save${noteType}Note`]: false }));
      });
  }, []);

  const sendEmail = useCallback((id, emailText) => {
    setError(null);
    setLoading(prev => ({ ...prev, sendEmail: true }));

    const emailData = {
      properties: {
        hs_email_subject: `Follow up from ${dataCache.leads[id]?.name || 'our team'}`,
        hs_email_text: emailText,
        hs_email_direction: 'EMAIL',
      }
    };

    return fetch(`/api/leads/create_email/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        alert('Email sent successfully!');
        return data;
      })
      .catch((err) => {
        setError(`Failed to send email: ${err.message}`);
        throw err;
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, sendEmail: false }));
      });
  }, [dataCache.leads]);

  const triggerAIAgent = useCallback((id) => {
    setError(null);
    return getLeadData(id)
      .then(() => getEngagements(id))
      .then(() => Promise.all([ generateDraftEmail(id), generateSummary(id) ]))
      .then(([emailResult, summaryResult]) => {
        return generateNextSteps(id, emailResult, summaryResult);
      })
      .catch(err => setError(err.message));
  }, [getLeadData, getEngagements, generateDraftEmail, generateSummary, generateNextSteps]);

  return {
    dataCache,
    loading,
    error,
    leadData,
    engagementData,
    draftEmail,
    draftSummary,
    nextSteps,
    getRecentLeads,
    getLeadData,
    getEngagements,
    generateDraftEmail,
    generateSummary,
    generateNextSteps,
    createNote,
    sendEmail,
    triggerAIAgent,
  };
}
