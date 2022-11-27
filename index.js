const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
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

// APIs start*******************************************

async function run() {
  try {
    const categories = client.db("cheapBook").collection("bookCategories");
    const books = client.db("cheapBook").collection("BookCollection");
    const bookingsCollection = client.db("cheapBook").collection("bookings");
    const usersCollection = client.db("cheapBook").collection("users");

    // API: Getting the categories in the Homepage: Start********

    app.get("/categories", async (req, res) => {
      const query = {};
      const bookCategories = await categories.find(query).toArray();
      res.send(bookCategories);
    });

    // API: Getting the categories in the Homepage: END ********

    // API: Getting the books according to category: Start ********

    app.get("/categories/fiction", async (req, res) => {
      const query = { categoryName: "Fiction" };
      const booksInCategory = await books.find(query).toArray();
      res.send(booksInCategory);
    });
    app.get("/categories/fantasy", async (req, res) => {
      const query = { categoryName: "Fantasy" };
      const booksInCategory = await books.find(query).toArray();
      res.send(booksInCategory);
    });
    app.get("/categories/adventure", async (req, res) => {
      const query = { categoryName: "Adventure" };
      const booksInCategory = await books.find(query).toArray();
      res.send(booksInCategory);
    });

    // API: Getting the books according to category: End ********

    // ****************START Bookings*****************

    //Start: API POST bookings
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    //ENd: API POST bookings

    //START: API GET bokkings
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };

      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });
    //END: API GET bokkings

    // ****************END Bookings******** ***********

    // *****************START USRS*********************

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // *****************End USRS***********************
  } finally {
  }
}
run().catch((error) => cosole.log(error));

// APIs END*******************************************

app.get("/", async (req, res) => {
  res.send("Book  server is running");
});

app.listen(port, () => console.log(`Book  running on ${port}`));
