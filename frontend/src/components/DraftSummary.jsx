// File: src/components/DraftSummary.js
import React from 'react';

const DraftSummary = ({ draftSummary, leadId, createNote, loadingNote }) => {
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Interaction Summary</h2>
      {draftSummary ? (
        <div className="whitespace-pre-wrap text-sm text-gray-800">
          {draftSummary.draftSummary}
          <div className="mt-4">
            <button 
              onClick={() => createNote(leadId, draftSummary.draftSummary, 'Summary')}
              disabled={loadingNote}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loadingNote ? 'Saving...' : 'Save to HubSpot'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No interaction summary generated yet.</p>
      )}
    </div>
  );
};

export default DraftSummary;
