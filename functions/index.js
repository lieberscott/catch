const functions = require('firebase-functions');
const admin = require("firebase-admin");
const nodeMailer = require("nodemailer");
admin.initializeApp();

require("dotenv").config();


exports.deleteOldConvosAndRequests = functions.pubsub.schedule('0 1 * * *')
.timeZone('America/New_York') // default is America/Los_Angeles
.onRun((context) => {
  
  const database = admin.firestore();
  let _72HoursAgo = new Date();
  _72HoursAgo.setHours(_72HoursAgo.getHours() - 72);
  console.log("_72HoursAgo : ", _72HoursAgo);

  // const deleteConvos = [];
  // let deleteUserChat = [];

  let promises = [];

  // Step 1: Get all conversations older than 72 hours
  database.collection("conversations")
  .where("lastMessageTime", "<", _72HoursAgo)
  .get()
  .then((oldConvos) => {
    oldConvos.forEach((doc) => {
      let d = doc.data();
      const conversationId = doc.id;

      // Step 2: Add a promise to delete the converssation from the conversations collection
      promises.push(database.collection("conversations").doc(conversationId).delete());

      for (let i = 0; i < d.userObjects.length; i++) {
        const userId = d.userObjects[i]._id;

        // Step 3: For each user involved in conversation, add a promise to delete that conversation from the user's userChats document
        promises.push(database.collection("userChats").doc(userId).update({
          [conversationId]: database.FieldValue.delete()
        }));
      }
    });

    // Step 4: Get old requests to delete as well
    return database.collection("requests").where("createdAt", "<", _72HoursAgo).get();
  })
  .then((oldRequests) => {
    oldRequests.forEach((doc) => {
      let d = doc.data();
      const docId = doc.id;

      // Step 5: Add a promise to delete the old request
      promises.push(database.collection("requests").doc(docId).delete());

    });

    // Step 6: Delete everything
    return Promise.all(promises);
  })
  .then(() => {
    console.log("Deleted conversations older than 72 hours and requests older than 72 hours at " + new Date());
    return true;
  })
  .catch((err) => {
    console.log("deleteOldConvosAndRequests error : ", err);
    return false;
  });

});


// Send email to yourself when a user "reports" another user
const transporter = nodeMailer.createTransport({
  // host: "smtp.gmail.com",
  // port: 465,
  service: "gmail",
  // secure: true,
  // auth: {
  //   type: "OAuth2",
  //   user: process.env.GMAIL_ADDRESS,
  //   serviceClient: process.env.CLIENT_ID,
  //   privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n")
  // }
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_PASS
  }
});

exports.sendEmail = functions.https.onRequest((req, res) => {

  const userInitiatingBlock = req.body.userInitiatingBlock;
  const userInitiatingBlockName = req.body.userInitiatingBlockName;
  const userBlockedArr = req.body.userBlockedArr;
  const messages = req.body.messages;


  let html = "<p>A user has blocked another user from a conversation</p>";
  html += "<p>userInitiatingBlock : " + userInitiatingBlock + "</p>";
  html += "<p>userInitiatingBlockName : " + userInitiatingBlockName + "</p>";
  html += "<p>Other Users : </p><p>";
  for (let i = 0; i < userBlockedArr.length; i++) {
    html += "<ul>"
    const keys = Object.keys(userBlockedArr[i]);
    for (let j = 0; j < keys.length; j++) {
      html += "<li>" + keys[j] + ": " + userBlockedArr[i][keys[j]] + "</li>";
    }
    html += "</ul>";
  }


  html += "</p><p>Conversation Messages : </p><p>";

  for (let k = 0; k < messages.length; k++) {
    html += "<ul><li>From Id : " + messages[k].user._id + "</li>";
    html += "<li>From Name : " + messages[k].user.name + "</li>";
    html += "<li>Message : " + messages[k].text + "</li></ul>"
  }

  html += "</p>";

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to: process.env.GMAIL_ADDRESS,
    subject: "User " + userInitiatingBlockName  + " has reported another User",
    // text: req.body.text
    html: html
  };

  transporter.sendMail(mailOptions, (err, responseObj) => {
    if (err) {
      console.log("send Email error : ", err);
      return res.status(500).send("Error sending mail");
    }
    else {
      console.log("email sent");
      return res.send("email sent");
    }
  });
});