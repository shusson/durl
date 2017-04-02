const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const b = 'sgc-download-test';
const k = 'test.vcf';
const e = 1;

const url = s3.getSignedUrl('getObject', {
    Bucket: b,
    Key: k,
    Expires: e
});
