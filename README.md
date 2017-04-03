### Durl
Authenticated [webtask](https://webtask.io/) that returns an AWS presigned S3
url and updates stats on a DynamnoDb Table.

### Setup:

Basic process to setup the webtask is:

```bash
npm install wt-cli -g
...
wt init <email>
...
wt create https://github.com/shusson/durl \
          --name durl \
          --secret awsId=<aws id> \
          --secret awsSecret=<aws secret> \
          --secret AUTH0_CLIENT_ID=<auth0 client id> \
          --secret AUTH0_CLIENT_SECRET=<auth0 client secret> \
          --secret AUTH0_DOMAIN=<auth0 domain>

### output should be something like
# Webtask created
#
# You can access your webtask at the following url:
#
# https://wt-<hash>.run.webtask.io/durl
```
More info on the official docs at https://webtask.io/docs/101.
