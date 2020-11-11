import * as firebase from 'firebase';
import firestore from 'firebase/firestore';
import { GeoFirestore } from 'geofirestore';

import { getDistance } from './utils.js';

export const deleteAccount = async (userId) => {
  try {
    const res1 = await firebase.firestore().collection("users").doc(userId).delete();
    return true;
  }
  catch(e) {
    console.log("delete Account error : ", e);
    return false;
  }
}

export const addPushNotification = async (userId, notificationToken) => {
  try {
    const res1 = await firebase.firestore().collection("users").doc(userId).update({
      getsNotifications: true,
      notificationToken: notificationToken
    })
  }
  catch(e) {
    console.log("addPushNotification error : ", e);
  }
}

export const removeFromConversation = async (item, newArr, userObj) => {

  const user = firebase.auth().currentUser;
  const uid = user.uid;
  const itemId = item.id;

  try {
    // Step 1: Remove chat from user's userChats
    const res1 = await firebase.firestore().collection("userChats").doc(uid).update({
      [`${item.id}`]: firebase.firestore.FieldValue.delete()
    });

    // Step 2: If only other user in convo is other person, delete them from convo too and delete conversation entirely
    if (newArr.length < 1) {
      const res2 = await firebase.firestore().collection("userChats").doc(newArr[0].userId).update({
        [`${item.id}`]: firebase.firestore.FieldValue.delete()
      });

      const res3 = await firebase.firestore().collection("conversations").doc(item.id).delete();
    }

    // Step 3: Else, remove user from userChats array, and from conversation usersArray (actually they'll stay in conversation usersArray, too difficult to match a whole object to remove from an array in firestore)
    else {
      for (let i = 0; i < newArr.length; i++) {
        const res4 = await firebase.firestore().collection("userChats").doc(newArr[i].userId).update({
          [`${itemId}.usersArr`]: firebase.firestore.FieldValue.arrayRemove(userObj[0])
        });
      }
    }
    return true;
  }
  catch (e) {
    console.log("removeFromConversation error : ", e);
    return false;
  }
}

export const createConvo = async (user0, sport, loc, skillLevel) => {

  // loc should be an obj: { latitude: 41, longitude -87 }

  // Create a GeoFirestore reference
  const geofirestore = new GeoFirestore(firebase.firestore());
  const geocollection = geofirestore.collection('conversations');

  const user0Dob = user0.dateOfBirth.seconds ? new Date(user0.dateOfBirth.seconds * 1000) : new Date(user0.dateOfBirth);

  let newConvo = {
    coordinates: new firebase.firestore.GeoPoint(loc[0], loc[1]),
    createdAt: new Date(),
    messages: [],
    lastMessageTime: new Date(),
    activeSport: sport,
    skillLevel: skillLevel,
    userObjects: [
      {
        _id: user0._id,
        name: user0.name,
        dateOfBirth: user0Dob,
        gender: user0.gender,
        coordinates: user0.coordinates,
        sports: user0.sports,
        photo: user0.photo || "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F2020910%2Fblank_user.png?alt=media&token=45db0019-77b8-46ef-b4fb-c78a4749484c",
        getsNotifications: user0.getsNotifications,
        notificationToken: user0.notificationToken,
        profileText: user0.profileText ? user0.profileText : ""
      }
    ]
  }

  let userChat = {
    lastMessageCreatedAt: new Date(),
    lastMessageFromId: user0._id,
    lastMessageFromName: user0.name,
    lastMessageText: "Awaiting players...",
    coordinates: loc,
    readByReceiver: false,
    activeSport: sport,
    skillLevel: skillLevel,
    usersArr: [
      {
        userAvatar: user0.photo,
        userName: user0.name,
        userId: user0._id
      }
    ]
  }

  try {
    const docRef = await geocollection.add(newConvo);
    const docRefId = docRef.id;
    const res2 = await firebase.firestore().collection("userChats").doc(user0._id).set({
      [`${docRefId}`]: userChat
    }, { merge: true });
    return docRefId;
  }
  catch (e) {
    console.log("createConvo error : ", e);
    return false;
  }
}


