import React from 'react';

const PrivacyPolicy = () => (
  <div className="max-w-3xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-heading font-semibold mb-4 text-foreground">Privacy Policy</h1>
    <p className="text-sm text-muted-foreground leading-relaxed">
      We respect your privacy. Your journal entries and mood data are stored securely and protected under Row Level Security (RLS). We do not sell personal data.
    </p>
    <h2 className="text-xl font-heading font-semibold mt-6 mb-2 text-foreground">Data Usage</h2>
    <ul className="list-disc pl-6 text-sm text-foreground space-y-1">
      <li>Entries are only accessible to your account under RLS policies.</li>
      <li>Aggregate analytics may be computed without identifying you.</li>
      <li>You can request deletion/export of your data.</li>
    </ul>
  </div>
);

export default PrivacyPolicy;
