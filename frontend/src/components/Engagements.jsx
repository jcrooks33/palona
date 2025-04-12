// File: src/components/Engagements.jsx
import React from 'react';

const Engagements = ({ engagementData }) => {
  if (!engagementData) {
    return (
      <div className="bg-white rounded shadow p-4 md:col-span-2">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Engagements</h2>
        <p className="text-gray-500">No engagement data fetched yet.</p>
      </div>
    );
  }

  const groupedEngagements = engagementData.reduce((groups, item) => {
    const group = groups[item.type] || [];
    group.push(item);
    groups[item.type] = group;
    return groups;
  }, {});

  return (
    <div className="bg-white rounded shadow p-4 md:col-span-2">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Engagements</h2>
      {Object.entries(groupedEngagements).map(([type, items]) => (
        <div key={type} className="mb-6">
          <h3 className="font-semibold text-lg text-gray-700 mb-2">{type}</h3>
          <div className="pl-4 border-l-2 border-gray-300">
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
  );
};

export default Engagements;