export const joinConvo = async (user0, user1) => {

  const userObjects = user1.userObjects;
  let usersArr2 = [];

  // create the usersArr for the new user's userChat
  for (let i = 0; i < userObjects.length; i++) {
    const obj = {
      userAvatar: userObjects[i].photo,
      userName: userObjects[i].name,
      userId: userObjects[i]._id
    }
    usersArr2.push(obj);
  }

  const userObj1 = { // for userChats usersArr
    userAvatar: user0.photo,
    userName: user0.name,
    userId: user0._id
  }

  usersArr2.push(userObj1); // <- for new user (me), userChat's usersArr is now ready

  const userObj2 = { // for userObjects array in conversation
    _id: user0._id,
    coordinates: user0.coordinates,
    dateOfBirth: user0.dateOfBirth,
    gender: user0.gender,
    getsNotifications: user0.getsNotifications,
    name: user0.name,
    notificationToken: user0.notificationToken,
    photo: user0.photo,
    profileText: user0.profileText ? user0.profileText : "",
    sports: user0.sports
  }

  const userChat = {
    chatId: user1.id,
    lastMessageCreatedAt: new Date(),
    lastMessageFromId: user0._id,
    lastMessageFromName: user0.name,
    lastMessageText: "You joined the conversation. Say hi!",
    readByReceiver: false,
    usersArr: usersArr2, // <-- here is where usersArr2 is used, all that code above for just one little value in the userChat object
    activeSport: user1.activeSport,
    skillLevel: user1.skillLevel,
    coordinates: user1.coordinates
  }

  try {

    // First check if the document still exists. Since areaConversations are not on a listener, it could have been deleted but still be on another user's screen.
    const res0 = await firebase.firestore().collection("conversations").doc(user1.id).get();

    if (!res0.exists) {
      return false;
    }
    else {

      // Step 2: Add userChat to new user (user0)
      const res1 = await firebase.firestore().collection("userChats").doc(user0._id).set({
        [`${user1.id}`]: userChat
      }, { merge: true });


      // Step 3: Update usersArr for existing users in chat
      for (let i = 0; i < userObjects.length; i++) {
        const res2 = await firebase.firestore().collection("userChats").doc(userObjects[i]._id).update({
          [`${user1.id}.usersArr`]: firebase.firestore.FieldValue.arrayUnion(userObj1),
          [`${user1.id}.lastMessageText`]: user0.name + " has joined",
          [`${user1.id}.lastMessageCreatedAt`]: new Date(),
          [`${user1.id}.readByReceiver`]: false,
          [`${user1.id}.lastMessageFromName`]: user0.name,
          [`${user1.id}.lastMessageFromId`]: user0._id
        });
      }

      // Step 4: Update userObjects array for the conversation
      const res3 = await firebase.firestore().collection("conversations").doc(user1.id).update({
        userObjects: firebase.firestore.FieldValue.arrayUnion(userObj2)
      });

      return user1.id;
    }
  }
  catch (e) {
    console.log("accept requests convo error : ", e);
    return false;
  }
}

export const updateUser = async (update, userId, userLoc) => {

  // const firestore = firebase.firestore();

  const geofirestore = new GeoFirestore(firebase.firestore());
  const geocollection = geofirestore.collection('users');

  let update2 = update;

  if (userLoc) {
    update2.coordinates = new firebase.firestore.GeoPoint(userLoc[0], userLoc[1])
  }

  try {
    const res = await geocollection.doc(userId).update(update2);
    return true;
  }
  catch (e) {
    console.log("update user error : ", e);
    return false;
  }
}

export const signOut = () => {
  firebase.auth().signOut();
}

export const uploadImage = async (blob, name, prevUrl) => {
  // get today's date to upload image to that folder
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const date = d.getDate();
  const today = "" + year + month + date; // 20200831

  const upload = firebase.storage().ref().child("images/" + today + "/" + name);
  try {
    const snap = await upload.put(blob);
    const downloadURL = await snap.ref.getDownloadURL();

    // if replacing a photo, delete previous photo (only WON'T be used during initial onboarding)
    if (prevUrl) {
      const deleteRef = firebase.storage().refFromURL(prevUrl);
      await deleteRef.delete();
    }

    return downloadURL;
  }
  catch (e) {
    console.log("uploadImage error : ", e);
    return false;
  }
}

