import React, {useEffect, useState} from 'react';
import {Button, Card, ProgressBar} from 'react-bootstrap';
import {AppProps, ModelStatus} from "../../../../types/Types";
import {FileUtils} from "../../../../utils/FileUtils";
import fetchProgress from 'fetch-progress';
import {BlobReader, BlobWriter, ZipReader} from '@zip.js/zip.js';
import {Gallery, Image} from "react-grid-gallery";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Download from "../../../hack/lightbox/download";

import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import {DownloadUtils} from "../../../../utils/DownloadUtils";

export interface CustomImage extends Image {
    original: string;
    fileName: string;
}


type FetchProgressData = fetchProgress.FetchProgressData &
    {
        percent: number;
        scaledPercent: number;
    };


function getImageInfo(url: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
        let image = document.createElement('img');
        image.src = url;
        image.onload = function () {
            resolve(image);
        }
    })
}

// TODO: 일부 코드간 교차되는 부분을 제외하고, 상당한 중복 제거 가능할 것으로 생각됨, 복잡도가 심화되는 부분들 모듈화할 것
function renderModelView({context}: AppProps) {
    let model = context.model;
    let history = model?.lastHistory;
    let outputPath = history?.outputPath;
    let outputName = history?.outputInfo?.fileName;
    let fileSizeExist = history?.outputInfo?.fileSize !== undefined;
    let fileSize = history?.outputInfo?.fileSize;
    let [images, setImages] = useState<CustomImage[]>([]);
    let [downloadProgress, setDownloadProgress] = useState<FetchProgressData>({
        total: 0,
        transferred: 0,
        speed: 0,
        eta: 0,
        percent: 0,
        scaledPercent: 0,
    });
    let [decompressProgress, setDecompressProgress] = useState<FetchProgressData>({
        total: 0,
        transferred: 0,
        speed: 0,
        eta: 0,
        percent: 0,
        scaledPercent: 0,
    });

    const [index, setIndex] = useState(-1);
    const handleClick = (index: number, item: CustomImage) => setIndex(index);

    useEffect(() => {
        if (outputPath && fileSize !== 0) {
            (async () => {
                setImages([]);
                let blob = await fetch('/' + outputPath).then(
                    fetchProgress({
                        onProgress(progress) {
                            let percent = progress.total ? progress.transferred / progress.total * 100 : 0;
                            let scaledPercent = Math.floor(percent * 10) / 10;
                            setDownloadProgress({...progress, percent, scaledPercent});
                        }
                    })
                ).then(r => r.blob());

                const zipFileReader = new BlobReader(blob);
                const zipReader = new ZipReader(zipFileReader);
                let entries = await zipReader.getEntries();
                let total = entries.map(e => e.compressedSize).reduce((a, c) => a + c, 0);
                let currentTransferred = 0;

                let images: CustomImage[] = [];
                for (let i = 0; i < entries.length; i++) {
                    let entry = entries[i];
                    let blobURL = URL.createObjectURL(await entry.getData(new BlobWriter(), {
                        onprogress: async (index, max) => {
                            let transferred = currentTransferred + index;
                            let percent = total ? transferred / total * 100 : 0;
                            let scaledPercent = Math.floor(percent * 10) / 10;
                            setDecompressProgress({...decompressProgress, total, transferred, percent, scaledPercent});
                        }
                    }));
                    let imageInfo = await getImageInfo(blobURL);
                    let image: CustomImage = {
                        src: blobURL,
                        original: blobURL,
                        fileName: entry.filename,
                        width: imageInfo.width,
                        height: imageInfo.height,
                        caption: `${entry.filename} (${FileUtils.formatBytes(entry.uncompressedSize)})`,
                        tags: [{value: entry.filename, title: entry.filename}]
                    };
                    images.push(image);
                    currentTransferred += entry.compressedSize;
                }
                setImages(images);
                await zipReader.close();
            })();
        }
    }, [outputPath, fileSize]);

    return <>
        <Card.Header>
            <Card.Title className='mb-0 float-start'>Output {outputPath ?
                <span className="badge green">Last executed</span> : ''}</Card.Title>
            {outputPath && fileSize ? <Button className='float-end btn-sm info' onClick={async (e) => {
                if (outputName) {
                    DownloadUtils.download('/' + outputPath, outputName.endsWith('.zip') ? outputName : outputName + '.zip');
                }
            }}>Download</Button> : <></>}
        </Card.Header>
        <Card.Body style={{
            overflowY: 'scroll',
        }}>
            <Card.Text>Output format: zip
                <br/>
                {fileSizeExist ? <>
                    <span style={{fontWeight: 'bold'}}>Size: </span>
                    <span>{FileUtils.formatBytes(history?.outputInfo.fileSize)}</span>
                    <br/>
                </> : <></>}
            </Card.Text>
            {outputPath && fileSize !== 0 && downloadProgress.percent !== 100 ? <ProgressBar>
                <ProgressBar striped now={downloadProgress.percent}
                             label={`Download - ${downloadProgress.scaledPercent}% (${FileUtils.formatBytes(downloadProgress.transferred, 1)}/${FileUtils.formatBytes(downloadProgress.transferred, 1)})`}/>
            </ProgressBar> : <></>}
            {outputPath && fileSize !== 0 && downloadProgress.percent === 100 && decompressProgress.percent !== 100 ? <ProgressBar>
                <ProgressBar variant='warning' striped now={decompressProgress.percent}
                             label={`Decompress - ${decompressProgress.scaledPercent}% (${FileUtils.formatBytes(decompressProgress.transferred, 1)}/${FileUtils.formatBytes(decompressProgress.transferred, 1)})`}/>
            </ProgressBar> : <></>}

            {outputPath && fileSize !== 0 ? <div>
                <Gallery id='gallery'
                         images={images}
                         onClick={handleClick}
                         enableImageSelection={false}
                />
                <Lightbox
                    slides={images.map(({original, width, height, caption}) => ({
                        src: original,
                        title: caption,
                        width,
                        height
                    }))}
                    open={index >= 0}
                    index={index}
                    close={() => {
                        setIndex(-1);
                        // TODO: 더 나은 방법
                        setTimeout(_ => document.getElementById("gallery")?.scrollIntoView(), 0);
                    }}
                    downloadInfo={images.map(({fileName, original}) => ({fileName, url: original}))}
                    plugins={[Captions, Zoom, Download, Thumbnails, Fullscreen]}
                />
            </div> : <></>}
        </Card.Body>
    </>;
}

