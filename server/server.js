import express from 'express';
import dotenv from 'dotenv';
import { auth } from "express-openid-connect";
import cookieParser from 'cookie-parser';
import cors from "cors";
import connect from "./db/connect.js";
import asyncHandler from "express-async-handler";
import fs from "fs";

dotenv.config();
const app= express();

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended:true}));
app.use(cookieParser());
app.use(auth(config));

// function to check if your exists in db
const enusureUserInDB = asyncHandler(async (user) => {
  try {
    const existingUser = await User.findOne({ auth0Id: user.sub });

    if (!existingUser) {
      // create a new user document
      const newUser = new User({
        auth0Id: user.sub,
        email: user.email,
        name: user.name,
        role: "jobseeker",
        profilePicture: user.picture,
      });

      await newUser.save();

      console.log("User added to db", user);
    } else {
      console.log("User already exists in db", existingUser);
    }
  } catch (error) {
    console.log("Error checking or adding user to db", error.message);
  }
});
app.get("/", async (req, res) => {
  if (req.oidc.isAuthenticated()) {
    // check if Auth0 user exists in the db
    await enusureUserInDB(req.oidc.user);

    // redirect to the frontend
    return res.redirect(process.env.CLIENT_URL);
  } else {
    return res.send("Logged out");
  }
});

// routes
const routeFiles= fs.readdirSync("./routes");

routeFiles.forEach((file)=>{
    // import dynamic routes
    import(`./routes/${file}`).then((route) => {
        app.use("/api/v1/" , route.default);
    })
    .catch((error) => {
        console.log("Error importing route", error)
    })
})

const server = async ()=>{
    try {
        await connect();
        app.listen(process.env.PORT, () =>{
            console.log(`Server is running on port ${process.env.PORT}`);
});
} catch (error) {
        console.log("Server error", error.message);
        process.exit(1);
    }
}
server();


