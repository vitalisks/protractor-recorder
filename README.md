# Protractor Recorder
Chrome extension to record Protractor E2E test scripts

## How to Install
1. Download ZIP and unzip to folder on your local machine
2. Start Chrome browser and navigate to *chrome://extensions*
3. Enable `Developer mode`
4. Click on **Load unpacked extension** and select location of the folder, where `manifest.json` is located
5. Enable the Protractor Recorder extension
 
## How to Use
1. Open your web site in Chrome
2. Launch **Developer Tools** by pressing F12
3. Select **Protractor** tab
4. Interact with your web site.  Each action is recorded in the Protractor Recorder console.
5. When you're done, click **Copy to Clipboard** to copy the recorded script.


## Limitations
  - Will not work on elements in frames, iframes
  
## Supported record actions (inject.js)
Following global objects are used and should be available
`element`, `browser`, `expect`, `by` and `page` with method `waitForItemToBeVisible` for the test execution

List of record actions
- `click` - for all elements except `CANVAS`, `SELECT` without holding `SHIFT` key will generate jelement query, check that element exists on the page and click action (except `INPUT`)
    ```javascript
    // start of header part is always generated
    browser.driver.manage().window().setSize(1680, 1020);
    let jelement=null
    let jelementValue=''
    // end of the header
    jelement=element(by.xpath('//BUTTON[contains(text(),"Log in")]'));
    expect(jelement.locator().toString()+' exists = '+await jelement.isPresent()).toBe(jelement.locator().toString()+' exists = true');
    await jelement.click();
    ```
- `CTRL` + `ALT` + `t` - will prompt text input box, which to enter test comment
    ```javascript
    //Start test: This is test comment
    ```
 - `CTRL` + `Right click` - will generate element query path and code to wait for element to appear on the page if element should appear after click action
    ```javascript
    jelement=element(by.xpath('//SPAN[contains(text()," Calendar ")]'));
    await page.waitForItemToBeVisible(jelement);
    ```
- `ALT` + `Right click` - will generate element query path and code to check if element exists
    ```javascript
    jelement=element(by.xpath('//SPAN[@title="protractor-recorder"]'));
    expect(jelement.locator().toString()+' exists = '+await jelement.isPresent()).toBe(jelement.locator().toString()+' exists = true');
    ``` 
- `SHIFT` + `Right click` - will generate element query path, code to check if element exists and click action for non INPUT tags (*can be required, when click action should not be triggered during the test recording*).
    ```javascript
    jelement=element(by.xpath('//SPAN[@title="protractor-recorder"]'));
    expect(jelement.locator().toString()+' exists = '+await jelement.isPresent()).toBe(jelement.locator().toString()+' exists = true');
    await jelement.click(); //except INPUT tags
    ```
 - `change` - records data change in the fields `INPUT(text|password|number)`, `TEXTAREA`, `SELECT` and generates fill script with the delay before checking populated value (required to ensure, that test field is filled before value check during the test execution)
    #### Simple INPUT field
    ```javascript
    jelement=element(by.xpath('//DIV/INPUT[@name="q"]'));
    jelementValue='testing recorder';
    expect(jelement.locator().toString()+' exists = '+await jelement.isPresent()).toBe(jelement.locator().toString()+' exists = true');
    await jelement.sendKeys(jelementValue);
    await browser.sleep(300);
    expect(await jelement.getAttribute('value')).toEqual(jelementValue);
    ```
    #### TEXTAREA
    ```javascript
    jelement=element(by.xpath('//TEXTAREA'));
    jelementValue='testing recorder';
    expect(jelement.locator().toString()+' exists = '+await jelement.isPresent()).toBe(jelement.locator().toString()+' exists = true');
    await jelement.sendKeys(jelementValue);
    await browser.sleep(300);
    expect(await jelement.getAttribute('value')).toEqual(jelementValue);
    ```
    #### SELECT
    ```javascript
    jelement=element(by.xpath('//SELECT[@name="cars"]'));
    jelementValue='volvo';
    expect(jelement.locator().toString()+' exists = '+await jelement.isPresent()).toBe(jelement.locator().toString()+' exists = true');
    await jelement.element(by.css('option[value="'+jelementValue+'"]')).click();
    await browser.sleep(300);
    expect(await jelement.element(by.css('option:checked')).getAttribute('value')).toEqual(jelementValue);
    ```
