# Testing React Components with async componentDidMount using Jest and Enzyme

In this repository you'll find some examples how to test React components that contain asynchronous
code.

## Scenario: A simple React application

Given we have following we have the following simplified React application:
* **GreetingView** loads a greeting from a server when it is mounted into the DOM (`componentDidMount`).
As soon as the server response comes (later) in, the received greeting should be rendered. Otherwise a placeholder is rendered.
* **backend** this is not a React component but a simple util module, that loads the data from the server.
 It uses the [fetch](https://github.github.io/fetch/) API to make the _asynchronous_ server call and invokes a callback
 with the received greeting
 
So here's a copy of the source code: (for the full code see the `src` folder)

```javascript
// GreetingView.js
import {loadFromServer} from './backend';

export default class GreetingView extends React.Component {
    render() {
        if (!this.state) {
            return <p>No Greeting yet</p>;
        }

        return <h1>{this.state.greeting}</h1>;
    }

    componentDidMount() {
        loadFromServer(greeting => this.setState({greeting}))
    }
}
```

```javascript
// backend.js
export const loadFromServer = onSuccess => {
    return fetch(BACKEND_URL)
        .then(response => response.json())
        .then(json => onSuccess(json.greeting))
        .catch(err => console.error('SERVER REQUEST FAILED: ' + err))
    ;
}
```
### Install and run the application

1. Clone this repository
2. `npm install`
3. `npm start`
4. open `http://localhost:8080` in your browser
5. Run all tests: `npm test`
6. Run an individual test "approach": `npm test:XX` where XX is the number from the test folder

## How to test this application (using Jest and Enzyme)

Challenges:

* Of course we want to mock the actual server call
* We have to deal with asynchronous code (ES6 Promise) in our test

Below you find some approaches how you could test this application. For clean separation
of the approaches I've used an own test folder for each of them. 
For better readability I've also included the relevant code snippets directly here in this document.

### Testing `backend.js` only
* Full source: `test/00-fetch-mock`
* Run: `npm run test:00`

* **Mocking the server call**: To test the `loadFromServer` function we need to mock the server call that is done with `fetch` API.
Fortunately there's a mock library for Jest that mocks the fetch API: [jest-fetch-mock](https://github.com/jefflau/jest-fetch-mock)
This library allows us to pass in expected results from a server call that is then returned by the mock
when fetch invoked in the real application code. The `jest-fetch-mock` is setup in the file `jest-config.js`
* **Asynchronous code in test**: The fetch mock still returns a promise, thus we have to deal with
 asynchronous flow in our test. But this is not a big deal, as we can simply return the promise
 back to Jest. Jest than waits for it to be fulfilled:
 
**Excerpt of the test code:**
```javascript
test('...', () => {
    const successMock = jest.fn();

    // setup the fetch mock
    fetch.mockResponse(JSON.stringify({greeting: 'HelloWorld!'}), {status: 200});

    // return the promise back to Jest to make sure Jest waits correctly
    return loadFromServer(successMock)
        .then(() => {
            expect(successMock.mock.calls[0][0]).toEqual('HelloWorld!');
        });
});
```

### Approach 1: Use shallow renderer

* Full source: `test/10-shallow`
* Run: `npm run test:10`

With the shallow renderer it is only possible to test that the GreetingView correctly without
any server response, as the shallow renderer does not execute `componentDidMount` at all. So
the backend is never called and a response is never read and rendered.
* **Mocking the server call**: no server calls 
* **Asynchronous code in test**: no async code is run

**Excerpt of the test code:**
```javascript
import {shallow} from 'enzyme';

test('...', () => {
    const component = shallow(<GreetingView/>);

    // componentDidMount will not be called
    //   => no server call, no async code
    //   => no h1 with greeting
    //   => instead p with waiting message
    // (Note: we could also use snapshot testing here)
    expect(component.find('p')).toHaveLength(1);
    expect(component.find('h1')).toHaveLength(0);
});
```

* **Pros:** Very simple
* **Cons:** Only very minimalistic testing possible

### Approach 2: Mock the backend module

* Full source: `test/20-mock-backend`
* Run: `npm run test:20`

Here we're using Enzyms `mount` to render the component into a headless DOM (jsdom in this case). When using `mount`
the `componentDidMount` lifecycle hook gets executed, as it would be in a real DOM. As JSDom is already included and 
correctly setup by Jest, no further setup is required.

* **Mocking the server call**: We mock the whole backend module using Jests [module mock](https://facebook.github.io/jest/docs/jest-object.html#jestmockmodulename-factory-options)
feature. Before our component is rendered we prepare the mock with a prepared answer. After the rendering we check
 if the answer has been correctly rendered.
* **Asynchronous code in test**: No asynchronous code here, as the backend mock run completely synchronous.

**Excerpt of the test code:**
```javascript
import {mount} from 'enzyme';
import backend from '../../src/backend';

// Setup the module mock. Note that we configure
// the actual mock behaviour of 'loadFromServer'
// in our individual test cases
jest.mock('../../src/backend', () => ({
    loadFromServer: jest.fn()
}));

test('it should render GreetingView by default', () => {
    // Configure the mock. Make it invoke the callback with a fixed answer, 
    // that should be rendered by the GreetingView
    backend.loadFromServer.mockImplementation(success => success('moin'));
    const component = mount(<GreetingView/>);

    // as backend.loadFromServer is a sync call (on our mock)
    // componentDidMount have been run at this point
    expect(backend.loadFromServer.mock.calls).toHaveLength(1);
    expect(component.find('h1').text()).toEqual('moin');
    expect(component.find('p')).toHaveLength(0);
});

```
* **Pros**: Only synchronous code. Like a unit test it only tests the component, no other module
* **Cons**: "only" unit test?

### Approach 3: Mock the fetch module

* Full source: `test/30-mock-fetch-async`
* Run: `npm run test:30`

In this case again we're using `mount` to render our component to make sure the `componentDidMount` method will
be executed. We're using the "real" backend module but mocking the fetch call (as we did it already when testing the backend module).

* **Mocking the server call**: As for the `backend` test we're using `jest-fetch-mock` to mock the fetch call.
* **Asynchronous code in test**: Even with the mocked fetch call we have to deal with asynchronous code, because 
`jest-fetch-mock` still returns a Promise (like the "real" fetch API would do). In this scenario we have the problem
  that the Promise is only used internally in our application (used only in `backend`), so we haven't a reference to
  it and cannot wait for it (as we did it in step 1). To make sure the `then` part of the promise is run before we
  run our assertions, we use [setImmediate](https://developer.mozilla.org/de/docs/Web/API/Window/setImmediate).

**Excerpt of the test code:**
```javascript
import {mount} from 'enzyme';

// Syntactic sugar, see: https://github.com/facebook/jest/issues/2157#issuecomment-279171856
// something like this will maybe added to the Jest API
function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

test('...', () => {
    // setup the fetch mock
    fetch.mockResponse(JSON.stringify({greeting: 'Moin, Moin!'}), {status: 200});
    const component = mount(<GreetingView/>);

    // This expects are only just to make the problem visible:
    // componentDidMount has been run, but the then()-function of
    // the promise (returned from fetch) has not been executed
    //  => callback not invoked
    //  => setState not invoked
    //  => no rendering of a greeting
    expect(component.find('p')).toHaveLength(1);
    expect(component.find('h1')).toHaveLength(0);

    return flushPromises().then(() => {
        // then()-function has now been executed
        //  => success-callback is called
        //  => setState is called
        //  => component is re-rendered with greeting we passed to our mock
        expect(component.find('h1').text()).toEqual('Moin, Moin!');
        expect(component.find('p')).toHaveLength(0);

        // just to make sure: fetch should have been called exactly once
        expect(fetch.mock.calls).toHaveLength(1);
    });
});
```
* **Pros**: More like an integration test of two components (React component and backend) if this is what you want
* **Cons**: Still asynchronous code

### Approach 4: Make promises synchronous (tbd)

For [SinonJS](http://sinonjs.org/) there's a nice addition 
called [`sinon-stub-promise`](https://github.com/substantial/sinon-stub-promise) that creates stubs for the promise
API that are run synchronously. Maybe something like this exists for Jest as well? Or could otherwise be built?
  
# Feedback, Questions, Comments, ...

I really like to get your feedback! Do you have any more ideas how to test such cases? Improvements?
Feel free to contact me, open an issue or create a pull request.

So long... Happy testing!

[@nilshartmann](https://twitter.com/nilshartmann)

