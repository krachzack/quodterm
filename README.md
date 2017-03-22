# quodterm
This is an implementation of a question terminal.

## Development
This outlines how to get it running and how to make changes.

### What am I looking at?
We use [electron](https://electron.atom.io/) to open a native window running a stripped-down browser and capable of running ECMAScript with most modern features. This all runs on [node](https://nodejs.org/en/) and you can use the wealth of packages available on [npm](https://www.npmjs.com/) in the project. Just edit `package.json`, run  `npm install` and you are good to go.

### Setup
Install [node](https://nodejs.org/en/) and a shell application you are comfortable with. [Atom](https://atom.io/) is a nice text editor you can use for development, anything you use for web development should be fine to contribute to this project.

### Running
Navigate to the project in your shell and run `npm install && npm start`. You can skip the install part if `package.json` did not change since last time.

### Architecture
`main.js` is the first thing that gets started to set up a window and get the renderer process going. If all went well, `renderer.js` can run the application logic.
