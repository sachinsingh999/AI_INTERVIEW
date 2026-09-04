const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes definition
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'MERN backend-node is healthy.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
