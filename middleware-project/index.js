const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const acsRoutes = require("./routes/acsRoutes");
const ivrRoutes = require("./routes/ivrRoutes");
app.use("/acs", acsRoutes);
app.use("/ivr", ivrRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

