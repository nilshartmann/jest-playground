import React from 'react';
import GreetingView from '../../src/GreetingView';
import {mount} from 'enzyme';

// https://github.com/facebook/jest/issues/2157#issuecomment-279171856
function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

test('it should render a greeting with server response', () => {
    fetch.mockResponse(JSON.stringify({greeting: 'Moin, Moin!'}), {status: 200});
    const component = mount(<GreetingView/>);

    // componentDidMount has been run, but the then()-function of
    // the promise (returned from fetch) has not been executed
    //  => callback not invoked
    //  => setState not invoked
    //  => no rendering of a greeting
    expect(component.find('p')).toHaveLength(1);
    expect(component.find('h1')).toHaveLength(0);

    return flushPromises().then(() => {
        // then()-function is now executed
        //  => success-callback is called
        //  => setState is called
        //  => component is re-rendered with greeting
        expect(component.find('h1').text()).toEqual('Moin, Moin!');
        expect(component.find('p')).toHaveLength(0);

        // just to make sure: fetch should have been called exactly once
        expect(fetch.mock.calls).toHaveLength(1);
    });
});
