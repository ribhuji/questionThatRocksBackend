/// <reference types="node" />

import * as stream from 'stream';

declare function pipeline<T extends NodeJS.WritableStream>(
  stream1: NodeJS.ReadableStream,
  stream2: T,
  callback?: (err: NodeJS.ErrnoException | null) => void
): T;
declare function pipeline<T extends NodeJS.WritableStream>(
  stream1: NodeJS.ReadableStream,
  stream2: NodeJS.ReadWriteStream,
  stream3: T,
  callback?: (err: NodeJS.ErrnoException | null) => void
): T;
declare function pipeline<T extends NodeJS.WritableStream>(
  stream1: NodeJS.ReadableStream,
  stream2: NodeJS.ReadWriteStream,
  stream3: NodeJS.ReadWriteStream,
  stream4: T,
  callback?: (err: NodeJS.ErrnoException | null) => void
): T;
declare function pipeline<T extends NodeJS.WritableStream>(
  stream1: NodeJS.ReadableStream,
  stream2: NodeJS.ReadWriteStream,
  stream3: NodeJS.ReadWriteStream,
  stream4: NodeJS.ReadWriteStream,
  stream5: T,
  callback?: (err: NodeJS.ErrnoException | null) => void
): T;
declare function pipeline(
  streams: Array<NodeJS.ReadableStream | NodeJS.WritableStream | NodeJS.ReadWriteStream>,
  callback?: (err: NodeJS.ErrnoException | null) => void
): NodeJS.WritableStream;
declare function pipeline(
  stream1: NodeJS.ReadableStream,
  stream2: NodeJS.ReadWriteStream | NodeJS.WritableStream,
  ...streams: Array<NodeJS.ReadWriteStream | NodeJS.WritableStream | ((err: NodeJS.ErrnoException | null) => void)>
): NodeJS.WritableStream;
declare namespace pipeline {
  function __promisify__(stream1: NodeJS.ReadableStream, stream2: NodeJS.WritableStream): Promise<void>;
  function __promisify__(
    stream1: NodeJS.ReadableStream,
    stream2: NodeJS.ReadWriteStream,
    stream3: NodeJS.WritableStream
  ): Promise<void>;
  function __promisify__(
    stream1: NodeJS.ReadableStream,
    stream2: NodeJS.ReadWriteStream,
    stream3: NodeJS.ReadWriteStream,
    stream4: NodeJS.WritableStream
  ): Promise<void>;
  function __promisify__(
    stream1: NodeJS.ReadableStream,
    stream2: NodeJS.ReadWriteStream,
    stream3: NodeJS.ReadWriteStream,
    stream4: NodeJS.ReadWriteStream,
    stream5: NodeJS.WritableStream
  ): Promise<void>;
  function __promisify__(
    streams: Array<NodeJS.ReadableStream | NodeJS.WritableStream | NodeJS.ReadWriteStream>
  ): Promise<void>;
  function __promisify__(
    stream1: NodeJS.ReadableStream,
    stream2: NodeJS.ReadWriteStream | NodeJS.WritableStream,
    ...streams: Array<NodeJS.ReadWriteStream | NodeJS.WritableStream>
  ): Promise<void>;
  function getPolyfill(): typeof pipeline;
  const implementation: typeof pipeline;
  function shim(): typeof pipeline;
}

export = pipeline;
