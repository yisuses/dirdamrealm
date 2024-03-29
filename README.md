# White Emotion

![](https://img.shields.io/github/license/yisuses/whemotion)
![](https://img.shields.io/github/last-commit/yisuses/whemotion)

![](https://img.shields.io/github/checks-status/yisuses/whemotion/main)
![](https://img.shields.io/github/deployments/yisuses/whemotion/production)
![Vercel](http://therealsujitk-vercel-badge.vercel.app/?app=whemotion)
![Railway](https://img.shields.io/badge/Railway-deployed-brightgreen)

![](https://img.shields.io/github/package-json/v/yisuses/whemotion?color=green&filename=packages%2Fapi%2Fpackage.json&label=API)
![](https://img.shields.io/github/package-json/v/yisuses/whemotion?color=green&filename=packages%2Fblog%2Fpackage.json&label=BLOG)

![](https://img.shields.io/github/package-json/dependency-version/yisuses/whemotion/next?filename=packages%2Fblog%2Fpackage.json)
![](https://img.shields.io/github/package-json/dependency-version/yisuses/whemotion/react?filename=packages%2Fblog%2Fpackage.json)
![](https://img.shields.io/github/package-json/dependency-version/yisuses/whemotion/@strapi/strapi?filename=packages%2Fapi%2Fpackage.json)
![](https://img.shields.io/badge/Storybook-ready-ff69b4)

Welcome to the project!

Below you will find some information on how to perform common tasks.

## Table of Contents

- [White Emotion](#white-emotion)
  - [Table of Contents](#table-of-contents)
  - [Folder Structure](#folder-structure)
  - [Available Scripts](#available-scripts)
    - [`install`](#install)
    - [`yarn start:blog`](#yarn-startblog)
    - [`yarn build:blog`](#yarn-buildblog)
    - [`yarn build:dep:blog`](#yarn-builddepblog)
    - [`yarn test:blog`](#yarn-testblog)
    - [`yarn release:blog`](#yarn-releaseblog)
    - [`yarn start:api:develop`](#yarn-startapidevelop)
    - [`yarn start:api`](#yarn-startapi)
    - [`yarn build:api`](#yarn-buildapi)
    - [`yarn build:dep:api`](#yarn-builddepapi)
    - [`yarn release:api`](#yarn-releaseapi)
    - [`yarn clean`](#yarn-clean)
    - [`yarn clean:install`](#yarn-cleaninstall)
    - [`yarn build`](#yarn-build)
    - [`yarn test`](#yarn-test)
    - [`yarn test:watch`](#yarn-testwatch)
    - [`yarn test:ci`](#yarn-testci)
    - [`yarn lint`](#yarn-lint)
    - [`yarn release`](#yarn-release)
    - [`yarn ncu`](#yarn-ncu)
  - [Generate changelog](#generate-changelog)
  - [Installing a Dependency](#installing-a-dependency)
  - [Updating Dependencies](#updating-dependencies)
  - [Importing a Component](#importing-a-component)
    - [`ButtonExample.tsx`](#buttonexampletsx)
    - [`ButtonAndMore.tsx`](#buttonandmoretsx)
  - [Styling with Emotion and Chakra UI](#styling-with-emotion-and-chakra-ui)
    - [`Button.tsx`](#buttontsx)
    - [`RedButton.tsx`](#redbuttontsx)
  - [Adding Custom Environment Variables](#adding-custom-environment-variables)
    - [Adding Temporary Environment Variables In Your Shell](#adding-temporary-environment-variables-in-your-shell)
      - [Windows (cmd.exe)](#windows-cmdexe)
      - [Linux, OS X (Bash)](#linux-os-x-bash)
    - [Adding Development Environment Variables In `.env`](#adding-development-environment-variables-in-env)
  - [Using HTTPS in Development](#using-https-in-development)
    - [Windows (cmd.exe)](#windows-cmdexe-1)
    - [Linux, OS X (Bash)](#linux-os-x-bash-1)
  - [Running Tests](#running-tests)
    - [Filename Conventions](#filename-conventions)
    - [Command Line Interface](#command-line-interface)
    - [Version Control Integration](#version-control-integration)
    - [Writing Tests](#writing-tests)
    - [Testing Components](#testing-components)
    - [Using Third Party Assertion Libraries](#using-third-party-assertion-libraries)
    - [Initializing Test Environment](#initializing-test-environment)
      - [`src/setupTests.js`](#srcsetuptestsjs)
    - [Focusing and Excluding Tests](#focusing-and-excluding-tests)
    - [Coverage Reporting](#coverage-reporting)
    - [Editor Integration](#editor-integration)
  - [Developing Components in Isolation](#developing-components-in-isolation)
  - [Troubleshooting](#troubleshooting)
  - [Usefull VSCode extensions](#usefull-vscode-extensions)

## Folder Structure

This monorepo is structured as follows

```text
monorepo/
  README.md
  node_modules/
  package.json
  packages/
    api/
      node_modules/
      package.json
      ...
    blog/
      node_modules/
      package.json
      ...
  [...configFiles]
```

You may create new workspaces inside `packages`. Depending on being a new app or a new lib, it has its specific subfolder. Each folder with a `package.json` file will be a new workspace.

## Available Scripts

In the project directory, you can run:

### `install`

Run

```sh
yarn
```

to install the projects dependencies, and the dependencies within the different workspaces. You can run also

```sh
yarn `command`
```

which will do whatever `command` does, and must be defined on `scripts` section in [`package.json`](./package.json)

### `yarn start:blog`

Runs the Blog app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `yarn build:blog`

Generates the build folder of the compiled files for Blog package
The build is minified and the filenames include the hashes.
It will generate a static folder that can be deployed anywhere.

### `yarn build:dep:blog`

Same as `yarn build:blog` but it moves the files to the root directory.

### `yarn test:blog`

Launches the test runner for the Blog package.
See the section about [running tests](#running-tests) for more information.

### `yarn release:blog`

It launches a release for Blog package.

- `fix` will do a patch bump
- `feat` will do a minor bump
- `!` will do a major bump.

### `yarn start:api:develop`

Runs the API in the development mode.
Open [http://localhost:3003](http://localhost:3003) to see a default API Response in browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `yarn start:api`

Runs the API in the development mode.
Open [http://localhost:3003](http://localhost:3003) to see a default API Response in browser.

### `yarn build:api`

Generates the build folder of the compiled files for API package
The build is minified and the filenames include the hashes.
It will generate a static folder that can be deployed anywhere.

### `yarn build:dep:api`

Same as `yarn build:api` but it moves the files to the root directory.

### `yarn release:api`

It launches a release for API package.

- `fix` will do a patch bump
- `feat` will do a minor bump
- `!` will do a major bump.

### `yarn clean`

Removes `dist` folder.

### `yarn clean:install`

Removes `node_modules` folder and executes installation command.

### `yarn build`

Generates builds for API and Blog applications

### `yarn test`

Launches the test runner for entire monorepo.
See the section about [running tests](#running-tests) for more information.

### `yarn test:watch`

Launches the test runner in interactive mode for entire ts-monorepo.
See the section about [running tests](#running-tests) for more information.

### `yarn test:ci`

Launches the test runner for entire ts-monorepo and generates the coverage folder.
See the section about [running tests](#running-tests) for more information.

### `yarn lint`

Launches eslint checker in the entire monorepo.

### `yarn release`

Releases an automatic version bump based on commit messages and generates the Changelog.md.

### `yarn ncu`

Checks the dependencies in all `package.json` files to see if there are updates.

## Generate changelog

To generate the changelog from the latest git tag for a given package, follow the next steps:

1. Open a branch `chore/release-packageName` from latest `master`
2. Execute one of the `release` commands (_release_, _release:packageName_)
   1. This command will update the `CHANGELOG.md` of the given package, or all `CHANGELOG.md` files if not package has been selected
   2. Then an automatic commit will be created and will tag the commit with the new tag according to the version number of the package json file of the package. The package.json of the root directory will always be 1.0.0
3. Push the changes with the tags with `git push --follow-tags origin chore/release-packageName`
4. Open a PR and **merge** the `chore/release-packageName` branch (**DO NOT SQUASH IT**) into `master` branch

## Installing a Dependency

You may install other dependencies with `yarn`. The flag `-W` indicates that the dependency must be installed in the package.json at root level.

```sh
yarn -W add <library-name>
```

If you want to install a dependency in a specific workspace, then you can do:

```sh
yarn workspace <workspace_name> add <library-name>
```

## Updating Dependencies

You can install globally [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) and run:

```sh
ncu
```

that will show the dependencies with new versions available to download.

With the following command, you will be able to upgrade versions number:

```sh
ncu -u
```

and then

```sh
yarn
```

## Importing a Component

This project setup supports ES6 modules thanks to Babel.
While you can still use `require()` and `module.exports`, we encourage you to use [`import` and `export`](http://exploringjs.com/es6/ch_modules.html) instead.

For example:

### `ButtonExample.tsx`

```js
import React from 'react'

export const ButtonExample: React.FunctionComponent = () => {
  ...
}
```

### `ButtonAndMore.tsx`

```js
import React from 'react';
import { ButtonExample } from './ButtonExample'; // Import a component from another file

export const ButtonAndMore: React.FunctionComponent = () => {
  <>
    <ButtonExample />
    ...
  </>;
};
```

Be aware of the [difference between default and named exports](http://stackoverflow.com/questions/36795819/react-native-es-6-when-should-i-use-curly-braces-for-import/36796281#36796281). It is a common source of mistakes.

We suggest that you stick to using default imports and exports when a module only exports a single thing (for example, a component). That’s what you get when you use `export default Button` and `import Button from './Button'`.

Named exports are useful for utility modules that export several functions. A module may have at most one default export and as many named exports as you like.

Learn more about ES6 modules:

- [When to use the curly braces?](http://stackoverflow.com/questions/36795819/react-native-es-6-when-should-i-use-curly-braces-for-import/36796281#36796281)
- [Exploring ES6: Modules](http://exploringjs.com/es6/ch_modules.html)
- [Understanding ES6: Modules](https://leanpub.com/understandinges6/read#leanpub-auto-encapsulating-code-with-modules)

## Styling with Emotion and Chakra UI

This project setup uses [Chakra UI](https://chakra-ui.com/) and [Emotion](https://emotion.sh/docs/introduction) for styling. This library allow us to write styles in js files and extending styles with a lot of flexibility.

### `Button.tsx`

```tsx
import React from 'react';
import styled from '@emotion/styled';

interface ButtonProps {
  ...
}

export const Button = (props: ButtonProps) => <StyledButton {...props} />;

const StyledButton = styled.button`
  background: white;
`;
```

### `RedButton.tsx`

```tsx
import React from 'react';
import styled from '@emotion/styled';
import { Button } from './Button';

interface RedButtonProps {
  ...
}

export const RedButton = (props: RedButtonProps) => <RedStyledButton {...props} />;

const RedStyledButton = styled(Button)`
  background: red;
`;
```

## Adding Custom Environment Variables

Your project can consume variables declared in your environment as if they were declared locally in your JS files. By
default you will have `NODE_ENV` defined for you, and any other environment variables starting with
`REACT_APP_`. These environment variables will be defined for you on `process.env`. For example, having an environment
variable named `REACT_APP_SECRET_CODE` will be exposed in your JS as `process.env.REACT_APP_SECRET_CODE`, in addition
to `process.env.NODE_ENV`.

> Note: Changing any environment variables will require you to restart the development server if it is running.

These environment variables can be useful for displaying information conditionally based on where the project is
deployed or consuming sensitive data that lives outside of version control.

First, you need to have environment variables defined. For example, let’s say you wanted to consume a secret defined
in the environment inside a `<form>`:

```jsx
const MyComponent = () => (
  <div>
    <small>
      You are running this application in <b>{process.env.NODE_ENV}</b> mode.
    </small>
    <form>
      <input type="hidden" defaultValue={process.env.ANOTHER_ENV_VARIABLE} />
    </form>
  </div>
);
```

During the build, `process.env.ANOTHER_ENV_VARIABLE` will be replaced with the current value of the `ANOTHER_ENV_VARIABLE` environment variable. Remember that the `NODE_ENV` variable will be set for you automatically.

When you load the app in the browser and inspect the `<input>`, you will see its value set to `abcdef`, and the bold text will show the environment provided when using `npm start`:

```html
<div>
  <small>You are running this application in <b>development</b> mode.</small>
  <form>
    <input type="hidden" value="abcdef" />
  </form>
</div>
```

Having access to the `NODE_ENV` is also useful for performing actions conditionally:

```js
if (process.env.NODE_ENV !== 'production') {
  analytics.disable();
}
```

The above form is looking for a variable called `ANOTHER_ENV_VARIABLE` from the environment. In order to consume this
value, we need to have it defined in the environment. This can be done using two ways: either in your shell or in a `.env` file.

### Adding Temporary Environment Variables In Your Shell

Defining environment variables can vary between OSes. It's also important to know that this manner is temporary for the
life of the shell session.

#### Windows (cmd.exe)

```cmd
set ANOTHER_ENV_VARIABLE=abcdef&&yarn start
```

(Note: the lack of whitespace is intentional.)

#### Linux, OS X (Bash)

```bash
ANOTHER_ENV_VARIABLE=abcdef yarn start
```

### Adding Development Environment Variables In `.env`

To define permanent environment variables, create a file called `.env` in the root of your project:

```text
ANOTHER_ENV_VARIABLE=abcdef
```

These variables will act as the defaults if the machine does not explicitly set them.
Please refer to the [dotenv documentation](https://github.com/motdotla/dotenv) for more details.

> Note: If you are defining environment variables for development, your CI and/or hosting platform will most likely need
> these defined as well. Consult their documentation how to do this. For example, see the documentation for [Travis CI](https://docs.travis-ci.com/user/environment-variables/) or [Heroku](https://devcenter.heroku.com/articles/config-vars).

## Using HTTPS in Development

You may require the dev server to serve pages over HTTPS. One particular case where this could be useful is when using [the "proxy" feature](#proxying-api-requests-in-development) to proxy requests to an API server when that API server is itself serving HTTPS.

To do this, set the `HTTPS` environment variable to `true`, then start the dev server as usual with `npm start`:

### Windows (cmd.exe)

```cmd
set HTTPS=true&&yarn start
```

(Note: the lack of whitespace is intentional.)

### Linux, OS X (Bash)

```bash
HTTPS=true yarn start
```

Note that the server will use a self-signed certificate, so your web browser will almost definitely display a warning upon accessing the page.

## Running Tests

Create React App uses [Jest](https://facebook.github.io/jest/) as its test runner.

Jest is a Node-based runner. This means that the tests always run in a Node environment and not in a real browser. This lets us enable fast iteration speed and prevent flakiness.

While Jest provides browser globals such as `window` thanks to [jsdom](https://github.com/tmpvar/jsdom), they are only approximations of the real browser behavior. Jest is intended to be used for unit tests of your logic and your components rather than the DOM quirks.

### Filename Conventions

Jest will look for test files with any of the following popular naming conventions:

- Files with `.js` suffix in `__tests__` folders.
- Files with `.test.js` suffix.
- Files with `.spec.js` suffix.

The `.test.js` / `.spec.js` files (or the `__tests__` folders) can be located at any depth under the `src` top level folder in every package.

We recommend to put the test files next to the code they are testing so that relative imports appear shorter. For example, if `App.test.js` and `App.js` are in the same folder, the test just needs to `import App from './App'` instead of a long relative path. This also helps find tests more quickly in larger projects.

### Command Line Interface

When you run `yarn test:watch`, Jest will launch in the watch mode. Every time you save a file, it will re-run the tests, just like `yarn start` rebuilds the code.

The watcher includes an interactive command-line interface with the ability to run all tests, or focus on a search pattern. It is designed this way so that you can keep it open and enjoy fast re-runs. You can learn the commands from the “Watch Usage” note that the watcher prints after every run:

![Jest watch mode](https://facebook.github.io/jest/img/blog/15-watch.gif)

### Version Control Integration

By default, when you run `yarn test`, Jest will only run the tests related to files changed since the last commit. This is an optimization designed to make your tests runs fast regardless of how many tests you have. However it assumes that you don’t often commit the code that doesn’t pass the tests.

Jest will always explicitly mention that it only ran tests related to the files changed since the last commit. You can also press `a` in the watch mode to force Jest to run all tests.

Jest will always run all tests on a [continuous integration](#continuous-integration) server or if the project is not inside a Git or Mercurial repository.

### Writing Tests

To create tests, add `it()` (or `test()`) blocks with the name of the test and its code. You may optionally wrap them in `describe()` blocks for logical grouping but this is neither required nor recommended.

Jest provides a built-in `expect()` global function for making assertions. A basic test could look like this:

```js
import sum from './sum';

it('sums numbers', () => {
  expect(sum(1, 2)).toEqual(3);
  expect(sum(2, 2)).toEqual(4);
});
```

All `expect()` matchers supported by Jest are [extensively documented here](http://facebook.github.io/jest/docs/api.html#expect-value).
You can also use [`jest.fn()` and `expect(fn).toBeCalled()`](http://facebook.github.io/jest/docs/api.html#tobecalled) to create “spies” or mock functions.

### Testing Components

There is a broad spectrum of component testing techniques. They range from a “smoke test” verifying that a component renders without throwing, to shallow rendering and testing some of the output, to full rendering and testing component lifecycle and state changes.

Different projects choose different testing tradeoffs based on how often components change, and how much logic they contain. If you haven’t decided on a testing strategy yet, we recommend that you start with creating simple smoke tests for your components:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
```

This test mounts a component and makes sure that it didn’t throw during rendering. Tests like this provide a lot value with very little effort so they are great as a starting point, and this is the test you will find in `src/App.test.js`.

When you encounter bugs caused by changing components, you will gain a deeper insight into which parts of them are worth testing in your application. This might be a good time to introduce more specific tests asserting specific expected output or behavior.

If you’d like to test components in isolation from the child components they render, we recommend using [`render()` rendering API](https://testing-library.com/docs/react-testing-library/api/#render) from [Testing Library](https://testing-library.com/). You can write a smoke test with it too:

```js
import { render } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders component', () => {
    const renderInstance = render(<Component />);
    expect(renderInstance.asFragment().firstChild).toBeDefined();
  });
});
```

Unlike the previous smoke test using `ReactDOM.render()`, this test only renders `<App>` and doesn’t go deeper. For example, even if `<App>` itself renders a `<Button>` that throws, this test will pass. Shallow rendering is great for isolated unit tests, but you may still want to create some full rendering tests to ensure the components integrate correctly. Enzyme supports [full rendering with `mount()`](http://airbnb.io/enzyme/docs/api/mount.html), and you can also use it for testing state changes and component lifecycle.

You can read the [React Testing Library documentation](https://testing-library.com/docs/react-testing-library/intro/) for more testing techniques.

All Jest matchers are [extensively documented here](http://facebook.github.io/jest/docs/api.html#expect-value).

### Using Third Party Assertion Libraries

We recommend that you use `expect()` for assertions and `jest.fn()` for spies. If you are having issues with them please [file those against Jest](https://github.com/facebook/jest/issues/new), and we’ll fix them. We intend to keep making them better for React, supporting, for example, [pretty-printing React elements as JSX](https://github.com/facebook/jest/pull/1566).

### Initializing Test Environment

We have a `src/setupTests.js` in each workspace. It will be automatically executed before running tests.

For example:

#### `src/setupTests.js`

```js
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

### Focusing and Excluding Tests

You can replace `it()` with `it.skip()` to temporarily exclude a test from being executed.
Similarly, `it.only()` lets you focus on a specific test without running any other tests.

### Coverage Reporting

Jest has an integrated coverage reporter that works well with ES6 and requires no configuration.
Run `yarn test:ci` to include a coverage report like this:

![coverage report](https://i.imgur.com/5bFhnTS.png)

Note that tests run much slower with coverage so it is recommended to run it separately from your normal workflow.

### Editor Integration

If you use [Visual Studio Code](https://code.visualstudio.com), there is a [Jest extension](https://github.com/orta/vscode-jest) which works with Create React App out of the box. This provides a lot of IDE-like features while using a text editor: showing the status of a test run with potential fail messages inline, starting and stopping the watcher automatically, and offering one-click snapshot updates.

![VS Code Jest Preview](https://cloud.githubusercontent.com/assets/49038/20795349/a032308a-b7c8-11e6-9b34-7eeac781003f.png)

## Developing Components in Isolation

We are using [Storybook](https://storybook.js.org/) to build isolated components(atoms, molecules, organisms) and its diferent states

## Troubleshooting

## Usefull VSCode extensions

This is a list of recommended VSCode extensions that can help you to the development of this project:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint): must for enable auto linting while developing
- [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph): Git Graphical integration in VSCode
- [Gitlens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens): God
- [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest): Jest integration in VSCode to see realtime test status
- [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme): Tons of icons for each kind of filetype
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode): Another must to lint and prettify your code on file save automatically
- [Vscode styled components](https://marketplace.visualstudio.com/items?itemName=jpoissonnier.vscode-styled-components): Syntax Highlighting for CSS in JS files