export const loginUser = async (credential) => {
  try {
    const result = await firebase.auth().signInWithCredential(credential);
    
    if (result.additionalUserInfo.isNewUser) {
      const res = await firebase.firestore().collection("users").doc(result.user.uid).set({
      // const res = await firebase.database().ref("users/" + result.user.uid).set({
        _id: result.user.uid,
        createdAt: new Date(),
        onboardingDone: false,
        available: false,
        getsNotifications: true,
        notificationToken: "-1",
        active: true,
        timeOfActivation: new Date(0)
      })

    }
    return true;
  }
  catch(err) {
    console.log("loginUser error : ", err);
    // firebase.auth().signOut();
    return false;
  }
}

export const getAuthUser = async () => {
  const user = firebase.auth().currentUser;
  return user.uid;
}

export const reauthenticateUser = async () => {
  const user = firebase.auth().currentUser;
  const credentials = firebase.auth.EmailAuthProvider.credential('puf@firebaseui.com', 'firebase');

}

export const getDbUser = async (uid) => {
  try {
    const document = await firebase.firestore().collection("users").doc(uid).get();
    const user = document.data();
    return user;
  }
  catch (e) {
    console.log("error in getDbUser : ", e);
  }
}

export const getAreaUsersAndConversations = async (userId, userLoc) => {

  let areaConversations0 = [];

  // Create a GeoFirestore reference
  const geofirestore = new GeoFirestore(firebase.firestore());

  // Create a GeoCollection reference
  const geocollection = geofirestore.collection('conversations');

  try {
    // get areaConversations - not a listener, just a get
    const docs = await geocollection.near({
      center: new firebase.firestore.GeoPoint(userLoc.latitude, userLoc.longitude),
      radius: 32 // km converts to 20 miles
    }).get();

    // slice out all the conversations involving user (since they will be in userChats)
    docs.forEach((doc) => {
      let d = doc.data();
      d.id = doc.id;

      // area conversations - only push if conversation does not include user
      if (d.userObjects.findIndex((item, i) => item._id === userId) === -1) {
        areaConversations0.push(d);
      }
    });

    // calculate distance for areaConversations
    const areaConversations1 = areaConversations0.map((item) => {
      const distance0 = getDistance(userLoc, item.coordinates);
      const distance = Math.round(distance0 * 10) / 10;

      item.distance = distance;
      return item;
    });

    // sort conversations by distance
    areaConversations1.sort((a, b) => a.distance - b.distance);


    return areaConversations1;
  }
  catch (e) {
    console.log("geofirestore error : ", e);
    return [[], []];
  }
}

export const getUserChatsAndRequests = async (userId) => { // NOTE: Removed requests 11/6/20
  try {
    const document = await firebase.firestore().collection("userChats").doc(userId).get();
    const chats = document.data();
    let chatArray = [];

    Object.keys(chats).forEach((key) => {
      chats[key].id = key;
      chatArray.push(chats[key]);
    });

    return chatArray;
  }
  catch (e) {
    console.log("error in getUserChatsAndRequests : ", e);
    return false;
  }

}



export const sendMessage = async (chatId, message, userChatUpdate, usersArr) => {

  try {
    // Add message to convo messagesArr
    const res = await firebase.firestore().collection("conversations").doc(chatId).update({ messages: firebase.firestore.FieldValue.arrayUnion(message), lastMessageTime: new Date() });
  
    // update all userChats arr (would be more than 2 if there is a group chat)
    for (let i = 0; i < usersArr.length; i++) {
      const res2 = await firebase.firestore().collection("userChats").doc(item.userId).update({
        [`${chatId}.lastMessageCreatedAt`]: new Date(),
        [`${chatId}.lastMessageFromId`]: userChatUpdate.lastMessageFromId,
        [`${chatId}.lastMessageFromName`]: userChatUpdate.lastMessageFromName,
        [`${chatId}.lastMessageText`]: userChatUpdate.lastMessageText,
        [`${chatId}.readByReceiver`]: false
      })
    }

    return true;
  }

  catch(e) {
    console.log("sendMessage error : ", e);
    return false;
  }
}

