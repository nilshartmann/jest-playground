const BACKEND_URL = 'http://echo.jsontest.com/greeting/HelloWorld!';

export const loadFromServer = onSuccess => {
    return fetch(BACKEND_URL)
        .then(response => response.json())
        .then(json => onSuccess(json.greeting))
        .catch(err => console.error('SERVER REQUEST FAILED: ' + err))
    ;
};