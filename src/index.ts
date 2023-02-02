type BatchFunction<I extends any[] = any[], O = any> = (args: I) => Promise<O[]>

type SingleInput<T extends BatchFunction> = Array<any> & (Parameters<T> extends Array<infer K> ? K : never)
type SingleOutput<T extends BatchFunction> = Awaited<ReturnType<T>> extends Array<infer K> ? K : never
type SingleFunction<T extends BatchFunction> = (...args: SingleInput<T>) => Promise<SingleOutput<T>>

export function runInDebouncedBatch(
  fn: BatchFunction,
  timeoutLength = 1000
): SingleFunction<typeof fn> {
  type Resolver = (results: SingleOutput<typeof fn>) => void
  type Rejecter = (reason: any) => void

  let argsList: SingleInput<typeof fn>[] = []
  let resolversList: [Resolver, Rejecter][] = []
  let timeout: NodeJS.Timeout

  async function batchCall(): Promise<void> {
    try {
      const results: Awaited<ReturnType<typeof fn>> = await fn(argsList)
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

  function singleCall(...args: SingleInput<typeof fn>): Promise<SingleOutput<typeof fn>> {
    clearTimeout(timeout)
    argsList.push(args)
    timeout = setTimeout(() => batchCall(), timeoutLength)
    return new Promise<SingleOutput<typeof fn>>((res, rej) => resolversList.push([res, rej]))
  }

  return singleCall
}
