
exports.setApp = function (JPS){

  //######################################################
  // POST: requestQueue
  // Request user to full course queue for notifications.
  //######################################################

  JPS.app.post('/requestQueue', (req, res) => {
    JPS.now = Date.now();
    console.log("POST: requestQueue", JPS.now);
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
      JPS.weeksForward = JPS.post.weeksForward;
      JPS.courseTime = JPS.timeHelper.getCourseTimeLocal(JPS.weeksForward, JPS.courseInfo.start, JPS.courseInfo.day)

      JPS.firebase.auth().verifyIdToken(JPS.currentUserToken)

      .then( decodedToken => {
        JPS.currentUserUID = decodedToken.sub;
        console.log("User: ", JPS.currentUserUID, " requested checkout.");
        return JPS.firebase.database().ref('/users/'+JPS.currentUserUID).once('value')
      })
      
      .then ( snapshot => {
        if(snapshot.val() == null){
          throw(new Error("User record does not exist in the database: " + JPS.currentUserUID))
        }
        JPS.user = snapshot.val();
        JPS.user.key = snapshot.key;
        console.log("USER:",JPS.user);
        console.log("courseINFO:",JPS.courseInfo);
      })
      
      .catch( err => {
        console.error("Queue failed: ", err);
        res.status(500).jsonp("Queue failed" + String(err)).end();
      })
    })
  })
}
