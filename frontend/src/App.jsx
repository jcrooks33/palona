import { useState } from 'react';

function App() {
  const [leadId, setLeadId] = useState('');
  const [email, setEmail] = useState('');
  const [leadData, setLeadData] = useState(null);
  const [leadEmailData, setLeadEmailData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [draftEmail, setDraftEmail] = useState(null);
  const [draftSummary, setDraftSummary] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = (url, setter, asText = false) => {
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return asText ? res.text() : res.json();
      })
      .then(data => setter(data))
      .catch(err => setError(err.message));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Lead Management</h2>

      <div className="mb-4 flex flex-col gap-4 items-center">
        <input
          type="text"
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          placeholder="Enter Lead ID"
          className="border p-2 rounded"
        />
        <button
          onClick={() => fetchData(`/api/leads/${leadId}`, setLeadData)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Fetch Lead by ID
        </button>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Email"
          className="border p-2 rounded"
        />
        <button
          onClick={() => fetchData(`/api/leads/email/${email}`, setLeadEmailData)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Fetch Lead by Email
        </button>

        <button
          onClick={() => fetchData(`/api/leads/engagement/${leadId}`, setEngagementData)}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Fetch Engagements
        </button>

        <button
          onClick={() => fetchData(`/api/leads/draft_email/${leadId}`, setDraftEmail, true)}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Generate Draft Email
        </button>

        <button
          onClick={() => fetchData(`/api/leads/draft_summary/${leadId}`, setDraftSummary, true)}
          className="bg-indigo-500 text-white px-4 py-2 rounded"
        >
          Generate Interaction Summary
        </button>
      </div>

      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="bg-gray-100 p-4 rounded shadow-md text-left whitespace-pre-wrap">
        {leadData && <pre>{JSON.stringify(leadData, null, 2)}</pre>}
        {leadEmailData && <pre>{JSON.stringify(leadEmailData, null, 2)}</pre>}
        {engagementData && <pre>{JSON.stringify(engagementData, null, 2)}</pre>}
        {draftEmail && <pre>{draftEmail}</pre>}
        {draftSummary && <pre>{draftSummary}</pre>}
      </div>
    </div>
  );
}

export default App;
