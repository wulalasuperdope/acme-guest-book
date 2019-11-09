const http = require('http');
const fs = require('fs');

const readFile = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    });
  });
};

const writeFile = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const addGuest = guest => {
  return readFile('./guests.json').then(data => {
    const guests = JSON.parse(data);
    let max = guests.reduce((acc, guest) => {
      if (guest.id > acc) {
        acc = guest.id;
      }
      return acc;
    }, 0);
    guest.id = max + 1;
    guests.push(guest);
    writeFile('./guests.json', JSON.stringify(guests));
    console.log('inside add guest', guests);
    return guests;
  });
};

http
  .createServer((req, res) => {
    if (req.url === '/api/guests') {
      if (req.method === 'GET') {
        readFile('./guests.json')
          .then(data => {
            res.write(data);
            res.end();
          })
          .catch(ex => {
            res.statusCode = 500;
            res.write(ex.message);
            res.end();
          });
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });
        req.on('end', () => {
          const guest = JSON.parse(body);
          addGuest(guest)
            .then(guests => {
              console.log('server guests', guests);
              res.statusCode = 201;
              res.write(JSON.stringify(guests));
              res.end();
            })
            .catch(ex => {
              res.statusCode = 500;
              res.write(ex.message);
              res.end();
            });
        });
      }
    } else if (req.url === '/') {
      readFile('./index.html')
        .then(data => {
          res.write(data);
          res.end();
        })
        .catch(ex => {
          res.statusCode = 500;
          res.write(ex.message);
          res.end();
        });
    }
  })
  .listen(3000);
