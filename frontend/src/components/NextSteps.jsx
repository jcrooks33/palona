// File: src/components/NextSteps.jsx
import React from 'react';

const NextSteps = ({ nextSteps, leadId, createNote, loadingNote, loadingNextSteps }) => {
  return (
    <div className="bg-white rounded shadow p-4 md:col-span-2">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">
        Recommended Next Steps
        {loadingNextSteps && <span className="ml-2 text-sm text-blue-500">Loading...</span>}
      </h2>
      {nextSteps ? (
        <div className="whitespace-pre-wrap text-sm text-gray-800">
          {nextSteps.nextSteps}
          <div className="mt-4">
            <button 
              onClick={() => createNote(leadId, nextSteps.nextSteps, 'NextSteps')}
              disabled={loadingNote}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loadingNote ? 'Saving...' : 'Save to HubSpot'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No next steps recommendations yet.</p>
      )}
    </div>
  );
};

export default NextSteps;
