import { InterfaceType, TypeKind } from '@jsii/spec';
import { DiagnosticCategory } from 'typescript';

import { compileJsiiForTest, sourceToAssemblyHelper } from '../lib';
import { compileJsiiForErrors } from './compiler-helpers';

describe('@struct', () => {
  test('causes behavioral-named interfaces to be structs', () => {
    const assembly = sourceToAssemblyHelper(`
      /** @struct */
      export interface IPSet {
        readonly cidr: string;
      }
    `);

    expect(assembly.types!['testpkg.IPSet'].kind).toBe(TypeKind.Interface);
    expect((assembly.types!['testpkg.IPSet'] as InterfaceType).datatype).toBe(true);
  });

  test('can be used on any struct', () => {
    const assembly = sourceToAssemblyHelper(`
      /** @struct */
      export interface Struct {
        readonly cidr: string;
      }
    `);

    expect(assembly.types!['testpkg.Struct'].kind).toBe(TypeKind.Interface);
    expect((assembly.types!['testpkg.Struct'] as InterfaceType).datatype).toBe(true);
  });
});

describe('@jsii ignore', () => {
  test('without an ignore directive, extending a mapped type emits JSII3004', () => {
    const errors = compileJsiiForErrors(`
      export interface Base {
        readonly foo: string;
      }
      export interface Derived extends Partial<Base> {
        readonly baz: number;
      }
    `);
    expect(errors).toEqual([expect.stringMatching(/Illegal extends clause.*MappedType/)]);
  });

  test('an interface extending a mapped type does not emit an error when ignored', () => {
    const errors = compileJsiiForErrors(
      `
      export interface Base {
        readonly foo: string;
      }

      /** @jsii ignore */
      export interface Derived extends Partial<Base> {
        readonly baz: number;
      }
    `,
    );
    expect(errors).toEqual([]);
  });

  test('a class extending a mapped type does not emit an error when ignored', () => {
    const errors = compileJsiiForErrors(`
      export interface Base {
        readonly foo: string;
        readonly bar: string;
      }

      /** @jsii ignore */
      export class Impl implements Partial<Base> {
        public readonly foo?: string;
      }
    `);
    expect(errors).toEqual([]);
  });
});
