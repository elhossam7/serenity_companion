import React from 'react';

const TermsOfService = () => (
  <div className="max-w-3xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-heading font-semibold mb-4 text-foreground">Terms of Service</h1>
    <p className="text-sm text-muted-foreground leading-relaxed">
      Use this app responsibly. Serenity Companion is not a substitute for professional medical advice. In emergencies, use local resources immediately.
    </p>
    <h2 className="text-xl font-heading font-semibold mt-6 mb-2 text-foreground">Acceptable Use</h2>
    <ul className="list-disc pl-6 text-sm text-foreground space-y-1">
      <li>No abusive or illegal content.</li>
      <li>Respect privacy and data protection laws.</li>
    </ul>
  </div>
);

export default TermsOfService;
