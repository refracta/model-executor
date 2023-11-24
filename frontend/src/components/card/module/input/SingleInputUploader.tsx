import React, {useEffect, useState} from 'react';
import {AppProps, ModelStatus, WSMessageType} from "../../../../types/Types";
import {Card, Nav, Tab} from "react-bootstrap";
import {useDropzone} from "react-dropzone";
import {COMMON_MIME_TYPES} from 'file-selector/dist/file'
import {FileUtils} from "../../../../utils/FileUtils";
import {DownloadUtils} from "../../../../utils/DownloadUtils";

type IFile = File & { preview?: string };

function renderModelView({context}: AppProps) {
    let model = context.model;
    let config = model?.config;
    let inputInfo = model?.lastHistory?.inputInfo;

    const [files, setFiles] = useState<IFile[]>([]);
    const [hideDropzone, setHideDropzone] = useState<boolean>(!(model?.status === ModelStatus.OFF || model?.status === ModelStatus.ERROR));
    const [uploadExplain, setUploadExplain] = useState<string>('');

    let extensions = config?.input?.options?.format;
    let accept: any = {};
    if (extensions) {
        let formats = extensions.map((k: string) => COMMON_MIME_TYPES.get(k)).filter((e: string) => e);
        for (let f of formats) {
            accept[f] = [];
        }
    } else {
        accept = {'image/*': []};
    }
    const {getRootProps, getInputProps} = useDropzone({
        accept,
        onDrop: async (acceptedFiles: IFile[]) => {
            setUploadExplain('Uploading...');
            setHideDropzone(true);

            acceptedFiles = acceptedFiles.slice(0, 1);
            setFiles(acceptedFiles.map((file) => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));

            const data = new FormData();

            for (const file of acceptedFiles) {
                data.append('files', file, file.name);
            }
            data.append('modelUniqueName', model?.uniqueName as string);
            data.append('parameters', JSON.stringify(context.parameters));

            let result = await fetch('/api/upload', {
                method: 'POST',
                body: data,
            }).then(r => r.json());
            if (result.status === 'success') {
                setUploadExplain('Upload done!');
            } else {
                setFiles([]);
                setHideDropzone(false);
                setUploadExplain('Upload error...');
            }
        }
    });

    const thumbs = files.map((file: IFile) => (
        (<div className='thumb' key={file.name}>
            <div className='thumb-inner'>
                <img
                    src={file.preview}
                    className='thumb-image'
                    onLoad={() => {
                        URL.revokeObjectURL(file.preview as string)
                    }}
                />
            </div>
        </div>)
    ));

    useEffect(() => {
        return () => files.forEach((file: IFile) => URL.revokeObjectURL(file.preview as string));
    }, []);


    useEffect(() => {
        let message = context.lastJsonMessage as any;
        if (message?.msg === WSMessageType.UpdateModel && message?.model?.status === ModelStatus.RUNNING) {
            (document.querySelector('.last-input-upload > a') as HTMLElement)?.click();
            setFiles([]);
            setUploadExplain('');
            setHideDropzone(false);
        }
    }, [context.lastJsonMessage]);

    useEffect(() => {
        setFiles([]);
        setUploadExplain('');
        setHideDropzone(false);
        setHideDropzone(!(model?.status === ModelStatus.OFF || model?.status === ModelStatus.ERROR));
        (document.querySelector('.input-upload > a') as HTMLElement)?.click();
    }, [model?.uniqueName]);

    useEffect(() => {
        if (model?.status === ModelStatus.RUNNING) {
            (document.querySelector('.last-input-upload > a') as HTMLElement)?.click();
        }
    }, [model?.status]);

    return <>
        <Tab.Container defaultActiveKey='input-upload'>
            <Card.Header>
                <Nav variant="tabs" className="column">
                    <Nav.Item className='input-upload'>
                        <Nav.Link eventKey="input-upload">Input upload</Nav.Link>
                    </Nav.Item>
                    <Nav.Item className='last-input-upload'>
                        <Nav.Link eventKey="last-input-upload">Last input upload</Nav.Link>
                    </Nav.Item>
                </Nav>
            </Card.Header>
            <Card.Body style={{height: '100%'}}>
                <Tab.Content style={{height: 'inherit'}}>
                    <Tab.Pane eventKey="input-upload" style={{height: 'inherit'}}>
                        <section className="container" style={{height: 'inherit'}}>
                            <div {...getRootProps({className: 'dropzone'})}
                                 style={hideDropzone ? {display: 'none'} : {}}>
                                <input {...getInputProps()} />
                                <p className='mb-0' style={{fontSize: 'larger'}}>Drag & drop or click to upload</p>
                                <p className='mb-0' style={{fontSize: 'larger'}}>Support
                                    format: {extensions ? extensions.join(', ') : 'image'}</p>
                            </div>
                            <aside className='thumbs-container'>
                                {thumbs}
                            </aside>
                            <span>{uploadExplain}</span>
                        </section>
                    </Tab.Pane>
                    <Tab.Pane eventKey="last-input-upload" style={{height: 'inherit'}}>
                        <div style={{height: 'inherit', display: 'flex', flexDirection: 'column'}}>
                            <div>
                                {inputInfo ? <div>
                                    <a href='#' onClick={e => {
                                        DownloadUtils.download('/' + model?.lastHistory?.inputPath, inputInfo?.originalName);
                                    }}>
                                    <span
                                        style={{fontWeight: 'bold'}}>Filename: </span><span>{inputInfo?.originalName} ({FileUtils.formatBytes(inputInfo?.size)})</span>
                                    </a>
                                </div> : <></>}
                            </div>
                            <div style={{overflow: 'hidden', display: 'flex', justifyContent: 'center'}}>
                                {inputInfo?.type?.startsWith('image') ? <a href='#' onClick={e => {
                                    DownloadUtils.download('/' + model?.lastHistory?.inputPath, inputInfo?.originalName);
                                }}>
                                    {inputInfo?.type?.startsWith('image') ?
                                        <img src={'/' + model?.lastHistory?.inputPath} style={{
                                            objectFit: 'contain',
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                        }}/> : <></>}
                                </a> : <></>}
                            </div>
                        </div>
                    </Tab.Pane>
                </Tab.Content>
            </Card.Body>
        </Tab.Container></>;
}

