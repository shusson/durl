var app = new (require('express'))();
var wt = require('webtask-tools');

const AWS = require('aws-sdk')
const table = 'sgc-downloads';
const region = 'ap-southeast-2';
const bucket = 'sgc-garvan';
const key = 'test.vcf';
const expiry = 60 * 60 * 5;

app.get('/', function (req, res) {
    const creds = new AWS.Credentials(req.webtaskContext.secrets.awsId, req.webtaskContext.secrets.awsSecret);
    const s3 = new AWS.S3({credentials: creds, region: region});
    const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: key,
        Expires: expiry,
        ResponseContentType: 'text/plain',
        ResponseContentDisposition: 'attachment; filename=' + key
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
    var db = new AWS.DynamoDB({credentials: creds, region: region});
    var paramKey = {
        "email": {
            S: req.user.email
        }
    };
    var params = {
        Key: paramKey,
        TableName: table,
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
            TableName: table,
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
