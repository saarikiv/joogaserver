module.exports = {
    cancelSlot: (JPS, user, courseInfo, courseInstance, transactionReference) => {

        var promise = new Promise((resolve, reject) => {

            console.log("USER:", user);
            JPS.firebase.database().ref('/bookingsbycourse/' + courseInfo.key + '/' + courseInstance + '/' + user.key).once('value')
            .then(snapshot => {
                if (snapshot.val() == null) {
                    throw (new Error("Booking by-COURSE does not exist in the database."))
                }
                return JPS.firebase.database().ref('/bookingsbyuser/' + user.key + '/' + courseInfo.key + '/' + courseInstance).once('value');
            })
            .then(snapshot => {
                if (snapshot.val() == null) {
                    throw (new Error("Booking by-USER does not exist in the database."))
                }
                return JPS.firebase.database().ref('/bookingsbyuser/' + user.key + '/' + courseInfo.key + '/' + courseInstance).remove();
            })
            .then(() => {
                return JPS.firebase.database().ref('/bookingsbycourse/' + courseInfo.key + '/' + courseInstance + '/' + user.key).remove();
            })
            .then(() => {
                console.log("Transaction reference: ", transactionReference)
                if (transactionReference != 0) {
                    //Give back one use time for the user
                    JPS.firebase.database().ref('/transactions/' + user.key + '/' + transactionReference).once('value')
                        .then(snapshot => {
                            if (snapshot.val() == null) {
                                throw (new Error("Transaction not found in the DB: TX:" + user.key + "/" + transactionReference));
                            }
                            JPS.unusedtimes = snapshot.val().unusedtimes;
                            JPS.unusedtimes++;
                            return JPS.firebase.database().ref('/transactions/' + user.key + '/' + transactionReference).update({
                                unusedtimes: JPS.unusedtimes
                            })
                        })
                        .then(() =>{
                            if (user.email) JPS.mailer.sendCourseCancellationCount(user.email, courseInfo, courseInstance); //Send confirmation email
                        }).catch(err => {
                            throw (new Error(err.message + " " + err.code));
                        })
                } else {
                    if (user.email) JPS.mailer.sendCourseCancellationTime(user.email, courseInfo, courseInstance); //Send confirmation email
                }
                JPS.firebase.database().ref('/queuebycourse/'+courseInfo.key+'/'+courseInstance).remove()
                JPS.firebase.database().ref('/queuebyuser/').once('value')
                .then( snapshot => {
                    if(snapshot.val() !== null){
                        var users = snapshot.val()
                        for(var user in users){
                            for(var course in users[user]){
                                if(course === courseInfo.key){
                                    JPS.firebase.database().ref('/queuebyuser/'+user+'/'+course).remove()
                                }
                            }
                        }
                    }
                })
            })
            .catch(err => {
                console.error("Cancel Slot failed: ", err);
                reject( "cancel slot failed: " + err.toString() );
            });
            resolve()
        })
        return promise;
    }
}
