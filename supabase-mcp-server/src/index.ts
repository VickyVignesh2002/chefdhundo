import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and anon key are required.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/query', async (req, res) => {
  const { query, table } = req.body;

  if (!query || !table) {
    return res.status(400).json({ error: 'Query and table are required.' });
  }

  try {
    const { data, error } = await supabase.from(table).select(query);
    if (error) {
      throw error;
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/table-counts', async (req, res) => {
  try {
    const tables = ['users', 'resumes', 'payments', 'subscriptions', 'announcements'];
    const counts: { [key: string]: number | string } = {};

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        counts[table] = `Error: ${error.message}`;
      } else {
        counts[table] = count || 0;
      }
    }

    res.json(counts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Supabase MCP server is running on http://localhost:${port}`);
});
