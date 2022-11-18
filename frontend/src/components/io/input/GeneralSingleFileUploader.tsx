import React, {CSSProperties, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {ModelData} from "../../../types/DataTypes";

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
    console.log(model);
    const [files, setFiles] = useState<IFile[]>([]);
    const {getRootProps, getInputProps} = useDropzone({
        accept: {
            'image/*': []
        },
        onDrop: (acceptedFiles: IFile[]) => {
            setFiles(acceptedFiles.map((file) => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));

            const data = new FormData();

            for (const file of acceptedFiles) {
                data.append('files', file, file.name);
            }

            return fetch('/api/upload', {
                method: 'POST',
                body: data,
            });
        }
    });

    const thumbs = files.map((file: IFile) => (
        <div style={thumb} key={file.name}>
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
        </div>
    ));

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
        return () => files.forEach((file: IFile) => URL.revokeObjectURL(file.preview as string));
    }, []);

    return (
        <section className="container">
            <div {...getRootProps({className: 'dropzone'})}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
            <aside style={thumbsContainer}>
                {thumbs}
            </aside>
        </section>
    );
}

export default GeneralSingleFileUploader;