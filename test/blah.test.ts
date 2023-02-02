import { runInDebouncedBatch } from "../src"

function sleep(ms = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

class SlowBackend {
  maxRequest = 2
  apiTime = 500
  currentRequests: (() => void)[] = []
  isLooping = false

  api(q: string): Promise<string> {
    const promise = new Promise<string>(r => {
      this.currentRequests.push(() => r(q.toUpperCase()))
      this.loop()
    })
    return promise
  }

  async loop(): Promise<void> {
    if (this.isLooping) return
    this.isLooping = true
    const computableRequests = this.currentRequests.splice(0, this.maxRequest)
    const promises = computableRequests.map(r => sleep(this.apiTime).then(r))
    await Promise.all(promises)
    this.isLooping = false
    if (computableRequests.length) this.loop()
  }
}

const backend = new SlowBackend()

async function batchFn(listOfInputs: string[]): Promise<string[]> {
  const concatenatedInputs = listOfInputs.join(",")
  const results = await backend.api(concatenatedInputs)
  return results.split(",")
}

const INPUTS = ["ciao", "hi", "salut", "hola", "oi", "hallo", "maronn"]
const OUTPUTS = ["CIAO", "HI", "SALUT", "HOLA", "OI", "HALLO", "MARONN"]

describe("tests batch function", () => {
  it("slow function should be slow", async (done) => {
    const start = Date.now()
    const promises = INPUTS.map(i => backend.api(i))
    const results = await Promise.all(promises)
    const elapsedTime = Date.now() - start
    const expectedTime = Math.ceil(INPUTS.length / backend.maxRequest) * backend.apiTime
    expect(results).toEqual(OUTPUTS)
    expect(elapsedTime / 1000).toBeCloseTo(expectedTime / 1000, 1)
    done()
  })
  it("batched function should be less slow", async (done) => {
    const debounceTime = 500
    const start = Date.now()
    const singleFunction = runInDebouncedBatch(batchFn, debounceTime)
    const promises = INPUTS.map(i => singleFunction(i))
    const results = await Promise.all(promises)
    const elapsedTime = Date.now() - start
    const expectedTime = backend.apiTime + debounceTime
    expect(results).toEqual(OUTPUTS)
    expect(elapsedTime / 1000).toBeCloseTo(expectedTime / 1000, 1)
    done()
  })
})
