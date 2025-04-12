// File: src/App.jsx
import React, { useState, useEffect } from 'react';
import { useLeadApi } from './hooks/useLeadApi';
import LeadSearch from './components/LeadSearch';
import LeadList from './components/LeadList';
import LeadDetail from './components/LeadDetail';
import Engagements from './components/Engagements';
import DraftEmail from './components/DraftEmail';
import DraftSummary from './components/DraftSummary';
import NextSteps from './components/NextSteps';

const Dashboard = () => {
  const [leadId, setLeadId] = useState('');
  const {
    loading,
    error,
    leadData,
    engagementData,
    draftEmail,
    draftSummary,
    nextSteps,
    getRecentLeads,
    getLeadData,
    triggerAIAgent,
    sendEmail,
    createNote,
  } = useLeadApi();

  const [recentLeads, setRecentLeadsState] = useState(null);
  
  // Load recent leads on component mount
  useEffect(() => {
    getRecentLeads()
      .then(data => setRecentLeadsState(data))
      .catch(err => console.error(err));
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

        {/* Search / Action Section */}
        <LeadSearch 
          leadId={leadId} 
          setLeadId={setLeadId}
          getLeadData={getLeadData}
          triggerAIAgent={triggerAIAgent}
          loading={loading.lead}
        />

        <button
          onClick={() => {
            getRecentLeads().then(data => setRecentLeadsState(data));
          }}
          disabled={loading.recentLeads}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 w-full mb-6"
        >
          {loading.recentLeads ? 'Loading...' : 'Fetch Recent Leads'}
        </button>

        {error && <p className="mb-4 text-red-500">Error: {error}</p>}

        {/* Display Leads List */}
        <LeadList recentLeads={recentLeads} triggerAIAgent={triggerAIAgent} setLeadId={setLeadId} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LeadDetail leadData={leadData} />
          <Engagements engagementData={engagementData} />
          <DraftEmail 
            draftEmail={draftEmail} 
            leadId={leadId} 
            sendEmail={sendEmail} 
            loadingEmail={loading.draftEmail}
          />
          <DraftSummary 
            draftSummary={draftSummary} 
            leadId={leadId} 
            createNote={createNote} 
            loadingNote={loading.draftSummary}
          />
          <NextSteps 
            nextSteps={nextSteps} 
            leadId={leadId} 
            createNote={createNote} 
            loadingNote={loading.saveNextStepsNote}
            loadingNextSteps={loading.nextSteps}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
