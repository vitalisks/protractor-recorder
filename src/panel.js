function logMessage(){
    console.log.apply(null,arguments);
}

var editing = false;

function update(logs) {
    if (!editing) {
        var code = document.querySelector('code');
        if (code)
            {
                logMessage('Received logs',logs)
                code.innerText = logs.join('\n');
            }
            
        hljs.highlightBlock(document.querySelector('code'));        
            
        if (logs && logs.length > 0) {
            document.querySelector('#copy').style.display = '';
            document.querySelector('#clear').style.display = '';
        }
        else {
            document.querySelector('#copy').style.display = 'none';
            document.querySelector('#clear').style.display = 'none';
        }
    }
}
function sendMessageToLogger(messageData,callback){    
    if (chrome.tabs){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id,messageData, function(response) {
                if (callback){
                    callback(response);
                }
            });
        });
    }
    
}
document.addEventListener('DOMContentLoaded', function () {
    function eventHandler(e){        
        if (hlist=handlers[e.type]){
            hlist      
            .filter(x=>x.from(e.target))
            .forEach(x=>{                
                x.action(e,e.target)
            })
        }
    }
    const handlers={
        'click':[
            {               
                from:el=>el.id=='clear',
                action:(e)=>{
                    logMessage('Sending message to extension: '+chrome.runtime.id)
                    sendMessageToLogger({action:'clearLogs'});                        
                }
            },
            {
                from:el=>el.id=='copy',
                action:(e)=>{
                    var code = document.createRange();
                    code.selectNode(document.querySelector('code'));
                    window.getSelection().addRange(code);
                    
                    try {
                        if (document.execCommand('copy'))
                            document.querySelector('#message').innerText = 'Copied to the clipboard on ' + (new Date()).toLocaleString();
                        else
                            document.querySelector('#message').innerText = 'Problem copying test script to the clipboard.';
                    } 
                    catch (e) {
                        document.querySelector('#message').innerText = 'Problem copying test script to the clipboard.';
                    }
                    
                    window.getSelection().removeAllRanges();
                }
            }
        ],
        'change':[
            {
                from:el=>el.name=='disableRecording',
                action:(e,target)=>{
                    sendMessageToLogger({
                        'action':'loggerState',
                        'isEnabled':!target.checked
                    })
                }
            }
        ]
    }   
    Object.keys(handlers).forEach(x=>document.addEventListener(x,eventHandler));

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.logs) {          
            update(request.logs);
        };
        sendResponse(true);
    });
    hljs.initHighlightingOnLoad();
}, false);
