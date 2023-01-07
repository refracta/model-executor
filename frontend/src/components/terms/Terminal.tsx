import React, {useEffect} from 'react';
import {FitAddon} from "xterm-addon-fit";
import {Terminal as XTerm} from 'xterm';
import 'xterm/css/xterm.css';
import {AppData} from "../../types/Types";

let terminal: XTerm;
let lastModelPath: string;
let lastMessage: any;
let lastResize: string;

function Terminal({data, fitAddon}: { data: AppData, fitAddon: FitAddon }) {

    useEffect(() => {
        if ((window as any).terminal) {
            ((window as any).terminal).dispose();
        }

        terminal = new XTerm({cursorBlink: false, allowProposedApi: true});
        terminal.loadAddon(fitAddon);
        terminal.open(document.querySelector('.terminal-container') as HTMLElement);
        terminal.onResize((event) => {
            let resize = JSON.stringify(event);
            if (lastResize !== resize) {
                lastResize = resize;
                data.sendJsonMessage({msg: 'TerminalResize', ...event});
            }
        });
        (window as any).terminal = terminal;

        let viewport = document.querySelector('.xterm-viewport') as HTMLElement;
        viewport.style.overflowY = 'hidden';
        fitAddon.fit();
    }, []);
    /*    if((window as any).testQueue?.length === void 0){
            (window as any).testQueue = [];
        }*/
    /*      useEffect(() => {
              if (lastMessage === data.lastJsonMessage) {
                  return;
              } else {
                  lastMessage = data.lastJsonMessage;
              }
              if (lastMessage && lastMessage.msg === 'Terminal') {
                  terminal.write(lastMessage.data);
                  terminal.scrollToBottom();
              }
          }, [data.lastJsonMessage]);*/
    useEffect(() => {
        // Strict mode 해제
        (window as any).terminalQueue = [];
        let terminalQueue: string[] = (window as any).terminalQueue;
        let isWorking = false;
        let count = 0;
        data.getWebSocket()?.addEventListener('message', (event: Event) => {
            let data = (event as MessageEvent).data;
            let message = JSON.parse(data);
            if (message.msg === 'Terminal') {
                terminalQueue.push(message.data);
                if (isWorking) {
                    return;
                }
                isWorking = true;
                setTimeout(async _ => {
                    function write(data: string) {
                        return new Promise(resolve => {
                            terminal.write(data, () => resolve(void 0));
                            terminal.scrollToBottom();
                        });
                    }

                    while (terminalQueue.length > 0) {
                        await write(terminalQueue.shift() as string);
                    }
                    isWorking = false;
                });
            }
        });
    }, []);

    let terminalData = data.model?.lastHistory?.terminal as string;
    useEffect(() => {
        if (terminal) {
            terminal.clear();
            if (terminalData) {
                terminal.write(terminalData);
            }
        }
    }, [terminalData, data.model]);

    return <></>;
}

export default Terminal;