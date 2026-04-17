function normalizeTextKey(value) {
    return typeof value === "string" ? value.trim() : "";
}

function resolveImagePath(images, text) {
    if (!images) {
        return null;
    }

    if (images[text]) {
        return images[text];
    }

    let normalizedText = normalizeTextKey(text);
    for (let key in images) {
        if (Object.prototype.hasOwnProperty.call(images, key) && normalizeTextKey(key) === normalizedText) {
            return images[key];
        }
    }

    return null;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        normalizeTextKey: normalizeTextKey,
        resolveImagePath: resolveImagePath
    };
}

if (typeof window !== "undefined") {
    (function () {
        var buttonOrder = [
            "turn_on",
            "play",
            "bannar_coming",
            "balloons_flying",
            "cake_fadein",
            "light_candle",
            "wish_message",
            "story"
        ];
        var balloonIds = ["b1", "b2", "b3", "b4", "b5", "b6", "b7"];
        var freeFlightTimers = {};
        var isWishLayoutActive = false;

        function byId(id) {
            return document.getElementById(id);
        }

        function sleep(ms) {
            return new Promise(function (resolve) {
                window.setTimeout(resolve, ms);
            });
        }

        function fadeIn(element, displayValue, duration) {
            if (!element) {
                return Promise.resolve();
            }

            element.style.display = displayValue || "block";
            element.animate([
                { opacity: 0 },
                { opacity: 1 }
            ], {
                duration: duration || 600,
                easing: "ease",
                fill: "forwards"
            });

            return Promise.resolve();
        }

        function fadeOut(element, duration) {
            return new Promise(function (resolve) {
                if (!element || getComputedStyle(element).display === "none") {
                    resolve();
                    return;
                }

                var animation = element.animate([
                    { opacity: 1 },
                    { opacity: 0 }
                ], {
                    duration: duration || 600,
                    easing: "ease",
                    fill: "forwards"
                });

                animation.onfinish = function () {
                    element.style.display = "none";
                    element.style.opacity = "";
                    resolve();
                };
            });
        }

        function showButton(id) {
            return fadeIn(byId(id), "inline-flex", 500);
        }

        function hideButton(id) {
            return fadeOut(byId(id), 400);
        }

        function setButtonLabels() {
            Object.keys(window.config.desc || {}).forEach(function (key) {
                var button = byId(key);
                if (button && window.config.desc[key]) {
                    button.textContent = window.config.desc[key];
                }
            });
        }

        function renderMessages() {
            var container = byId("texts-container");

            window.config.texts.forEach(function (text) {
                var paragraph = document.createElement("p");
                var imagePath = resolveImagePath(window.config.imgs, text);

                paragraph.textContent = text;

                if (imagePath) {
                    var image = document.createElement("img");
                    image.src = imagePath;
                    image.className = "text-img";
                    image.alt = "birthday image";
                    paragraph.appendChild(image);
                }

                container.appendChild(paragraph);
            });
        }

        function clearFreeFlight() {
            Object.keys(freeFlightTimers).forEach(function (key) {
                var timerId = freeFlightTimers[key];
                window.clearTimeout(timerId);
            });
            freeFlightTimers = {};
        }

        function randomPosition(max) {
            return Math.max(0, Math.round(Math.random() * max));
        }

        function loopBalloon(balloon) {
            if (!balloon || balloon.dataset.freeFlight !== "true") {
                return;
            }

            var horizontalLimit = Math.max(window.innerWidth - 120, 120);
            var verticalLimit = Math.max(window.innerHeight - 220, 260);

            balloon.style.left = randomPosition(horizontalLimit) + "px";
            balloon.style.bottom = randomPosition(verticalLimit) + "px";

            freeFlightTimers[balloon.id] = window.setTimeout(function () {
                loopBalloon(balloon);
            }, 10000);
        }

        function startFreeFlight() {
            isWishLayoutActive = false;
            clearFreeFlight();

            balloonIds.forEach(function (id, index) {
                var balloon = byId(id);
                if (!balloon) {
                    return;
                }

                balloon.dataset.freeFlight = "true";
                balloon.style.transition = "left 10s linear, bottom 10s linear, top 0.6s ease";
                balloon.style.top = "auto";
                balloon.style.left = Math.max(16, Math.round((window.innerWidth / 8) * (index + 0.5))) + "px";
                balloon.style.bottom = "0px";
                loopBalloon(balloon);
            });
        }

        function layoutWishBalloons() {
            var viewportWidth = window.innerWidth;
            var center = viewportWidth / 2;
            var offsets = [-330, -220, -110, 0, 110, 220, 330];

            isWishLayoutActive = true;
            clearFreeFlight();

            balloonIds.forEach(function (id, index) {
                var balloon = byId(id);
                if (!balloon) {
                    return;
                }

                balloon.dataset.freeFlight = "false";
                balloon.style.transition = "left 0.6s ease, top 0.6s ease, bottom 0.6s ease";
                balloon.style.top = "240px";
                balloon.style.bottom = "auto";
                balloon.style.left = Math.max(12, Math.round(center + offsets[index] - 50)) + "px";
                balloon.style.opacity = "0.9";
            });
        }

        function setupResizeHandler() {
            window.addEventListener("resize", function () {
                if (isWishLayoutActive) {
                    layoutWishBalloons();
                }
            });
        }

        async function transitionToNext(currentId, nextId, delay) {
            await hideButton(currentId);
            if (delay) {
                await sleep(delay);
            }
            await showButton(nextId);
        }

        async function handleTurnOn() {
            ["yellow", "red", "blue", "green", "pink", "orange"].forEach(function (color) {
                byId("bulb_" + color).classList.add("bulb-glow-" + color);
            });
            document.body.classList.add("peach");

            await transitionToNext("turn_on", "play", 5000);
        }

        async function handlePlay() {
            var audio = document.querySelector(".song");
            if (audio) {
                audio.play().catch(function () {
                    return null;
                });
            }

            ["yellow", "red", "blue", "green", "pink", "orange"].forEach(function (color) {
                byId("bulb_" + color).classList.add("bulb-glow-" + color + "-after");
            });
            document.body.classList.add("peach-after");

            await transitionToNext("play", "bannar_coming", 6000);
        }

        async function handleBannerComing() {
            var banner = document.querySelector(".bannar");
            banner.classList.add("bannar-come");

            await transitionToNext("bannar_coming", "balloons_flying", 6000);
        }

        async function handleBalloonsFlying() {
            var border = document.querySelector(".balloon-border");
            border.style.transition = "transform 8s linear";
            border.style.transform = "translateY(-150vh)";

            document.querySelectorAll("#b1, #b4, #b5, #b7").forEach(function (balloon) {
                balloon.classList.add("balloons-rotate-behaviour-one");
            });
            document.querySelectorAll("#b2, #b3, #b6").forEach(function (balloon) {
                balloon.classList.add("balloons-rotate-behaviour-two");
            });

            startFreeFlight();
            await transitionToNext("balloons_flying", "cake_fadein", 5000);
        }

        async function handleCakeFadeIn() {
            await fadeIn(document.querySelector(".cake"), "block", 600);
            await transitionToNext("cake_fadein", "light_candle", 3000);
        }

        async function handleLightCandle() {
            document.querySelectorAll(".fuego").forEach(function (flame) {
                flame.style.display = "block";
            });

            await transitionToNext("light_candle", "wish_message", 0);
        }

        async function handleWishMessage() {
            layoutWishBalloons();
            document.querySelectorAll(".balloons h2").forEach(function (label) {
                fadeIn(label, "block", 3000);
            });

            await transitionToNext("wish_message", "story", 3000);
        }

        async function handleStory() {
            var paragraphs = Array.prototype.slice.call(document.querySelectorAll("#texts-container p"));

            await hideButton("story");
            await fadeOut(document.querySelector(".cake"), 300);
            await fadeIn(document.querySelector(".message"), "block", 600);

            for (var index = 0; index < paragraphs.length; index += 1) {
                await fadeIn(paragraphs[index], "block", 500);
                await sleep(1200);
                await fadeOut(paragraphs[index], 400);
                await sleep(500);
            }

            await fadeIn(document.querySelector(".cake"), "block", 300);
        }

        function bindButton(id, handler) {
            var button = byId(id);
            if (!button) {
                return;
            }

            button.addEventListener("click", function () {
                if (button.disabled) {
                    return;
                }

                button.disabled = true;
                handler().catch(function (error) {
                    console.error(error);
                });
            });
        }

        function initializeButtons() {
            buttonOrder.slice(1).forEach(function (id) {
                byId(id).style.display = "none";
            });
            byId(buttonOrder[0]).style.display = "inline-flex";
        }

        function initializePage() {
            renderMessages();
            setButtonLabels();
            initializeButtons();
            setupResizeHandler();

            bindButton("turn_on", handleTurnOn);
            bindButton("play", handlePlay);
            bindButton("bannar_coming", handleBannerComing);
            bindButton("balloons_flying", handleBalloonsFlying);
            bindButton("cake_fadein", handleCakeFadeIn);
            bindButton("light_candle", handleLightCandle);
            bindButton("wish_message", handleWishMessage);
            bindButton("story", handleStory);
        }

        document.addEventListener("DOMContentLoaded", initializePage);
        window.addEventListener("load", function () {
            fadeOut(document.querySelector(".loading"), 300);
            fadeIn(document.querySelector(".container"), "block", 400);
        });
    }());
}
