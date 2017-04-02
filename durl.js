module.exports = function(context, cb) {
  const AWS = require('aws-sdk@2.5.3')
  const s3 = new AWS.S3();
  AWS.config.update({accessKeyId: context.awsId, secretAccessKey: context.awsSecret})
  const b = 'sgc-download-test';
  const k = 'test.vcf';
  const e = 1;

  const url = s3.getSignedUrl('getObject', {
      Bucket: b,
      Key: k,
      Expires: e
  });
  cb(null, url);
}
