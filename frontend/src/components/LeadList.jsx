// File: src/components/LeadList.js
import React from 'react';

const LeadList = ({ recentLeads, triggerAIAgent, setLeadId }) => {
  if (!recentLeads || !recentLeads.leads || recentLeads.leads.length === 0) {
    return <p className="text-gray-500 mb-6">No leads found.</p>;
  }

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Leads</h2>
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
            {recentLeads.leads.map((lead) => (
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
    </div>
  );
};

export default LeadList;
