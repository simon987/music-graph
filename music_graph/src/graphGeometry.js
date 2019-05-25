/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import measureText from './textMeasurement'

let addShortenedNextWord = (line, word, measure) => {
    const result = []
    while (!(word.length <= 2)) {
        word = word.substr(0, word.length - 2) + '\u2026'
        if (measure(word) < line.remainingWidth) {
            line.text += ` ${word}`
            break
        } else {
            result.push(undefined)
        }
    }
    return result
}

let noEmptyLines = function (lines) {
    for (let line of Array.from(lines)) {
        if (line.text.length === 0) {
            return false
        }
    }
    return true
}

export let fitCaptionIntoCircle = function (captionText, node) {
    const fontFamily = 'Tahoma'
    const fontSize = 11
    const lineHeight = fontSize
    const measure = text => measureText(text, fontFamily, fontSize)

    const words = captionText.split(' ')

    const emptyLine = function (lineCount, iLine) {
        let baseline = (1 + iLine - lineCount / 2) * lineHeight
        const containingHeight = iLine < lineCount / 2 ? baseline - lineHeight : baseline
        const lineWidth =
            Math.sqrt(node.radius * node.radius - containingHeight * containingHeight) * 2
        return {
            node,
            text: '',
            baseline,
            remainingWidth: lineWidth
        }
    }

    const fitOnFixedNumberOfLines = function (lineCount) {
        const lines = []
        let iWord = 0
        for (
            let iLine = 0, end = lineCount - 1, asc = end >= 0;
            asc ? iLine <= end : iLine >= end;
            asc ? iLine++ : iLine--
        ) {
            const line = emptyLine(lineCount, iLine)
            while (
                iWord < words.length &&
                measure(` ${words[iWord]}`) < line.remainingWidth) {
                line.text += ` ${words[iWord]}`
                line.remainingWidth -= measure(` ${words[iWord]}`)
                iWord++
            }
            lines.push(line)
        }
        if (iWord < words.length) {
            addShortenedNextWord(lines[lineCount - 1], words[iWord], measure)
        }
        return [lines, iWord]
    }

    let consumedWords = 0
    const maxLines = (node.radius * 2) / fontSize

    let lines = [emptyLine(1, 0)]
    for (
        let lineCount = 1, end = maxLines, asc = end >= 1;
        asc ? lineCount <= end : lineCount >= end;
        asc ? lineCount++ : lineCount--
    ) {
        const [candidateLines, candidateWords] = Array.from(
            fitOnFixedNumberOfLines(lineCount)
        )
        if (noEmptyLines(candidateLines)) {
            [lines, consumedWords] = Array.from([candidateLines, candidateWords])
        }
        if (consumedWords >= words.length) {
            return lines
        }
    }
    return lines
}
