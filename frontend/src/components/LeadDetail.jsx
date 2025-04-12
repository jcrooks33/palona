// src/components/LeadDetail.jsx
import React from 'react';

const LeadDetail = ({ leadData, leadSegment }) => {
  if (!leadData) {
    return (
      <div className="bg-white rounded shadow p-4 md:col-span-2">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Lead Data</h2>
        <p className="text-gray-500">No lead data fetched yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow p-4 md:col-span-2">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Lead Data</h2>
      <div className="text-sm text-gray-800">
        <p><strong>Contact ID:</strong> {leadData.contact_id}</p>
        <p><strong>Name:</strong> {leadData.name}</p>
        <p><strong>Email:</strong> {leadData.email}</p>
        <p><strong>Company:</strong> {leadData.company}</p>
        <p><strong>Job Title:</strong> {leadData.job_title}</p>
        <p><strong>Lead Segment:</strong> {leadSegment ? leadSegment.segment : "Not yet segmented"}</p>
        <p><strong>Created Date:</strong> {leadData.created_date}</p>
        <p><strong>Updated Date:</strong> {leadData.updated_date}</p>
        <p><strong>Archived:</strong> {leadData.archived ? "Yes" : "No"}</p>
      </div>
    </div>
  );
};

export default LeadDetail;
