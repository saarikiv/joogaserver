exports.setApp = function(JPS) {

    //######################################################
    // POST: cashbuy, post the item being purchased
    //######################################################
    JPS.app.post('/approveincomplete', (req, res) => {

        JPS.now = Date.now();
        console.log("approveincomplete requested.", JPS.now);
        JPS.body = '';
        req.on('data', (data) => {
            JPS.body += data;
            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (JPS.body.length > 1e6) req.connection.destroy();
        });
        req.on('end', () => {
            JPS.post = JSON.parse(JPS.body);
            JPS.currentUserToken = JPS.post.current_user;
            JPS.pendingTransactionKey = JPS.post.pending_transaction_id;
            console.log("POST:", JPS.post);

            JPS.firebase.auth().verifyIdToken(JPS.currentUserToken)
                .then(decodedToken => {
                    JPS.currentUserUID = decodedToken.sub;
                    console.log("User: ", JPS.currentUserUID, " requested approveincomplete for trx: ", JPS.pendingTransactionKey);
                    return JPS.firebase.database().ref('/users/' + JPS.currentUserUID).once('value');
                })
                .then(snapshot => {
                    JPS.user = snapshot.val()
                    JPS.user.key = snapshot.key;
                    return JPS.firebase.database().ref('/specialUsers/' + JPS.currentUserUID).once('value');
                })
                .then(snapshot => {
                    JPS.specialUser = snapshot.val()
                    if (JPS.specialUser.admin || JPS.specialUser.instructor) {
                        console.log("USER requesting cashpay is ADMIN or INSTRUCTOR");
                        JPS.result = JPS.pendingTransactionsHelper.completePendingTransaction(JPS, JPS.pendingTransactionKey, JPS.user.lastname, "Admin")
                        switch(JPS.result.code){
                            case 200:
                                res.status(200).end();
                                break;
                            case 500:
                                throw(new Error(JPS.result.message))
                        }
                    } else{
                        throw (new Error("Non admin or instructor user requesting cashbuy."))
                    }
                }).catch(err => {
                    console.error("approveincomplete failde: ", err);
                    res.status(500).jsonp({
                        message: "approveincomplete failde." + err.toString()
                    }).end(err);
                });
        })
    })
}