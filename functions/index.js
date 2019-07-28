const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const firestore = admin.firestore();

const whitelist = [
    'https://pushtestapp-51f6f.web.app', 
    'https://pushtestapp-51f6f.firebaseapp.com',
    'https://tadashiy1012.github.io'
];
const corsOpt = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};
const cors = require('cors')(corsOpt);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        const ref = firestore.collection('users');
        ref.get().then((ss) => {
            let data = [];
            ss.forEach((doc) => {
                data.push(doc.data());
            });
            response.send(JSON.stringify(data));
        }).catch((err) => {
            console.error(err);
            response.status(500).send('ng');
        });
    });
});

exports.putUser = functions.https.onRequest((req, res) => {
    const subject = req.query.name;
    const ref = firestore.collection('users');
    ref.add({
        name: subject
    }).then((doc) => {
        console.log(doc.id);
        res.send('ok');
    }).catch((err) => {
        console.error(err);
        res.status(500).send('ng');
    });
});

exports.putToken = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const subject = req.query.token;
        const ref = firestore.collection('tokens');
        ref.get().then((ss) => {
            let tokens = [];
            ss.forEach((e) => { tokens.push(e.data()); });
            const filterd = tokens.filter((e) => e.token === subject);
            if (filterd.length !== 0) {
                res.send('ok:exist');
            } else {
                ref.add({
                    token: subject
                }).then((doc) => {
                    console.log(doc.id);
                    res.send('ok');
                }).catch((err) => {
                    console.error(err);
                    res.status(500).send('ng');
                });
            }
        }).catch((err) => {
            console.error(err);
            res.status(500).send('ng');
        });
    });
});

exports.requestPush = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const ref = firestore.collection('tokens');
        ref.get().then((ss) => {
            let tokens = [];
            let tasks = [];
            ss.forEach((doc) => {
                const token = doc.data().token;
                tokens.push(token);
            });
            [...new Set(tokens)].forEach((token) => {
                const message = {
                    notification: {
                        title: "test push",
                        body: "hoge"
                    },
                    token
                };
                tasks.push(admin.messaging().send(message));
            });
            return Promise.all(tasks);
        }).then((resps) => {
            console.log(resps);
            res.send('ok');
        }).catch((err) => {
            console.error(err);
            res.status(500).send('ng');
        });
    });
});

exports.requestListPush = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const text = req.body.text;
        const tokens = req.body.tokens;
        let tasks = [];
        [...new Set(tokens)].forEach((token) => {
            const message = {
                notification: {
                    title: "test push",
                    body: text
                },
                token
            };
            tasks.push(admin.messaging().send(message));
        });
        return Promise.all(tasks).then((resps) => {
            console.log(resps);
            res.send('ok');
        }).catch((err) => {
            console.error(err);
            res.status(500).send('ng');
        });
    });
});

exports.requestTokenList = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const ref = firestore.collection('tokens');
        ref.get().then((ss) => {
            let tokens = [];
            ss.forEach((e) => { tokens.push(e.data().token); });
            res.send(JSON.stringify(tokens));
        }).catch((err) => {
            console.error(err);
            res.status(500).send('ng');
        });
    });
});