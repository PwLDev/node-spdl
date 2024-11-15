var base62Charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const toBase62 = (input: number) => {
    if (input == 0) {
        return base62Charset[0];
    }

    var res = "";
    while (input > 0) {
        res = base62Charset[input % 62] + res;
        input = Math.floor(input / 62);
    }
    return res;
}

export const fromBase62 = (input: string) => {
    let res = 0;
    let length = input.length
    let i, char;

    for (i = 0; i < length; i++) {
        char = input.charCodeAt(i);
        if (char < 58) { // 0-9
            char = char - 48;
        } else if (char < 91) { // A-Z
            char = char - 29;
        } else { // a-z
            char = char - 87;
        }
        res += char * Math.pow(62, length - i - 1);
    }
    return res;
}
