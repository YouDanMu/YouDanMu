export function objToMap(o: any): Map<any,any> {
    return Object.keys(o).reduce((m, k) => m.set(k, o[k]), new Map());
}