function renderHistoryView({context}: AppProps) {
    let history = context.history;
    let outputPath = history?.outputPath;
    let outputName = history?.outputInfo?.fileName;
    let fileSizeExist = history?.outputInfo?.fileSize !== undefined;
    let fileSize = history?.outputInfo?.fileSize;

    let [images, setImages] = useState<CustomImage[]>([]);
    let [downloadProgress, setDownloadProgress] = useState<FetchProgressData>({
        total: 0,
        transferred: 0,
        speed: 0,
        eta: 0,
        percent: 0,
        scaledPercent: 0,
    });
    let [decompressProgress, setDecompressProgress] = useState<FetchProgressData>({
        total: 0,
        transferred: 0,
        speed: 0,
        eta: 0,
        percent: 0,
        scaledPercent: 0,
    });

    const [index, setIndex] = useState(-1);
    const handleClick = (index: number, item: CustomImage) => setIndex(index);

    useEffect(() => {
        if (outputPath && fileSize !== 0) {
            (async () => {
                setImages([]);
                let blob = await fetch('/' + outputPath).then(
                    fetchProgress({
                        onProgress(progress) {
                            let percent = progress.total ? progress.transferred / progress.total * 100 : 0;
                            let scaledPercent = Math.floor(percent * 10) / 10;
                            setDownloadProgress({...progress, percent, scaledPercent});
                        }
                    })
                ).then(r => r.blob());

                const zipFileReader = new BlobReader(blob);
                const zipReader = new ZipReader(zipFileReader);
                let entries = await zipReader.getEntries();
                let total = entries.map(e => e.compressedSize).reduce((a, c) => a + c, 0);
                let currentTransferred = 0;

                let images: CustomImage[] = [];
                for (let i = 0; i < entries.length; i++) {
                    let entry = entries[i];
                    let blobURL = URL.createObjectURL(await entry.getData(new BlobWriter(), {
                        onprogress: async (index, max) => {
                            let transferred = currentTransferred + index;
                            let percent = total ? transferred / total * 100 : 0;
                            let scaledPercent = Math.floor(percent * 10) / 10;
                            setDecompressProgress({...decompressProgress, total, transferred, percent, scaledPercent});
                        }
                    }));
                    let imageInfo = await getImageInfo(blobURL);
                    let image: CustomImage = {
                        src: blobURL,
                        original: blobURL,
                        fileName: entry.filename,
                        width: imageInfo.width,
                        height: imageInfo.height,
                        caption: `${entry.filename} (${FileUtils.formatBytes(entry.uncompressedSize)})`,
                        tags: [{value: entry.filename, title: entry.filename}]
                    };
                    images.push(image);
                    currentTransferred += entry.compressedSize;
                }
                setImages(images);
                await zipReader.close();
            })();
        }
    }, [outputPath, fileSize]);

    return <>
        <Card.Header>
            <Card.Title className='mb-0 float-start'>Output</Card.Title>
            {outputPath && fileSize ? <Button className='float-end btn-sm info' onClick={async (e) => {
                if (outputName) {
                    DownloadUtils.download('/' + outputPath, outputName.endsWith('.zip') ? outputName : outputName + '.zip');
                }
            }}>Download</Button> : <></>}
        </Card.Header>
        <Card.Body style={{
            overflowY: 'scroll',
        }}>
            <Card.Text>
                {fileSizeExist ? <>
                    <span style={{fontWeight: 'bold'}}>Size: </span>
                    <span>{FileUtils.formatBytes(history?.outputInfo.fileSize)}</span>
                    <br/>
                </> : <></>}
            </Card.Text>
            {outputPath && fileSize !== 0 && downloadProgress.percent !== 100 ? <ProgressBar>
                <ProgressBar striped now={downloadProgress.percent}
                             label={`Download - ${downloadProgress.scaledPercent}% (${FileUtils.formatBytes(downloadProgress.transferred, 1)}/${FileUtils.formatBytes(downloadProgress.transferred, 1)})`}/>
            </ProgressBar> : <></>}
            {outputPath && fileSize !== 0 && downloadProgress.percent === 100 && decompressProgress.percent !== 100 ? <ProgressBar>
                <ProgressBar variant='warning' striped now={decompressProgress.percent}
                             label={`Decompress - ${decompressProgress.scaledPercent}% (${FileUtils.formatBytes(decompressProgress.transferred, 1)}/${FileUtils.formatBytes(decompressProgress.transferred, 1)})`}/>
            </ProgressBar> : <></>}

            {context.history?.modelStatus === ModelStatus.OFF ? <div>
                <Gallery id='gallery'
                         images={images}
                         onClick={handleClick}
                         enableImageSelection={false}
                />
                <Lightbox
                    slides={images.map(({original, width, height, caption}) => ({
                        src: original,
                        title: caption,
                        width,
                        height
                    }))}
                    open={index >= 0}
                    index={index}
                    close={() => {
                        setIndex(-1);
                        // TODO: 더 나은 방법
                        setTimeout(_ => document.getElementById("gallery")?.scrollIntoView(), 0);
                    }}
                    downloadInfo={images.map(({fileName, original}) => ({fileName, url: original}))}
                    plugins={[Captions, Zoom, Download, Thumbnails, Fullscreen]}
                />
            </div> : <></>}
        </Card.Body>
    </>;
}

export default function ZipGalleryViewer(props: AppProps) {
    return props.context.path.startsWith('model') ? renderModelView(props) : renderHistoryView(props);
}