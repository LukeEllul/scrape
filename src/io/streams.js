const R = require('ramda');
const { Tuple } = require('ramda-fantasy');

//Note that everytime function is called the writable streams are piped
/**
 * injectStreamer :: ReadableStream -> [WritableStream] -> Action
 */
const injectStreamer = R.curry((readStream, writableStreams) => {
    writableStreams.forEach(stream => readStream.pipe(stream));
    return [
        Tuple(
            (_, v) => (readStream.push(v), v),
            (_, { err, v }) => {
                console.log(`Error in stream occured`);
                console.log(err);
                console.log(`ignoring stream error and continuing...`);
                return v;
            }
        )
    ]
});

/**
 * injectReadStream :: (ReadableStream, ?(a -> _)) -> Action
 */
const injectReadStream = (readStream, f) => [
    Tuple(
        (_, v) => (f ? f(readStream, v) : readStream.push(JSON.stringify(v)), v),
        (_, {err, v}) => {
            console.log(`error while pushing ${v.toString()} in read stream`);
            console.log(err);
            console.log('ignoring read stream error...');
            return v;
        }
    )
];

module.exports = {
    injectStreamer,
    injectReadStream
};