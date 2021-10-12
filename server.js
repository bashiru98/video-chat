const express = require("express") 
const path =require("path") 
const twilio =require( "twilio")
const cors =require( "cors")
require('dotenv').config('dotenv')
const twilioAccountSid = process.env.twilioAccountSid
const twilioAuthToken = process.env.twilioAuthToken
const twilioApiKey = process.env.twilioApiKey
const twilioApiSecret = process.env.twilioApiSecret

const app = express()
app.use(cors())
app.use(express.static(path.join(__dirname,"build")));

app.use(express.json())
if (process.env.NODE_ENV === "production") {
  // Set static folder
  // app.use(express.static("build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname,"build", "index.html"));
  });
}
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname,"build","index.html"))
// })
app.get("/api/secure-token-xml",(req, res) => {
try {
    const AccessToken =  require("twilio").jwt.AccessToken

    const VideoGrant = AccessToken.VideoGrant;
    const videoGrant = new VideoGrant()

    const { identity } = req.query;
   
    //  create an accessToken and send to the client 

const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);
console.log("token",token)
token.addGrant(videoGrant);
token.identity = identity;
console.log("token before init", token)
   const accessToken = token.toJwt()
   console.log("accesstoken",accessToken)
    res.send({

    accessToken: accessToken
})


} catch (err) {
    console.log("error here",err)
}
    
})

app.get("/api/secure-token-xml/room-exists", (req, res) => {
    const { roomId } = req.query;

    console.log("room",roomId);

    const client = require("twilio")(twilioAccountSid, twilioAuthToken);
  
    client.video
      .rooms(roomId)
      .fetch()
      .then((room) => {
        if (room) {
          res.send({
            roomExists: true,
            room,
          });
        } else {
          res.status(200).json({
            roomExists: false,
          });
        }
      })
      .catch((err) => {
          console.log(err)
        res.send({
          roomExists: false,
          err,
        });
      });
  });
  
  
app.listen(process.env.PORT || 2000, () => {
    console.log("server running on port 2000")
})