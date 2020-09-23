import * as firebase from 'firebase';
import firestore from 'firebase/firestore';
import { GeoFirestore } from 'geofirestore';
// import firebase from 'firebase/app';
// import 'firebase/storage';

import { getDistance } from './utils.js';

export const deleteAccount = async (userId) => {
  try {
    await firebase.firestore().collection("users").doc(userId).delete();
    return true;
  }
  catch(e) {
    console.log("delete Account error : ", e);
    return false;
  }
}

export const addPushNotification = async (userId, notificationToken) => {
  try {
    firebase.firestore().collection("users").doc(userId).update({
      getsNotifications: true,
      notificationToken: notificationToken
    })
  }
  catch(e) {
    console.log("addPushNotification error : ", e);
  }
}

export const removeFromConversation = async (item, newArr) => {

  const promises = item.usersArr.map((item, i) => {
    return firebase.firestore().collection("userChats").doc(item.userId).update({ usersArr: newArr })
  });

  try {
    // Step 1: remove user from conversation in firebase
    const res1 = await Promise.all(promises);

    // Step 2: remove conversation locally from array
  }
  catch (e) {
    console.log("removeFromConversation error : ", e);
  }
}

export const acceptRequestUser = async (user0, user1) => {
  const firestore = firebase.firestore();

  // Create a GeoFirestore reference
  const GeoFirestore = geofirestore.initializeApp(firestore);
  const geocollection = GeoFirestore.collection('conversations');

  const user0Dob = user0.date_of_birth.seconds ? new Date(user0.date_of_birth.seconds * 1000) : new Date(user0.date_of_birth);
  const user1Dob = user1.date_of_birth.seconds ? new Date(user1.date_of_birth.seconds * 1000) : new Date(user1.date_of_birth);

  let newConvo = {
    coordinates: new firebase.firestore.GeoPoint(user0.coordinates.latitude, user0.coordinates.longitude),
    createdAt: new Date(),
    messages: [],
    lastMessageTime: new Date(),
    userObjects: [
      {
        _id: user0._id,
        name: user0.name,
        date_of_birth: user0Dob,
        gender: user0.gender,
        coordinates: user0.coordinates,
        sports: user0.sports,
        photo: user0.photo || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png",
        getsNotifications: user0.getsNotifications,
        notificationToken: user0.notificationToken,
        profileText: user0.profileText
      },
      {
        _id: user1._id,
        name: user1.name,
        date_of_birth: user1Dob,
        gender: user1.gender,
        coordinates: user1.coordinates,
        sports: user1.sports,
        photo: user1.photo || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png",
        getsNotifications: user1.getsNotifications,
        notificationToken: user1.notificationToken,
        profileText: user1.profileText
      }
    ]
  }

  try {
    const res1 = await firebase.firestore().collection("requests").doc(user1.id).delete();
    const docRef = await geocollection.add(newConvo);
    return docRef.id;
  }
  catch (e) {
    return false;
  }
}


// export const acceptRequest = async (user0, user1) => {
//   const firestore = firebase.firestore();

//   // Create a GeoFirestore reference
//   const GeoFirestore = geofirestore.initializeApp(firestore);
//   const geocollection = GeoFirestore.collection('conversations');

//   const user0Dob = user0.date_of_birth.seconds ? new Date(user0.date_of_birth.seconds * 1000) : new Date(user0.date_of_birth);
//   const user1Dob = user1.date_of_birth.seconds ? new Date(user1.date_of_birth.seconds * 1000) : new Date(user1.date_of_birth);

//   let newConvo = {
//     coordinates: new firebase.firestore.GeoPoint(user0.coordinates.latitude, user0.coordinates.longitude),
//     createdAt: new Date(),
//     messages: [],
//     userObjects: [
//       {
//         _id: user0._id,
//         name: user0.name,
//         date_of_birth: user0Dob,
//         gender: user0.gender,
//         coordinates: user0.coordinates,
//         sports: user0.sports,
//         photo: user0.photo || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png",
//         getsNotifications: user0.getsNotifications,
//         notificationToken: user0.notificationToken,
//         profileText: user0.profileText
//       },
//       {
//         _id: user1._id,
//         name: user1.name,
//         date_of_birth: user1Dob,
//         gender: user1.gender,
//         coordinates: user1.coordinates,
//         sports: user1.sports,
//         photo: user1.photo || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png",
//         getsNotifications: user1.getsNotifications,
//         notificationToken: user1.notificationToken,
//         profileText: user1.profileText
//       }
//     ]
//   }

