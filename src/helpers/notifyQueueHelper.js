module.exports = {
    notifyQueue: (JPS, courseInfo, courseInstance) => {

        var promise = new Promise((resolve, reject) => {

            JPS.firebase.database().ref('/queuebycourse/' + courseInfo.key + '/' + courseInstance).once('value')
            .then(snapshot => {
                const users = snapshot.val()
                if (users === null) {
                    resolve()
                }
                for (let user in users) {
                    JPS.mailer.sendQueueNotification(users[user].email, courseInfo, courseInstance)
                }
            })            
            .catch(err => {
                console.error("Notifying Queue failed: ", err);
                reject( "Notifying Queue failed: " + err.toString() );
            });
            resolve()
        })
        return promise;
    }
}
