export default function clientMiddleware(client) {
  return ({ dispatch, getState }) => next => (action) => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }

    const { promise, types, ...rest } = action;
    if (!promise) {
      return next(action);
    }

    const [REQUEST, SUCCESS, FAILURE] = types;
    next({ ...rest, type: REQUEST });

    const actionPromise = promise(client);
    const onSuccess = result => next({ ...rest, payload: result.body, type: SUCCESS });
    const onError = error => next({ ...rest, error, type: FAILURE });
    actionPromise.then(onSuccess, onError).catch(onError);

    return actionPromise;
  };
}
