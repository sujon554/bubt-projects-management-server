const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require("mongodb").ObjectId;
const app = express()
const port = process.env.PORT || 8080; 

app.use(cors());
app.use(express.json());




const uri = "mongodb+srv://bubtProject:U4RPSNUQinvqEPeR@cluster0.ad0jo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);


async function run() {
  try {
    await client.connect();
    console.log("database connected with BUBT Projects");
    const database = client.db("bubtProject");
    const projectCollection = database.collection("projects");
    const userCollection = database.collection("users");

    //POST API to Project
    app.post("/projects", async (req, res) => {
     const project = req.body;
     console.log(project);
      const result = await projectCollection.insertOne(project);
      console.log(result);
      res.json(result);
    });


    // GET API From Projects 
    app.get("/projects", async(req, res) => {
      const cursor = projectCollection.find({});
      const users = await cursor.toArray();
      res.send(users)
    });

   //    *****************
    //   ////////// USER **********
    //   *****************
     //POST API For Users
     app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    //Get Users API
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });

    //Upsert
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //Make Admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //Admin Verfication
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });


  } finally {
    // await client.close()
  }
}

run().catch(console.log.dir);

app.get("/", (req, res) => {
  res.send("Hello World here with bubt procets");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})



