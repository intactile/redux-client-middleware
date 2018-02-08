import createClientMiddleware from './';

const client = {};
const clientMiddleware = createClientMiddleware(client);

const createFakeStore = fakeData => ({
  getState() {
    return fakeData;
  },
});

describe('redux.middleware.clientMiddleware', () => {
  let dispatched;
  let promise;
  let resolePromise;
  let rejectPromise;
  const action = {
    types: ['CREATE', 'CREATE_SUCCESS', 'CREATE_FAIL'],
    promise: apiClient => apiClient.get('/create'),
  };

  beforeEach(() => {
    dispatched = [];
    promise = new Promise((resolve, reject) => {
      resolePromise = resolve;
      rejectPromise = reject;
    });
    client.get = () => promise;
  });

  const dispatchAction = (storeData, a) => {
    const store = createFakeStore(storeData);
    clientMiddleware(store)(actionAttempt => dispatched.push(actionAttempt))(a);
  };

  const handleDispatched = expectedActions => () => {
    expect(dispatched).toEqual(expectedActions);
  };

  it('should forward to next middleware other action', () => {
    const otherAction = { type: 'OTHER' };
    dispatchAction({}, otherAction, dispatched);
    expect(dispatched).toEqual([otherAction]);
  });

  it('should dispatch action started and action success if the promise is resolved', () => {
    dispatchAction({}, action, dispatched);
    expect(dispatched).toEqual([{ type: 'CREATE' }]);
    resolePromise({ body: 'ok' });
    const expectedActions = [{ type: 'CREATE' }, { payload: 'ok', type: 'CREATE_SUCCESS' }];
    return promise.then(handleDispatched(expectedActions));
  });

  it('should dispatch action started and action fail if the promise is rejected', () => {
    dispatchAction({}, action, dispatched);
    expect(dispatched).toEqual([{ type: 'CREATE' }]);
    rejectPromise('error');
    const expectedActions = [{ type: 'CREATE' }, { error: 'error', type: 'CREATE_FAIL' }];
    return promise.catch(handleDispatched(expectedActions));
  });

  it('should let the user customize actions', () => {
    dispatchAction({}, { payload: 1, test: true, ...action }, dispatched);
    expect(dispatched).toEqual([{ payload: 1, test: true, type: 'CREATE' }]);
    resolePromise({ body: 'ok' });
    const expectedActions = [
      { payload: 1, test: true, type: 'CREATE' },
      { payload: 1, test: true, type: 'CREATE_SUCCESS' },
    ];
    return promise.then(handleDispatched(expectedActions));
  });
});
