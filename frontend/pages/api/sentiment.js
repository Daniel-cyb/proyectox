import { Client } from '@opensearch-project/opensearch';
import config from '../../../getopensearch/config';


const client = new Client({
  node: config.opensearch.node,
  auth: config.opensearch.auth,
  ssl: config.opensearch.ssl,
});

export default async function handler(req, res) {
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
    console.log('Query:', JSON.stringify(query, null, 2));

    const response = await client.search({
      index: indexName,
      body: query,
    });

    console.log('Response from OpenSearch:', response);

    const buckets = response.body.aggregations?.sentiment_count?.buckets || [];
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
}
