const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
  console.log("token inside verifyJWT", req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send(`unauthorized access`);
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

// APIs start*******************************************

async function run() {
  try {
    const categories = client.db("cheapBook").collection("bookCategories");
    const books = client.db("cheapBook").collection("BookCollection");
    const bookingsCollection = client.db("cheapBook").collection("bookings");
    const usersCollection = client.db("cheapBook").collection("users");

    //Start: JWT

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "5h",
        });
        return res.send({ accessToken: token });
      }
      console.log(user);
      res.status(403).send({ accessToken: "" });
    });

    //END: JWT

    // API: Getting the categories in the Homepage: Start********

    app.get("/categories", async (req, res) => {
      const query = {};
      const bookCategories = await categories.find(query).toArray();
      res.send(bookCategories);
    });

    // API: Getting the categories in the Homepage: END ********

    //Start: Sending book to collection

    app.post("/books", async (req, res) => {
      const bookSend = req.body;
      const result = await books.insertOne(bookSend);
      res.send(result);
    });

    //End: Sending book to collection

    //Get all the books
    //  app.get("/books", async (req, res) => {
    //    const query = {};
    //    const result = await books.find(query).toArray();
    //    res.send(result);
    //  });
    //Start: Get books posted by particular buyer
    app.get("/books", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await books.find(query).toArray();
      res.send(result);
    });

    //Start: Get Unsold books
    app.get("/books/unsold", async (req, res) => {
      const query = { sold: "Unsold" };
      const result = await books.find(query).limit(3).toArray();
      res.send(result);
    });
    //End: Get Unsold books

    //  Start: DELETE my book post
    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;
      console.log(`deleting ${id}`);
      const filter = { _id: ObjectId(id) };
      const result = await books.deleteOne(filter);
      res.send(result);
    });
    //  End: DELETE my book post

    //End: Get books posted by particular buyer

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
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    //ENd: API POST bookings

    //START: API GET bokkings
    app.get("/bookings", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      console.log("token", req.headers.authorization);
      const query = { email: email };

      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });
    //END: API GET bokkings

    // ****************END Bookings******** ***********

    // *****************START USRS*********************

    //START: API POST USER
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    //End: API POST USER

    //Start: Checking if the user is Admin or not
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
    //End: Checking if the user is Admin or not
    //Start: Checking if the user is seller or not
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "seller" });
    });
    //End: Checking if the user is seller or not
    //Start: Checking if the user is buyer or not
    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.role === "buyer" });
    });
    //End: Checking if the user is buyer or not

    //START: API GET user

    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    //END: API GET user

    // Start: DELETE users
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log(`deleting ${id}`);
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });
    // End: DELETE users

    // Start: MAKE ADMIN
    app.put("/users/admin/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin") {
        return res.status(403).send({ message: "Forbidden access" });
      }
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };

      const results = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(results);
    });

    // End: MAKE ADMIN

    // *****************End USRS***********************
  } finally {
  }
}
run().catch((error) => console.log(error));

// APIs END*******************************************

app.get("/", async (req, res) => {
  res.send("Book  server is running");
});

app.listen(port, () => console.log(`Book  running on ${port}`));
