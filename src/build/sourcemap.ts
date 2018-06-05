import { readFile } from 'fs';
import { resolve } from 'source-map-resolve';
import { SourceMapConsumer, BasicSourceMapConsumer } from 'source-map';

function readLocalFile(uri: string, callback: (err: Error, content: string) => void) {
  readFile(uri, 'utf8', callback);
}

function getFile(uri: string, callback: (err: Error, content: string) => void) {
  // if (isUrl(uri)) {
  //   downloadFile(uri, callback);
  // } else {
  readLocalFile(uri, callback);
  // }
}

export async function getSourceMapConsumerFromSource(source: string, url: string): Promise<BasicSourceMapConsumer> {
  return new Promise<BasicSourceMapConsumer>((res, rej) => {
    resolve(source, url, getFile, (error, result) => {
      if (error) rej(error);
      else {
        result.map.sourcesContent = result.sourcesContent;
        res(new SourceMapConsumer(result.map));
      }
    });
  });
}

export async function getSourceMapConsumer(sourceUrl: string): Promise<BasicSourceMapConsumer> {
  return new Promise<BasicSourceMapConsumer>((res, rej) => {
    getFile(sourceUrl, (error, source) => {
      if (error) rej(error);
      else res(getSourceMapConsumerFromSource(source, sourceUrl));
    });
  });
}
