const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require("mongodb").ObjectId;
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ad0jo.mongodb.net/?retryWrites=true&w=majority`
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    console.log("database connected with BUBT Projects");
    const database = client.db("BubtProjectFinal");
    const projectCollection = database.collection("projects");
    const myprojectsCollection = database.collection("myprojects");
    const userCollection = database.collection("users");
      const requestCollection = database.collection("reqestedproj");
      const studentCollection = database.collection("studentReq");


      //POST Request Project for students to supervisor
      app.post("/studentReq", async (req, res) => {
          const studentReq = req.body;
          const result = await studentCollection.insertOne(studentReq);
          res.json(result);
      });

      //GET Request Project for students supervisor
      app.get("/studentReq", async(req, res) => {
          const cursor = studentCollection.find({});
          const users = await cursor.toArray();
          res.send(users)
      });

      // Update Approved Request Project for students to supervisor
      app.put("/studentsreqapproval/:id", (req, res) => {
          const id = req.params.id;
          const updatedStatus = req.body.status;
          const filter = { _id: ObjectId(id) };
          studentCollection
              .updateOne(filter, {
                  $set: { bookedServiceStatus: updatedStatus },
              })
              .then((result) => {
                  res.send(result);
              });
      });


      //POST Request Project for students
      app.post("/reqproject", async (req, res) => {
          const reqproject = req.body;
          const result = await requestCollection.insertOne(reqproject);
          console.log(result);
          res.json(result);
      });

      //GET Request Project for students
      app.get("/reqproject", async(req, res) => {
          const cursor = requestCollection.find({});
          const users = await cursor.toArray();
          res.send(users)
      });

       //GET Request Project for single Item
       app.get("/reqproject/:id", async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const cursor = await requestCollection.findOne(query);
        res.send(cursor)
    });

      // Update Approved Request Project for students
      app.put("/requestapproval/:id", (req, res) => {
          const id = req.params.id;
          const updatedStatus = req.body.status;
          const filter = { _id: ObjectId(id) };
          requestCollection
              .updateOne(filter, {
                  $set: { bookedServiceStatus: updatedStatus },
              })
              .then((result) => {
                  res.send(result);
              });
      });

      //POST API to Project
    app.post("/projects", async (req, res) => {
     const project = req.body;
     console.log(project);
      const result = await projectCollection.insertOne(project);
      console.log(result);
      res.json(result);
    });


     //singleProduct by Email wise
     app.get("/singleProduct", async (req, res) => {
      let query = {};
      const email = req.query.email;
      if(email) {
        query = {userEmail: email};
      }
      
      const project =  projectCollection.find(query);
      const singleProduct = await project.toArray()
      res.json(singleProduct);
    });

    // GET API From Projects 
    app.get("/projects", async(req, res) => {
      const cursor = projectCollection.find({});
      const users = await cursor.toArray();
      res.send(users)
    });

     //singleProduct
     app.get("/projects/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const project = await projectCollection.findOne(query);
      res.json(project);
    });

    //delete watch from all
    app.delete("/projects/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const project = await projectCollection.deleteOne(query);
      res.json(project);
    });

   //    *****************
    //   ////////// USER **********
    //   *****************




     //POST API For Users
     app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
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

   //Make supervisor 
    app.put("/users/supervisor", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "supervisor" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
      {/*
    //supervisor Verfication
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isSupervisor = false;
      if (user?.role === "supervisor") {
        isSupervisor = true;
      }
      res.json({ supervisor: isSupervisor });
    });
   */}

    //Make Admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // Admin and supervisor Verfication
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      let isSupervisor = false;
      if (user?.role === "admin") {
        isAdmin = true;
          res.json({ admin: isAdmin });
      } else if (user?.role === "supervisor") {
          isSupervisor = true;
          res.json({ supervisor: isSupervisor });
      }

    });


      //    *****************
    //   ////////// Project  **********
    //   *****************

    //POST API For Project
    app.post("/allprojects", async (req, res) => {
      const project = req.body;
      const result = await myprojectsCollection.insertOne(project);
      res.json(result);
    });

    //GET All Project API
    app.get("/allprojects", async (req, res) => {
      const cursor = myprojectsCollection.find({});
      const project = await cursor.toArray();
      res.json(project);
    });

     //Update Approved
     app.put("/updateStatus/:id", (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body.status;
      const filter = { _id: ObjectId(id) };
      projectCollection
        .updateOne(filter, {
          $set: { bookedServiceStatus: updatedStatus },
        })
        .then((result) => {
          res.send(result);
        });
    });
    

     //Get My Orders by email
     app.get("/myprojects", async (req, res) => {
      let query = {};
      const email = req.query.email;
      if (email) {
        query = { userEmail: email };
      }
      const cursor = projectCollection.find(query);
      const project = await cursor.toArray();
      res.json(project);
    });

    //Delete My Orders
    app.delete("/myprojects/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Deleted Order", id);
      const query = { _id: ObjectId(id) };
      const result = await projectCollection.deleteOne(query);
      console.log("Deleted", result);
      res.json(result);
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