export const sendMessageAndOverwrite = async (chatId, newMessagesArr, userChatUpdate, usersArr) => {

  try {
    // Overwrite messagesArr to in convo
    const res = await firebase.firestore().collection("conversations").doc(chatId).update({ messages: newMessagesArr, lastMessageTime: new Date() });
  
    // update all userChats arr (would be more than 2 if there is a group chat)
    for (let i = 0; i < usersArr.length; i++) {
      const res2 = await firebase.firestore().collection("userChats").doc(item.userId).update({
        [`${chatId}.lastMessageCreatedAt`]: new Date(),
        [`${chatId}.lastMessageFromId`]: userChatUpdate.lastMessageFromId,
        [`${chatId}.lastMessageFromName`]: userChatUpdate.lastMessageFromName,
        [`${chatId}.lastMessageText`]: userChatUpdate.lastMessageText,
        [`${chatId}.readByReceiver`]: false
      })
    }

    return true;
  }

  catch(e) {
    console.log("sendMessage error : ", e);
    return false;
  }
}


export const blockUser = async (user0, user1) => {

  const userInitiatingBlock = user0._id;
  const userInitiatingBlockName = user0.name;
  const userBlocked = user1._id;


  const userObj0 = {
    userAvatar: user0.photo,
    userName: user0.name,
    userId: user0._id
  }

  const userObj1 = {
    userAvatar: user1.photo,
    userName: user1.name,
    userId: user1._id
  }

  try {

    const res1 = await firebase.firestore().collection("users").doc(user0._id).update({
      blockedUsers: firebase.firestore.FieldValue.arrayUnion(userObj1)
    })
  
    const res2 = await firebase.firestore().collection("users").doc(user1._id).update({
      blockedUsers: firebase.firestore.FieldValue.arrayUnion(userObj0)
    });

    
    fetch("https://us-central1-catchr-f539d.cloudfunctions.net/sendEmail", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({ userInitiatingBlock, userInitiatingBlockName, userBlockedArr: [userBlocked], messages: [] })
    });
    return true;
  }
  catch(e) {
    console.log("block User error : ", e);
    return false;
  }


}


export const deleteUser = async (photoUrl) => {
  const user = firebase.auth().currentUser;

  try {
    const res1 = await firebase.firestore().collection("users").doc(user.uid).delete();
    if (photoUrl) {
      const deleteRef = firebase.storage().refFromURL(photoUrl);
      await deleteRef.delete();
    }
    const res2 = await user.delete();
    return true;
  }
  catch (e) {
    console.log("delete User error : ", e);
    return false;
  }
}

export const deleteConvo = async (convoId) => { // deletes in Conversation.jsx if userChats usersArr is only === 1 when the user removes him/herself from it, (so there's no one left in the chat)
  try {
    const res = await firebase.firestore().collection("conversations").doc(convoId).delete();
    return true;
  }
  catch(e) {
    console.log("deleteConvo error : ", e);
    return false;
  }
}

// export const createConvos = async () => { // not for production, only for testing
//   const firestore = firebase.firestore();

//   // Create a GeoFirestore reference
//   const geofirestore = new GeoFirestore(firebase.firestore());
//   const geocollection = geofirestore.collection('conversations');
//   const geocollection2 = geofirestore.collection("users");


