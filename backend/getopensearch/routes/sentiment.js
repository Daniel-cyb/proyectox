const express = require('express');
const { Client } = require('@opensearch-project/opensearch');
const config = require('../config');

const router = express.Router();
const client = new Client({
  node: config.opensearch.node,
  auth: config.opensearch.auth,
  ssl: config.opensearch.ssl,
});

router.get('/sentiments', async (req, res) => {
  const { indexName } = req.query;

  if (!indexName) {
    return res.status(400).json({ error: 'indexName is required' });
  }

  const query = {
    size: 0,
    aggs: {
      sentiment_count: {
        terms: {
          field: 'sentiment.keyword',
          size: 10,
        },
      },
    },
  };

  try {
    console.log('Executing query on index:', indexName);
    const response = await client.search({
      index: indexName,
      body: query,
    });

    const buckets = response.aggregations?.sentiment_count?.buckets || [];
    if (buckets.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified index' });
    }

    const sentiments = buckets.map((bucket) => bucket.key);
    const counts = buckets.map((bucket) => bucket.doc_count);

    res.status(200).json({ sentiments, counts });
  } catch (error) {
    console.error('Error fetching sentiments:', error.message);
    res.status(500).json({ error: 'Error fetching sentiments', details: error.message });
  }
});

module.exports = router;
