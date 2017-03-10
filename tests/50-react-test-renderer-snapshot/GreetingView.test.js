import React from 'react';
import GreetingView from '../../src/GreetingView';
import renderer from 'react-test-renderer';

import backend from '../../src/backend';

// Setup the module mock. Note that we configure
// the actual mock behaviour of 'loadFromServer'
// in our individual test cases
jest.mock('../../src/backend', () => ({
    loadFromServer: jest.fn()
}));

// Make sure to reset the mocks after each test
beforeEach(() => {
    jest.resetAllMocks();
});

test('it should render fine without greetings', () => {
    const tree = renderer.create(
        <GreetingView />
    ).toJSON();
    expect(tree).toMatchSnapshot();
});

test('it should render fine with a message received from backend', () => {
    // Configure the mock. Make it return a fixed answer,
    // that should be rendered by the GreetingView
    backend.loadFromServer.mockImplementation(success => success('moin'));

    const tree = renderer.create(
        <GreetingView />
    ).toJSON();

    // the react-test-renderer runs the componentDidMount hook
    // And as backend.loadFromServer is a sync call (on our mock)
    // componentDidMount have been run completely at this point, so the
    // snapshot should contain the greeting
    expect(tree).toMatchSnapshot();
});