//   try {
//     const res1 = await firebase.firestore().collection("requests").doc(user1.id).delete();
//     const docRef = await geocollection.add(newConvo);
//     return docRef.id;
//   }
//   catch (e) {
//     return false;
//   }
// }

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
    console.log("downloadUrl : ", downloadURL);

    // if replacing a photo, delete previous photo (only WON'T be used during initial onboarding)
    if (prevUrl) {
      console.log("prevUrl : ", prevUrl);
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

// export { storage as default };

export const loginUser = async (credential) => {
  try {
    const result = await firebase.auth().signInWithCredential(credential);
    console.log("user signed in");
    
    if (result.additionalUserInfo.isNewUser) {
      console.log("isNewUser");
      const res = firebase.firestore().collection("users").doc(result.user.uid).set({
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

      console.log("res after setting new user in firebase.js : ", res);
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
  const userRes = firebase.auth().currentUser;
  console.log("userRes.uid in firebase.js");
  return userRes.uid;
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

  let areaUsers0 = [];
  let areaConversations0 = [];


  const firestore = firebase.firestore();

  // Create a GeoFirestore reference
  const geofirestore = new GeoFirestore(firebase.firestore());

  // Create a GeoCollection reference
  const geocollection = geofirestore.collection('conversations');
  const geocollection2 = geofirestore.collection("users");

  try {
    // get areaConversations - not a listener, just a get
    const docs = await geocollection.near({
      center: new firebase.firestore.GeoPoint(userLoc.latitude, userLoc.longitude),
      radius: 3200 // km converts to 20 miles
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

    let sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

    const docs2 = await geocollection2.near({
      center: new firebase.firestore.GeoPoint(41.1, -87.9),
      radius: 3200 // km converts to 20 miles
    })
    .get();

    docs2.forEach((doc) => {
      let d = doc.data();
      // _id is already a part of the object, so we are commenting out the below
      // d._id = doc.id;
      let notYetAConvo = true;
      // if an area user already has a conversation going, filter them out (make user request a join to the existing coversation)
      for (let i = 0; i < areaConversations0.length; i++) {
        if (areaConversations0[i].userObjects[0]._id === d._id) {
          notYetAConvo = false;
        }
      }
      if (notYetAConvo) {
        areaUsers0.push(d);
      }
    });

    // filter out users who aren't active
    const areaUsers1 = areaUsers0.filter((item, i) => {
      const timeOfActivation = item.timeOfActivation.seconds ? new Date(item.timeOfActivation.seconds * 1000) : new Date(item.timeOfActivation);
      
      console.log("i : ", i);
      console.log("timeOfActivation : ", timeOfActivation);
      console.log("timeOfActivation > sixHoursAgo : ", timeOfActivation > sixHoursAgo);
      if (item.active && new Date(timeOfActivation) > new Date(sixHoursAgo)) {
        return true;
      }
      else {
        return false;
      }
    });

    // calculate distance for users
    const areaUsers2 = areaUsers1.map((item, i) => {
      const distance0 = getDistance(userLoc, item.coordinates);
      const distance = Math.round(distance0 * 10) / 10;

      item.distance = distance;
      return item;
    })

    // sort users by distance
    areaUsers2.sort((a, b) => a.distance - b.distance);

    return [areaUsers2, areaConversations1];
  }
  catch (e) {
    console.log("geofirestore error : ", e);
    return [[], []];
  }
}

export const declineRequest = async (itemId) => {
  try {
    const res = await firebase.firestore().collection("requests").doc(itemId).delete();
    return res.status === 200 ? true : false;
  }
  catch (e) {
    console.log("delete error : ", e);
    return false;
  }
}


export const sendRequest = async (user, item) => {
  
  let req = {
    _id: user._id,
    createdAt: new Date(),
    date_of_birth: user.date_of_birth.seconds ? new Date(user.date_of_birth.seconds * 1000) : new Date(user.date_of_birth),
    gender: user.gender,
    getsNotifications: user.getsNotifications,
    coordinates: new firebase.firestore.GeoPoint(user.coordinates.latitude, user.coordinates.longitude),
    name: user.name,
    notificationToken: user.notificationToken,
    profileText: user.profileText,
    photo: user.photo,
    sports: user.sports,
    toId: item._id,
  }

  if (item.id) { // this means the item is an existing conversation rather than just a user
    req.existingConversation = true;
    req.conversationId = item.id;
  }
  else {
    req.existingConversation = false;
    req.conversationId = false;
  }

  try {
    await firebase.firestore().collection("requests").add(req);
    return true;
  }
  catch(e) {
    console.log("sendRequest error : ", e);
    return false;
  }
}


export const sendMessage = async (chatId, message, userChatUpdate, usersArr) => {
  // set up updates to all userChats arr (would be more than 2 if there is a group chat)
  const promises = usersArr.map((item, i) => {
    return firebase.firestore().collection("userChats").doc(item._id).update({ [`${chatId}`]: userChatUpdate })
  })

  try {
    // Add message to convo messagesArr
    const res = await firebase.firestore().collection("conversations").doc(chatId).update({ messages: firebase.firestore.FieldValue.arrayUnion(message), lastMessageTime: new Date() });
  
    // Add message to BOTH (ALL?) userChats arrs
    const res2 = await Promise.all(promises);

    return true;
  }

  catch(e) {
    console.log("sendMessage error : ", e);
    return false;
  }
}



export const createConvos = async () => { // not for production, only for testing
  const firestore = firebase.firestore();

  // Create a GeoFirestore reference
  const geofirestore = new GeoFirestore(firebase.firestore());
  const geocollection = geofirestore.collection('conversations');
  const geocollection2 = geofirestore.collection("users");

  let newConvo = {
    coordinates: new firebase.firestore.GeoPoint(41.88043118753208, -87.63034075498381),
    createdAt: new Date(),
    messages: [
      {
        _id: "someId",
        createdAt: new Date(2020, 7, 9),
        text: "Yo",
        user: {
          _id: "userId",
          avatar: "https://randomuser.me/api/portraits/men/65.jpg",
          name: "Zach"
        }
      },
      {
        _id: "someId2",
        createdAt: new Date(2020, 8, 9),
        text: "Yo to you",
        user: {
          _id: "01P4eORz41OmDL4HxHHegnrAIYu1",
          avatar: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
          name: "Scott"
        }
      }
    ],
    userObjects: [
      {
        _id: "userId",
        name: "Zach",
        date_of_birth: new Date(1993, 1, 1),
        gender: false,
        coordinates: { latitude: 41.88043118753208, longitude: -87.63034075498381 },
        sports: { Football: { interested: true, skill_level: "Can throw a spiral" }, Baseball: { interested: true, skill_level: "Played Little League" }, Frisbee: { interested: true, skill_level: "Absolute beginner" }},
        photo: "https://randomuser.me/api/portraits/men/65.jpg",
        getsNotifications: true,
        notificationToken: "token1",
        profileText: "This is my profile"
      },
      {
        _id: "01P4eORz41OmDL4HxHHegnrAIYu1",
        name: "Scott",
        date_of_birth: new Date(1984, 3, 25),
        gender: 0,
        coordinates: { latitude: 41.88043118753208, longitude: -87.63034075498481 },
        sports: { Football: { interested: true, skill_level: "Can throw a spiral" }, Baseball: { interested: true, skill_level: "Played Little League" }, Frisbee: { interested: true, skill_level: "Absolute beginner" }},
        photo: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
        getsNotifications: true,
        notificationToken: "token",
        profileText: "Looking to play baseball catch"
      }
    ]
  };
  let newConvo2 = {
    coordinates: new firebase.firestore.GeoPoint(41.88043118753218, -87.63034075498381),
    createdAt: new Date(),
    messages: [
      {
        _id: "someId2",
        createdAt: new Date(2020, 8, 9),
        text: "Now I'm initiating the convo",
        user: {
          _id: "01P4eORz41OmDL4HxHHegnrAIYu1",
          avatar: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
          name: "Scott"
        }
      },
      {
        _id: "someId3",
        createdAt: new Date(2020, 7, 9),
        text: "Cool bro",
        user: {
          _id: "userId2",
          avatar: "https://randomuser.me/api/portraits/men/66.jpg",
          name: "Yoni"
        }
      }
    ],
    userObjects: [
      {
        _id: "01P4eORz41OmDL4HxHHegnrAIYu1",
        name: "Scott",
        date_of_birth: new Date(1984, 3, 25),
        gender: 0,
        coordinates: { latitude: 41.88043118753218, longitude: -87.63034075498481 },
        sports: { Football: { interested: true, skill_level: "Can throw a spiral" }, Baseball: { interested: true, skill_level: "Played Little League" }, Frisbee: { interested: true, skill_level: "Absolute beginner" }},
        photo: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
        getsNotifications: true,
        notificationToken: "token",
        profileText: "Looking to play baseball catch"
      },
      {
        _id: "userId2",
        name: "Yoni",
        date_of_birth: new Date(1993, 1, 1),
        gender: false,
        coordinates: { latitude: 41.88043118753208, longitude: -87.63034075498381 },
        sports: { Football: { interested: true, skill_level: "Can throw a spiral" }, Baseball: { interested: true, skill_level: "Played Little League" }, Frisbee: { interested: true, skill_level: "Absolute beginner" }},
        photo: "https://randomuser.me/api/portraits/men/66.jpg",
        getsNotifications: true,
        notificationToken: "token2",
        profileText: "This is my profile again as Yoni"
      }
    ]
  }
  let userChat = {
    lastMessageCreatedAt: new Date(2020, 7, 9),
    lastMessageFromId: "01P4eORz41OmDL4HxHHegnrAIYu1",
    lastMessageFromname: "Scott",
    lastMessageText: "We're meeting at the old playground near the Stevens place",
    readByReceiver: false,
    usersArr: [
      {
        userAvatar: "https://randomuser.me/api/portraits/men/65.jpg",
        userName: "Zach",
        userId: "userId"
      },
      {
        userAvatar: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
        userName: "Scott",
        userId: "01P4eORz41OmDL4HxHHegnrAIYu1"
      }
    ]
  }

  let userChat2 = {
    lastMessageCreatedAt: new Date(2020, 7, 9),
    lastMessageFromId: "userId2",
    lastMessageFromname: "Yoni",
    lastMessageText: "Cool bro",
    readByReceiver: false,
    usersArr: [
      {
        userAvatar: "https://randomuser.me/api/portraits/men/66.jpg",
        userName: "Yoni",
        userId: "userId2"
      },
      {
        userAvatar: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
        userName: "Scott",
        userId: "01P4eORz41OmDL4HxHHegnrAIYu1"
      }
    ]
  }

  try {
    const res = await geocollection.add(newConvo);
    const res2 = await geocollection.add(newConvo2);
    const docId = res.id;
    const docId2 = res2.id;
    userChat.chatId = docId;
    userChat2.chatId = docId2;
    // console.log("res : ", res);
    // console.log("res2 : ", res2);
    const res3 = await firebase.firestore().collection("userChats").doc("01P4eORz41OmDL4HxHHegnrAIYu1").set({
      [`${docId}`]: userChat
    }, { merge: true });
    const res4 = await firebase.firestore().collection("userChats").doc("01P4eORz41OmDL4HxHHegnrAIYu1").set({
      [`${docId2}`]: userChat2
    }, { merge: true });
    const res5 = await firebase.firestore().collection("userChats").doc("userId").set({
      [`${docId}`]: userChat
    });
    const res6 = await firebase.firestore().collection("userChats").doc("userId2").set({
      [`${docId2}`]: userChat2
    });
    const res7 = await geocollection2.add({
      _id: "myUserId",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(41.88043118753228, -87.63034075498391),
      createdAt: new Date(),
      date_of_birth: new Date(1983, 3, 3),
      gender: false,
      getsNotifications: true,
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/34.jpg",
      profileText: "I'm a fake user",
      sports: {
        Baseball: {
          interested: true,
          skill_level: "Played Little League"
        },
        Football: {
          interested: true,
          skill_level: "Can throw a pretty good spiral"
        },
        Frisbee: {
          interested: true,
          skill_level: "Good backhand thrower"
        }
      },
      timeOfActivation: new Date(2020, 11, 11)
    })
  }

  catch (e) {
    console.log("createConvos error : ", e);
  }
}

export const addTestCloudFunctionsData = async () => {
  const firestore = firebase.firestore();

  // Create a GeoFirestore reference
  const geofirestore = new GeoFirestore(firebase.firestore());
  const geocollection = geofirestore.collection('conversations');

  let newReq1 = {
    _id: "userid001",
    createdAt: new Date(2020, 8, 13),
    date_of_birth: new Date(1990, 9, 9),
    gender: 0,
    getsNotifications: false,
    coordinates: new firebase.firestore.GeoPoint(41.1, -87.8),
    name: "Otto",
    notificationToken: "Some token",
    photo: "https://randomuser.me/api/portraits/men/2.jpg",
    sports: { Football: { interested: true, skill_level: "Can throw a spiral" }, Baseball: { interested: true, skill_level: "Played Little League" }, Frisbee: { interested: true, skill_level: "Absolute beginner" }},
    profileText: "This is a request for testing purposes",
    toId: "01P4eORz41OmDL4HxHHegnrAIYu1",
    existingConversation: false,
    conversationId: false
  }

  let newConvo1 = {
    coordinates: new firebase.firestore.GeoPoint(41.19, -87.92),
    createdAt: new Date(2020, 8, 14),
    messages: [],
    userObjects: [
      {
        _id: "userId1",
        name: "Frank",
        date_of_birth: new Date(1990, 2, 3),
        gender: 0,
        coordinates: { latitude: 41.19, longitude: -87.92 },
        sports: { Football: { interested: true, skill_level: "Can throw a spiral" }, Baseball: { interested: true, skill_level: "Played Little League" }, Frisbee: { interested: true, skill_level: "Absolute beginner" }},
        photo: "https://randomuser.me/api/portraits/men/3.jpg",
        getsNotifications: false,
        notificationToken: "-1",
        profileText: "Frank strong like bull"
      },
      {
        _id: "01P4eORz41OmDL4HxHHegnrAIYu1",
        name: "Scott",
        date_of_birth: new Date(1984, 3, 24),
        gender: 0,
        coordinates: { latitude: 41.195, longitude: -87.925 },
        sports: { Football: { interested: true, skill_level: "Can throw a spiral" }, Baseball: { interested: true, skill_level: "Played Little League" }, Frisbee: { interested: true, skill_level: "Absolute beginner" }},
        photo: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
        getsNotifications: true,
        notificationToken: "-1",
        profileText: "Looking for baseball catch"
      }
    ]
  }

  let userChat = {
    lastMessageCreatedAt: new Date(2020, 7, 9),
    lastMessageFromId: "01P4eORz41OmDL4HxHHegnrAIYu1",
    lastMessageFromname: "Scott",
    lastMessageText: "Jimminy Jillikins",
    readByReceiver: false,
    usersArr: [
      {
        userAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
        userName: "Frank",
        userId: "userId1"
      },
      {
        userAvatar: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
        userName: "Scott",
        userId: "01P4eORz41OmDL4HxHHegnrAIYu1"
      }
    ]
  }

  try {
    const res1 = await firebase.firestore().collection("requests").add(newReq1);
    const res2 = await geocollection.add(newConvo1);
    const docId = res2.id;
    const res3 = await firebase.firestore().collection("userChats").doc("01P4eORz41OmDL4HxHHegnrAIYu1").set({
      [`${docId}`]: userChat
    }, { merge: true });
    const res4 = await firebase.firestore().collection("userChats").doc("userId4").set({
      [`${docId}`]: userChat
    }, { merge: true });
  }

  catch (e) {
    console.log("addTestCloudFunctionsData error : ", e);
  }
}

export const testCloudFunctionsLocally = async () => {
  let promises = [];
  let _24HoursAgo = new Date();
  _24HoursAgo.setHours(_24HoursAgo.getHours() - 24);
  
  try {
    // Step 1: Get all conversations where last message is older than 24 hours
    const oldConvos = await firebase.firestore().collection("conversations").where("lastMessageTime", "<", _24HoursAgo).get();

    oldConvos.forEach((doc) => {
      let d = doc.data();
      const conversationId = d.id;
      console.log("conversationId : ", conversationId);

      // Step 2: Add a promise to delete the converssation from the conversations collection
      promises.push(firebase.firestore().collection("conversations").doc(conversationId).delete());

      for (let i = 0; i < d.userObjects.length; i++) {
        const userId = d.userObjects[i]._id;
        console.log("userId : ", userId);

        // Step 3: For each user involved in conversation, add a promise to delete that conversation from the user's userChats document
        promises.push(firebase.firestore().collection("userChats").doc(userId).update({
          [conversationId]: firebase.firestore().FieldValue.delete()
        }));
      }
    });

    // Step 4: Get old requests to delete as well
    const oldRequests = await firebase.firestore().collection("requests").where("createdAt", "<", _24HoursAgo).get();

    oldRequests.forEach((doc) => {
      let d = doc.data();
      const docId = doc.id;

       console.log("docId : ", docId);

      // Step 5: Add a promise to delete the old request
      promises.push(firebase.firestore().collection("requests").doc(docId).delete());

    });

    console.log("await Promise.all(promises)");

    // Step 6: Delete everything
    const promisesRes = await Promise.all(promises);
    console.log("deleted");
  }

  catch (e) {
    console.log("testCloudFunctionsLocally error : ", e);
  }
}