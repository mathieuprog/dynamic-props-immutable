import { setNestedProp, deleteNestedProp } from './index';
import { isArray, isObjectLiteral } from './utils';

test('setNestedProp', () => {
  let foo = {};

  foo = setNestedProp`bar.baz[${2}].qux`(foo, 'hello');

  expect(isObjectLiteral(foo.bar)).toBeTruthy();
  expect(isArray(foo.bar.baz)).toBeTruthy();
  expect(isObjectLiteral(foo.bar.baz[2])).toBeTruthy();
  expect(foo.bar.baz[2].qux).toBe('hello');

  // test override
  const newFoo1 = setNestedProp`bar.baz[${2}].qux`(foo, 'world');
  
  expect(foo.bar.baz[2].qux).toBe('hello');
  expect(newFoo1.bar.baz[2].qux).toBe('world');
  expect(foo).not.toBe(newFoo1);
  expect(foo.bar).not.toBe(newFoo1.bar);
  expect(foo.bar.baz).not.toBe(newFoo1.bar.baz);

  const newFoo2 = setNestedProp`bar.baz[${1}]`(newFoo1, 'test');
  
  expect(newFoo2.bar.baz[1]).toBe('test');
  expect(newFoo2.bar.baz[2].qux).toBe('world');

  let newFoo3 = setNestedProp`bar.baz[${2}].qux`(foo, 'hello');
  newFoo3 = setNestedProp`bar.baz[${1}].corge`(newFoo3, 'corge');
  let newFoo4 = setNestedProp`bar.baz[${2}].qux`(newFoo3, 'hello');
  
  expect(newFoo3).not.toBe(newFoo4);
  expect(newFoo3.bar).not.toBe(newFoo4.bar);
  expect(newFoo3.bar.baz).not.toBe(newFoo4.bar.baz);
  expect(newFoo3.bar.baz[2]).not.toBe(newFoo4.bar.baz[2]);
  expect(newFoo3.bar.baz[1]).toBe(newFoo4.bar.baz[1]);
});

test('deleteNestedProp 1', () => {
  const foo = { bar: { baz: [ undefined, undefined, { qux: 'hello' } ] } };

  const newFoo = deleteNestedProp`bar.baz[${2}].qux`(foo);

  expect(foo).not.toBe(newFoo);
  expect(isArray(newFoo.bar?.baz)).toBeFalsy();
  expect(isArray(foo.bar.baz)).toBeTruthy();
  expect(isObjectLiteral(newFoo.bar)).toBeFalsy();
  expect(isObjectLiteral(foo.bar)).toBeTruthy();
});

test('deleteNestedProp 2', () => {
  const foo = { bar: { baz: [ 1, undefined, { qux: 'hello' } ] } };

  const newFoo = deleteNestedProp`bar.baz[${2}].qux`(foo);

  expect(foo).not.toBe(newFoo);
  expect(isArray(newFoo.bar?.baz)).toBeTruthy();
  expect(isArray(foo.bar.baz)).toBeTruthy();
  expect(isObjectLiteral(newFoo.bar)).toBeTruthy();
  expect(isObjectLiteral(foo.bar)).toBeTruthy();
});

test('deleteNestedProp 3', () => {
  const foo = { bar: { corge: 1, baz: [ undefined, undefined, { qux: 'hello' } ] } };

  const newFoo = deleteNestedProp`bar.baz[${2}].qux`(foo);

  expect(foo).not.toBe(newFoo);
  expect(isArray(newFoo.bar?.baz)).toBeFalsy();
  expect(isArray(foo.bar.baz)).toBeTruthy();
  expect(isObjectLiteral(newFoo.bar)).toBeTruthy();
  expect(isObjectLiteral(foo.bar)).toBeTruthy();
});

test('deleteNestedProp 4', () => {
  const foo = { bar: { corge: 1, baz: [ undefined, undefined, 1 ] } };

  const newFoo = deleteNestedProp`bar.baz`(foo);

  expect(foo).not.toBe(newFoo);
  expect(isArray(newFoo.bar?.baz)).toBeFalsy();
  expect(isArray(foo.bar.baz)).toBeTruthy();
  expect(isObjectLiteral(newFoo.bar)).toBeTruthy();
  expect(isObjectLiteral(foo.bar)).toBeTruthy();
});

test('deleteNestedProp 5', () => {
  const foo = { bar: 1 };

  const newFoo = deleteNestedProp`bar`(foo);

  expect(foo).not.toBe(newFoo);
  expect(newFoo).toEqual({});
  expect(foo.bar).toBe(1);
});

test('deleteNestedProp 6', () => {
  const foo = { bar: { baz: [ 1, 2, 3 ] } };

  const newFoo = deleteNestedProp`bar.baz[${1}]`(foo);

  expect(foo).not.toBe(newFoo);
  expect(isArray(newFoo.bar?.baz)).toBeTruthy();
  expect(isArray(foo.bar.baz)).toBeTruthy();
  expect(isObjectLiteral(newFoo.bar)).toBeTruthy();
  expect(isObjectLiteral(foo.bar)).toBeTruthy();
});

test('deleteNestedProp 7', () => {
  const foo = { bar: [undefined, { baz: [ undefined, 2, undefined ] }, undefined] };

  const newFoo = deleteNestedProp`bar[${1}].baz[${1}]`(foo);

  expect(foo).not.toBe(newFoo);
  expect(isArray(newFoo.bar?.[1]?.baz)).toBeFalsy();
  expect(isArray(foo.bar[1].baz)).toBeTruthy();
  expect(isArray(newFoo.bar)).toBeFalsy();
  expect(isArray(foo.bar)).toBeTruthy();
});
