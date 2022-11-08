const fs = require('fs');
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

const data = "NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=" + vapidKeys.publicKey + "\nNEXT_PRIVATE_WEB_PUSH_PRIVATE_KEY=" + vapidKeys.privateKey;

fs.writeFile(".env.local", data, function(err) {
  if(err) {
      return console.log(err);
  }
  console.log("The file was saved!");
}); 

console.log("Public Key: " + vapidKeys.publicKey);
console.log("Private Key: " + vapidKeys.privateKey);
