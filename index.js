const path = require('path');
const _ = require('lodash');
const realAWS = require('aws-sdk');
const AWS = require('aws-sdk-mock');
AWS.setSDK(path.resolve('node_modules/aws-sdk'));

class ServerlessOfflineAwsSdkSts {
    constructor(serverless, options) {
        this.hooks = {
            'before:offline:start:init': this.start.bind(this),
            'before:offline:start': this.start.bind(this),
        }
    }

    start() {
        this.createMocks();
    }

    createMocks() {
        AWS.mock('STS', 'getCallerIdentity', (params, callback) => {
            process.nextTick(() => {
                callback(null, {
                    ResponseMetadata: {
                        RequestId: `offlineContext_requestId_${_.random()}`
                    },
                    UserId: 'offlineContext_userId',
                    Account: 'offlineContext_accountId',
                    Arn: 'arn:aws:sts::offlineContext_accountId:assumed-role/LambdaExecution/offlineContext_caller'
                })
            })
        })

        AWS.mock('STS', 'assumeRole', (params, callback) => {
            process.nextTick(() => {
                callback(null, {
                    ResponseMetadata: {
                        RequestId: `offlineContext_requestId_${_.random()}`
                    },
                    Credentials: {
                        AccessKeyId: 'offlineContext_accessKeyId',
                        SecretAccessKey: 'offlineContext_secretAccessKey',
                        SessionToken: 'offlineContext_sessionToken',
                        Expiration: new Date()
                    },
                    AssumedRoleUser: {
                        AssumedRoleId: 'offlineContext_assumedRoleId',
                        Arn: 'arn:aws:sts::offlineContext_accountId:assumed-role/LambdaExecution/offlineContext_caller'
                    }
                })
            })
        })
    }
}

module.exports = ServerlessOfflineAwsSdkSts;
