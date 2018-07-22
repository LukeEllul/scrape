const R = require('ramda');
const { Tuple } = require('ramda-fantasy');

/**
 * type Action = [Tuple((driver, v) -> b, (driver, v) -> d)]
 */

/**
 * toPromise :: (*a -> b) -> Bool -> (*a -> Promise b err)
 */
const toPromise = f =>
    (...a) => {
        const v = f(...a);
        return v.then ? v : Promise.resolve(v);
    };

/**
 * apply :: Driver -> Promise v err -> [Tuple((driver, v) -> b, (driver, v) -> d)] -> (Driver -> Promise x err -> q) -> q
 */
const apply = R.curry((driver, promise, ops, f) =>
    ops.length === 0 ? f.f(driver)(promise, f.ops) :
    apply(
        driver,
        R.pipe(
            op => Tuple(toPromise(Tuple.fst(op)), toPromise(Tuple.snd(op))),
            op => promise.then(
                v => Tuple.fst(op)(driver, v).then(v => v, err => Tuple.snd(op)(driver, err)))
        )(R.head(ops)),
        R.tail(ops),
        typeof f === "function" ? {f, ops} : f
    ));

module.exports = {
    apply
};