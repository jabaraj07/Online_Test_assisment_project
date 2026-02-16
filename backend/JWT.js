const jwt = require('crypto').randomBytes(32).toString('base64');
console.log("JWT Secret:", jwt);