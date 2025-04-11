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
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return asText ? res.text() : res.json();
      })
      .then((data) => setter(data))
      .catch((err) => setError(err.message));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Lead Management Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Fetch lead info, engagements, draft email and interaction summary.
          </p>
        </header>

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
              onClick={() => fetchData(`/api/leads/${leadId}`, setLeadData)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Fetch Lead by ID
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={() => fetchData(`/api/leads/email/${email}`, setLeadEmailData)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Fetch Lead by Email
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={() => fetchData(`/api/leads/engagement/${leadId}`, setEngagementData)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full sm:w-auto"
            >
              Fetch Engagements
            </button>
            <button
              onClick={() => fetchData(`/api/leads/draft_email/${leadId}`, setDraftEmail)}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 w-full sm:w-auto"
            >
              Generate Draft Email
            </button>
            <button
              onClick={() => fetchData(`/api/leads/draft_summary/${leadId}`, setDraftSummary)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full sm:w-auto"
            >
              Generate Interaction Summary
            </button>
          </div>
        </div>

        {error && <p className="mb-4 text-red-500 text-center">Error: {error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Lead Data</h2>
            {leadData ? (
              <div className="text-sm text-gray-800">
                <p><strong>Contact ID:</strong> {leadData.contact_id}</p>
                <p><strong>Name:</strong> {leadData.name}</p>
                <p><strong>Email:</strong> {leadData.email}</p>
                <p><strong>Company:</strong> {leadData.company}</p>
                <p><strong>Job Title:</strong> {leadData.job_title}</p>
                <p><strong>Created Date:</strong> {leadData.created_date}</p>
                <p><strong>Updated Date:</strong> {leadData.updated_date}</p>
                <p><strong>Archived:</strong> {leadData.archived ? "Yes" : "No"}</p>
              </div>
            ) : (
              <p className="text-gray-500">No lead data fetched yet.</p>
            )}
          </div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Lead (By Email)</h2>
            {leadEmailData ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {JSON.stringify(leadEmailData, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No lead email data fetched yet.</p>
            )}
          </div>

          <div className="bg-white rounded shadow p-4 md:col-span-2">
  <h2 className="text-xl font-semibold mb-3 text-gray-700">Engagements</h2>
  {engagementData ? (
    <div>
      {/* Group the engagements by type */}
      {Object.entries(
        engagementData.reduce((groups, item) => {
          const group = groups[item.type] || [];
          group.push(item);
          groups[item.type] = group;
          return groups;
        }, {})
      ).map(([type, items]) => (
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
  ) : (
    <p className="text-gray-500">No engagement data fetched yet.</p>
  )}
</div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Draft Email</h2>
            {draftEmail ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {draftEmail.draftEmail}
              </pre>
            ) : (
              <p className="text-gray-500">No draft email generated yet.</p>
            )}
          </div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Interaction Summary</h2>
            {draftSummary ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {draftSummary.draftSummary}
              </pre>
            ) : (
              <p className="text-gray-500">No interaction summary generated yet.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
