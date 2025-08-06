const sum = require("./sum");

test("Sums two numbers properly", () => {
    expect(sum(1,2)).toBe(3);
});


test("Returns zero for zero elements", () => {
    expect(sum(0, 0)).toBe(0);
});


test("Throws an error if one or more arguments are missing", () => {
    expect(() => {
        sum(a=1);
    }).toThrow("error");

    expect(() => {
        sum(b=1);
    }).toThrow("error");

    expect(() => {
        sum();
    }).toThrow("error");
    
});