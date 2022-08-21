
class SEmitter<E extends { type: string }> {

  #listeners = new Set<(e: E) => void>()

  on (listener: (e: E) => void): void {
    if (!this.#listeners.has(listener)) this.#listeners.add(listener)
  }

  off (listener: (e: E) => void): void {
    this.#listeners.delete(listener)
  }

  _emit (e: E): void {
    for (const l of this.#listeners) {
      try {
        l(e)
      } catch (_) { /**/ }
    }
  }

  _clearEmitter (): void {
    this.#listeners.clear()
  }
}

class Emitter<E extends { type: string }> {

  #types = new Map<E['type'], SEmitter<E>>()

  #getEventType <V extends E> (type: V['type'], force: true): SEmitter<V>
  #getEventType <V extends E> (type: V['type'], force: false): undefined | SEmitter<V>
  #getEventType <V extends E> (type: V['type'], force: boolean): undefined | SEmitter<V> {
    let emitter = this.#types.get(type) as unknown as (undefined | SEmitter<V>)
    if (!emitter && force) {
      emitter = new SEmitter()
      this.#types.set(type, emitter as SEmitter<E | V>)
    }
    return emitter
  }

  on<T extends E['type'], V extends E & { type: T }> (type: T, listener: (e: V) => void): void {
    this.#getEventType<V>(type, true).on(listener)
  }

  off<T extends E['type'], V extends E & { type: T }> (type: T, listener: (e: V) => void): void {
    this.#getEventType<V>(type, false)?.off(listener)
  }

  _emit<T extends E['type'], V extends E & { type: T }> (type: T, e: V): void {
    this.#getEventType<V>(type, false)?._emit(e)
  }

  _clearEmitter (): void {
    const vs = this.#types.values()
    this.#types.clear()
    for (const item of vs) {
      item._clearEmitter()
    }
  }
}

export {
  SEmitter,
  Emitter
}
