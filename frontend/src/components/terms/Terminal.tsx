import React, {useEffect} from 'react';
import {FitAddon} from "xterm-addon-fit";
import {Terminal as XTerm} from 'xterm';
import 'xterm/css/xterm.css';
import {AppData} from "../../types/Types";

let terminal: XTerm;
let lastResize: string;
let global: any = window;

// TODO: 아직까지도 터미널 출력 반복 현상 관찰됨
export default function Terminal({data, fitAddon}: { data: AppData, fitAddon: FitAddon }) {
    useEffect(() => {
        // WARNING: ref hook로 수정 가능한지 알아볼 것
        global.terminal?.dispose();
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


        const resizeObserver = new ResizeObserver(entries => {
            try {
                let width = document.querySelector('.terminal')?.clientWidth;
                for (let i = 0; i < 25; i++) {
                    fitAddon && fitAddon.fit();
                    let currentWidth = document.querySelector('.terminal')?.clientWidth;
                    if (width == currentWidth) {
                        break;
                    }
                    width = currentWidth;
                }
            } catch (err) {
                console.log(err);
            }
        });

        resizeObserver.observe(document.querySelector(".terminal-container") as HTMLElement);
        global.terminal = terminal;

        let viewport = document.querySelector('.xterm-viewport') as HTMLElement;
        viewport.style.overflowY = 'hidden';
        fitAddon.fit();
    }, []);

    useEffect(() => {
        // Strict mode 해제
        let terminalQueue: string[] = global.terminalQueue = [];
        let isWorking = false;
        data.getWebSocket()?.addEventListener('message', (event: Event) => {
            let data = (event as MessageEvent).data;
            let message = JSON.parse(data);
            if (message.msg === 'Terminal') {
                terminalQueue.push(message.data);
                if (isWorking) {
                    return;
                }
                isWorking = true;
                setTimeout(async () => {
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
                terminal.scrollToBottom();
            }
        }
    }, [terminalData, data.model]);

    return <></>;
}