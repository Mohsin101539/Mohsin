const bcrypt = require('bcrypt');

const password = process.argv[2] || 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log(`Password: "${password}"`);
    console.log(`Bcrypt Hash: ${hash}`);
    console.log('\nCopy the hash above into your server/.env file for ADMIN_PASSWORD_HASH=');
});
