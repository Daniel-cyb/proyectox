// lib/opensearchClient.js
import { Client } from '@opensearch-project/opensearch';

const client = new Client({
  node: 'https://localhost:9201',
  auth: {
    username: 'admin',
    password: 'Soporte18*'
  },
  ssl: {
    rejectUnauthorized: false
  }
});

export default client;
