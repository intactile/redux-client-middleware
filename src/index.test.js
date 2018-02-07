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

  it('should dispatch action started and action success if the promise is resolved', () => {
    dispatchAction({}, action, dispatched);
    expect(dispatched).toEqual([{ type: 'CREATE' }]);
    resolePromise({ body: 'ok' });
    return promise.then(() => {
      expect(dispatched).toEqual([{ type: 'CREATE' }, { payload: 'ok', type: 'CREATE_SUCCESS' }]);
    });
  });

  it('should dispatch action started and action fail if the promise is rejected', () => {
    dispatchAction({}, action, dispatched);
    expect(dispatched).toEqual([{ type: 'CREATE' }]);
    rejectPromise('error');
    return promise.catch(() => {
      expect(dispatched).toEqual([{ type: 'CREATE' }, { error: 'error', type: 'CREATE_FAIL' }]);
    });
  });
});
