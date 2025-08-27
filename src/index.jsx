import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import './i18n';
// Sentry init (optional via env) - no top-level await
(() => {
	try {
		const dsn = import.meta?.env?.VITE_SENTRY_DSN;
		if (!dsn) return;
		import('@sentry/react')
			.then((Sentry) => {
				Sentry.init({
					dsn,
					integrations: [],
					tracesSampleRate: 0.1,
					environment: import.meta?.env?.MODE || 'development',
					release: import.meta?.env?.VITE_APP_VERSION || undefined,
					replaysSessionSampleRate: 0,
					replaysOnErrorSampleRate: 0,
				});
			})
			.catch(() => {});
	} catch (_) {}
})();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
