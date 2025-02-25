const { Client } = require('@opensearch-project/opensearch');

// OpenSearch configuration
const client = new Client({
  node: 'https://localhost:9201', // OpenSearch node URL
  auth: {
    username: 'admin', // OpenSearch credentials
    password: 'Soporte18*',
  },
  ssl: {
    rejectUnauthorized: false, // Adjust for local setup
  },
});

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const response = await client.search({
        index: 'ransomwarelive', // Replace with your index name
        body: {
          size: 1000, // Number of results to return
          query: {
            match_all: {}, // Get all documents
          },
        },
      });

      const hits = response.body.hits.hits.map((hit) => ({
        id: hit._id,
        country: hit._source.country || null,
        date: hit._source.date || null,
        domain: hit._source.domain || null,
        summary: hit._source.summary || null,
        title: hit._source.title || null,
        translated_summary: hit._source.translated_summary || null,
        url: hit._source.url || null,
        victim: hit._source.victim || null,
      }));

      res.status(200).json(hits);
    } catch (error) {
      console.error('Error fetching data from OpenSearch:', error);
      res.status(500).json({
        error: 'Failed to fetch data from OpenSearch',
        details: error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Ensure this is exported as the default export
export default handler;
