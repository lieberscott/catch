import * as firebase from 'firebase';
import firestore from 'firebase/firestore';
import { GeoFirestore } from 'geofirestore';
// import firebase from 'firebase/app';
// import 'firebase/storage';

export const updateUser = async (update, userId, userLoc) => {

  const firestore = firebase.firestore();

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

export const getFullConversation = async (convoId) => {
  try {

  }
  catch (e) {
    console.log("getFullConversation error : ", e);
  }
}

export const uploadImage = async (blob, name) => {
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
        notificationToken: "-1"
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

    const docs2 = await geocollection2.near({
      center: new firebase.firestore.GeoPoint(41.1, -87.9),
      radius: 3200 // km converts to 20 miles
    })
    .get();

    docs2.forEach((doc) => {
      let d = doc.data();
      d.id = doc.id;
      areaUsers0.push(d);
    });

    console.log("got area users from geofirestore in firebase.js");

    return [areaUsers0, areaConversations0];
  }
  catch (e) {
    console.log("geofirestore error : ", e);
    return [[], []];
  }
}

export const declineRequest = async (item) => {
  try {
    const res = await firebase.firestore().collection("requests").doc(item.id).delete();
    return res.status === 200 ? true : false;
  }
  catch (e) {
    console.log("delete error : ", e);
    return false;
  }
}

