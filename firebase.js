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

export const removeFromConversation = async (item, newArr, userObj) => {

  const user = firebase.auth().currentUser;
  const uid = user.uid;

  let promises = [];

  // Step 1: Remove chat from user's userChats
  promises.push(firebase.firestore().collection("userChats").doc(uid).set({
    [`${item.id}`]: firebase.firestore.FieldValue.delete()
  }, { merge: true }));

  // Step 2: If only other user in convo is other person, delete them from convo too and delete conversation entirely
  if (newArr.length === 1) {
    promises.push(firebase.firestore().collection("userChats").doc(newArr[0].userId).set({
      [`${item.id}`]: firebase.firestore.FieldValue.delete()
    }, { merge: true }));

    promises.push(firebase.firestore().collection("conversations").doc(item.id).delete());
  }

  // Step 3: Else, remove user from userChats array, and from conversation usersArray (actually they'll stay in conversation usersArray, too difficult to match a whole object to remove from an array in firestore)
  else {
    for (let i = 0; i < newArr.length; i++) {
      promises.push(firebase.firestore().collection("userChats").doc(newArr[i].userId).set({
        usersArr: firebase.firestore.FieldValue.arrayRemove(userObj[0])
      }, { merge: true }));
    }
  }

  try {
    const res1 = await Promise.all(promises);
    return true;
  }
  catch (e) {
    console.log("removeFromConversation error : ", e);
    return false;
  }
}

export const acceptRequestUser = async (user0, user1) => {

  // Create a GeoFirestore reference
  const geofirestore = new GeoFirestore(firebase.firestore());
  const geocollection = geofirestore.collection('conversations');

  const user0Dob = user0.dateOfBirth.seconds ? new Date(user0.dateOfBirth.seconds * 1000) : new Date(user0.dateOfBirth);
  const user1Dob = user1.dateOfBirth.seconds ? new Date(user1.dateOfBirth.seconds * 1000) : new Date(user1.dateOfBirth);

  let newConvo = {
    coordinates: new firebase.firestore.GeoPoint(user0.coordinates.latitude, user0.coordinates.longitude),
    createdAt: new Date(),
    messages: [],
    lastMessageTime: new Date(),
    activeSport: user0.activeSport,
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
      },
      {
        _id: user1._id,
        name: user1.name,
        dateOfBirth: user1Dob,
        gender: user1.gender,
        coordinates: user1.coordinates,
        sports: user1.sports,
        photo: user1.photo || "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F2020910%2Fblank_user.png?alt=media&token=45db0019-77b8-46ef-b4fb-c78a4749484c",
        getsNotifications: user1.getsNotifications,
        notificationToken: user1.notificationToken,
        profileText: user1.profileText ? user1.profileText : ""
      }
    ]
  }

  let userChat = {
    lastMessageCreatedAt: new Date(),
    lastMessageFromId: user1._id,
    lastMessageFromName: user1.name,
    lastMessageText: "You accepted " + user1.name + "'s request!",
    readByReceiver: false,
    activeSport: user0.activeSport,
    usersArr: [
      {
        userAvatar: user0.photo,
        userName: user0.name,
        userId: user0._id
      },
      {
        userAvatar: user1.photo,
        userName: user1.name,
        userId: user1._id
      }
    ]
  }

  let userChat2 = {
    lastMessageCreatedAt: new Date(),
    lastMessageFromId: user1._id,
    lastMessageFromName: user1.name,
    lastMessageText: user0.name + " accepted your request!",
    readByReceiver: false,
    activeSport: user0.activeSport,
    usersArr: [
      {
        userAvatar: user0.photo,
        userName: user0.name,
        userId: user0._id
      },
      {
        userAvatar: user1.photo,
        userName: user1.name,
        userId: user1._id
      }
    ]
  }

  try {
    const res1 = await firebase.firestore().collection("requests").doc(user1.id).delete();
    const docRef = await geocollection.add(newConvo);
    const docRefId = docRef.id;
    const res2 = await firebase.firestore().collection("userChats").doc(user0._id).set({
      [`${docRefId}`]: userChat
    }, { merge: true });
    const res3 = await firebase.firestore().collection("userChats").doc(user1._id).set({
      [`${docRefId}`]: userChat2
    }, { merge: true });
    return docRefId;
  }
  catch (e) {
    console.log("acceptRequest error : ", e);
    return false;
  }
}


