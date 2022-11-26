const express = require("express"); 
const cors = require("cors"); 
const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config(); 
const port = process.env.PORT || 5000; 
const app = express(); 

app.use(cors()); 
app.use(express.json()); 
 



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.x1we7vi.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});



app.get("/", async (req, res) => {
  res.send("Book  server is running");
});

app.listen(port, () => console.log(`Book  running on ${port}`));