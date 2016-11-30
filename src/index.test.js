import createClientMiddleware from './';

const client = {};
const clientMiddleware = createClientMiddleware(client);

const createFakeStore = fakeData => ({
  getState() { return fakeData; },
});

const dispatchWithStore = (storeData, action, dispatched) => {
  const store = createFakeStore(storeData);
  clientMiddleware(store)(actionAttempt => dispatched.push(actionAttempt))(action);
};

describe('redux.middleware.clientMiddleware', () => {
  let promise;
  let resolePromise;
  let rejectPromise;
  const action = {
    types: ['CREATE', 'CREATE_SUCCESS', 'CREATE_FAIL'],
    promise: apiClient => apiClient.get('/create'),
  };

  beforeEach(() => {
    promise = new Promise((resolve, reject) => {
      resolePromise = resolve;
      rejectPromise = reject;
    });
    client.get = () => promise;
  });

  it('should dispatch action started and action success if the promise is resolved', (done) => {
    const dispatched = [];
    dispatchWithStore({}, action, dispatched);
    expect(dispatched).toEqual([{ type: 'CREATE' }]);
    resolePromise({ body: 'ok' });
    promise.then(() => {
      expect(dispatched).toEqual([{ type: 'CREATE' }, { result: 'ok', type: 'CREATE_SUCCESS' }]);
      done();
    });
  });

  it('should dispatch action started and action fail if the promise is rejected', (done) => {
    const dispatched = [];
    dispatchWithStore({}, action, dispatched);
    expect(dispatched).toEqual([{ type: 'CREATE' }]);
    rejectPromise('error');
    promise.catch(() => {
      expect(dispatched).toEqual([{ type: 'CREATE' }, { error: 'error', type: 'CREATE_FAIL' }]);
      done();
    });
  });
});
