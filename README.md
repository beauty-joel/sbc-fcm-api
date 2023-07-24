# Description

This is an implementation of Firebase Cloud Messaging server. It allows to send messages to android/ios devices using differerent strategies. It uses a Firestore database to persit data.

# Project Structure

This project is composed of single app, `api`. The `api` app serves API endpoints of the project.
<br> <br>

# Installation

install the dependencies

```jsx
pip install

```

Run the server in develeopment mode

```jsx
npm run dev
```

<br>

# Environment Variables

The .env file should be localted inside the /src/config forlder, there is an .env.example file for reference.

It is necesary to provide a GCP service account json file key with valid permissions to access both services, Firestore Databases and Cloud Messaging. <br>

```jsx
FIREBASE_SERVICE_ACCOUNT_KEY = "example-file-name.json";
FIRESTORE_URL = "https://example-firebase-url.com";
PORT = 3000;
TESTING_DEVICE_TOKEN = "example-device-token-123123123";
```

<br> <br>

# API Endpoints

The `api` app has a total of 9 endpoints.

### Endpoints for `api` app

```jsx
http:127.0.0.1:8000/sbc-fcm-api/v1/message/account/single *
http:127.0.0.1:8000/sbc-fcm-api/v1/message/account/group *

TODO
http:127.0.0.1:8000/sbc-fcm-api/v1/topics

http:127.0.0.1:8000/sbc-fcm-api/v1/subscriptions *

http:127.0.0.1:8000/sbc-fcm-api/v1/tokens *

http:127.0.0.1:8000/sbc-fcm-api/v1/message/native/single *
http:127.0.0.1:8000/sbc-fcm-api/v1/message/native/group *
http:127.0.0.1:8000/sbc-fcm-api/v1/message/native/batch *
http:127.0.0.1:8000/sbc-fcm-api/v1/message/native/topic *
```

<br>

http:127.0.0.1:8000/sbc-fcm-api/v1/message/account/single
| Method | Action | TOKEN AUTH | STATUS CODE |
| --- | --- | --- | --- |
| POST | Sends a message to all the devices linked a single account | Yes | 201 |
<br>

http:127.0.0.1:8000/sbc-fcm-api/v1/message/account/group
| Method | Action | TOKEN AUTH | STATUS CODE |
| --- | --- | --- | --- |
| POST | Sends a messages all the devices linked to a group of accounts | Yes | 201 |
<br>

http:127.0.0.1:8000/sbc-fcm-api/v1/message/native/single
| Method | Action | TOKEN AUTH | STATUS CODE |
| --- | --- | --- | --- |
| POST | Sends a message to a single device token. | Yes | 201 |
<br>

http:127.0.0.1:8000/sbc-fcm-api/v1/message/native/group
| Method | Action | TOKEN AUTH | STATUS CODE |
| --- | --- | --- | --- |
| POST | Sends a message to a group of tokens. | Yes | 201 |
<br>

http:127.0.0.1:8000/sbc-fcm-api/v1/message/native/topic
| Method | Action | TOKEN AUTH | STATUS CODE |
| --- | --- | --- | --- |
| POST | Sends a message to a topic subscribers | Yes | 201 |
<br>

http:127.0.0.1:8000/sbc-fcm-api/v1/message/native/batch
| Method | Action | TOKEN AUTH | STATUS CODE |
| --- | --- | --- | --- |
| POST | Sends message batch | Yes | 201 |
<br>

http:127.0.0.1:8000/sbc-fcm-api/v1/subscription
| Method | Action | TOKEN AUTH | STATUS CODE |
| --- | --- | --- | --- |
| POST | Subscribres tokens to a topic | Yes | 201 |
| DELETE | Unsubscribes tokens from a topic | Yes | 204 |
<br>

http:127.0.0.1:8000/sbc-fcm-api/v1/token
| Method | Action | TOKEN AUTH | STATUS CODE |
| --- | --- | --- | --- |
| POST | Registers a device token to a account | Yes | 201 |
| DELETE | Unregisters a device token from a account | Yes | 204 |
<br>

http:127.0.0.1:8000/sbc-fcm-api/v1/topics
| Method | Action | TOKEN AUTH | STATUS CODE |
| --- | --- | --- | --- |
| GET | Get all the topics | Yes | 201 |
| DELETE | Delete a topic | Yes | 204 |
<br>

http:127.0.0.1:8000/sbc-fcm-api/v1/topics
| Method | Action | TOKEN AUTH | STATUS CODE |
| --- | --- | --- | --- |
| GET | Get all the topics | Yes | 201 |
| DELETE | Delete a topic | Yes | 204 |
<br>

# Testing

There are a total of 9 tests to ensure that each API endpoint and each of its allowed HTTP methods work properly.
<br>

Run the tests

```jsx
npm run test
```

<br>

It should output something similar to this

```cmd
 PASS  src/controllers/__tests__/message.test.js
 PASS  src/controllers/__tests__/subscription.test.js
 PASS  src/controllers/__tests__/token.test.js

Test Suites: 3 passed, 3 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        7.1 s
Ran all test suites.
```

<br>

<aside>💡 These tests are targeting the controllers. For the moment, there are no integration tests at the API endpoint level.
<br>
<br>

💡 Integration tests at endpoint level are pending.

</aside>
