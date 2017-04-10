import React from 'react';
import GreetingView from '../../src/GreetingView';
import {shallow} from 'enzyme';

const D = title => <div>{title}</div>;
const C = title => <div>I'm C: <D title={title} /></div>;
const B = title => <div>I'm B: <C title={title} /></div>;
const A = title => <div>I'm A: <B title={title} /></div>;


test('it should render A by default', () => {
    const component = shallow(<A title="AAA" />);
    console.log(component.debug());
    expect(component.find('B')).toHaveLength(1);
    expect(component.find('C')).toHaveLength(0);
    expect(component.find('D')).toHaveLength(0);
});



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

