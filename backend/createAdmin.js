const http = require('http');

const data = JSON.stringify({
  full_name: 'Admin PetCare',
  email: 'admin@petcare.com',
  phone: '0987654321',
  password: 'password123',
  role: 'ADMIN'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();
