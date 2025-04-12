// File: src/components/LeadSearch.js
import React from 'react';

const LeadSearch = ({ leadId, setLeadId, getLeadData, triggerAIAgent, loading }) => {
  return (
    <div className="mb-8 space-y-4">
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
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Loading...' : 'Fetch Lead by ID'}
        </button>
        <button
          onClick={() => triggerAIAgent(leadId)}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-purple-300"
        >
          {loading ? 'Processing...' : 'Trigger Agent'}
        </button>
      </div>
    </div>
  );
};

export default LeadSearch;
