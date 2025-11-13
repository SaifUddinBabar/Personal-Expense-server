const express = require('express');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running...');
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
