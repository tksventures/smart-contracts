const http = require('http');

const localNode = {
  nodeUrl: 'http://localhost:6869',
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
