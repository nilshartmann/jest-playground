import React from 'react';
import GreetingView from '../../src/GreetingView';
import {mount} from 'enzyme';

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

test('it should render GreetingView by default', () => {
    // Configure the mock. Make it return a fixed answer,
    // that should be rendered by the GreetingView
    backend.loadFromServer.mockImplementation(success => success('moin'));
    const component = mount(<GreetingView/>);

    // as backend.loadFromServer is a sync call (on our mock)
    // componentDidMount have been run at this point
    expect(backend.loadFromServer.mock.calls).toHaveLength(1);
    expect(component.find('h1').text()).toEqual('moin');
    expect(component.find('p')).toHaveLength(0);
});

test('it should render GreetingView a second time', () => {
    // nearly same test as above, just to make sure resetting the
    // backend mock works as expected
    backend.loadFromServer.mockImplementation(success => success('hello'));
    const component = mount(<GreetingView/>);

    // calls should still be one because we reset the mock
    // in beforeEach()
    expect(backend.loadFromServer.mock.calls).toHaveLength(1);
    expect(component.find('h1').text()).toEqual('hello');
    expect(component.find('p')).toHaveLength(0);
});

