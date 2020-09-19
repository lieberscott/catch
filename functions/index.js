const functions = require('firebase-functions');
const admin = require("firebase-admin");
const nodeMailer = require("nodemailer");
admin.initializeApp();


exports.deleteOldConvosAndRequests = functions.pubsub.schedule('0 12 1-31/2 * *')
.timeZone('America/New_York') // default is America/Los_Angeles
.onRun((context) => {
  console.log('This will be run every other day at Noon ET');
  
  const database = admin.firestore();
  let _24HoursAgo = new Date();
  _24HoursAgo.setHours(_24HoursAgo.getHours() - 24);

  // const deleteConvos = [];
  // let deleteUserChat = [];

  let promises = [];

  // Step 1: Get all conversations where last message is older than 24 hours
  database.collection("conversations")
  .where("lastMessageTime", "<", _24HoursAgo)
  .get()
  .then((oldConvos) => {
    oldConvos.forEach((doc) => {
      let d = doc.data();
      const conversationId = d.id;

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
    return database.collection("requests").where("createdAt", "<", _24HoursAgo).get();
  })
  .then((oldRequests) => {
    oldRequests.forEach((doc) => {
      let d = doc.data();
      const docId = d.id;

      // Step 5: Add a promise to delete the old request
      promises.push(database.collection("requests").doc(docId).delete());

    });

    // Step 6: Delete everything
    return Promise.all(promises);
  })
  .then(() => {
    console.log("Deleted conversations older than 24 hours and requests older than 24 hours at " + new Date());
    return res.send("deleted");
  })
  .catch((err) => {
    console.log("deleteOldConvosAndRequests error : ", err);
    return res.status(500).send("error");
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

  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to: process.env.GMAIL_ADDRESS,
    subject: "A User has reported another User",
    // text: req.body.text
    text: "Some text"
  };

  return transporter.sendMail(mailOptions)
  .then(() => {
    console.log("email sent");
    return res.send("email sent");
  })
  .catch((err) => {
    console.log("send Email error : ", err);
    return res.status(500).send("Error sending mail");
  });
});