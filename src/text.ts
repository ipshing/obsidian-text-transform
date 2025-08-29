export enum TextCase {
    TitleCase,
    CamelCase,
    PascalCase,
}

export function changeTextCase(text: string, newCase: TextCase, wordBoundaryChars: string[], ignore: string[]): string {
    // Add space and tab to wordBoundaryChars
    wordBoundaryChars.push(" ", "\t");

    let transformed = "";
    let word = "";
    let isFirst = true;
    // Iterate the characters and build each word
    for (const char of text) {
        if (wordBoundaryChars.includes(char)) {
            // push 'word' to 'transformed'
            if (newCase == TextCase.CamelCase && isFirst && word.length > 0) {
                // First word needs to be lowercase if 'camelCase'
                transformed += word.toLocaleLowerCase();
                isFirst = false;
            } else {
                transformed += wordToTitleCase(word, ignore);
            }
            // push 'char' to 'transformed'
            transformed += char;
            // clear 'word'
            word = "";
        } else {
            // push 'char' to 'word'
            word += char;
        }
    }
    // Push 'word' one last time
    transformed += wordToTitleCase(word, ignore);

    return transformed;
}

function wordToTitleCase(word: string, ignore: string[]): string {
    if (word.length > 0) {
        // convert to lowercase
        word = word.toLocaleLowerCase();
        // only capitalize if not in 'ignore' list
        if (!ignore.includes(word)) {
            word = word[0].toLocaleUpperCase() + word.slice(1);
        }
    }
    return word;
}
