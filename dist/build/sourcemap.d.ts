import { BasicSourceMapConsumer } from 'source-map';
export declare function getSourceMapConsumerFromSource(source: string, url: string): Promise<BasicSourceMapConsumer>;
export declare function getSourceMapConsumer(sourceUrl: string): Promise<BasicSourceMapConsumer>;
