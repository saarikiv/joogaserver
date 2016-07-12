
exports.setApp = function (JPS){

  //######################################################
  // POST: cancelSlot
  //######################################################

  JPS.app.post('/cancelSlot', (req, res) => {
    JPS.now = Date.now();
    console.log("POST: cancelSlot", JPS.now);
    JPS.body = '';
    req.on('data', (data) => {
      JPS.body += data;
      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (JPS.body.length > 1e6) req.connection.destroy();
    });
    req.on('end', () => {
      JPS.post = JSON.parse(JPS.body);
      console.log("POST:", JPS.post);
      JPS.currentUserToken = JPS.post.user;
      JPS.courseInfo = JPS.post.courseInfo;
      JPS.cancelItem = JPS.post.cancelItem;
      JPS.txRef = JPS.post.transactionReference;

      JPS.firebase.auth().verifyIdToken(JPS.currentUserToken)
      .then( decodedToken => {
        JPS.currentUserUID = decodedToken.sub;
        console.log("User: ", JPS.currentUserUID, " requested checkout.");
        return JPS.firebase.database().ref('/users/'+JPS.currentUserUID).once('value');
      })
      .then( snapshot => {
        if(snapshot.val() != null){
          JPS.user = snapshot.val();
          JPS.user.key = snapshot.key;
          console.log("USER:",JPS.user);
          return JPS.firebase.database().ref('/bookingsbycourse/' + JPS.courseInfo.key + '/' + JPS.cancelItem + '/' + JPS.user.key).once('value');
        } else {
          throw(new Error("User record does not exist in the database: " + JPS.currentUserUID))
        }
      })
      .then( snapshot =>{
        if(snapshot.val() != null){
          return JPS.firebase.database().ref('/bookingsbyuser/' + JPS.user.key + '/' +JPS.courseInfo.key + '/' + JPS.cancelItem).once('value');
        } else {
          throw(new Error("Booking by-COURSE does not exist in the database."))
        }
      })
      .then( snapshot =>{
        if(snapshot.val() != null){
          return JPS.firebase.database().ref('/bookingsbyuser/' + JPS.user.key + '/' +JPS.courseInfo.key + '/' + JPS.cancelItem).remove();
        } else {
          throw(new Error("Booking by-USER does not exist in the database."))
        }
      })
      .then( err => {
        if(err){
          throw(new Error(err.message + " " + err.code));
        }
        return JPS.firebase.database().ref('/bookingsbycourse/' + JPS.courseInfo.key + '/' + JPS.cancelItem + '/' + JPS.user.key).remove();
      })
      .then( err => {
        if(err){
          throw(new Error(err.message + " " + err.code));
        }
        else {
          if(JPS.txRef != 0){
            //Give back one use time for the user
            JPS.TransactionRef = JPS.firebase.database().ref('/transactions/'+JPS.user.key+'/'+JPS.txRef );
            JPS.TransactionRef.once('value')
            .then( snapshot => {
              if(snapshot.val() == null){
                throw(new Error("Transaction not found in the DB: TX:" + JPS.user.key+"/"+JPS.txRef));
              } else {
                JPS.unusedtimes = snapshot.val().unusedtimes;
                JPS.unusedtimes++;
                JPS.TransactionRef.update({unusedtimes: JPS.unusedtimes})
                .then( err => {
                  if(err){
                    throw(new Error(err.message + " " + err.code));
                  } else {
                    res.status(200).jsonp({message : "Cancellation COUNT was succesfull."}).end();
                  }
                }). catch( err => {
                  throw(new Error(err.message + " " + err.code));
                })
              }
            }).catch( err => {
              throw(new Error(err.message + " " + err.code));
            })
          } else {
            res.status(200).jsonp({message : "Cancellation TIME was succesfull."}).end();
          }
        }
      })
      .catch( err => {
        console.error("POST Cancel Slot failed: ", err);
        res.status(500).jsonp({message: "POST Cancel Slot failed:"}).end(err);
      });
    })
  })
}
