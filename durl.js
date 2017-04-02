var app = new (require('express'))();
var wt = require('webtask-tools');

app.get('/', function (req, res) {
  const AWS = require('aws-sdk')
  const b = 'sgc-download-test';
  const k = 'test.vcf';
  const e = 60;
  const creds = new AWS.Credentials(req.webtaskContext.secrets.awsId, req.webtaskContext.secrets.awsSecret);
  const s3 = new AWS.S3({credentials: creds});
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
      res.end(JSON.stringify(url));
    }
  });
});

module.exports = wt.fromExpress(app)
.auth0({
    clientId: (ctx, req) => ctx.secrets.AUTH0_CLIENT_ID,
    clientSecret: (ctx, req) => ctx.secrets.AUTH0_CLIENT_SECRET,
    domain: (ctx, req) => ctx.secrets.AUTH0_DOMAIN
});
