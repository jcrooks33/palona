import React, { useState, useEffect } from 'react';

const DraftEmail = ({ draftEmail, leadId, sendEmail, loadingEmail }) => {
  // Local state to hold the editable email content
  const [emailContent, setEmailContent] = useState("");

  // When the draftEmail prop changes, update the local state
  useEffect(() => {
    if (draftEmail && draftEmail.draftEmail) {
      setEmailContent(draftEmail.draftEmail);
    }
  }, [draftEmail]);

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">
        Draft Email
        {loadingEmail && <span className="ml-2 text-sm text-blue-500">Loading...</span>}
      </h2>
      {draftEmail ? (
        <div className="text-sm text-gray-800">
          {/* Editable textarea to allow users to modify the email draft */}
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows="15"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
          />
          <div className="mt-4">
            <button 
              onClick={() => sendEmail(leadId, emailContent)}
              disabled={loadingEmail}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loadingEmail ? 'Sending...' : 'Send email and save to HubSpot'}
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
