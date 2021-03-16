# auth-api
RBAC server using ACL built with node, express, mongoose

## Author: Anne Thorsteinson

**[Tests](https://github.com/AnneThor/bearer-auth/actions)**

**[Front End](https://bearer-auth-at.herokuapp.com/)**

## Setup

```.env``` requirements:

- ```PORT``` - port number
- ```SECRET``` - used to create jwt

## Running the App

There is no front end, so this app won't do much from it's deployment (as it will be impossible to login, signup and get the access tokens necessary to view content)

- ```npm start```
- Endpoints:
* ```POST``` requests to ```/sign-in``` will compare the plain text password with the bcrypt hash stored in the Users database and return the status of loggedIn ```true``` or ```false```; successul sign in will return:
![screenshot of successful sign in](./sign-in.png)
* ```POST``` requests to ```/sign-up``` will has the password and send to the user database to store (if the user with this username does not already exist); if successful, the userwill be displayed in the format
![screenshot of user json](./sign-up.png)
* ```GET``` requests to ```/users``` will return a list of usernames that are currently signed up to validated users, invalid users will get an error message; user names will be returned in the format ```["name1", "name2", "name3"...]```
* ```GET``` requests to ```/secret``` will give validated users access to the secret area, invalid users will be locked out; it will show a message saying "Welcome to the secret area!"

## Additional security measures 

- Updated JWT to have 15 minute validity period
- Added session functionality and a ```restricted``` middleware function that allows access on routes to which it is applied only to sessions that have a user
- Session functionality is all commented out to retain passing status of the CF provided test suite

## Tests

- Unit Tests: ```npm run test``` (tests for server, routes, and user model currently implemented)
- Lint Tests: ```npm run lint```
