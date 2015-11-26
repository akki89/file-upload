module.exports = {
    address: '127.0.0.1',
    port: 8005,
    api: 'http://127.0.0.1:3003',
    s3: {
        accessKeyId: "AKIAIGQTHJMN3BOJ5JVQ",
        secretAccessKey: "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"
    },
    redis: {
        port: 6379,
        host: process.env.LOCAL_DB || process.env.LOCAL_REDIS ? 'localhost' : 'devdblin.dmz.dd.loc',
        auth: process.env.LOCAL_DB || process.env.LOCAL_REDIS ? '' : 'eepho0tiupohnatiuc8ait7Wei9geigootheesae',
        scope: 'globalrockstar'
    }
};
