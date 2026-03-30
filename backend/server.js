const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`Beauty and Salon Management System listening on http://localhost:${PORT}`);
});
