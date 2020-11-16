/// <reference types="node" />

import * as stream from 'stream';

declare function getPolyfill<T extends NodeJS.WritableStream>(): (
  stream1: NodeJS.ReadableStream,
  stream2: T,
  callback?: (err: NodeJS.ErrnoException | null) => void
) => T;
declare function getPolyfill<T extends NodeJS.WritableStream>(): (
  stream1: NodeJS.ReadableStream,
  stream2: NodeJS.ReadWriteStream,
  stream3: T,
  callback?: (err: NodeJS.ErrnoException | null) => void
) => T;
declare function getPolyfill<T extends NodeJS.WritableStream>(): (
  stream1: NodeJS.ReadableStream,
  stream2: NodeJS.ReadWriteStream,
  stream3: NodeJS.ReadWriteStream,
  stream4: T,
  callback?: (err: NodeJS.ErrnoException | null) => void
) => T;
declare function getPolyfill<T extends NodeJS.WritableStream>(): (
  stream1: NodeJS.ReadableStream,
  stream2: NodeJS.ReadWriteStream,
  stream3: NodeJS.ReadWriteStream,
  stream4: NodeJS.ReadWriteStream,
  stream5: T,
  callback?: (err: NodeJS.ErrnoException | null) => void
) => T;
declare function getPolyfill(): (
  streams: Array<NodeJS.ReadableStream | NodeJS.WritableStream | NodeJS.ReadWriteStream>,
  callback?: (err: NodeJS.ErrnoException | null) => void
) => NodeJS.WritableStream;
declare function getPolyfill(): (
  stream1: NodeJS.ReadableStream,
  stream2: NodeJS.ReadWriteStream | NodeJS.WritableStream,
  ...streams: Array<NodeJS.ReadWriteStream | NodeJS.WritableStream | ((err: NodeJS.ErrnoException | null) => void)>
) => NodeJS.WritableStream;

export = getPolyfill;
