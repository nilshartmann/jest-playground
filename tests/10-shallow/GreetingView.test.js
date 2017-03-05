import React from 'react';
import GreetingView from '../../src/GreetingView';
import {shallow} from 'enzyme';


test('it should render GreetingView by default', () => {
    const component = shallow(<GreetingView/>);

    // componentDidMount will not be called
    //   => no server call
    //   => no h1 with greeting
    //   => instead p with waiting message
    // (Note: we could also use snapshot testing here)
    expect(component.find('p')).toHaveLength(1);
    expect(component.find('h1')).toHaveLength(0);
});