function renderHistoryView({context}: AppProps) {
    let history = context.history;
    let inputInfo = context.history?.inputInfo;
    return <>
        <Tab.Container defaultActiveKey='input-upload'>
            <Card.Header>
                <Card.Title className='mb-0'>Input</Card.Title>
            </Card.Header>
            <Card.Body style={{height: '100%'}}>
                <div style={{height: 'inherit', display: 'flex', flexDirection: 'column'}}>
                    <div>
                        {inputInfo ? <div>
                            <a href='#' onClick={e => {
                                DownloadUtils.download('/' + history?.inputPath, inputInfo?.originalName);
                            }}>
                                <span
                                    style={{fontWeight: 'bold'}}>Filename: </span><span>{inputInfo?.originalName} ({FileUtils.formatBytes(inputInfo?.size)})</span>
                            </a>
                        </div> : <></>}
                    </div>
                    <div style={{overflow: 'hidden', display: 'flex', justifyContent: 'center'}}>
                        {inputInfo?.type?.startsWith('image') ? <a href='#' onClick={e => {
                            DownloadUtils.download('/' + history?.inputPath, inputInfo?.originalName);
                        }}>
                            <img src={'/' + history?.inputPath} style={{
                                objectFit: 'contain',
                                maxWidth: '100%',
                                maxHeight: '100%',
                            }}/>
                        </a> : <></>}
                    </div>
                </div>
            </Card.Body>
        </Tab.Container></>;
}

export default function SingleInputUploader(props: AppProps) {
    return props.context.path.startsWith('model') ? renderModelView(props) : renderHistoryView(props);
}