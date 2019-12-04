export const relativeTestRootPath = '../test';
export const relativeTestHarnessPath = '../harness';

export const excludePaths = [
  '_FIXTURE.js', // test262 convention, does not contain tests.

  'language/expressions/import.meta/', // todo
  'language/expressions/dynamic-import/assignment-expression/import-meta.js', // todo
  'language/expressions/dynamic-import/', // todo
  'language/module-code/top-level-await/', // not supported as documented

  'language/comments/hashbang/module.js',
  'language/expressions/class/elements/class-name-static-initializer-default-export.js',
  'language/module-code/eval-gtbndng-indirect-update-as.js',
  'language/module-code/eval-gtbndng-indirect-update-dflt.js',
  'language/module-code/eval-gtbndng-indirect-update.js',
  'language/module-code/eval-rqstd-once.js',
  'language/module-code/eval-rqstd-order.js',
  'language/module-code/eval-self-once.js',
  'language/module-code/instn-iee-bndng-cls.js',
  'language/module-code/instn-iee-bndng-const.js',
  'language/module-code/instn-iee-bndng-fun.js',
  'language/module-code/instn-iee-bndng-gen.js',
  'language/module-code/instn-iee-bndng-let.js',
  'language/module-code/instn-iee-bndng-var.js',
  'language/module-code/instn-iee-star-cycle.js',
  'language/module-code/instn-local-bndng-cls.js',
  'language/module-code/instn-local-bndng-const.js',
  'language/module-code/instn-local-bndng-export-cls.js',
  'language/module-code/instn-local-bndng-export-const.js',
  'language/module-code/instn-local-bndng-export-fun.js',
  'language/module-code/instn-local-bndng-export-gen.js',
  'language/module-code/instn-local-bndng-export-let.js',
  'language/module-code/instn-local-bndng-export-var.js',
  'language/module-code/instn-local-bndng-for.js',
  'language/module-code/instn-local-bndng-fun.js',
  'language/module-code/instn-local-bndng-gen.js',
  'language/module-code/instn-local-bndng-let.js',
  'language/module-code/instn-local-bndng-var.js',
  'language/module-code/instn-named-bndng-cls.js',
  'language/module-code/instn-named-bndng-const.js',
  'language/module-code/instn-named-bndng-dflt-cls.js',
  'language/module-code/instn-named-bndng-dflt-expr.js',
  'language/module-code/instn-named-bndng-dflt-fun-anon.js',
  'language/module-code/instn-named-bndng-dflt-fun-named.js',
  'language/module-code/instn-named-bndng-dflt-gen-anon.js',
  'language/module-code/instn-named-bndng-dflt-gen-named.js',
  'language/module-code/instn-named-bndng-dflt-named.js',
  'language/module-code/instn-named-bndng-dflt-star.js',
  'language/module-code/instn-named-bndng-fun.js',
  'language/module-code/instn-named-bndng-gen.js',
  'language/module-code/instn-named-bndng-let.js',
  'language/module-code/instn-named-bndng-trlng-comma.js',
  'language/module-code/instn-named-bndng-var.js',
  'language/module-code/instn-named-star-cycle.js',
  'language/module-code/instn-same-global.js',
  'language/module-code/instn-star-binding.js',
  'language/module-code/instn-star-star-cycle.js',
  'language/module-code/namespace/Symbol.toStringTag.js',
  'language/module-code/namespace/internals/define-own-property.js',
  'language/module-code/namespace/internals/delete-exported-init.js',
  'language/module-code/namespace/internals/delete-non-exported.js',
  'language/module-code/namespace/internals/enumerate-binding-uninit.js',
  'language/module-code/namespace/internals/get-own-property-str-found-init.js',
  'language/module-code/namespace/internals/get-own-property-str-found-uninit.js',
  'language/module-code/namespace/internals/get-own-property-sym.js',
  'language/module-code/namespace/internals/get-str-found-init.js',
  'language/module-code/namespace/internals/get-str-update.js',
  'language/module-code/namespace/internals/get-sym-found.js',
  'language/module-code/namespace/internals/has-property-str-found-init.js',
  'language/module-code/namespace/internals/has-property-sym-found.js',
  'language/module-code/namespace/internals/is-extensible.js',
  'language/module-code/namespace/internals/object-hasOwnProperty-binding-uninit.js',
  'language/module-code/namespace/internals/object-keys-binding-uninit.js',
  'language/module-code/namespace/internals/object-propertyIsEnumerable-binding-uninit.js',
  'language/module-code/namespace/internals/own-property-keys-binding-types.js',
  'language/module-code/namespace/internals/own-property-keys-sort.js',
  'language/module-code/namespace/internals/set-prototype-of.js',
  'language/module-code/namespace/internals/set.js',
  'language/module-code/privatename-valid-no-earlyerr.js',
];

export const excludeDescriptions = [];

export const excludeFeatures = [
  'cross-realm', // TODO: Evaluator does not create realms.
];

export const excludeFlags = [
  'noStrict', // TODO: Evaluator does not support sloppy mode.
];

export const sourceTextCorrections = [];

export const excludeErrors = []; // used while debugging, avoid long term
