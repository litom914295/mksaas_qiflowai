/**
 * 文本分块工具 - TextChunker
 *
 * 功能：将长文本智能分割成适合向量化的块
 * 策略：优先按段落分割，保持语义完整性
 */

export interface TextChunk {
  content: string; // 分块内容
  index: number; // 块索引（从 0 开始）
  startChar: number; // 起始字符位置
  endChar: number; // 结束字符位置
  tokens?: number; // 预估 token 数
}

export interface ChunkOptions {
  maxChunkSize: number; // 最大块大小（字符数）默认 1000
  overlap: number; // 重叠字符数，默认 200
  separator: string; // 段落分隔符，默认 \n\n
  minChunkSize: number; // 最小块大小，默认 100
  preserveSentences: boolean; // 保持句子完整性，默认 true
}

const DEFAULT_OPTIONS: ChunkOptions = {
  maxChunkSize: 1000,
  overlap: 200,
  separator: '\n\n',
  minChunkSize: 100,
  preserveSentences: true,
};

export class TextChunker {
  private options: ChunkOptions;

  constructor(options?: Partial<ChunkOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 主入口：智能分块
   * 优先按段落，fallback 到按字符
   */
  chunk(text: string, customOptions?: Partial<ChunkOptions>): TextChunk[] {
    const opts = { ...this.options, ...customOptions };

    // 清理文本
    const cleanedText = this.cleanText(text);

    // 如果文本小于最大块大小，直接返回
    if (cleanedText.length <= opts.maxChunkSize) {
      return [
        {
          content: cleanedText,
          index: 0,
          startChar: 0,
          endChar: cleanedText.length,
          tokens: this.estimateTokens(cleanedText),
        },
      ];
    }

    // 尝试按段落分块
    const paragraphs = this.splitIntoParagraphs(cleanedText, opts.separator);

    if (paragraphs.length > 1) {
      return this.chunkByParagraph(cleanedText, paragraphs, opts);
    }

    // Fallback: 按字符分块
    return this.chunkBySize(cleanedText, opts);
  }

  /**
   * 按段落分块（优先策略）
   */
  private chunkByParagraph(
    text: string,
    paragraphs: Array<{ content: string; start: number; end: number }>,
    opts: ChunkOptions
  ): TextChunk[] {
    const chunks: TextChunk[] = [];
    let currentChunk = '';
    let currentStart = 0;
    let chunkIndex = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const paraWithSeparator =
        i < paragraphs.length - 1
          ? para.content + opts.separator
          : para.content;

      // 如果当前段落本身就超过最大大小
      if (paraWithSeparator.length > opts.maxChunkSize) {
        // 先保存当前累积的块
        if (currentChunk.trim().length > 0) {
          chunks.push({
            content: currentChunk.trim(),
            index: chunkIndex++,
            startChar: currentStart,
            endChar: currentStart + currentChunk.length,
            tokens: this.estimateTokens(currentChunk),
          });
        }

        // 对超长段落进行字符分块
        const subChunks = this.chunkBySize(paraWithSeparator, opts);
        subChunks.forEach((subChunk) => {
          chunks.push({
            ...subChunk,
            index: chunkIndex++,
            startChar: para.start + subChunk.startChar,
            endChar: para.start + subChunk.endChar,
          });
        });

        // 重置当前块
        currentChunk = '';
        currentStart = para.end;
        continue;
      }

      // 检查是否会超过最大大小
      if (currentChunk.length + paraWithSeparator.length > opts.maxChunkSize) {
        // 保存当前块
        if (currentChunk.trim().length >= opts.minChunkSize) {
          chunks.push({
            content: currentChunk.trim(),
            index: chunkIndex++,
            startChar: currentStart,
            endChar: currentStart + currentChunk.length,
            tokens: this.estimateTokens(currentChunk),
          });
        }

        // 开始新块（带重叠）
        const overlapText = this.getOverlapText(currentChunk, opts.overlap);
        currentChunk = overlapText + paraWithSeparator;
        currentStart = para.start - overlapText.length;
      } else {
        // 继续累积
        currentChunk += paraWithSeparator;
        if (currentStart === 0) {
          currentStart = para.start;
        }
      }
    }

    // 保存最后一个块
    if (currentChunk.trim().length >= opts.minChunkSize) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex,
        startChar: currentStart,
        endChar: currentStart + currentChunk.length,
        tokens: this.estimateTokens(currentChunk),
      });
    }

    return chunks;
  }

  /**
   * 按固定大小分块（Fallback 策略）
   */
  private chunkBySize(text: string, opts: ChunkOptions): TextChunk[] {
    const chunks: TextChunk[] = [];
    let startChar = 0;
    let chunkIndex = 0;

    while (startChar < text.length) {
      let endChar = Math.min(startChar + opts.maxChunkSize, text.length);

      // 保持句子完整性
      if (opts.preserveSentences && endChar < text.length) {
        endChar = this.findSentenceBreak(text, endChar);
      }

      const content = text.slice(startChar, endChar);

      if (content.trim().length >= opts.minChunkSize) {
        chunks.push({
          content: content.trim(),
          index: chunkIndex++,
          startChar,
          endChar,
          tokens: this.estimateTokens(content),
        });
      }

      // 移动到下一个块（考虑重叠）
      startChar = endChar - opts.overlap;

      // 避免死循环：确保至少前进一个字符
      if (startChar <= chunks[chunks.length - 1]?.startChar) {
        startChar = endChar;
      }
    }

    return chunks;
  }

  /**
   * 将文本分割成段落
   */
  private splitIntoParagraphs(
    text: string,
    separator: string
  ): Array<{ content: string; start: number; end: number }> {
    const paragraphs: Array<{ content: string; start: number; end: number }> =
      [];
    const parts = text.split(separator);
    let currentPos = 0;

    for (const part of parts) {
      if (part.trim().length > 0) {
        paragraphs.push({
          content: part,
          start: currentPos,
          end: currentPos + part.length,
        });
      }
      currentPos += part.length + separator.length;
    }

    return paragraphs;
  }

  /**
   * 找到最近的句子断点
   */
  private findSentenceBreak(text: string, pos: number): number {
    const sentenceEndings = ['.', '!', '?', '。', '！', '？', '\n'];
    const searchWindow = 100; // 向前搜索 100 个字符
    const startSearch = Math.max(0, pos - searchWindow);

    for (let i = pos; i >= startSearch; i--) {
      if (sentenceEndings.includes(text[i])) {
        // 找到句子结尾，返回下一个字符位置
        return i + 1;
      }
    }

    // 如果没找到句子结尾，尝试找空白字符
    for (let i = pos; i >= startSearch; i--) {
      if (/\s/.test(text[i])) {
        return i + 1;
      }
    }

    // 实在找不到，返回原位置
    return pos;
  }

  /**
   * 获取重叠文本（从块末尾取）
   */
  private getOverlapText(text: string, overlapSize: number): string {
    if (text.length <= overlapSize) {
      return text;
    }

    const overlapText = text.slice(-overlapSize);

    // 尝试从单词/句子边界开始
    const spaceIndex = overlapText.indexOf(' ');
    if (spaceIndex > 0 && spaceIndex < overlapSize / 2) {
      return overlapText.slice(spaceIndex + 1);
    }

    return overlapText;
  }

  /**
   * 清理文本：去除多余空白
   */
  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // 统一换行符
      .replace(/\n{3,}/g, '\n\n') // 最多保留两个连续换行
      .replace(/[ \t]+/g, ' ') // 多个空格/tab 合并为一个
      .replace(/^\s+|\s+$/g, '') // 去除首尾空白
      .trim();
  }

  /**
   * 估算 token 数（粗略估算）
   * 英文：~4 字符 = 1 token
   * 中文：~1.5 字符 = 1 token
   */
  private estimateTokens(text: string): number {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;

    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  }

  /**
   * 静态方法：快速分块（使用默认配置）
   */
  static quickChunk(text: string, maxChunkSize = 1000): TextChunk[] {
    const chunker = new TextChunker({ maxChunkSize });
    return chunker.chunk(text);
  }
}

/**
 * 便捷函数：直接分块
 */
export function chunkText(
  text: string,
  options?: Partial<ChunkOptions>
): TextChunk[] {
  const chunker = new TextChunker(options);
  return chunker.chunk(text);
}

/**
 * 便捷函数：批量分块
 */
export function chunkTexts(
  texts: string[],
  options?: Partial<ChunkOptions>
): TextChunk[][] {
  const chunker = new TextChunker(options);
  return texts.map((text) => chunker.chunk(text));
}
