var app = new (require('express'))();
var wt = require('webtask-tools');

const AWS = require('aws-sdk')

app.get('/', function (req, res) {
    const creds = new AWS.Credentials(req.webtaskContext.secrets.awsId, req.webtaskContext.secrets.awsSecret);

    const b = 'sgc-download-test';
    const k = 'test.vcf';
    const e = 60 * 60 * 5;

    const s3 = new AWS.S3({credentials: creds, region: 'ap-southeast-2'});

    const url = s3.getSignedUrl('getObject', {
        Bucket: b,
        Key: k,
        Expires: e,
        ResponseContentType: 'text/plain',
        ResponseContentDisposition: 'attachment; filename=' + k
    }, function (err, url) {
        if (err) {
            res.status(500).end(JSON.stringify(err));
        } else {
            updateStats(req, res, creds, function () {
                res.end(JSON.stringify(url));
            });
        }
    });
});

function updateStats(req, res, creds, cb) {
    var db = new AWS.DynamoDB({credentials: creds, region: 'us-west-2'});
    var paramKey = {
        "email": {
            S: req.user.email
        }
    };
    var params = {
        Key: paramKey,
        TableName: "downloads"
    };
    db.getItem(params, function (err, data) {
        if (err) {
            res.status(500).end(JSON.stringify(err));
        }
        var count = "0";
        if (data["Item"] && data["Item"]["mgrb"]["N"]) {
            count = data["Item"]["mgrb"]["N"];
        }
        var updateParams = {
            ExpressionAttributeNames: {
                "#Y": "mgrb"
            },
            ExpressionAttributeValues: {
                ":y": {
                    N: String(Number(count) + 1)
                }
            },
            Key: paramKey,
            TableName: "downloads",
            UpdateExpression: "SET #Y = :y"
        };
        db.updateItem(updateParams, function (err, updateData) {
            if (err) {
                res.status(500).end(JSON.stringify(err));
            } else {
                cb();
            }
        });
    });
}

module.exports = wt.fromExpress(app)
    .auth0({
        clientId: (ctx, req) => ctx.secrets.AUTH0_CLIENT_ID,
        clientSecret: (ctx, req) => ctx.secrets.AUTH0_CLIENT_SECRET,
        domain: (ctx, req) => ctx.secrets.AUTH0_DOMAIN,
        scope: 'email'
    });
