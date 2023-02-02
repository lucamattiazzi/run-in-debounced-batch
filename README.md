# Run in Debounced Batch

Pretty sure I could find a better name for this.

## What

### The problem

You have a function `fn` that takes a while if you call it a lot of times, but you still need to get the results for `fn`.

You also have a way of batch the calls to `fn` so that it takes less time, but you still get the results.

e.g.:
You have a backend that returns responses to a query you run, but accepts single values or a list of values to query.

### The solution

You can debounce `fn` using something like lodash `debounce(fn)`, but it would not give you the results for all the instances of `fn` that have been called.

Instead, you can write `batchFn` that can handle an array of inputs from `fn` and returns the promise of an array of outputs from `fn`.

Then you use this library to generate a new function `gn` that when called returns a promise that resolves to the original output of `fn`, but that will actually simply add its input to `batchFn` and get the output from it.

## Why

There is at least one use case I know of for this, the one we encountered: we have custom Excel functions that query our backend.

These functions can take a cell as an input, and read the value from that cell: that's great, but when the Excel user has a huge column (or row) of inputs and simply drags the cell where the function is called, what Excel does is to call the function n times.

This proved to be quite a lot for our backend, we needed a way to be able to batch requests if they were called within a time limit.

## How

Badly written, barely tested, hardly legible TypeScript, how else could have I managed?

Created with [TSDX](https://tsdx.io/)
