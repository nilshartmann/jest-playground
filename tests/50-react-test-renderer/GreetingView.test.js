import React from 'react';
import renderer from 'react-test-renderer';

import Editor from './Editor';

test('it should bla', () => {
        const tree = renderer.create(
        <Editor/>
    ).toJSON();
    expect(tree).toMatchSnapshot();
});
