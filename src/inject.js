(function () {
    const protractor = {
        logs: [],
        ignoreSynchronization: false
    };

    var url = '';
    var time = null;
    var mouse = [];
    var loggerEnabled = true;
    function eventHandler(e) {
        if (hlist = handlers[e.type]) {
            let stopExecution = false;
            hlist
                .filter(x => x.from(e.target, e))
                .forEach(x => {
                    let result = stopExecution || x.action(e, e.target);
                    if (result) {
                        e.stopPropagation()
                        e.preventDefault()
                        stopExecution = result
                    }
                });
        }
    }

    const handlers = {
        'click': [
            {
                from: (el, e) => ['CANVAS', 'SELECT'].indexOf(el.tagName) == -1 && e.shiftKey != true,
                action: (e, target) => {
                    logMultiple([
                        elementVariable(target),
                        checkForExistence(target),
                        ['INPUT'].indexOf(target.tagName) == -1 ? 'await jelement.click();' : null,
                        ''
                    ].filter(x => x != null));

                }
            }
        ],
        'keydown': [
            {
                from: (el, e) => e.altKey && e.ctrlKey && e.key == 't',
                action(e, el) {
                    const testName = prompt('Please write down test comment');
                    if (testName) {
                        log('//Start test: ' + testName);
                    }
                }
            }
        ],
        'contextmenu': [
            {
                from: (el, e) => e.ctrlKey && el.tagName != '',
                action(e, target) {
                    logMultiple([
                        elementVariable(target),
                        waitItemToAppear(target)
                    ]);
                    return true
                }
            },
            {
                from: (el, e) => e.altKey && el.tagName != '',
                action(e, target) {
                    logMultiple([
                        elementVariable(target),
                        checkForExistence(target)
                    ]);
                    return true
                }
            },
            {
                from: (el, e) => e.shiftKey && el.tagName != '',
                action(e, target) {
                    logMultiple([
                        elementVariable(target),
                        checkForExistence(target),
                        ['INPUT'].indexOf(target.tagName) == -1 ? 'await jelement.click();' : null,
                        ''
                    ].filter(x => x != null));
                    return true
                }
            }
        ],
        'mousedown': [],
        'mousemove': [],
        'mouseup': [],
        'touchstart': [],
        'touchmove': [],
        'touchend': [],
        'change': [
            {
                from: (el) => el.tagName == 'INPUT' && ['text', 'password', 'number'].indexOf(el.getAttribute('type').toLowerCase()) != -1,
                action(e, target) {
                    logMultiple(
                        [
                            elementVariable(target),
                            elementValue(target.value),
                            checkForExistence(target),
                            fillElementValue(target, target.value),
                            sleep(300),
                            checkElementValue(target, target.value),
                            ''//empty separator
                        ]
                    );

                }
            },
            {
                from: (el) => el.tagName == 'TEXTAREA',
                action(e, target) {
                    logMultiple(
                        [
                            elementVariable(target),
                            elementValue(target.value),
                            checkForExistence(target),
                            fillElementValue(target, target.value),
                            sleep(300),
                            checkElementValue(target, target.value),
                            ''//empty separator
                        ]
                    );

                }
            },
            {
                from: (el) => el.tagName == 'SELECT',
                action(e, target) {
                    const elValue = target.options[target.selectedIndex].value;
                    logMultiple(
                        [
                            elementVariable(target),
                            elementValue(elValue),
                            checkForExistence(target),
                            fillSelectElementValue(target, elValue),
                            sleep(300),
                            checkSelectElementValue(target, elValue),
                            ''//empty separator
                        ]
                    );
                }
            }
        ]
    }
    Object.keys(handlers).forEach(x => document.addEventListener(x, eventHandler));


    document.addEventListener('mousedown', function (e) {
        if (e.target.tagName.toLowerCase() == 'canvas')
            mouse = [e];
    });

    document.addEventListener('mousemove', function (e) {
        if (e.target.tagName.toLowerCase() == 'canvas' && mouse && mouse.length > 0)
            mouse.push(e);
    });

    document.addEventListener('mouseup', function (e) {
        if (e.target.tagName.toLowerCase() == 'canvas' && mouse && mouse.length > 0 && mouse[0].target == e.target) {
            if (mouse.reduce(function (a, b) { return a.clientX - b.clientX; }, mouse[0]) <= 1 && mouse.reduce(function (a, b) { return a.clientY - b.clientY; }, mouse[0]) <= 1)
                log('browser.driver.actions().mouseMove(element(by.css(\'' + selector(mouse[0].target).replace(/\\\"/g, '\\\\\\"') + '\')), {x: ' + mouse[0].clientX.toString() + ', y:' + mouse[0].clientY.toString() + '}).click().perform();');
            else
                log('browser.driver.actions().mouseMove(element(by.css(\'' + selector(mouse[0].target).replace(/\\\"/g, '\\\\\\"') + '\')), {x: ' + mouse[0].clientX.toString() + ', y:' + mouse[0].clientY.toString() + '}).mouseDown()' + mouse.reduce(function (a, b, i) { return i > 0 ? a + '.mouseMove({x: ' + (b.clientX - mouse[i - 1].clientX).toString() + ', y:' + (b.clientY - mouse[i - 1].clientY).toString() + '})' : ''; }, '') + '.mouseUp().perform();');
        }
    });

    document.addEventListener('touchstart', function (e) {
        if (e.target.tagName.toLowerCase() == 'canvas' && e.targetTouches && e.targetTouches.length > 0)
            mouse = [{ target: e.target, clientX: Math.floor(e.targetTouches[0].clientX), clientY: Math.floor(e.targetTouches[0].clientY) }];
    });

    document.addEventListener('touchmove', function (e) {
        if (e.target.tagName.toLowerCase() == 'canvas' && e.targetTouches && e.targetTouches.length > 0 && mouse && mouse.length > 0)
            mouse.push({ target: e.target, clientX: Math.floor(e.targetTouches[0].clientX), clientY: Math.floor(e.targetTouches[0].clientY) });
    });

    document.addEventListener('touchend', function (e) {
        if (e.target.tagName.toLowerCase() == 'canvas' && mouse && mouse.length > 0 && mouse[0].target == e.target) {
            if (mouse.reduce(function (a, b) { return a.clientX - b.clientX; }, mouse[0]) <= 1 && mouse.reduce(function (a, b) { return a.clientY - b.clientY; }, mouse[0]) <= 1)
                log('browser.driver.actions().mouseMove(element(by.css(\'' + selector(mouse[0].target).replace(/\\\"/g, '\\\\\\"') + '\')), {x: ' + mouse[0].clientX.toString() + ', y:' + mouse[0].clientY.toString() + '}).click().perform();');
            else
                log('browser.driver.actions().mouseMove(element(by.css(\'' + selector(mouse[0].target).replace(/\\\"/g, '\\\\\\"') + '\')), {x: ' + mouse[0].clientX.toString() + ', y:' + mouse[0].clientY.toString() + '}).mouseDown()' + mouse.reduce(function (a, b, i) { return i > 0 ? a + '.mouseMove({x: ' + (b.clientX - mouse[i - 1].clientX).toString() + ', y:' + (b.clientY - mouse[i - 1].clientY).toString() + '})' : ''; }, '') + '.mouseUp().perform();');
        }
    });
    function sleep(time) {
        return `await browser.sleep(${time});`
    }
    function elementVariable(target) {
        return `jelement=${jasmineSelector(target)};`
    }
    function elementValue(refValue) {
        return `jelementValue='${refValue}';`
    }
    function fillElementValue(target, refValue) {
        return `await jelement.sendKeys(jelementValue);`;
    }
    function fillSelectElementValue(target, refValue) {
        return `await jelement.element(by.css('option[value="'+jelementValue+'"]')).click();`;
    }
    function checkSelectElementValue(target, refValue) {
        return `expect(await jelement.element(by.css('option:checked')).getAttribute('value')).toEqual(jelementValue);`;
    }
    function checkElementValue(target, refValue) {
        return `expect(await jelement.getAttribute('value')).toEqual(jelementValue);`;
    }
    function waitItemToAppear(target) {
        return `await page.waitForItemToBeVisible(jelement);`;
    }
    function checkForExistence(target) {
        let selectorPath = getUniqueXPath(target) || selector(target);
        return `expect(jelement.locator().toString()+' exists = '+await jelement.isPresent()).toBe(jelement.locator().toString()+' exists = true');`;
    }
    function jasmineSelector(target) {
        if (xpath = getUniqueXPath(target)) {
            return `element(by.xpath('${xpath}'))`;
        } else {
            return 'element(by.css(\'' + selector(target).replace(/\\\"/g, '\\\\\\"') + '\'))';
        }

    }
    const getPriorityAttribute = (target) => {
        return ['ng-model', 'ng-href', 'name', 'aria-label', 'id', 'title', 'ng-reflect-title'].reduce(function (a, b) { return a || (target.getAttribute(b) ? b : null); }, null);
    }
    const selector = function (target) {
        var query = '';

        if (target == document) {
            query = 'body';
        } else {
            var attr = getPriorityAttribute(target);
            if (attr)
                query = target.tagName.toLowerCase() + '[' + attr + '="' + target.getAttribute(attr).replace(/\\/g, '\\\\').replace(/\'/g, '\\\'').replace(/\"/g, '\\"').replace(/\0/g, '\\0') + '"]';
            else
                query = target.tagName.toLowerCase();

            var nodes = target.parentNode.querySelectorAll(query);
            if (nodes && nodes.length > 1)
                query += ':nth-of-type(' + (Array.prototype.slice.call(nodes).indexOf(target) + 1).toString() + ')';

            query = query.replace(/\s/g, ' ');
        }

        if (document.querySelectorAll(query).length > 1 && target.parentNode) {
            query = selector(target.parentNode) + '>' + query;
        }


        return query;
    };
    const getUniqueXPath = (target) => {
        let thisTarget = target
        let fullPath = []
        function copy(arr) {
            return [...arr]
        }
        while (thisTarget && thisTarget.parentNode) {
            fullPath.push(getIds(thisTarget))
            const testXPath = `count(//${copy(fullPath).reverse().join("/")})`;
            const nodeCount = document.evaluate(testXPath, document, null, 0).numberValue

            if (nodeCount == 1) {
                return `//${copy(fullPath).reverse().join("/")}`;
            } else if (nodeCount == 0) {
                return false;
            }
            thisTarget = thisTarget.parentNode
        }
        return false;
    }
    const innerText = (target) => {
        let child = target.firstChild
        while (child) {
            if (child.nodeType == 3) {
                return child.data;
            }
            child = child.nextSibling
        }
    }
    const getIds = (target) => {
        let attrs = getPriorityAttribute(target);
        let base = `${target.tagName}`
        if (attrs) {
            base += `[@${attrs}="${target.getAttribute(attrs)}"]`
        } else if (['SPAN', 'BUTTON', 'A', 'H5', 'H4', 'H3', 'H2', 'H1', 'TH', 'TD'].indexOf(target.tagName) != -1) {
            if (innerText(target)) {//}.innerText!='' && target.children.length==0){
                base += `[contains(text(),"${innerText(target)}")]`
            }

        }
        return base;
    }
    function updateDevResult() {
        chrome.runtime.sendMessage(chrome.runtime.id, { logs: protractor.logs }, function (response) {

        });
    }
    var log = function (action) {
        //skip duplicate action add
        if (loggerEnabled && protractor.logs[protractor.logs.length - 1] != action) {
            if (protractor.logs.length == 0) {
                protractor.logs.push('browser.driver.manage().window().setSize(' + window.outerWidth + ', ' + window.outerHeight + ');');
                protractor.logs.push('let jelement=null');
                protractor.logs.push('let jelementValue=\'\'');
            }


            if (protractor.ignoreSynchronization && time)
                protractor.logs.push('browser.sleep(' + (new Date() - time).toString() + ');');

            time = new Date();

            protractor.logs.push(action);
            updateDevResult();
        }

    };
    const logMultiple = function (actions) {
        actions.forEach((action) => log(action));
    }
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action) {
            if (request.action == 'clearLogs') {
                protractor.logs = [];
                updateDevResult();
            } else if (request.action == 'loggerState') {
                loggerEnabled = request.isEnabled
            }

        };
        sendResponse(true);
    });
    console.log('Initialized extension: ', chrome.runtime.getManifest())

})();
