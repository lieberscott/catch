import * as firebase from 'firebase';
import firestore from 'firebase/firestore';
import { GeoFirestore } from 'geofirestore';

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

    let sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

    const docs2 = await geocollection2.near({
      center: new firebase.firestore.GeoPoint(userLoc.latitude, userLoc.longitude),
      radius: 32 // km converts to 20 miles
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
    coordinates: new firebase.firestore.GeoPoint(41.88656118753228, -87.63254075498391),
    createdAt: new Date(),
    messages: [
      {
        _id: "someMessageId",
        createdAt: new Date(2020, 7, 9),
        text: "Hey, what's up?",
        user: {
          _id: "myUserId7",
          avatar: "https://randomuser.me/api/portraits/men/17.jpg",
          name: "Goran"
        }
      },
      {
        _id: "someMessageId2",
        createdAt: new Date(2020, 8, 9),
        text: "Meh, not much",
        user: {
          _id: "myUserId8",
          avatar: "https://randomuser.me/api/portraits/men/18.jpg",
          name: "Hagar Horrible"
        }
      }
    ],
    userObjects: [
      {
        _id: "myUserId7",
        coordinates: { latitude: 41.88656118753228, longitude: -87.63254075498391 },
        date_of_birth: new Date(1993, 2, 3),
        gender: false,
        getsNotifications: true,
        name: "Goran",
        notificationToken: "-1",
        photo: "https://randomuser.me/api/portraits/men/17.jpg",
        profileText: "I will be involved in conversation with Hagar Horrible",
        sports: { Baseball: { interested: true, skill_level: "Played Little League" }, Football: { interested: true, skill_level: "Can throw a pretty good spiral" }, Frisbee: { interested: true, skill_level: "Good backhand thrower" } },
      },
      {
        _id: "myUserId8",
        coordinates: new firebase.firestore.GeoPoint(41.88556118753228, -87.63454075498391),
        date_of_birth: new Date(1993, 2, 3),
        gender: false,
        getsNotifications: true,
        name: "Hagar Horrible",
        notificationToken: "-1",
        photo: "https://randomuser.me/api/portraits/men/18.jpg",
        profileText: "I will be involved in conversation with Goran",
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
        }
      }
    ],
    timeOfActivation: new Date(2020, 9, 8)
  };

  let newConvo2 = {
    coordinates: new firebase.firestore.GeoPoint(30.88556118753228, -87.63054075498391),
    createdAt: new Date(),
    messages: [
      {
        _id: "someMessageId",
        createdAt: new Date(2020, 7, 9),
        text: "Hey, what's up?",
        user: {
          _id: "myUserId9",
          avatar: "https://randomuser.me/api/portraits/men/19.jpg",
          name: "Igor"
        }
      },
      {
        _id: "someMessageId2",
        createdAt: new Date(2020, 8, 9),
        text: "Meh, not much still",
        user: {
          _id: "myUserId10",
          avatar: "https://randomuser.me/api/portraits/men/20.jpg",
          name: "Jaialai"
        }
      }
    ],
    userObjects: [
      {
        _id: "myUserId9",
        coordinates: { latitude: 30.88556118753228, longitude: -87.63054075498391 },
        date_of_birth: new Date(1993, 2, 3),
        gender: false,
        getsNotifications: true,
        name: "Igor",
        notificationToken: "-1",
        photo: "https://randomuser.me/api/portraits/men/19.jpg",
        profileText: "I will be involved in conversation outside Geolocation with Jaialai",
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
        }
      },
      {
        _id: "myUserId10",
        coordinates: { latitude: 30.89956118753228, longitude: -87.63054075498391 },
        date_of_birth: new Date(1993, 2, 3),
        gender: false,
        getsNotifications: true,
        name: "Jaialai",
        notificationToken: "-1",
        photo: "https://randomuser.me/api/portraits/men/20.jpg",
        profileText: "I will be involved in conversation outside Geolocation with Igor",
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
        }
      }
    ],
    timeOfActivation: new Date(2020, 9, 8)
  };

  let newConvo3 = {
    coordinates: new firebase.firestore.GeoPoint(41.88756118753228, -87.63554075498391),
    createdAt: new Date(),
    messages: [
      {
        _id: "someMessageId",
        createdAt: new Date(2020, 7, 9),
        text: "Hey, what's up?",
        user: {
          _id: "myUserId11",
          avatar: "https://randomuser.me/api/portraits/men/21.jpg",
          name: "Keanu"
        }
      },
      {
        _id: "someMessageId2",
        createdAt: new Date(2020, 8, 9),
        text: "Meh, not much still",
        user: {
          _id: "myUserId12",
          avatar: "https://randomuser.me/api/portraits/men/22.jpg",
          name: "Leury"
        }
      }
    ],
    userObjects: [
      {
        _id: "myUserId11",
        coordinates: { latitude: 41.88756118753228, longitude: -87.63554075498391 },
        date_of_birth: new Date(1993, 2, 3),
        gender: false,
        getsNotifications: true,
        name: "Keanu",
        notificationToken: "-1",
        photo: "https://randomuser.me/api/portraits/men/21.jpg",
        profileText: "I will be involved in conversation with both Scott and Leury",
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
        }
      },
      {
        _id: "myUserId12",
        coordinates: { latitude: 41.88956118753228, longitude: -87.63554075498391 },
        date_of_birth: new Date(1993, 2, 3),
        gender: false,
        getsNotifications: true,
        name: "Leury",
        notificationToken: "-1",
        photo: "https://randomuser.me/api/portraits/men/22.jpg",
        profileText: "I will be involved in conversation with just Keanu",
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
        }
      }
    ],
    timeOfActivation: new Date(2020, 9, 8)
  };


  let newConvo4 = {
    coordinates: new firebase.firestore.GeoPoint(41.88043118753208, -87.63034075498481),
    createdAt: new Date(),
    messages: [
      {
        _id: "someMessageId",
        createdAt: new Date(2020, 7, 9),
        text: "Hey, what's up?",
        user: {
          _id: "01P4eORz41OmDL4HxHHegnrAIYu1",
          avatar: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
          name: "Scott"
        }
      },
      {
        _id: "someMessageId2",
        createdAt: new Date(2020, 8, 9),
        text: "Meh, not much still",
        user: {
          _id: "myUserId11",
          avatar: "https://randomuser.me/api/portraits/men/21.jpg",
          name: "Keanu"
        }
      }
    ],
    userObjects: [
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
      },
      {
        _id: "myUserId11",
        coordinates: { latitude: 41.88756118753228, longitude: -87.63554075498391 },
        date_of_birth: new Date(1993, 2, 3),
        gender: false,
        getsNotifications: true,
        name: "Keanu",
        notificationToken: "-1",
        photo: "https://randomuser.me/api/portraits/men/21.jpg",
        profileText: "I will be involved in conversation with both Scott and Leury",
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
        }
      }
    ],
    timeOfActivation: new Date(2020, 9, 8)
  };


  let newConvo5 = {
    coordinates: new firebase.firestore.GeoPoint(41.88043118753208, -87.63034075498481),
    createdAt: new Date(),
    messages: [
      {
        _id: "someMessageId",
        createdAt: new Date(2020, 7, 9),
        text: "Hey, what's up?",
        user: {
          _id: "01P4eORz41OmDL4HxHHegnrAIYu1",
          avatar: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
          name: "Scott"
        }
      },
      {
        _id: "someMessageId2",
        createdAt: new Date(2020, 8, 9),
        text: "Cool bro",
        user: {
          _id: "myUserId6",
          avatar: "https://randomuser.me/api/portraits/men/16.jpg",
          name: "Felonios"
        }
      }
    ],
    userObjects: [
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
      },
      {

        _id: "myUserId6",
        coordinates: { latitude: 41.88656118753228, longitude: -87.63154075498391 },
        date_of_birth: new Date(1993, 2, 3),
        gender: false,
        getsNotifications: true,
        name: "Felonios",
        notificationToken: "-1",
        photo: "https://randomuser.me/api/portraits/men/16.jpg",
        profileText: "I will be involved in a conversation with Scott",
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
        }
      }
    ],
    timeOfActivation: new Date(2020, 9, 8)
  };
  

  let userChat4 = {
    lastMessageCreatedAt: new Date(2020, 7, 9),
    lastMessageFromId: "myUserId11",
    lastMessageFromname: "Keanu",
    lastMessageText: "Cool bro",
    readByReceiver: false,
    usersArr: [
      {
        userAvatar: "https://randomuser.me/api/portraits/men/21.jpg",
        userName: "Keanu",
        userId: "myUserId11"
      },
      {
        userAvatar: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
        userName: "Scott",
        userId: "01P4eORz41OmDL4HxHHegnrAIYu1"
      }
    ]
  }

  let userChat5 = {
    lastMessageCreatedAt: new Date(2020, 7, 9),
    lastMessageFromId: "myUserId6",
    lastMessageFromname: "Felonios",
    lastMessageText: "Cool bro",
    readByReceiver: false,
    usersArr: [
      {
        userAvatar: "https://randomuser.me/api/portraits/men/16.jpg",
        userName: "Felonios",
        userId: "myUserId6"
      },
      {
        userAvatar: "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F202088%2F01P4eORz41OmDL4HxHHegnrAIYu11599579141675?alt=media&token=bc788617-a291-4879-9622-719e0486b8e3",
        userName: "Scott",
        userId: "01P4eORz41OmDL4HxHHegnrAIYu1"
      }
    ]
  }

  try {

    const pers1 = await geocollection2.add({
      _id: "myUserId",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(41.88046118753228, -87.63054075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Abel",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/10.jpg",
      profileText: "I'm supposed to be active but timeOfActivation was longer than 6 hours ago",
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
      timeOfActivation: new Date(2020, 9, 5)
    });

    const pers2 = await geocollection2.add({
      _id: "myUserId2",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(41.88116118753228, -87.63054075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Bort",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/11.jpg",
      profileText: "I'm supposed to be active AND timeOfActivation was WITHIN the last 6 hours",
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
      timeOfActivation: new Date(2020, 9, 7)
    });

    const pers3 = await geocollection2.add({
      _id: "myUserId3",
      active: false,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(41.88256118753228, -87.63054075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Cain",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/13.jpg",
      profileText: "I'm supposed to be inactive",
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
      timeOfActivation: new Date(2020, 9, 7)
    });

    const pers4 = await geocollection2.add({
      _id: "myUserId4",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(35.88356118753228, -89.63054075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Delonte",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/14.jpg",
      profileText: "I'm supposed to be more than 20 miles away",
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
      timeOfActivation: new Date(2020, 9, 7)
    });

    const pers5 = await geocollection2.add({
      _id: "myUserId5",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(41.88556118753228, -87.63054075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Elon",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/15.jpg",
      profileText: "I'm supposed to be blocked (eventually)",
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
      timeOfActivation: new Date(2020, 9, 7)
    });
    
    const pers6 = await geocollection2.add({
      _id: "myUserId6",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(41.88656118753228, -87.63154075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Felonios",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/16.jpg",
      profileText: "I will be involved in a conversation with Scott",
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
      timeOfActivation: new Date(2020, 9, 7)
    });

    const pers7 = await geocollection2.add({
      _id: "myUserId7",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(41.88656118753228, -87.63254075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Goran",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/17.jpg",
      profileText: "I will be involved in conversation with Hagar Horrible",
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
      timeOfActivation: new Date(2020, 9, 7)
    });

    const pers8 = await geocollection2.add({
      _id: "myUserId8",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(41.88556118753228, -87.63454075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Hagar Horrible",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/18.jpg",
      profileText: "I will be involved in conversation with Goran",
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
      timeOfActivation: new Date(2020, 9, 7)
    });

    const pers9 = await geocollection2.add({
      _id: "myUserId9",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(30.88556118753228, -87.63054075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Igor",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/19.jpg",
      profileText: "I will be involved in conversation outside Geolocation with Jaialai",
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
      timeOfActivation: new Date(2020, 9, 7)
    });

    const pers10 = await geocollection2.add({
      _id: "myUserId10",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(30.89956118753228, -87.63054075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Jaialai",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/20.jpg",
      profileText: "I will be involved in conversation outside Geolocation with Igor",
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
      timeOfActivation: new Date(2020, 9, 7)
    });

    const pers11 = await geocollection2.add({
      _id: "myUserId11",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(41.88756118753228, -87.63554075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Keanu",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/21.jpg",
      profileText: "I will be involved in conversation with both Scott and Leury",
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
      timeOfActivation: new Date(2020, 9, 7)
    });

    const pers12 = await geocollection2.add({
      _id: "myUserId12",
      active: true,
      available: true,
      coordinates: new firebase.firestore.GeoPoint(41.88956118753228, -87.63554075498391),
      createdAt: new Date(2020, 1, 1),
      date_of_birth: new Date(1993, 2, 3),
      gender: false,
      getsNotifications: true,
      name: "Leury",
      notificationToken: "-1",
      onboardingDone: false,
      photo: "https://randomuser.me/api/portraits/men/22.jpg",
      profileText: "I will be involved in conversation with just Keanu",
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
      timeOfActivation: new Date(2020, 9, 7)
    });



    const res = await geocollection.add(newConvo);
    const res2 = await geocollection.add(newConvo2);
    const res3 = await geocollection.add(newConvo3);
    const res4 = await geocollection.add(newConvo4);
    const res5 = await geocollection.add(newConvo5);
    const docId4 = res4.id;
    const docId5 = res5.id;


    userChat4.chatId = docId4;
    userChat5.chatId = docId5;
    // console.log("res : ", res);
    // console.log("res2 : ", res2);
    const res6 = await firebase.firestore().collection("userChats").doc("01P4eORz41OmDL4HxHHegnrAIYu1").set({
      [`${docId4}`]: userChat4
    }, { merge: true });
    const res7 = await firebase.firestore().collection("userChats").doc("01P4eORz41OmDL4HxHHegnrAIYu1").set({
      [`${docId5}`]: userChat5
    }, { merge: true });
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

export const deleteOldConvosTest = () => {
  // const database = admin.firestore();
  let _24HoursAgo = new Date();
  _24HoursAgo.setHours(_24HoursAgo.getHours() - 24);

  // const deleteConvos = [];
  // let deleteUserChat = [];

  let promises = [];

  // Step 1: Get all conversations where last message is older than 24 hours
  firebase.firestore().collection("conversations")
  .where("lastMessageTime", "<", _24HoursAgo)
  .get()
  .then((oldConvos) => {
    console.log("one");
    oldConvos.forEach((doc) => {
      let d = doc.data();
      const conversationId = doc.id;
      console.log("two : ", conversationId);

      // Step 2: Add a promise to delete the converssation from the conversations collection
      promises.push(firebase.firestore().collection("conversations").doc(conversationId).delete());

      for (let i = 0; i < d.userObjects.length; i++) {
        const userId = d.userObjects[i]._id;

        // Step 3: For each user involved in conversation, add a promise to delete that conversation from the user's userChats document
        promises.push(firebase.firestore().collection("userChats").doc(userId).update({
          [conversationId]: firebase.firestore.FieldValue.delete()
        }));
      }
    });

    // Step 4: Get old requests to delete as well
    return firebase.firestore().collection("requests").where("createdAt", "<", _24HoursAgo).get();
  })
  .then((oldRequests) => {
    console.log("three");
    oldRequests.forEach((doc) => {
      let d = doc.data();
      const docId = doc.id;

      console.log("four : ", docId);

      // Step 5: Add a promise to delete the old request
      promises.push(firebase.firestore().collection("requests").doc(docId).delete());

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
}

export const addRequestTest = () => {
  let req = {
    _id: "someId",
    createdAt: new Date(),
    date_of_birth: new Date(1990, 3, 3),
    gender: 0,
    getsNotifications: true,
    coordinates: new firebase.firestore.GeoPoint(41.5, -87.5),
    name: "Joey Joe Joe",
    notificationToken: "-1",
    profileText: "Tis no man, but an eating machine.",
    photo: "https://randomuser.me/api/portraits/men/10.jpg",
    sports: { Football: { interested: true, skill_level: "Can throw a spiral" }, Baseball: { interested: true, skill_level: "Played Little League" }, Frisbee: { interested: true, skill_level: "Absolute beginner" }},
    toId: "01P4eORz41OmDL4HxHHegnrAIYu1"
  }

  req.existingConversation = false;
  req.conversationId = false;

  firebase.firestore().collection("requests").add(req);
}