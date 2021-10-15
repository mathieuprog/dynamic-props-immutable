import { isArray, isObjectLiteral } from './utils';

const setNestedProp = (path, ...indexes) => {
  const splitPath = path.join('').split('.');

  return (originalObject, value) => {
    let object = { ...originalObject };

    let getObject = () => object;

    splitPath.forEach((key, i) => {
      const _getObject = getObject;
      const isLastProp = (i === splitPath.length - 1);

      if (key.slice(-1) === ']') {
        key = key.slice(0, -2);
        if (!getObject()[key]) {
          getObject()[key] = [];
        } else {
          getObject()[key] = [ ...getObject()[key] ];
        }
        const index = indexes.shift();
        if (isLastProp) {
          getObject()[key][index] = value;
        } else {
          if (!getObject()[key][index]) {
            getObject()[key][index] = {};
          } else {
            getObject()[key][index] = { ...getObject()[key][index] };
          }
          getObject = () => _getObject()[key][index];
        }
      } else {
        if (isLastProp) {
          getObject()[key] = value;
        } else {
          if (!getObject()[key]) {
            getObject()[key] = {};
          } else {
            getObject()[key] = { ...getObject()[key] };
          }
          getObject = () => _getObject()[key];
        }
      }
    });

    return object;
  };
};

const isEmpty = item => {
  return (isObjectLiteral(item) && !Object.keys(item).length)
    || (isArray(item) && !item.some(e => e !== undefined && (!isObjectLiteral(e) || Object.keys(e).length)))
    || item === undefined;
};

const deleteNestedProp = (path, ...indexes) => {
  const splitPath = path.join('').split('.');

  return originalObject => {
    let object = { ...originalObject };

    let getObject = () => object;

    let deleteKeyAndCleanRecursively = keyToDelete => {
      delete object[keyToDelete];
    };

    for (let [i, key] of splitPath.entries()) {
      const _getObject = getObject;

      const isLastProp = (i === splitPath.length - 1);

      if (key.slice(-1) === ']') {
        key = key.slice(0, -2);
        if (!getObject()[key]) {
          break;
        }
        const index = indexes.shift();
        if (!getObject()[key][index]) {
          break;
        } else if (isLastProp) {
          getObject()[key] = [ ...getObject()[key] ];
          delete getObject()[key][index];
          if (!getObject()[key].some(e => e !== undefined)) {
            deleteKeyAndCleanRecursively(key);
          }
        } else {
          // copy for closure
          const o = getObject();
          const prevDeleteKeyAndCleanRecursively = deleteKeyAndCleanRecursively;
          deleteKeyAndCleanRecursively = keyToDelete => {
            o[key] = [ ...o[key] ];
            o[key][index] = { ...o[key][index] };
            delete o[key][index][keyToDelete];

            if (isEmpty(o[key][index])) {
              delete o[key][index];
              if (isEmpty(o[key])) {
                prevDeleteKeyAndCleanRecursively(key);
              }
            }
          };
          getObject = () => _getObject()[key][index];
        }
      } else {
        if (!getObject()[key]) {
          break;
        } else if (isLastProp) {
          deleteKeyAndCleanRecursively(key);
        } else {
          // copy for closure
          const o = getObject();
          const prevDeleteKeyAndCleanRecursively = deleteKeyAndCleanRecursively;
          deleteKeyAndCleanRecursively = keyToDelete => {
            o[key] = { ...o[key] };
            delete o[key][keyToDelete];

            if (isEmpty(o[key])) {
              prevDeleteKeyAndCleanRecursively(key);
            }
          };
          getObject = () => _getObject()[key];
        }
      }
    }

    return object;
  };
};

export {
  setNestedProp,
  deleteNestedProp
}
