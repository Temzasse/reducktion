# Contributing to reducktion

You can contribute to reducktion in many ways: file bugs, answer issues, suggest improvements and create PRs to make this library better.

## Working on reducktion

### Prerequisites

* [Git](https://git-scm.com/)
* Some recent version of [Node.js](https://nodejs.org/en/)

### Setup reducktion

Fork the repo and run the following to get the project on you machine:

```sh
$ git clone https://github.com/YOUR-GITHUB-PROFILE/reducktion.git
$ cd reducktion
$ npm install
$ npm test
```

If you want to test against the exaple app you need to also run the following:

```sh
npm run build:watch
npm run link:example
cd example
npm install
npm start
```

So when you make changes to `src/reducktion.js` file it will be built automatically and the changes will be reflected to the example app.

### Git flow and commit message format

When you want to work on a task you should create a new branch that preferably has the issue number in the name so that it is easy to see what the PR is related to. Example: `git checkout -b Issue#1234`.

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automatically determine the version number for the library based on the commit messages. This means that **YOU HAVE TO FOLLOW** the commit message conventions described [here](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit). If you don't have time to read the document you can just look at the [commit history](https://github.com/Temzasse/reducktion/commits/master) for a reference.

Basically you should usualle only need these commit message templates:

```
feat: some new feature that increases the minor version
```

```
feat: some new feature with breaking change

BREAKING CHANGE: describe the breaking change.
```

```
fix: some smaller fix that increases the patch version
```

```
chore: some tiny task that does not affect the lib version
```

```
docs: updates to documentation
```

So, if your PR commits don't follow this convention it will most likely not be merged to the master branch.

### Finding tasks

After you've got the project ready on your machine, you can find issues to work on by heading over to the [issues list](https://github.com/Temzasse/reducktion/issues). If there are no issues to work on you can also come up with improvements to the library and file a new issue for it.

### Rules of the discussions

Remember to be clear and transparent when discussing any issue and preferably use English as the language to make easier for people from different countries to join the discussion. Also remember to be kind and understanding towards people even if you don't agree with them on some subject.

Note that this project is not my main job so some issues might not be fixed as fast as you would like them to fixed. Additionally, don't be offended if some feature you want won't be added to the library - I will try my best to make you happy but some things might just be out of the scope for this library 😊