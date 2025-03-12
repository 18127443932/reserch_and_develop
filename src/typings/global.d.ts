/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  type AnyFunction = (...args: any[]) => any
  type AnyObject = Record<string, any>
  
  /** 将类型里的必选都变成可选 */
  type ToOptional<T extends object> = {
    [k in keyof T]?: T[k] extends object ? ToOptional<T[k]> : T[k]
  }
    /** 将类型里的可选都变成必选 */
  type ToRequired<T extends object> = {
    [K in keyof T]-?: T[K] extends object ? ToRequired<T[K]> : T[K];
  };
}
