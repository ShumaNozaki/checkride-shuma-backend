require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { transcribe } = require('./watsonClient');

const app = express();
const upload = multer();
app.use(cors());

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  const buffer = req.file.buffer;
  const result = await transcribe(buffer);
  res.json({ text: result });
});

app.listen(3001, () => console.log('Server running on 3001'));
