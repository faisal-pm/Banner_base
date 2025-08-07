const express = require('express');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase setup
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// OpenRouter setup
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// API Endpoints

/**
 * @route GET /api/projects
 * @desc Get all projects
 * @access Public
 */
app.get('/api/projects', async (req, res) => {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/**
 * @route GET /api/projects/:projectId
 * @desc Get a single project by ID
 * @access Public
 */
app.get('/api/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/**
 * @route POST /api/projects
 * @desc Create a new project
 * @access Public
 */
app.post('/api/projects', async (req, res) => {
  const { name, user_id } = req.body;
  const { data, error } = await supabase.from('projects').insert([{ name, user_id }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

/**
 * @route PUT /api/projects/:projectId
 * @desc Update a project
 * @access Public
 */
app.put('/api/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { name } = req.body;
  const { data, error } = await supabase.from('projects').update({ name }).eq('id', projectId).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

/**
 * @route DELETE /api/projects/:projectId
 * @desc Delete a project
 * @access Public
 */
app.delete('/api/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { data, error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Project deleted successfully' });
});

/**
 * @route POST /api/upload
 * @desc Upload assets for a project
 * @access Public
 */
app.post('/api/upload', upload.fields([{ name: 'logo' }, { name: 'background' }, { name: 'product' }]), async (req, res) => {
    const { projectId } = req.body;
    const files = req.files;

    if (!projectId || !files) {
        return res.status(400).json({ error: 'Project ID and files are required' });
    }

    const uploadPromises = [];
    for (const key in files) {
        const file = files[key][0];
        const filePath = `${projectId}/${key}/${file.originalname}`;
        uploadPromises.push(
            supabase.storage.from('assets').upload(filePath, file.buffer, {
                contentType: file.mimetype,
            })
        );
    }

    const results = await Promise.all(uploadPromises);

    for (const result of results) {
        if (result.error) {
            return res.status(500).json({ error: result.error.message });
        }
    }

    res.json({ message: 'Files uploaded successfully' });
});

/**
 * @route POST /api/generate-banner
 * @desc Generate a banner for a project
 * @access Public
 */
// Generate a banner
app.post('/api/generate-banner', async (req, res) => {
    const { projectId } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        // 1. Fetch project assets from Supabase Storage
        const { data: files, error: listError } = await supabase.storage.from('assets').list(projectId, {
            limit: 100,
        });

        if (listError) {
            return res.status(500).json({ error: `Failed to list assets: ${listError.message}` });
        }

        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'No assets found for this project.' });
        }

        // 2. Prepare the prompt for the generative model
        const prompt = "Create an engaging HTML5 banner ad using the provided assets. The banner should be animated and visually appealing. The copy for the banner is: 'Check out our new product!'. The call to action is 'Shop Now'.";

        const imageParts = await Promise.all(
            files.map(async (file) => {
                const { data, error } = await supabase.storage.from('assets').download(`${projectId}/${file.name}`);
                if (error) {
                    throw new Error(`Failed to download ${file.name}: ${error.message}`);
                }
                const buffer = await data.arrayBuffer();
                return {
                    type: 'image_url',
                    image_url: {
                        url: `data:${file.metadata.mimetype};base64,${Buffer.from(buffer).toString('base64')}`,
                    },
                };
            })
        );

        // 3. Generate the banner
        const response = await openrouter.chat.completions.create({
            model: 'openrouter/horizon-beta',
            messages: [
                {
                    role: 'user',
                    content: [prompt, ...imageParts],
                },
            ],
        });

        const text = response.choices[0].message.content;

        // 4. Save the generated banner to Supabase
        const bannerName = `banner-${Date.now()}.html`;
        const { error: uploadError } = await supabase.storage
            .from('banners')
            .upload(`${projectId}/${bannerName}`, text, { contentType: 'text/html' });

        if (uploadError) {
            return res.status(500).json({ error: `Failed to upload banner: ${uploadError.message}` });
        }

        res.json({ message: 'Banner generated successfully!', bannerUrl: `${supabaseUrl}/storage/v1/object/public/banners/${projectId}/${bannerName}` });

    } catch (error) {
        console.error('Error generating banner:', error);
        res.status(500).json({ error: 'Failed to generate banner. Please check the server logs for more details.' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
