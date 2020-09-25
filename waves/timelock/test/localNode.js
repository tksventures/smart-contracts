const http = require('http');

const localNode = {
  height() {
    return new Promise((resolve) => {
      http.get(
        {
          hostname: 'localhost',
          port: 6869,
          path: '/blocks/height',
          agent: false,
        },
        (resp) => {
          let data = '';
          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            const { height } = JSON.parse(data);
            console.log(JSON.parse(data));
            resolve(height);
          });
        },
      );
    });
  },

  waitUntilBlock(block, intervalMs = 1000) {
    return new Promise((resolve) => {
      const observer = setInterval(async () => {
        const height = await localNode.height();
        if (height >= block) {
          clearInterval(observer);
          resolve();
        }
      }, intervalMs);
    });
  },

  accountData(address, key) {
    return new Promise((resolve) => {
      http.get(
        {
          hostname: 'localhost',
          port: 6869,
          path: `/addresses/data/${address}/${key}`,
          agent: false,
        },
        (resp) => {
          let data = '';
          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            const { value } = JSON.parse(data);
            console.log(JSON.parse(data));
            resolve(value);
          });
        },
      );
    });
  },
};

module.exports = localNode;
