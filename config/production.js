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
        host: 'localhost',
        auth: 'eepho0tiupohnatiuc8ait7Wei9geigootheesae',
        scope: 'globalrockstar'
    },
    goodOptions: {
        subscribers: {
            'console' : ['error']
        }
    }
};

// rsync -rcv . deploy@172.28.0.91:/home/node/globalrockstar/composer
