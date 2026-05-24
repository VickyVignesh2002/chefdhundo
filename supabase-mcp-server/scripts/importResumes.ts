import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import csv from 'csv-parser';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and anon key are required.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const importResumes = async () => {
  const results: any[] = [];
  const filePath = path.resolve(__dirname, '../../../../backup/resumes_rows.csv');

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const row of results) {
        // Skip rows with no user_id
        if (!row.user_id) {
          console.log(`Skipping row with empty user_id: ${row.name}`);
          continue;
        }

        // Convert empty strings to null
        Object.keys(row).forEach(key => {
          if (row[key] === '') {
            row[key] = null;
          }
        });
        
        // Convert numeric fields
        if (row.experience_years) {
            row.experience_years = parseFloat(row.experience_years);
        }


        const { error } = await supabase.from('resumes').insert(row);

        if (error) {
          console.error(`Error inserting row: ${JSON.stringify(row)}`, error);
        } else {
          console.log(`Successfully inserted row: ${row.name}`);
        }
      }
    });
};

importResumes();
