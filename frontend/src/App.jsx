import { useState, useEffect, useCallback } from 'react';

function App() {
  // Input state
  const [leadId, setLeadId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  
  // Add a state cache object to store fetched data
  const [dataCache, setDataCache] = useState({
    leads: {}, // Will store lead data by ID
    emailLeads: {}, // Will store lead data by email
    engagements: {}, // Will store engagement data by lead ID
    draftEmails: {}, // Will store generated emails by lead ID
    draftSummaries: {}, // Will store summaries by lead ID
    recentLeads: {},
    nextSteps: {} // Add this new cache section
  });
  
  // Display state variables
  const [leadData, setLeadData] = useState(null);
  const [leadEmailData, setLeadEmailData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [draftEmail, setDraftEmail] = useState(null);
  const [draftSummary, setDraftSummary] = useState(null);
  const [nextSteps, setNextSteps] = useState(null);

  
  // Loading states for UI feedback
  const [loading, setLoading] = useState({
    lead: false,
    emailLead: false,
    engagements: false,
    draftEmail: false,
    draftSummary: false,
    recentLeads: false,
    sendEmail: false,
    nextSteps: false 
  });
  
  // Enhanced fetch function that uses the cache
  const fetchData = useCallback((url, cacheKey, cacheSection, setter = null, 
                               loadingKey = null, asText = false) => {
    // Check if we already have this data in cache
    if (dataCache[cacheSection] && dataCache[cacheSection][cacheKey]) {
      // If we have a setter function, call it with the cached data
      if (setter) {
        setter(dataCache[cacheSection][cacheKey]);
      }
      return Promise.resolve(dataCache[cacheSection][cacheKey]);
    }
    
    // Set loading state if a key was provided
    if (loadingKey) {
      setLoading(prev => ({ ...prev, [loadingKey]: true }));
    }
    
    // Otherwise, fetch the data
    setError(null);
    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return asText ? res.text() : res.json();
      })
      .then((data) => {
        // Update the cache with the new data
        setDataCache(prevCache => ({
          ...prevCache,
          [cacheSection]: {
            ...prevCache[cacheSection],
            [cacheKey]: data
          }
        }));
        
        // If we have a setter function, call it with the data
        if (setter) {
          setter(data);
        }
        
        // Reset loading state
        if (loadingKey) {
          setLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
        
        return data;
      })
      .catch((err) => {
        setError(err.message);
        
        // Reset loading state
        if (loadingKey) {
          setLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
        
        throw err;
      });
  }, [dataCache]);
  
// Function to generate next steps recommendations
// Function to generate next steps recommendations
const generateNextSteps = useCallback((id, emailData, summaryData) => {
  setError(null);
  setLoading(prev => ({ ...prev, nextSteps: true }));

  // Prepare the request data
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

  // Make the API call
  return fetch(`/api/leads/next_steps/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    })
    .then((data) => {
      // Update the cache
      setDataCache(prevCache => ({
        ...prevCache,
        nextSteps: {
          ...prevCache.nextSteps,
          [id]: data
        }
      }));
      
      // Update the state
      setNextSteps(data);
      
      // Reset loading state
      setLoading(prev => ({ ...prev, nextSteps: false }));
      
      return data;
    })
    .catch((err) => {
      setError(`Failed to generate next steps: ${err.message}`);
      setLoading(prev => ({ ...prev, nextSteps: false }));
      throw err;
    });
}, []); // Remove dependencies on draftEmail and draftSummary


  const getRecentLeads = useCallback((limit = 20, days = 7) => {
    return fetchData(
      `/api/leads/recent?limit=${limit}&days=${days}`,
      `${limit}_${days}`,
      'recentLeads',
      setRecentLeads,
      'recentLeads'
    );
  }, [fetchData]);

  // Function to get lead data
  const getLeadData = useCallback((id) => {
    return fetchData(`/api/leads/${id}`, id, 'leads', setLeadData, 'lead');
  }, [fetchData]);
  
  // Function to get lead by email
  const getLeadByEmail = useCallback((emailAddress) => {
    return fetchData(`/api/leads/email/${emailAddress}`, emailAddress, 
                    'emailLeads', setLeadEmailData, 'emailLead');
  }, [fetchData]);
  
  // Function to get engagements
  const getEngagements = useCallback((id) => {
    return fetchData(`/api/leads/engagement/${id}`, id, 'engagements', 
                    setEngagementData, 'engagements');
  }, [fetchData]);
  
  // Function to generate draft email
  const generateDraftEmail = useCallback((id) => {
    // Check if we have lead data first
    const ensureLeadData = dataCache.leads[id] 
                          ? Promise.resolve(dataCache.leads[id]) 
                          : getLeadData(id);
    
    return ensureLeadData
      .then(() => {
        return fetchData(`/api/leads/draft_email/${id}`, id, 'draftEmails', 
                        setDraftEmail, 'draftEmail');
      });
  }, [fetchData, getLeadData, dataCache.leads]);
  
  // Function to generate interaction summary
  const generateSummary = useCallback((id) => {
    // Check if we have engagement data first
    const ensureEngagements = dataCache.engagements[id] 
                             ? Promise.resolve(dataCache.engagements[id]) 
                             : getEngagements(id);
    
    return ensureEngagements
      .then(() => {
        return fetchData(`/api/leads/draft_summary/${id}`, id, 'draftSummaries', 
                        setDraftSummary, 'draftSummary');
      });
  }, [fetchData, getEngagements, dataCache.engagements]);
  
// Function to trigger the complete AI agent workflow
// Function to trigger the complete AI agent workflow
const triggerAIAgent = useCallback((id) => {
  setError(null);
  
  // First get the lead data
  getLeadData(id)
    .then(() => {
      // Then get the engagement data
      return getEngagements(id);
    })
    .then(() => {
      // Generate both email and summary in parallel
      return Promise.all([
        generateDraftEmail(id),
        generateSummary(id)
      ]);
    })
    .then(([emailResult, summaryResult]) => {
      // After both email and summary are generated, get next steps recommendations
      // Pass the results directly instead of relying on state
      return generateNextSteps(id, emailResult, summaryResult);
    })
    .catch(err => setError(err.message));
}, [getLeadData, getEngagements, generateDraftEmail, generateSummary, generateNextSteps]);

// Function to send the email to HubSpot
const sendEmail = useCallback((id, emailText) => {
  setError(null);
  
  // Set loading state
  setLoading(prev => ({ ...prev, sendEmail: true }));
  
  // Prepare the email data
  const emailData = {
    properties: {
      hs_email_subject: `Follow up from ${dataCache.leads[id]?.name || 'our team'}`,
      hs_email_text: emailText,
      hs_email_direction: 'EMAIL',
      // You can add more properties here if needed
    }
  };
  
  // Call the API to send the email
  return fetch(`/api/leads/create_email/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    })
    .then((data) => {
      // Success message or action
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

// Display next steps in a structured format
const renderNextSteps = (data) => {
  if (!data) return <p className="text-gray-500">No next steps recommendations yet.</p>;
  
  return (
    <div className="whitespace-pre-wrap text-sm text-gray-800">
      {data.nextSteps}
    </div>
  );
};

// Display leads in a table format
const renderLeads = (leads) => {
  if (!leads || !leads.leads || leads.leads.length === 0) 
    return <p className="text-gray-500">No leads found.</p>;
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-left">
            <th className="py-2 px-3 text-sm font-semibold">Name</th>
            <th className="py-2 px-3 text-sm font-semibold">Email</th>
            <th className="py-2 px-3 text-sm font-semibold">Company</th>
            <th className="py-2 px-3 text-sm font-semibold">Job Title</th>
            <th className="py-2 px-3 text-sm font-semibold">Created Date</th>
            <th className="py-2 px-3 text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.leads.map((lead) => (
            <tr key={lead.id} className="border-t hover:bg-gray-50">
              <td className="py-2 px-3 text-sm">{lead.name}</td>
              <td className="py-2 px-3 text-sm">{lead.email}</td>
              <td className="py-2 px-3 text-sm">{lead.company}</td>
              <td className="py-2 px-3 text-sm">{lead.job_title}</td>
              <td className="py-2 px-3 text-sm">{new Date(lead.created_date).toLocaleDateString()}</td>
              <td className="py-2 px-3 text-sm">
                <button 
                  onClick={() => {
                    setLeadId(lead.id);
                    triggerAIAgent(lead.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                >
                  Trigger Agent
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

  // Display lead data in a structured format
  const renderLeadData = (data) => {
    if (!data) return <p className="text-gray-500">No lead data fetched yet.</p>;
    
    return (
      <div className="text-sm text-gray-800">
        <p><strong>Contact ID:</strong> {data.contact_id}</p>
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Company:</strong> {data.company}</p>
        <p><strong>Job Title:</strong> {data.job_title}</p>
        <p><strong>Created Date:</strong> {data.created_date}</p>
        <p><strong>Updated Date:</strong> {data.updated_date}</p>
        <p><strong>Archived:</strong> {data.archived ? "Yes" : "No"}</p>
      </div>
    );
  };

  // Display engagements in a structured format
  const renderEngagements = (data) => {
    if (!data) return <p className="text-gray-500">No engagement data fetched yet.</p>;
    
    // Group engagements by type
    const groupedEngagements = data.reduce((groups, item) => {
      const group = groups[item.type] || [];
      group.push(item);
      groups[item.type] = group;
      return groups;
    }, {});
    
    return (
      <div>
        {Object.entries(groupedEngagements).map(([type, items]) => (
          <div key={type} className="mb-6">
            <h3 className="font-semibold text-lg text-gray-700 mb-2">{type}</h3>
            <div className="pl-4 border-l-2 border-gray-300">
              {/* Sort items by date (newest first) */}
              {items
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((engagement, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex items-baseline">
                      <span className="text-gray-500 text-sm mr-3">{engagement.date}:</span>
                      <span className="text-sm text-gray-800">{engagement.body}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Load recent leads on component mount
  useEffect(() => {
    getRecentLeads();
  }, [getRecentLeads]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Lead Management Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Fetch lead info, engagements, draft email and interaction summary.
          </p>
        </header>

        {/* New button layout */}
        <div className="mb-8 space-y-4">
          {/* Full width button for Recent Leads - now at the top */}
          <div>
            <button
              onClick={() => getRecentLeads()}
              disabled={loading.recentLeads}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 w-full"
            >
              {loading.recentLeads ? 'Loading...' : 'Fetch Recent Leads'}
            </button>
          </div>
          
          {/* Lead ID entry field with button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              placeholder="Enter Lead ID"
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={() => getLeadData(leadId)}
              disabled={loading.lead}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading.lead ? 'Loading...' : 'Fetch Lead by ID'}
            </button>
          </div>
        </div>

        {/* Changed from "Recent Leads" to just "Leads" since it will show both recent and fetched by ID */}
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Leads</h2>
          {error && <p className="mb-4 text-red-500">Error: {error}</p>}
          {renderLeads(recentLeads)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Lead Data</h2>
            {renderLeadData(leadData)}
          </div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Lead (By Email)</h2>
            {renderLeadData(leadEmailData)}
          </div>

          <div className="bg-white rounded shadow p-4 md:col-span-2">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Engagements</h2>
            {renderEngagements(engagementData)}
          </div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Draft Email</h2>
            {draftEmail ? (
              <div className="whitespace-pre-wrap text-sm text-gray-800">
                {draftEmail.draftEmail}
                <div className="mt-4">
                  <button 
                    onClick={() => sendEmail(leadId, draftEmail.draftEmail)}
                    disabled={loading.sendEmail}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:bg-green-300"
                  >
                    {loading.sendEmail ? 'Sending...' : 'Approve & Send'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No draft email generated yet.</p>
            )}
          </div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Interaction Summary</h2>
            {draftSummary ? (
              <div className="whitespace-pre-wrap text-sm text-gray-800">
                {draftSummary.draftSummary}
              </div>
            ) : (
              <p className="text-gray-500">No interaction summary generated yet.</p>
            )}
          </div>
          <div className="bg-white rounded shadow p-4 md:col-span-2">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Recommended Next Steps
              {loading.nextSteps && <span className="ml-2 text-sm text-blue-500">Loading...</span>}
            </h2>
            {renderNextSteps(nextSteps)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;