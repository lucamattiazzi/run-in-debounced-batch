type BatchFunction<I extends any[] = any[], O = any> = (args: I) => Promise<O[]>

type SingleInput<T extends BatchFunction> = Array<any> & (Parameters<T> extends Array<infer K> ? K : never)
type SingleOutput<T extends BatchFunction> = Awaited<ReturnType<T>> extends Array<infer K> ? K : never
type SingleFunction<T extends BatchFunction> = (...args: SingleInput<T>) => Promise<SingleOutput<T>>

export function runInDebouncedBatch<T extends BatchFunction>(
  fn: T,
  timeoutLength = 1000
): SingleFunction<T> {
  type Resolver = (results: SingleOutput<T>) => void
  type Rejecter = (reason: any) => void

  let argsList: SingleInput<T>[] = []
  let resolversList: [Resolver, Rejecter][] = []
  let timeout: NodeJS.Timeout

  async function batchCall(): Promise<void> {
    try {
      const results: Awaited<ReturnType<T>> = await fn(argsList)
      for (const idx in results) {
        const result = results[idx]
        const [resolve] = resolversList[idx]
        resolve(result)
      }
    } catch (err) {
      for (const [_resolve, reject] of resolversList) {
        reject(err)
      }
    }
    argsList = []
    resolversList = []
  }

  function singleCall(...args: SingleInput<T>): Promise<SingleOutput<T>> {
    clearTimeout(timeout)
    argsList.push(args)
    timeout = setTimeout(() => batchCall(), timeoutLength)
    return new Promise<SingleOutput<T>>((res, rej) => resolversList.push([res, rej]))
  }

  return singleCall
}
