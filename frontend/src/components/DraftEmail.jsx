// File: src/components/DraftEmail.jsx
import React from 'react';

const DraftEmail = ({ draftEmail, leadId, sendEmail, loadingEmail }) => {
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Draft Email
      {loadingEmail && <span className="ml-2 text-sm text-blue-500">Loading...</span>}
      </h2>
      {draftEmail ? (
        <div className="whitespace-pre-wrap text-sm text-gray-800">
          {draftEmail.draftEmail}
          <div className="mt-4">
            <button 
              onClick={() => sendEmail(leadId, draftEmail.draftEmail)}
              disabled={loadingEmail}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loadingEmail ? 'Sending...' : 'Save to HubSpot'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No draft email generated yet.</p>
      )}
    </div>
  );
};

export default DraftEmail;
