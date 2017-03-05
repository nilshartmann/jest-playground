import {loadFromServer} from '../../src/backend';

test('loadFromServer should invoke success callback function if response is successful', () => {
    const successMock = jest.fn();
    fetch.mockResponse(JSON.stringify({greeting: 'HelloWorld!'}), {status: 200});

    return loadFromServer(successMock)
        .then(() => {
            expect(successMock.mock.calls.length).toBe(1);
            expect(successMock.mock.calls[0][0]).toEqual('HelloWorld!');
        });
});

