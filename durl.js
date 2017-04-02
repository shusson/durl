module.exports = function(context, cb) {
  const AWS = require('aws-sdk')
  const b = 'sgc-download-test';
  const k = 'test.vcf';
  const e = 60;
  const creds = new AWS.Credentials(context.secrets.awsId, context.secrets.awsSecret);
  const s3 = new AWS.S3({credentials: creds});
  const url = s3.getSignedUrl('getObject', {
      Bucket: b,
      Key: k,
      Expires: e,
      ResponseContentType: 'text/plain',
      ResponseContentDisposition: 'attachment; filename=' + k
  }, function (err, url) {
    cb(err, url);
  });
}