export const acceptRequestConvo = async (user0, user1, usersArr) => {

  const userObj1 = { // for userChats usersArr
    userAvatar: user1.photo,
    userName: user1.name,
    userId: user1._id
  }

  const userObj2 = { // for userObjects array in conversation
    _id: user1._id,
    coordinates: user1.coordinates,
    dateOfBirth: user1.dateOfBirth,
    gender: user1.gender,
    getsNotifications: user1.getsNotifications,
    name: user1.name,
    notificationToken: user1.notificationToken,
    photo: user1.photo,
    profileText: user1.profileText ? user1.profileText : "",
    sports: user1.sports
  }

  // let usersArr2 = [];
  // for (let i = 0; i < usersArr.length; i++) {
  //   usersArr2.push(usersArr[i]);
  // }
  let usersArr2 = [...usersArr];

  usersArr2.push(userObj1);

  const userChat = {
    chatId: user1.conversationId,
    lastMessageCreatedAt: new Date(),
    lastMessageFromId: user1._id,
    lastMessageFromName: user1.name,
    lastMessageText: "You joined the conversation. Say hi!",
    readByReceiver: false,
    usersArr: usersArr2,
    activeSport: request.activeSport
  }

  let promises = [];

  // Step 1: Delete request
  promises.push(firebase.firestore().collection("requests").doc(user1.id).delete());

  // Step 2: Add userChat to new user (user1)
  promises.push(firebase.firestore().collection("userChats").doc(user1._id).set({
    [`${user1.conversationId}`]: userChat
  }, { merge: true }));


  // Step 3: Update usersArr for existing users in chat
  for (let i = 0; i < usersArr.length; i++) {
    promises.push(firebase.firestore().collection("userChats").doc(usersArr[i].userId).update({
      [`${user1.conversationId}.usersArr`]: usersArr2
    }))
  }

  // Step 4: Update userObjects array for the conversation
  promises.push(firebase.firestore().collection("conversations").doc(user1.conversationId).update({
    userObjects: firebase.firestore.FieldValue.arrayUnion(userObj2)
  }));


  try {
    const res1 = await Promise.all(promises);
    return user1.conversationId;
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

  let areaUsers0 = [];
  let areaConversations0 = [];

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

    // filter out own user from results
    const areaUsers2 = areaUsers1.filter((item, i) => item._id !== userId);

    // calculate distance for users
    const areaUsers3 = areaUsers2.map((item, i) => {
      const distance0 = getDistance(userLoc, item.coordinates);
      const distance = Math.round(distance0 * 10) / 10;

      item.distance = distance;
      return item;
    })

    // sort users by distance
    areaUsers3.sort((a, b) => a.distance - b.distance);

    return [areaUsers3, areaConversations1];
  }
  catch (e) {
    console.log("geofirestore error : ", e);
    return [[], []];
  }
}

export const getUserChatsAndRequests = async () => {
  try {
    const document = await firebase.firestore().collection("userChats").doc(userId).get();
    const chats = document.data();
    let chatArray = [];
    let requestsArr = [];

    Object.keys(chats).forEach((key) => {
      chats[key].id = key;
      chatArray.push(chats[key]);
    });

    const requests0 = await firebase.firestore().collection("requests").where("toId", "==", userId).get();
    const requests1 = requests0.data();

    requests1.forEach((doc) => {
      let d = doc.data();
      d.id = doc.id;
      requestsArr.push(d);
    });
    // although I save locally that a request has been made to someone (and so to prevent duplicate requests) the system is not perfect (if app refreshes, local data may be lost)
    // so filter out duplicate requests here
    let seen = {};
    const requestsArr2 = requestsArr.filter((item) => {
      const id = item._id;
      return seen.hasOwnProperty(id) ? false : (seen[id] = true);
    });

    return [chatArray, requestsArr2];
  }
  catch (e) {
    console.log("error in getUserChatsAndRequests : ", e);
    return false;
  }

}

export const declineRequest = async (itemId) => {
  try {
    const res = await firebase.firestore().collection("requests").doc(itemId).delete();
    return true;
  }
  catch (e) {
    console.log("delete error : ", e);
    return false;
  }
}


export const sendRequest = async (user, item) => {
  
  let req = {
    _id: user._id,
    activeSport: item.activeSport,
    createdAt: new Date(),
    dateOfBirth: user.dateOfBirth.seconds ? new Date(user.dateOfBirth.seconds * 1000) : new Date(user.dateOfBirth),
    gender: user.gender,
    getsNotifications: user.getsNotifications,
    coordinates: new firebase.firestore.GeoPoint(user.coordinates.latitude, user.coordinates.longitude),
    name: user.name,
    notificationToken: user.notificationToken,
    profileText: user.profileText ? user.profileText : "",
    photo: user.photo,
    sports: user.sports,
    toId: item._id ? item._id : item.userObjects[0]._id
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
    const res = await firebase.firestore().collection("requests").add(req);
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
    return firebase.firestore().collection("userChats").doc(item.userId).update({
      [`${chatId}.lastMessageCreatedAt`]: new Date(),
      [`${chatId}.lastMessageFromId`]: userChatUpdate.lastMessageFromId,
      [`${chatId}.lastMessageFromName`]: userChatUpdate.lastMessageFromName,
      [`${chatId}.lastMessageText`]: userChatUpdate.lastMessageText,
      [`${chatId}.readByReceiver`]: false
    })
  });

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

  let promises = [];
  promises.push(firebase.firestore().collection("users").doc(user0._id).update({
    blockedUsers: firebase.firestore.FieldValue.arrayUnion(userObj1)
  }))

  promises.push(firebase.firestore().collection("users").doc(user1._id).update({
    blockedUsers: firebase.firestore.FieldValue.arrayUnion(userObj0)
  }))

  try {
    const res1 = await Promise.all(promises);
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

