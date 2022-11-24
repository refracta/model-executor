import React, {useEffect} from 'react';
import {FitAddon} from "xterm-addon-fit";
import {Terminal as XTerm} from 'xterm';
import 'xterm/css/xterm.css';
import {AppData} from "../../types/Types";
import model from "../contents/Model";

let terminal: XTerm;
let lastModelPath: string;
let lastMessage: any;
let lastResize: string;
function Terminal({data, fitAddon}: { data: AppData, fitAddon: FitAddon }) {

    useEffect(() => {
        if ((window as any).terminal) {
            ((window as any).terminal).dispose();
        }
        terminal = new XTerm({cursorBlink: false, scrollback: 0});
        terminal.loadAddon(fitAddon);
        terminal.open(document.querySelector('.terminal-container') as HTMLElement);
        terminal.onResize((event) => {
            let resize = JSON.stringify(event);
            if(lastResize !== resize){
                lastResize = resize;
                data.sendJsonMessage({msg: 'TerminalResize', ...event});
            }
        });
        (window as any).terminal = terminal;

        let viewport = document.querySelector('.xterm-viewport') as HTMLElement;
        viewport.style.overflowY = 'hidden';
        fitAddon.fit();
        console.log(fitAddon);
    }, []);
    useEffect(() => {
        if (lastMessage === data.lastJsonMessage) {
            return;
        } else {
            lastMessage = data.lastJsonMessage;
        }
        if (lastMessage && lastMessage.msg === 'Terminal') {
            console.log(lastMessage);
            terminal.write(lastMessage.data);
        }
    }, [data.lastJsonMessage]);

    let terminalData = data.model?.lastHistory?.terminal as string;
    useEffect(() => {
        if (terminal) {
            if (terminalData) {
                terminal.write(terminalData);
            } else {
                terminal.clear();
            }
        }
    }, [terminalData]);

    return <></>;
}

export default Terminal;