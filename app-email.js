var config = require("./protected-config");

function sendEmail(req, res, next) {

    const mailjet = require ('node-mailjet')
    .connect(config.MailApiKey, config.MailSecretKey)
    const request = mailjet
    .post("send", {'version': 'v3.1'})
    .request({
        "Messages":[
                {
                        "From": {
                                "Email": "gustavo.ubatuba@gmail.com",
                                "Name": "Gustavo Ubatuba"
                        },
                        "To": [
                                {
                                        "Email": req.email,
                                        "Name": req.nome
                                }
                        ],
                        "TemplateID": 550722,
                        "TemplateLanguage": true
                }
        ]
    })
    request.then((result) => {
        console.log(result.body)
    })
    .catch((err) => {
        console.log(err.statusCode)
    })
}
module.exports = sendEmail;
