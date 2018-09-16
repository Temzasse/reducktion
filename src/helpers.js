export const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

export const isFunction = f => f && {}.toString.call(f) === '[object Function]';

export const camelCasedAction = action =>
  action
    .toLowerCase()
    .split('_')
    .reduce((acc, x, i) => (i === 0 ? acc + x : acc + capitalize(x)), '');

export const validateInject = injected => {
  if (!Array.isArray(injected)) {
    throw Error('Inject should be an array of dependency names');
  }

  const hasNonStringInjects =
    injected.map(dep => typeof dep !== 'string').filter(Boolean).length > 0;

  if (hasNonStringInjects) {
    throw Error('Injected dependency names should be strings');
  }
};

export const validateDuck = ({ name, state, inject, actions, reactions }) => {
  if (!name) throw Error('Duck should have a name');

  if (state && !actions && !reactions) {
    throw Error('Duck with state should have reducers');
  }

  if (inject) validateInject(inject);
};
