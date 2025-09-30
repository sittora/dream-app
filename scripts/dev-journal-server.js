#!/usr/bin/env node
// Lightweight dev server that serves /journal-export for local widget development.
// Run with: node ./scripts/dev-journal-server.js

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5789;

app.get('/journal-export', (req, res) => {
  const sample = [
    { id: '1', text: 'I was flying over a forest and then it rained stars.', ts: new Date().toISOString() },
    { id: '2', text: 'I lost my teeth in front of a crowd and felt embarrassed.', ts: new Date(Date.now()-86400000).toISOString() },
    { id: '3', text: 'A wise woman gave me a key and said it opens doors to my father.', ts: new Date(Date.now()-2*86400000).toISOString() }
  ];
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(sample);
});

app.use('/numinos-widget', express.static(path.join(process.cwd(), 'public', 'numinos-widget')));

app.listen(port, () => {
  console.log('Dev journal server listening on http://localhost:' + port);
});
