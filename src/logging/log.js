/**
 * logReject :: v -> ((driver, a) -> Promise _ a)
 */
const logReject = v => (driver, a) => console.log(v) || Promise.reject(a);

module.exports = {
    logReject
};