//   let newConvo = {
//     activeSport: 1,
//     coordinates: new firebase.firestore.GeoPoint(41.88656118753228, -87.63254075498391),
//     createdAt: new Date(),
//     messages: [
//       {
//         _id: "someMessageId",
//         createdAt: Date.now(),
//         text: "Hey, what's up?",
//         user: {
//           _id: "myUserId1",
//           avatar: "https://randomuser.me/api/portraits/men/1.jpg",
//           name: "Bort"
//         }
//       },
//       {
//         _id: "someMessageId2",
//         createdAt: Date.now(),
//         text: "Meh, not much",
//         user: {
//           _id: "myUserId2",
//           avatar: "https://randomuser.me/api/portraits/men/2.jpg",
//           name: "Chiamaka"
//         }
//       }
//     ],
//     userObjects: [
//       {
//         _id: "myUserId1",
//         coordinates: { latitude: 41.88116118753228, longitude: -87.63054075498391 },
//         dateOfBirth: new Date(1993, 2, 3),
//         gender: false,
//         getsNotifications: true,
//         name: "Bort",
//         notificationToken: "-1",
//         photo: "https://randomuser.me/api/portraits/men/1.jpg",
//         profileText: "I am just a user",
//         sports: { Baseball: { interested: true, skill_level: "Played Little League" }, Football: { interested: true, skill_level: "Can throw a pretty good spiral" }, Frisbee: { interested: false, skill_level: "" }, Basketball: { interested: true, skill_level: "Played HS ball" } },
//       },
//       {
//         _id: "myUserId2",
//         coordinates: { latitude: 41.88316118753228, longitude: -87.63454075498391 },
//         dateOfBirth: new Date(1993, 2, 3),
//         gender: false,
//         getsNotifications: true,
//         name: "Chiamaka",
//         notificationToken: "-1",
//         photo: "https://randomuser.me/api/portraits/men/2.jpg",
//         profileText: "I am just a second user",
//         sports: { Baseball: { interested: true, skill_level: "Played Little League" }, Football: { interested: true, skill_level: "Can throw a pretty good spiral" }, Frisbee: { interested: true, skill_level: "Play in a league" }, Basketball: { interested: true, skill_level: "Played HS ball" } },
//       },
//       {
//         _id: "myUserId3",
//         coordinates: { latitude: 41.88316118753228, longitude: -87.63454075498391 },
//         dateOfBirth: new Date(1993, 2, 3),
//         gender: false,
//         getsNotifications: true,
//         name: "Durango",
//         notificationToken: "-1",
//         photo: "https://randomuser.me/api/portraits/men/3.jpg",
//         profileText: "I am just a third user",
//         sports: { Baseball: { interested: false, skill_level: "" }, Football: { interested: true, skill_level: "Can throw a pretty good spiral" }, Frisbee: { interested: true, skill_level: "Play in a league" }, Basketball: { interested: true, skill_level: "Played HS ball" } },
//       }
//     ],
//     timeOfActivation: new Date(2020, 9, 24)
//   };
  

//   let userChat = {
//     activeSport: 1,
//     lastMessageCreatedAt: new Date(),
//     lastMessageFromId: "myUserId2",
//     lastMessageFromname: "Chiamaka",
//     lastMessageText: "Meh, not much",
//     readByReceiver: false,
//     usersArr: [
//       {
//         userAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
//         userName: "Bort",
//         userId: "myUserId1"
//       },
//       {
//         userAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
//         userName: "Chiamaka",
//         userId: "myUserId2"
//       },
//       {
//         userAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
//         userName: "Durango",
//         userId: "myUserId3"
//       }
//     ]
//   }

//   let req = {
//     _id: "myUserId1",
//     activeSport: 1,
//     createdAt: new Date(),
//     dateOfBirth: new Date(1993, 2, 3),
//     gender: 0,
//     getsNotifications: true,
//     coordinates: new firebase.firestore.GeoPoint(41.88116118753228, -87.63054075498391),
//     name: "Bort",
//     notificationToken: "-1",
//     profileText: "Juset a user",
//     photo: "https://randomuser.me/api/portraits/men/1.jpg",
//     sports: { Football: { interested: true, skill_level: "Can throw a spiral" }, Baseball: { interested: true, skill_level: "Played Little League" }, Frisbee: { interested: false, skill_level: "" }, Basketball: { interested: true, skill_level: "Played HS ball" } },
//     toId: "WU4oKhuwuyLm7chqSysSkfH5Iwy2"
//   }

//   req.existingConversation = false;
//   req.conversationId = false;

