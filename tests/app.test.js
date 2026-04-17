const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeTextKey, resolveImagePath } = require("../assets/app.js");

test("normalizeTextKey trims surrounding spaces", function () {
    assert.equal(normalizeTextKey("  rua, 突然出现！  "), "rua, 突然出现！");
});

test("resolveImagePath matches exact keys", function () {
    assert.equal(
        resolveImagePath({ "rua, 突然出现！": "./imgs/rain.png" }, "rua, 突然出现！"),
        "./imgs/rain.png"
    );
});

test("resolveImagePath matches trimmed keys", function () {
    assert.equal(
        resolveImagePath({ " rua, 突然出现！ ": "./imgs/rain.png" }, "rua, 突然出现！"),
        "./imgs/rain.png"
    );
});

test("resolveImagePath returns null when no match exists", function () {
    assert.equal(resolveImagePath({ "别的句子": "./imgs/rain.png" }, "rua, 突然出现！"), null);
});
