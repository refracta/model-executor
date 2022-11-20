import React, {CSSProperties, useEffect, useRef, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {ModelData} from "../../../types/Types";

const thumbsContainer: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16
};

const thumb: CSSProperties = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box'
};

const thumbInner: CSSProperties = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
};

const img: CSSProperties = {
    display: 'block',
    width: 'auto',
    height: '100%'
};

type IFile = File & { preview?: string };

function GeneralSingleFileUploader({model}: { model: ModelData }) {
    const [files, setFiles] = useState<IFile[]>([]);
    const [hideDropzone, setHideDropzone] = useState<boolean>(!(model.status === 'off' || model.status === 'error'));
    const [uploadExplain, setUploadExplain] = useState<string>('');
    useEffect(() => {
        setFiles([]);
        setUploadExplain(model.status === 'error' ? 'Model executing error...' : '');
        setHideDropzone(!(model.status === 'off' || model.status === 'error'));
    }, [model]);

    const {getRootProps, getInputProps} = useDropzone({
        accept: {
            'image/*': []
        },
        // TODO: 이미지 말고 다양한 타입 지원
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
            data.append('modelUniqueName', model.uniqueName);

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
        (<div style={thumb} key={file.name}>
            <div style={thumbInner}>
                <img
                    src={file.preview}
                    style={img}
                    // Revoke data uri after image is loaded
                    onLoad={() => {
                        URL.revokeObjectURL(file.preview as string)
                    }}
                />
            </div>
        </div>)
    ));

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
        return () => files.forEach((file: IFile) => URL.revokeObjectURL(file.preview as string));
    }, []);

    if (model.status === 'off' || model.status === 'error') {
        return (
            <section className="container">
                <div {...getRootProps({className: 'dropzone'})} style={hideDropzone ? {display: 'none'} : {}}
                >
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
                <aside style={thumbsContainer}>
                    {thumbs}
                </aside>
                <span>{uploadExplain}</span>
            </section>
        );
    } else {
        let inputInfo = model.lastHistory?.inputInfo;
        return <>
            <span style={{fontWeight: 'bold'}}>Filename: </span><span>{inputInfo.originalname}</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>Type: </span><span>{inputInfo.mimetype}</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>Size: </span><span>{inputInfo.size}</span>
            <br/>
            {inputInfo.mimetype.startsWith('image') ? <img src={inputInfo.webpath} style={{
                objectFit: 'contain',
                maxHeight: '40vh',
                maxWidth: '100%',
                overflow: 'hidden',
                paddingBottom: '55px'
            }}/> : <></>}
        </>
    }
}

export default GeneralSingleFileUploader;