//   try {
//     const pers1 = await geocollection2.add({
//       _id: "myUserId1",
//       active: true,
//       activeSport: 1,
//       available: true,
//       coordinates: new firebase.firestore.GeoPoint(41.88116118753228, -87.63054075498391),
//       createdAt: new Date(2020, 1, 1),
//       dateOfBirth: new Date(1993, 2, 3),
//       gender: false,
//       getsNotifications: true,
//       name: "Bort",
//       notificationToken: "-1",
//       onboardingDone: false,
//       photo: "https://randomuser.me/api/portraits/men/1.jpg",
//       profileText: "Just a user",
//       sports: {
//         Baseball: {
//           interested: true,
//           skill_level: "Played Little League"
//         },
//         Football: {
//           interested: true,
//           skill_level: "Can throw a pretty good spiral"
//         },
//         Frisbee: {
//           interested: false,
//           skill_level: ""
//         },
//         Basketball: {
//           interested: true,
//           skill_level: "Played HS ball"
//         }
//       },
//       timeOfActivation: new Date(2020, 9, 25)
//     });
  
//     const pers2 = await geocollection2.add({
//       _id: "myUserId2",
//       active: true,
//       activeSport: 1,
//       available: true,
//       coordinates: new firebase.firestore.GeoPoint(41.88216118753228, -87.63154075498391),
//       createdAt: new Date(2020, 1, 1),
//       dateOfBirth: new Date(1993, 2, 3),
//       gender: false,
//       getsNotifications: true,
//       name: "Chiamaka",
//       notificationToken: "-1",
//       onboardingDone: false,
//       photo: "https://randomuser.me/api/portraits/men/2.jpg",
//       profileText: "Just a second user",
//       sports: {
//         Baseball: {
//           interested: true,
//           skill_level: "Played Little League"
//         },
//         Football: {
//           interested: true,
//           skill_level: "Can throw a pretty good spiral"
//         },
//         Frisbee: {
//           interested: true,
//           skill_level: "Play in a league"
//         },
//         Basketball: {
//           interested: true,
//           skill_level: "Played HS ball"
//         }
//       },
//       timeOfActivation: new Date(2020, 9, 25)
//     });
  
//     const pers3 = await geocollection2.add({
//       _id: "myUserId3",
//       active: true,
//       activeSport: 1,
//       available: true,
//       coordinates: new firebase.firestore.GeoPoint(41.88316118753228, -87.63454075498391),
//       createdAt: new Date(2020, 1, 1),
//       dateOfBirth: new Date(1993, 2, 3),
//       gender: false,
//       getsNotifications: true,
//       name: "Durango",
//       notificationToken: "-1",
//       onboardingDone: false,
//       photo: "https://randomuser.me/api/portraits/men/3.jpg",
//       profileText: "Just a third user",
//       sports: {
//         Baseball: {
//           interested: false,
//           skill_level: ""
//         },
//         Football: {
//           interested: true,
//           skill_level: "Can throw a pretty good spiral"
//         },
//         Frisbee: {
//           interested: true,
//           skill_level: "Play in a league"
//         },
//         Basketball: {
//           interested: true,
//           skill_level: "Played HS ball"
//         }
//       },
//       timeOfActivation: new Date(2020, 9, 25)
//     });

//     const res0 = await firebase.firestore().collection("requests").add(req);
//     const res = await geocollection.add(newConvo);
//     const docId = res.id;


//     userChat.chatId = docId;
//     // console.log("res : ", res);
//     // console.log("res2 : ", res2);
//     const res6 = await firebase.firestore().collection("userChats").doc("userId1").set({
//       [`${docId4}`]: userChat
//     }, { merge: true });
//     const res7 = await firebase.firestore().collection("userChats").doc("userId2").set({
//       [`${docId5}`]: userChat
//     }, { merge: true });
//     const res8 = await firebase.firestore().collection("userChats").doc("userId3").set({
//       [`${docId5}`]: userChat
//     }, { merge: true });
//   }

//   catch (e) {
//     console.log("createConvos error : ", e);
//   }
// }