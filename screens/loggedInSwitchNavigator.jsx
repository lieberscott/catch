import React, { useEffect, useState, useContext } from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

const LoggedInSwitchNavigator = createSwitchNavigator({
  LoadingScreen: LoadingScreen,
  LoginStackNavigator: LoginStackNavigator,
  TabNavigator: TabNavigator
});

const LoggedInContainer = createAppContainer(LoggedInSwitchNavigator);

export default LoggedIn = () => {
  console.log("signed in");

  const [user, setUser] = useState({});
  const [mongoCallMade, setMongoCallMade] = useState(false);
  const [firstFirebaseCallMade, setFirstFirebaseCallMade] = useState(false);
  const [secondFirebaseCallMade, setSecondFirebaseCallMade] = useState(false);

  const store = useContext(StoreContext);
  // const basicUser = store.basicUser;
  // const userId = "5f428781284d3725cd1daeab";
  // const userId = basicUser.userId;
  // const deviceToken = basicUser.deviceToken;
  // const deviceToken = "-1";
  // const userLoc = [41.5, -87.5];
  // const user = store.user;
  // const userId = user._id;
  // const deviceToken = user.deviceToken;

  useEffect(() => {
    console.log("signed In.jsx in UseEffect");
  
    let usersFromMongo0 = [];
  
    // Step 1: Get user and active area users
    (async () => {
      try {
        // Step 2: Get user from auth object
        const uid = await getAuthUser();

        // Step 2: Get user from users collection
        const user = await getDbUser(uid);
        console.log("second user in TabNavigator.jsx : ", user);


        // Step 3: Check if user has onboarded. If not, navigate to introComponents
        if (user.onboardingDone) {
          navigation
        }

        // Step 4: If user has completed onboarding, get other users based on geolocation

        
        // Step 5: Save user and other users in state

        // Step 6: Set up listener for and get userChats

        // Step 7: Set up listener for and get requests

        // Step 8: Set up listener for and get areaConversations



        // const userFromMongo = await loginUserFromMongo(userId, deviceToken);
        // const userLoc = userFromMongo.loc;
        // const usersFromMongo = await getUsersFromMongo(userId, deviceToken, userLoc);
        
        setUser(user);
        setAreaUsers()
        
        store.setAndSaveUser(userFromMongo);
        store.setAndSaveUsersFromMongo(usersFromMongo);
        setMongoCallMade(true);
      }
      catch (e) {
        console.log("mongo error : ", e);
        firebase.auth().signOut();
      }
    })();
  }, []);

  useEffect(() => {
    let unsubscribe;
    // Step 2: Get userChats from Firebase
    if (mongoCallMade) {
      console.log("getting userChats");
      unsubscribe = firebase.firestore().collection("userChats").doc(userId)
      .onSnapshot((snapshot) => {
        const d = snapshot.data();
        console.log("d : ", d);

        let chatArray = d.chatArray;

        let chatArray2 = [];
        
        Object.keys(chatArray).forEach((key) => {
          chatArray2.push(chatArray[key]);
        });
        
        // for conversations involving user
        store.setAndSaveUserChats(chatArray2);
        setFirstFirebaseCallMade(true);
      });
    }

    return () => {
      console.log("userChats listener unmounting")
      unsubscribe != undefined ? unsubscribe() : console.log("unsubscribe was not yet defined");
    }
  }, [mongoCallMade]);
  
  useEffect(() => {
    // get areaConversations
    if (firstFirebaseCallMade) {
      console.log("geofirestore call...")
      const firestore = firebase.firestore();

      // Create a GeoFirestore reference
      const GeoFirestore = geofirestore.initializeApp(firestore);

      // Create a GeoCollection reference
      const geocollection = GeoFirestore.collection('conversations');
      let arr = [];
  
      // get areaConversations - not a listener, just a get
      geocollection.near({
        center: new firebase.firestore.GeoPoint(41.5, -87),
        radius: 3200 // km converts to 20 miles
      })
      .get()
      .then((docs) => {
        console.log("geofirestore docs");
        // slice out all the conversations involving user (since they will be in userChats)
        docs.forEach((doc) => {
          let d = doc.data();
          d.id = doc.id;
  
          // area conversations - only push if conversation does not include user
          if (d.userObjects.findIndex((item, i) => item._id === "userId") === -1) {
            arr.push(d);
          }
        });
        console.log("end");
        store.setAndSaveAreaConversations(arr);
        setSecondFirebaseCallMade(true);
      });
    }
  }, [firstFirebaseCallMade]);
  
  useEffect(() => {
    let arr = [];
    let unsubscribe3;

    // get requests
    if (secondFirebaseCallMade) {
      console.log("getting requests");
      unsubscribe3 = firebase.firestore().collection("requests")
      .where("toId", "==", userId)
      .onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
          let d = doc.data();
          d.id = doc.id;
          arr.push(d);
        });
        store.setAndSaveRequests(arr);
      });
    }
  
    return () => {
      console.log("requests listener unmounting");
      unsubscribe3 != undefined ? unsubscribe3() : console.log("unsubscribe3 was not yet defined");
    }
  }, [secondFirebaseCallMade]);

  return (
    <LoggedInContainer />
  )
}