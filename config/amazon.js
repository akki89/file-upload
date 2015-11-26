require('newrelic') ;
module.exports = {
    address: '0.0.0.0',
    port: process.env.PORT || 3002,
    s3: {
        accessKeyId: "AKIAIGQTHJMN3BOJ5JVQ",
        secretAccessKey: "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"
    },
    bucket: 'grs-centralstore-01',
    redis: {
        port: 6379,
        host: '172.16.200.60',
        auth: 'ahkoogh7rah1deifohsh1Eik1Paida',
        scope: 'globalrockstar-prod'
    },
    goodOptions: {
        subscribers: {
            'udp://172.16.200.70:3004' : ['request', 'error', 'ops']
        },
        opsInterval: 60000
    }
};

// rsync -rcv . deploy@172.28.0.91:/home/node/globalrockstar/composer
