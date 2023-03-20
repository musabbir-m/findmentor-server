const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// http *****//
const http = require("http");
const { Server } = require("socket.io");
// *****//
app.use(cors());
app.use(express.json());

//socket io operations start
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://findmentor-236d0.web.app",
  },
});
io.on("connection", (socket) => {
  console.log(`user connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  //  recieve and braodcast
  socket.on("send_message", (data) => {
    console.log(data);
    socket.to(data.room).emit("recieve_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

//** Socket operations Ends */

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@cluster0.z1jayhr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    //collections
    const userCollection = client.db("findmentor").collection("users");
    const mentoringCollection = client.db("findmentor").collection("mentoring");

    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
      console.log(result);
    });

    //post mentoring request by mentee
    app.post("/mentoring", async (req, res) => {
      const request = req.body;
      const result = await mentoringCollection.insertOne(request);
      res.send(result);
    });

    //get mentoring request for single mentors
    app.get("/mentoring/:email", async (req, res) => {
      const email = req.params.email;
      const query = { mentorEmail: email };
      const mentoring = await mentoringCollection.find(query).toArray();
      res.send(mentoring);
      console.log(mentoring + "mentoring looading");
    });

    //get my mentoring request
    app.get("/myrequest/:email", async (req, res) => {
      const email = req.params.email;
      const query = { menteeEmail: email };
      const myrequest = await mentoringCollection.find(query).toArray();
      res.send(myrequest);
      console.log(myrequest);
    });

    //get single mentee/mentor details
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const mentee = await userCollection.findOne(query);
      res.send(mentee);
    });

    //get categories of mentoring
    app.get("/webdevelopment", async (req, res) => {
      const query = { category: "Web Development" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/uxdesign", async (req, res) => {
      const query = { category: "Ux and Design" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/programming", async (req, res) => {
      const query = { category: "Programming" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
      console.log(result);
    });
    app.get("/productmarketing", async (req, res) => {
      const query = { category: "Product and Marketing" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    //check admin role

    app.get("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.type === "admin" });
    });

    //check mentor role
    app.get("/user/mentor/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isMentor: user?.type === "mentor" });
    });

    //check mentee role
    app.get("/user/mentee/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isMentee: user?.type === "mentee" });
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("findmentor server is running");
});

server.listen(port, () => {
  console.log(`server running on port ${port} `);
});
