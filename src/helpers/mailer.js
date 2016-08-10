var JPSM = {}
JPSM.Mailgun = require('mailgun-js')
JPSM.mg_api_key = process.env.MAILGUN_API_KEY || 'key-4230707292ae718f00a8274d41beb7f3';
JPSM.mg_domain = 'sandbox75ae890e64684217a94067bbc25db626.mailgun.org';
JPSM.mg_from_who = 'postmaster@sandbox75ae890e64684217a94067bbc25db626.mailgun.org';
JPSM.initialized = false;

module.exports = {

    initializeMail: (jps) => {
        if (!JPSM.initialized) {
            JPSM.jps = jps;
            JPSM.mailgun = new JPSM.Mailgun({
                apiKey: JPSM.mg_api_key,
                domain: JPSM.mg_domain
            });
        }
        JPSM.initialized = true;
    },

    sendThankyouForFeedback: (user) => {
        if (!JPSM.initialized) return;

        console.log("sendThankyouForFeedback")
        console.log(user)

        JPSM.html =
            "<h1>Kiitos palautteesta!</h1>" +
            "<p>Olemme vastaanottaneet palautteenne.</p>" +
            "<p>Arvostamme sitä, että käytit aikaasi antaaksesi meille palautetta.</p>" +
            "<p>Lähetämme teille tietoa toimenpiteistä, joihin palautteenne johtaa.</p>" +
            "<br>" +
            "<p>Ystävällisin terveisin,</p>" +
            "<p>Joogakoulu Silta</p>"
        console.log("Thankyou: ", JPSM.html)

        JPSM.data = {
            from: JPSM.mg_from_who,
            to: user.email,
            subject: 'Kitos palautteesta!',
            html: JPSM.html
        }
        JPSM.mailgun.messages().send(JPSM.data, (err, body) => {
            if (err) {
                console.error("MAILGUN-error: ", err);
            } else {
                console.log("MAIL-SENT: ", body);
            }
        });
    },


    sendFeedback: (user, feedback) => {
        if (!JPSM.initialized) return;

        console.log("sendFeedback")
        console.log(user)
        console.log(feedback)

        JPSM.html =
            "<h1>Palaute:</h1>" +
            "<p>"+ feedback +"</p>" +
            "<br>" +
            "<p> Terveisin " + user.email + "</p>"
        console.log("Feedback: ", JPSM.html)

        JPSM.data = {
            from: JPSM.mg_from_who,
            to: "tero.saarikivi@outlook.com",
            subject: 'Joogakoulu Silta palaute',
            html: JPSM.html
        }
        JPSM.mailgun.messages().send(JPSM.data, (err, body) => {
            if (err) {
                console.error("MAILGUN-error: ", err);
            } else {
                console.log("MAIL-SENT: ", body);
            }
        });
    },

    sendConfirmation: (sendTo, courseInfo, courseTime) => {
        if (!JPSM.initialized) return;

        console.log("sendConfirmation")
        console.log(sendTo)
        console.log(courseInfo)
        console.log(courseTime)

        JPSM.html =
            "<h1>Varauksen vahvistus</h1>" +
            "<p>Varauksesi kurssille " + courseInfo.courseType.name + " on vahvistettu.</p>" +
            "<p>Kurssipäivä: " + JPSM.jps.timeHelper.getDayStr(courseTime) + "</p>" +
            "<p>Kurssiaika: " + JPSM.jps.timeHelper.getTimeStr(courseTime) + "</p>" +
            "<br></br>" +
            "<p>Mikäli et pääse osallistumaan kurssille voit perua ilmoittautumisesi vielä edellisenä päivänä.</p>" +
            "<footer><a href=\"https: //joogakoulusilta-projekti.firebaseapp.com\">Joogakoulu Silta</a>, jooga(at)joogasilta.com</footer>"

        console.log("CONFIRMATION: ", JPSM.html)

        JPSM.data = {
            from: JPSM.mg_from_who,
            to: sendTo,
            subject: 'Varausvahvistus:' + courseTime.toString() + ' - Joogakoulu Silta',
            html: JPSM.html
        }
        JPSM.mailgun.messages().send(JPSM.data, (err, body) => {
            if (err) {
                console.error("MAILGUN-error: ", err);
            } else {
                console.log("MAIL-SENT: ", body);
            }
        });
    },

    sendCourseCancellationCount: (sendTo, courseInfo, courseTimeMs) => {
        if (!JPSM.initialized) return;
        var day = new Date()
        day.setTime(courseTimeMs)
        console.log("sendCourseCancellationCount")
        console.log(courseTimeMs)

        JPSM.html =
            "<h1>Kurssi jolle olet ilmoittautunut on peruttu!</h1>" +
            "<p>Kurssi " + courseInfo.courseType.name + " on peruttu.</p>" +
            "<p>Kurssipäivä: " + JPSM.jps.timeHelper.getDayStr(day) + "</p>" +
            "<p>Kurssiaika: " + JPSM.jps.timeHelper.getTimeStr(day) + "</p>" +
            "<br></br>" +
            "<p>Kertalippusi on palautettu tilillesi.</p>" +
            "<p>Terve tuloa jonain toisena ajankohtana.</p>" +
            "<footer><a href=\"https: //joogakoulusilta-projekti.firebaseapp.com\">Joogakoulu Silta</a>, jooga(at)joogasilta.com</footer>"

        JPSM.data = {
            from: JPSM.mg_from_who,
            to: sendTo,
            subject: 'Kurssin peruutusilmoitus:' + day.toString() + ' - Joogakoulu Silta',
            html: JPSM.html
        }
        JPSM.mailgun.messages().send(JPSM.data, (err, body) => {
            if (err) {
                console.error("MAILGUN-error: ", err);
            } else {
                console.log("CANCEL-SENT: ", body);
            }
        });
    },

    sendCourseCancellationTime: (sendTo, courseInfo, courseTimeMs) => {
        if (!JPSM.initialized) return;
        var day = new Date()
        day.setTime(courseTimeMs)
        console.log("sendCancellationTime")
        console.log(courseTimeMs)

        JPSM.html =
            "<h1>Kurssi jolle olet ilmoittautunut on peruttu!</h1>" +
            "<p>Kurssi " + courseInfo.courseType.name + " on peruttu.</p>" +
            "<p>Kurssipäivä: " + JPSM.jps.timeHelper.getDayStr(day) + "</p>" +
            "<p>Kurssiaika: " + JPSM.jps.timeHelper.getTimeStr(day) + "</p>" +
            "<br></br>" +
            "<p>Terve tuloa jonain toisena ajankohtana.</p>" +
            "<footer><a href=\"https: //joogakoulusilta-projekti.firebaseapp.com\">Joogakoulu Silta</a>, jooga(at)joogasilta.com</footer>"

        JPSM.data = {
            from: JPSM.mg_from_who,
            to: sendTo,
            subject: 'Kurssin peruutusilmoitus:' + day.toString() + ' - Joogakoulu Silta',
            html: JPSM.html
        }
        JPSM.mailgun.messages().send(JPSM.data, (err, body) => {
            if (err) {
                console.error("MAILGUN-error: ", err);
            } else {
                console.log("CANCEL-SENT: ", body);
            }
        });
    },


    sendCancellationCount: (sendTo, courseInfo, courseTimeMs) => {
        if (!JPSM.initialized) return;
        var day = new Date()
        day.setTime(courseTimeMs)
        console.log("sendCancellationCount")
        console.log(courseTimeMs)

        JPSM.html =
            "<h1>Peruutuksen vahvistus</h1>" +
            "<p>Peruutuksesi kurssille " + courseInfo.courseType.name + " on vahvistettu.</p>" +
            "<p>Kurssipäivä: " + JPSM.jps.timeHelper.getDayStr(day) + "</p>" +
            "<p>Kurssiaika: " + JPSM.jps.timeHelper.getTimeStr(day) + "</p>" +
            "<br></br>" +
            "<p>Kertalippusi on palautettu tilillesi.</p>" +
            "<p>Terve tuloa jonain toisena ajankohtana.</p>" +
            "<footer><a href=\"https: //joogakoulusilta-projekti.firebaseapp.com\">Joogakoulu Silta</a>, jooga(at)joogasilta.com</footer>"

        JPSM.data = {
            from: JPSM.mg_from_who,
            to: sendTo,
            subject: 'Peruutusvahvistus:' + day.toString() + ' - Joogakoulu Silta',
            html: JPSM.html
        }
        JPSM.mailgun.messages().send(JPSM.data, (err, body) => {
            if (err) {
                console.error("MAILGUN-error: ", err);
            } else {
                console.log("CANCEL-SENT: ", body);
            }
        });
    },

    sendCancellationTime: (sendTo, courseInfo, courseTimeMs) => {
        if (!JPSM.initialized) return;
        var day = new Date()
        day.setTime(courseTimeMs)
        console.log("sendCancellationTime")
        console.log(courseTimeMs)

        JPSM.html =
            "<h1>Peruutuksen vahvistus</h1>" +
            "<p>Peruutuksesi kurssille " + courseInfo.courseType.name + " on vahvistettu.</p>" +
            "<p>Kurssipäivä: " + JPSM.jps.timeHelper.getDayStr(day) + "</p>" +
            "<p>Kurssiaika: " + JPSM.jps.timeHelper.getTimeStr(day) + "</p>" +
            "<br></br>" +
            "<p>Terve tuloa jonain toisena ajankohtana.</p>" +
            "<footer><a href=\"https: //joogakoulusilta-projekti.firebaseapp.com\">Joogakoulu Silta</a>, jooga(at)joogasilta.com</footer>"

        JPSM.data = {
            from: JPSM.mg_from_who,
            to: sendTo,
            subject: 'Peruutusvahvistus:' + day.toString() + ' - Joogakoulu Silta',
            html: JPSM.html
        }
        JPSM.mailgun.messages().send(JPSM.data, (err, body) => {
            if (err) {
                console.error("MAILGUN-error: ", err);
            } else {
                console.log("CANCEL-SENT: ", body);
            }
        });
    },

    sendReceipt: (sendTo, trx, trxId) => {
        if (!JPSM.initialized) return;

        console.log("sendReceipt")
        console.log(trx.title)
        var expires = new Date();
        expires.setTime(trx.expires);

        JPSM.html =
            "<h1>Ostokuitti</h1>" +
            "<br></br>" +
            "<p>Tuote: " + trx.title + "</p>" +
            "<p>Tuotekuvaus: " + trx.desc + "</p>" +
            "<p>Voimassaolo loppuu: " + JPSM.jps.timeHelper.getDayStr(expires) + "</p>" +
            "<p>Veroton hinta: " + trx.beforetax + " " + trx.details.transaction.currencyIsoCode + "</p>" +
            "<p>ALV(" + trx.taxpercent + ")     : " + trx.taxamount + " " + trx.details.transaction.currencyIsoCode + "</p>" +
            "<p>Yhteensä     : " + trx.price + " " + trx.details.transaction.currencyIsoCode + "</p>" +
            "<br></br>" +
            "<p>Ostotunniste: " + trxId + "</p>" +
            "<p>Maksupalvelutunniste: " + trx.details.transaction.id + "</p>" +
            "<p>Maksutapa: " + trx.details.transaction.paymentInstrumentType + "</p>" +
            "<br></br>" +
            "<p>Y-tunnus: 2736475-2  ALV-numero: FI27364752</p>" +
            "<footer><a href=\"https: //joogakoulusilta-projekti.firebaseapp.com\">Joogakoulu Silta</a>, jooga(at)joogasilta.com</footer>"

        JPSM.data = {
            from: JPSM.mg_from_who,
            to: sendTo,
            subject: 'Ostokuitti, Joogakoulu Silta',
            html: JPSM.html
        }
        JPSM.mailgun.messages().send(JPSM.data, (err, body) => {
            if (err) {
                console.error("MAILGUN-RECEIPT-error: ", err);
            } else {
                console.log("RECEIPT-SENT: ", body);
            }
        });
    }


}
