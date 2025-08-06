import baseLib from "base-x";

// https://github.com/PwLDev/node-spdl/issues/2
const base  = typeof baseLib == "function" ?
    baseLib : (baseLib as any).default;

export const base62 = base("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");