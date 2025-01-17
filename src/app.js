const express = require("express");
const app = express();
const port = 3000;

app.use("/test", (req, res) => {
  res.send("Hello from the server!");
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
