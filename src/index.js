export default function clientMiddleware(client) {
  return () => next => (action) => {
    const { promise, types, ...rest } = action;
    if (!promise) {
      return next(action);
    }

    const [REQUEST, SUCCESS, FAILURE] = types;
    next({ type: REQUEST, ...rest });

    const actionPromise = promise(client);
    const onSuccess = result => next({ payload: result.body, type: SUCCESS, ...rest });
    const onError = error => next({ error, type: FAILURE, ...rest });
    actionPromise.then(onSuccess, onError).catch(onError);

    return actionPromise;
  };
}
